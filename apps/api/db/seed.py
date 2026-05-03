"""Seed script: idempotently import historical debates from data/seed_historical_debates.

Called from main.py lifespan after migrations. If the debates table is empty,
inserts the 4 mock debates from Lumen Sesja 27 so /api/debates/history has
data on a fresh deploy.
"""

from __future__ import annotations

from typing import Any

import structlog

from data.seed_historical_debates import get_historical_debates
from db import is_connected, session_scope
from db.repositories.debate_repo import DebateRepo

log = structlog.get_logger()


async def seed_historical_debates_if_empty() -> int:
    """Returns count of newly-inserted debates (0 when DB already has data or DB down)."""
    if not is_connected():
        return 0
    async with session_scope() as session:
        repo = DebateRepo(session)
        existing_count = await repo.count()
        if existing_count > 0:
            log.info("seed_skipped_db_not_empty", existing=existing_count)
            return 0

        seeded: list[str] = []
        for entry in get_historical_debates():
            debate_id = str(entry.get("id") or entry.get("debate_id") or entry.get("vote_id") or "")
            if not debate_id:
                continue
            await repo.create(
                debate_id=debate_id,
                proposal_id=str(entry.get("proposal_id", debate_id)),
                proposal_text=str(entry.get("proposal_text") or entry.get("proposal") or "")[:8000],
                consensus=str(entry.get("consensus", "ABSTAIN")),
                confidence=float(entry.get("confidence", 0.0)),
                cost_usd=float(entry.get("cost_usd", 0.0)),
                audit_trail_cid=entry.get("audit_trail_cid"),
                storage_provider=entry.get("storage_provider"),
            )
            statements: list[dict[str, Any]] = []
            for s in entry.get("agent_statements") or entry.get("decisions") or []:
                statements.append(
                    {
                        "persona": str(s.get("persona") or s.get("agent_id", "unknown")),
                        "decision": str(s.get("decision", "ABSTAIN")),
                        "text": str(s.get("text") or s.get("reasoning", ""))[:4000],
                        "confidence": float(s.get("confidence", 0.0)),
                        "sources_json": s.get("sources") or [],
                    }
                )
            if statements:
                await repo.add_statements(debate_id, statements)
            seeded.append(debate_id)
        log.info("seed_inserted", count=len(seeded), ids=seeded)
        return len(seeded)
