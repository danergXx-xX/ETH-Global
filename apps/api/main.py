import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import AsyncIterator

import httpx
import structlog
from eth_utils import to_checksum_address
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from limits import parse as parse_limit
from limits.storage import MemoryStorage
from limits.strategies import MovingWindowRateLimiter
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from config import get_settings
from governance import (
    MOCK_USDC_ADDRESS,
    MOCK_USDC_DECIMALS,
    SAMPLE_RECIPIENTS,
    encode_mock_usdc_transfer,
)
from logging_config import RequestIDMiddleware, setup_logging
from middleware import get_budget_tracker, get_ws_tracker
from agents.orchestrator import run_debate
from data.seed_historical_debates import (
    get_debate_by_id,
    get_historical_debates,
)
from data.seed_proposals import get_proposal_by_id, get_suggested_proposals
from schemas import (
    DebateRequest,
    DebateResponse,
    HealthResponse,
    ProposalEncodeRequest,
    ProposalEncoded,
    RecipientInfo,
    RecipientsResponse,
)
from routers import (
    agents_custom_router,
    notifications_router,
    protocols_router,
    treasury_router,
    users_router,
)
from routers.notifications import ws_router as notifications_ws_router
from services.debate_streamer import stream_debate
from services.reputation_updater import (
    PERSONA_ADDRESSES,
    get_reputation_updater,
)
from storage.factory import StorageConfigError, StorageFallbackError, upload_with_fallback

settings = get_settings()
setup_logging(env=settings.env, log_level=settings.log_level)
log = structlog.get_logger()

limiter = Limiter(key_func=get_remote_address)

# WebSocket rate limit (slowapi nie obsluguje WS natywnie - uzywamy limits bezposrednio)
_ws_storage = MemoryStorage()
_ws_rate_limiter = MovingWindowRateLimiter(_ws_storage)
_WS_DEBATE_LIMIT = parse_limit("10/minute")


def _rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    log.warning("rate_limited", path=request.url.path, client=get_remote_address(request))
    return JSONResponse(status_code=429, content={"detail": "Too many requests. Try again later."})


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Initialize singletons so they're warm at first request.
    ws_tracker = get_ws_tracker()
    budget = get_budget_tracker()
    log.info(
        "api_ready",
        env=settings.env,
        version="0.1.0",
        ws_cap=ws_tracker.max_concurrent,
        budget_usd_daily=budget.cap_usd,
        budget_halt_pct=budget.halt_fraction,
    )
    yield
    log.info("api_shutdown")


app = FastAPI(
    title="AI Treasury Council API",
    version="0.1.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Request-ID", "Authorization"],
)
app.add_middleware(RequestIDMiddleware)


# Foundation routers (Wave 1 + Wave 2). Existing /api/debate, /ws/debate,
# /api/proposals/* and /api/agents/{persona}/reputation stay below.
app.include_router(treasury_router)
app.include_router(protocols_router)
app.include_router(users_router)
app.include_router(agents_custom_router)
app.include_router(notifications_router)
app.include_router(notifications_ws_router)


@app.get("/health")
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        version="0.1.0",
        timestamp=datetime.now(timezone.utc),
    )


@app.get("/api/budget")
async def get_budget_status() -> dict[str, object]:
    """
    Current Anthropic spend snapshot for today (UTC).

    Returned fields:
      date_utc, spent_usd, cap_usd, pct_used, halt_threshold_usd,
      debates_count, halted, ws_open, ws_cap.
    """
    snap = await get_budget_tracker().snapshot()
    ws_tracker = get_ws_tracker()
    return {
        "date_utc": snap.date_utc,
        "spent_usd": snap.spent_usd,
        "cap_usd": snap.cap_usd,
        "pct_used": snap.pct_used,
        "halt_threshold_usd": snap.halt_threshold_usd,
        "debates_count": snap.debates_count,
        "halted": snap.halted,
        "ws_open": await ws_tracker.open_count(),
        "ws_cap": ws_tracker.max_concurrent,
    }


