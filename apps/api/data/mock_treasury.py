"""
Mock treasury portfolio data for /api/treasury/portfolio endpoint.

Realistic demo numbers (~$1.5M total) until real on-chain integration
ships post-hackathon. Numbers are intentionally consistent: token USD values
sum within rounding to total_usd, allocation_pct sums to 100%, protocol
balances sum to a sensible subset of total (treasury can also hold cash).
"""

from __future__ import annotations

from datetime import datetime, timezone, timedelta

from schemas import (
    PortfolioResponse,
    ProtocolAllocation,
    RecentDecision,
    TokenHolding,
)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def get_mock_portfolio() -> PortfolioResponse:
    """Return a realistic treasury snapshot for the demo."""
    now = _utcnow()
    tokens = [
        TokenHolding(
            symbol="mUSDC",
            balance=1_000_000.0,
            usd_value=1_000_000.0,
            allocation_pct=66.67,
        ),
        TokenHolding(
            symbol="ETH",
            balance=120.0,
            usd_value=300_000.0,
            allocation_pct=20.0,
        ),
        TokenHolding(
            symbol="WBTC",
            balance=2.0,
            usd_value=140_000.0,
            allocation_pct=9.33,
        ),
        TokenHolding(
            symbol="UNI",
            balance=8_000.0,
            usd_value=60_000.0,
            allocation_pct=4.0,
        ),
    ]
    protocols = [
        ProtocolAllocation(
            name="Aave v3 (aUSDC)",
            balance_usd=250_000.0,
            apy=4.20,
            risk_score=18,
        ),
        ProtocolAllocation(
            name="Compound v3",
            balance_usd=150_000.0,
            apy=3.85,
            risk_score=22,
        ),
        ProtocolAllocation(
            name="Uniswap v4 LP (USDC/ETH)",
            balance_usd=100_000.0,
            apy=12.30,
            risk_score=45,
        ),
        ProtocolAllocation(
            name="Lido (stETH)",
            balance_usd=80_000.0,
            apy=3.10,
            risk_score=20,
        ),
    ]
    recent_decisions = [
        RecentDecision(
            proposal_id="prop-001",
            verdict="FOR",
            impact_usd=250_000.0,
            executed_at=now - timedelta(days=1, hours=4),
        ),
        RecentDecision(
            proposal_id="prop-002",
            verdict="AGAINST",
            impact_usd=0.0,
            executed_at=now - timedelta(days=2, hours=11),
        ),
        RecentDecision(
            proposal_id="prop-003",
            verdict="FOR",
            impact_usd=100_000.0,
            executed_at=now - timedelta(days=4, hours=2),
        ),
        RecentDecision(
            proposal_id="prop-004",
            verdict="SPLIT",
            impact_usd=-15_000.0,
            executed_at=now - timedelta(days=6, hours=8),
        ),
    ]
    return PortfolioResponse(
        total_usd=1_500_000.0,
        tokens=tokens,
        protocols=protocols,
        pnl_7d=12_450.75,
        recent_decisions=recent_decisions,
    )
