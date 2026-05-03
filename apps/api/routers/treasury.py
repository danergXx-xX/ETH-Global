"""GET /api/treasury/portfolio - mock snapshot until on-chain integration."""

from __future__ import annotations

import structlog
from fastapi import APIRouter

from data.mock_treasury import get_mock_portfolio
from schemas import PortfolioResponse

log = structlog.get_logger()

router = APIRouter(prefix="/api/treasury", tags=["treasury"])


@router.get(
    "/portfolio",
    response_model=PortfolioResponse,
    summary="Treasury portfolio snapshot",
    description=(
        "Returns total USD value, per-token holdings, deployed protocol "
        "positions, 7-day P&L, and recent council decisions. Mock data for "
        "demo - swap to live on-chain reads post-hackathon."
    ),
)
async def get_portfolio() -> PortfolioResponse:
    log.info("portfolio_requested")
    return get_mock_portfolio()
