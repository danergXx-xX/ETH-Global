from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import AsyncIterator

import structlog
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from governance import (
    MOCK_USDC_ADDRESS,
    MOCK_USDC_DECIMALS,
    SAMPLE_RECIPIENTS,
    encode_mock_usdc_transfer,
)
from logging_config import RequestIDMiddleware, setup_logging
from agents.orchestrator import run_debate
from schemas import (
    DebateRequest,
    DebateResponse,
    HealthResponse,
    ProposalEncodeRequest,
    ProposalEncoded,
    RecipientInfo,
    RecipientsResponse,
)
import httpx

from storage.factory import StorageConfigError, StorageFallbackError, upload_with_fallback

settings = get_settings()
setup_logging(env=settings.env, log_level=settings.log_level)
log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    log.info("api_ready", env=settings.env, version="0.1.0")
    yield
    log.info("api_shutdown")


app = FastAPI(
    title="AI Treasury Council API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Request-ID", "Authorization"],
)
app.add_middleware(RequestIDMiddleware)


@app.get("/health")
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        version="0.1.0",
        timestamp=datetime.now(timezone.utc),
    )


@app.post("/api/debate")
async def debate(req: DebateRequest) -> DebateResponse:
    log.info("debate_requested", text_length=len(req.text))
    result = await run_debate(req.text)
    log.info("debate_complete", consensus=result["consensus"])

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
    except (StorageFallbackError, StorageConfigError, httpx.HTTPError, ConnectionError, OSError) as storage_err:
        log.error("audit_trail_failed", error=str(storage_err), error_type=type(storage_err).__name__)

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


@app.get("/api/proposals/recipients")
async def list_recipients() -> RecipientsResponse:
    """List available demo recipients for proposal UI."""
    from eth_utils import to_checksum_address

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
