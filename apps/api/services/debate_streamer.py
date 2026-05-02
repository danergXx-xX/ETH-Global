"""
WebSocket streamer for /ws/debate.

Wraps run_debate (Nova's orchestrator in apps/api/agents/) and emits a
typed event sequence:

  agent_statement (x N)  -> consensus  -> reputation_update  -> complete

Strategy: keep agents/orchestrator.py untouched (Nova's territory). After
run_debate completes, replay decisions as agent_statement events with a
configurable inter-event delay so the frontend gets a streaming UX.

Reputation updates are dispatched on-chain via ReputationUpdater. Failures
are logged and surfaced in the reputation_update event but do not abort
the stream (debate must always reach 'complete').
"""

from __future__ import annotations

import asyncio
import time
from datetime import datetime, timezone
from typing import Any, AsyncIterator

import structlog

from agents.orchestrator import run_debate
from services.reputation_updater import (
    ReputationUpdate,
    compute_updates_for_debate,
    get_reputation_updater,
)

log = structlog.get_logger()


def _utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _serialize_sources(sources: list[Any]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for s in sources or []:
        # AgentClaim.sources are pydantic Source models; flatten for the wire
        try:
            out.append(s.model_dump(mode="json"))
        except AttributeError:
            if isinstance(s, dict):
                out.append(s)
    return out


def _decision_text(decision: Any) -> str:
    """Concatenate claim texts (fallback to reasoning) for the streamed agent statement."""
    if getattr(decision, "claims", None):
        joined = " ".join(c.text for c in decision.claims if getattr(c, "text", None))
        if joined.strip():
            return joined
    return getattr(decision, "reasoning", "") or ""


def _aggregate_sources(decision: Any) -> list[dict[str, Any]]:
    seen: set[str] = set()
    out: list[dict[str, Any]] = []
    for claim in getattr(decision, "claims", []) or []:
        for src in _serialize_sources(getattr(claim, "sources", [])):
            url = src.get("url")
            if url and url in seen:
                continue
            if url:
                seen.add(url)
            out.append(src)
    return out


async def stream_debate(
    proposal_id: str,
    proposal_text: str,
    *,
    step_delay_s: float = 0.25,
) -> AsyncIterator[dict[str, Any]]:
    """
    Run a debate and yield WebSocket-ready event dicts.

    Ordering invariants:
    1. exactly one event per persona of type 'agent_statement'
    2. exactly one 'consensus' event after all statements
    3. exactly one 'reputation_update' event after consensus (may be empty)
    4. exactly one terminal 'complete' event

    Errors during reputation updates are reported in event['updates'] entries
    with status='failed'; the stream still ends with 'complete'.
    """
    started_at = time.perf_counter()
    log.info("ws_debate_start", proposal_id=proposal_id, text_length=len(proposal_text))

    # Run full debate first - keeps agents/orchestrator.py untouched (Nova's scope).
    result = await run_debate(proposal_text)
    decisions: list[Any] = result["decisions"]
    consensus: str = result["consensus"]
    vote_id: str = result["vote_id"]

    for decision in decisions:
        yield {
            "type": "agent_statement",
            "proposal_id": proposal_id,
            "agent": decision.persona,
            "decision": decision.decision,
            "confidence": decision.confidence,
            "text": _decision_text(decision),
            "sources": _aggregate_sources(decision),
            "timestamp": _utcnow_iso(),
        }
        if step_delay_s > 0:
            await asyncio.sleep(step_delay_s)

    confidence_pct = round(
        100 * sum(d.confidence for d in decisions) / max(len(decisions), 1)
    )
    yield {
        "type": "consensus",
        "proposal_id": proposal_id,
        "verdict": consensus,
        "confidence": confidence_pct,
        "vote_id": vote_id,
        "timestamp": _utcnow_iso(),
    }

    # Reputation updates - on-chain dispatch (best-effort)
    rep_updates = await _dispatch_reputation_updates(decisions, consensus)
    yield {
        "type": "reputation_update",
        "proposal_id": proposal_id,
        "updates": [
            {
                "agent": u.persona,
                "address": u.address,
                "delta": u.delta,
                "new_score": u.new_score,
                "tx_hash": u.tx_hash,
                "status": u.status,
                "error": u.error,
            }
            for u in rep_updates
        ],
        "timestamp": _utcnow_iso(),
    }

    yield {
        "type": "complete",
        "proposal_id": proposal_id,
        "elapsed_s": round(time.perf_counter() - started_at, 2),
        "timestamp": _utcnow_iso(),
    }
    log.info(
        "ws_debate_complete",
        proposal_id=proposal_id,
        consensus=consensus,
        rep_updates=len(rep_updates),
    )


async def _dispatch_reputation_updates(
    decisions: list[Any],
    consensus: str,
) -> list[ReputationUpdate]:
    pairs: list[tuple[str, str]] = [(d.persona, d.decision) for d in decisions]
    planned = compute_updates_for_debate(pairs, consensus)  # type: ignore[arg-type]
    if not planned:
        return []

    updater = get_reputation_updater()
    if updater is None:
        return [
            ReputationUpdate(
                persona=persona,
                address=address,
                delta=delta,
                new_score=None,
                tx_hash=None,
                status="skipped_unauthorized",
                error="reputation updater not configured",
            )
            for persona, address, delta in planned
        ]

    results = await asyncio.gather(
        *[updater.update_reputation_async(addr, delta) for _, addr, delta in planned],
        return_exceptions=True,
    )
    out: list[ReputationUpdate] = []
    for (persona, address, delta), res in zip(planned, results, strict=True):
        if isinstance(res, ReputationUpdate):
            out.append(res)
        else:
            log.error(
                "reputation_dispatch_exception",
                persona=persona,
                error_type=type(res).__name__,
                error=str(res),
            )
            out.append(
                ReputationUpdate(
                    persona=persona,
                    address=address,
                    delta=delta,
                    new_score=None,
                    tx_hash=None,
                    status="failed",
                    error=str(res),
                )
            )
    return out