@app.post("/api/debate", response_model=DebateResponse)
@limiter.limit("10/minute")
async def debate(request: Request, req: DebateRequest) -> DebateResponse:
    log.info("debate_requested", text_length=len(req.text))
    budget = get_budget_tracker()
    if await budget.is_halted():
        snap = await budget.snapshot()
        log.warning(
            "debate_halted_budget",
            spent_usd=snap.spent_usd,
            cap_usd=snap.cap_usd,
            pct=snap.pct_used,
        )
        raise HTTPException(
            status_code=503,
            detail=(
                f"Daily Anthropic budget at {snap.pct_used}% "
                f"(${snap.spent_usd}/${snap.cap_usd}). "
                "New debates halted until UTC midnight reset."
            ),
        )
    try:
        result = await run_debate(req.text)
    except Exception as exc:
        log.error("debate_failed", error_type=type(exc).__name__, error_msg=str(exc))
        raise HTTPException(
            status_code=503,
            detail="Debate orchestration unavailable. Try again or contact support.",
        ) from exc
    log.info("debate_complete", consensus=result["consensus"])

    # Record Anthropic spend from per-decision cost_usd / token usage.
    try:
        debate_cost = sum(
            float(getattr(d, "cost_usd", 0.0) or 0.0) for d in result["decisions"]
        )
        if debate_cost <= 0.0:
            in_tok = sum(
                int(getattr(d, "tokens_used", 0) or 0) for d in result["decisions"]
            )
            await budget.record_debate(input_tokens=in_tok, output_tokens=0)
        else:
            await budget.record_debate(cost_usd=debate_cost)
    except Exception as track_err:
        log.warning("budget_track_failed", error=str(track_err))

    audit_cid: str | None = None
    audit_gateway: str | None = None
    provider: str | None = None

    try:
        transcript = {
            "proposal": req.text,
            "decisions": [d.model_dump(mode="json") for d in result["decisions"]],
            "consensus": result["consensus"],
            "vote_id": result["vote_id"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        storage_result = await upload_with_fallback(transcript)
        audit_cid = storage_result.cid
        audit_gateway = storage_result.gateway_url
        provider = storage_result.provider
        log.info(
            "audit_trail_stored",
            cid=audit_cid,
            provider=provider,
            fallback=storage_result.fallback_used,
        )
    except (
        StorageFallbackError,
        StorageConfigError,
        httpx.HTTPError,
        ConnectionError,
        OSError,
    ) as storage_err:
        log.error(
            "audit_trail_failed", error=str(storage_err), error_type=type(storage_err).__name__
        )

    return DebateResponse(
        decisions=result["decisions"],
        consensus=result["consensus"],
        vote_id=result["vote_id"],
        audit_trail_cid=audit_cid,
        audit_trail_gateway=audit_gateway,
        storage_provider=provider,
    )


@app.post("/api/proposals/encode")
async def encode_proposal(request: ProposalEncodeRequest) -> ProposalEncoded:
    """Encode treasury action into Governor-compatible calldata."""
    log.info(
        "encode_proposal_requested",
        action_type=request.action.type,
        recipient=request.action.recipient,
    )
    try:
        encoded = encode_mock_usdc_transfer(
            request.action.recipient,
            request.action.amount_wei,
        )
    except ValueError as exc:
        log.warning("encode_proposal_invalid_input", error=str(exc))
        raise HTTPException(status_code=422, detail="Invalid proposal parameters") from exc

    return ProposalEncoded(**encoded)


_VALID_PERSONAS = set(PERSONA_ADDRESSES.keys())


def _validate_proposal_id(raw: str) -> str:
    """Allow alphanumerics, dash, underscore. Bound length to mitigate abuse."""
    if not raw or len(raw) > 128:
        raise ValueError("proposal_id must be 1-128 chars")
    if not all(ch.isalnum() or ch in "-_" for ch in raw):
        raise ValueError("proposal_id must match [A-Za-z0-9_-]+")
    return raw


@app.websocket("/ws/debate")
async def ws_debate(websocket: WebSocket) -> None:
    """
    WebSocket streaming for live debate visualization.

    Query params:
      - proposal_id: client-side identifier (validated)
      - text:        proposal text (10..2000 chars)

    Rate limit: 10 connections/minute per client IP (DoS protection).
    Stream order: agent_statement* -> consensus -> reputation_update -> complete.
    """
    client_ip = websocket.client.host if websocket.client else "unknown"
    if not _ws_rate_limiter.hit(_WS_DEBATE_LIMIT, "ws_debate", client_ip):
        await websocket.accept()
        await websocket.send_json(
            {"type": "error", "message": "rate limit exceeded (10/min)", "recoverable": False}
        )
        log.warning("ws_debate_rate_limited", client=client_ip)
        await websocket.close(code=1008)
        return

    ws_tracker = get_ws_tracker()
    conn_id = await ws_tracker.try_acquire()
    if conn_id is None:
        await websocket.accept()
        cap = ws_tracker.max_concurrent
        await websocket.send_json(
            {
                "type": "error",
                "message": f"server at capacity ({cap} concurrent WS). Retry shortly.",
                "recoverable": True,
                "retry_after_seconds": 5,
            }
        )
        await websocket.close(code=1013)  # Try Again Later
        return

    await websocket.accept()
    try:
        proposal_id_raw = websocket.query_params.get("proposal_id", "")
        text = websocket.query_params.get("text", "")
        try:
            proposal_id = _validate_proposal_id(proposal_id_raw)
        except ValueError as exc:
            await websocket.send_json(
                {"type": "error", "message": str(exc), "recoverable": False}
            )
            await websocket.close(code=1008)
            return
        if not (10 <= len(text) <= 2000):
            await websocket.send_json(
                {"type": "error", "message": "text must be 10-2000 chars", "recoverable": False}
            )
            await websocket.close(code=1008)
            return

        step_delay = max(settings.debate_stream_step_ms, 0) / 1000.0
        try:
            async for event in stream_debate(proposal_id, text, step_delay_s=step_delay):
                await websocket.send_json(event)
        except WebSocketDisconnect:
            log.info("ws_debate_client_disconnect", proposal_id=proposal_id)
            return
        except Exception as exc:
            log.error(
                "ws_debate_failed",
                proposal_id=proposal_id,
                error_type=type(exc).__name__,
                error=str(exc),
            )
            try:
                await websocket.send_json(
                    {
                        "type": "error",
                        "proposal_id": proposal_id,
                        "message": "internal error",
                        "recoverable": False,
                    }
                )
            except Exception:  # nosec - best effort error notification
                pass
            await websocket.close(code=1011)
            return

        await websocket.close(code=1000)
    finally:
        await ws_tracker.release(conn_id)


@app.get("/api/agents/{persona}/reputation")
async def get_agent_reputation(persona: str) -> dict[str, object]:
    """Read on-chain reputation for one persona. Returns score, debates, aligned."""
    if persona not in _VALID_PERSONAS:
        raise HTTPException(status_code=404, detail=f"unknown persona '{persona}'")
    updater = get_reputation_updater()
    if updater is None:
        raise HTTPException(
            status_code=503,
            detail="reputation contract not configured",
        )
    address = PERSONA_ADDRESSES[persona]
    try:
        view = await updater.get_reputation_async(address)
    except Exception as exc:
        log.error(
            "reputation_read_failed",
            persona=persona,
            error_type=type(exc).__name__,
            error=str(exc),
        )
        raise HTTPException(status_code=502, detail="upstream RPC failure") from exc
    return {
        "persona": persona,
        "address": address,
        "score": view.score,
        "debates": view.debates,
        "aligned": view.aligned,
    }


@app.get("/api/agents/reputation/all")
async def get_all_agent_reputations() -> dict[str, object]:
    """Batch read all 5 personas. Each entry returns its own status on RPC failure."""
    updater = get_reputation_updater()
    if updater is None:
        raise HTTPException(status_code=503, detail="reputation contract not configured")

    async def _one(persona: str, address: str) -> dict[str, object]:
        try:
            view = await updater.get_reputation_async(address)
            return {
                "persona": persona,
                "address": address,
                "score": view.score,
                "debates": view.debates,
                "aligned": view.aligned,
                "status": "ok",
            }
        except Exception as exc:
            log.error(
                "reputation_read_failed",
                persona=persona,
                error_type=type(exc).__name__,
                error=str(exc),
            )
            return {
                "persona": persona,
                "address": address,
                "score": None,
                "debates": None,
                "aligned": None,
                "status": "error",
                "error": str(exc),
            }

    items = await asyncio.gather(
        *[_one(p, a) for p, a in PERSONA_ADDRESSES.items()]
    )
    return {"agents": items}


@app.get("/api/proposals/recipients")
async def list_recipients() -> RecipientsResponse:
    """List available demo recipients for proposal UI."""
    items = [
        RecipientInfo(
            key=key,
            address=to_checksum_address(info["address"]),
            label=info["label"],
            description=info["description"],
        )
        for key, info in SAMPLE_RECIPIENTS.items()
    ]
    return RecipientsResponse(
        recipients=items,
        token_address=to_checksum_address(MOCK_USDC_ADDRESS),
        token_symbol="mUSDC",
        token_decimals=MOCK_USDC_DECIMALS,
    )


@app.get("/api/proposals/suggested")
async def list_suggested_proposals() -> dict[str, list[dict]]:
    """Return 4 golden demo proposals for the Suggested Proposals dropdown.

    Used by frontend submission form: judge picks one to pre-fill the textarea
    with full_context, demonstrating council across geopolitics, crypto-native,
    time-sensitive, and meta-DAO scenarios.
    """
    return {"proposals": get_suggested_proposals()}


@app.get("/api/proposals/suggested/{proposal_id}")
async def get_suggested_proposal(proposal_id: str) -> dict:
    """Return single suggested proposal by id."""
    proposal = get_proposal_by_id(proposal_id)
    if proposal is None:
        raise HTTPException(status_code=404, detail=f"Proposal {proposal_id} not found")
    return proposal


@app.get("/api/debates/history")
async def list_debate_history() -> dict[str, list[dict]]:
    """Return 3 mock historical debates for audit trail tab.

    Each debate has: proposal meta, 5 agent statements with primary source
    attribution, consensus verdict, 0G Storage CID, optional tx hash, and
    per-agent reputation deltas. Used to populate audit trail before live
    debates accumulate during demo.
    """
    return {"debates": get_historical_debates()}


@app.get("/api/debates/history/{debate_id}")
async def get_debate_history_detail(debate_id: str) -> dict:
    """Return single historical debate by id (detail view)."""
    debate = get_debate_by_id(debate_id)
    if debate is None:
        raise HTTPException(status_code=404, detail=f"Debate {debate_id} not found")
    return debate
