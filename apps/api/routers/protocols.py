"""GET /api/protocols - protocol registry (lending, DEX, staking, derivatives)."""

from __future__ import annotations

import structlog
from fastapi import APIRouter, Query

from data.mock_protocols import get_mock_protocols
from schemas import Protocol, ProtocolCategory, ProtocolStatus

log = structlog.get_logger()

router = APIRouter(prefix="/api/protocols", tags=["protocols"])


@router.get(
    "",
    response_model=list[Protocol],
    summary="Protocol registry",
    description=(
        "Returns DeFi protocols available to the council with status, audit "
        "history, and risk flags. Optional query filters: category, status. "
        "Mock data for demo - live DefiLlama integration is a Phase 4 stretch."
    ),
)
async def list_protocols(
    category: ProtocolCategory | None = Query(default=None),
    status: ProtocolStatus | None = Query(default=None),
) -> list[Protocol]:
    items = get_mock_protocols()
    if category is not None:
        items = [p for p in items if p.category == category]
    if status is not None:
        items = [p for p in items if p.status == status]
    log.info("protocols_listed", returned=len(items), category=category, status=status)
    return items
