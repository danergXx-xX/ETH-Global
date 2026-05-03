"""
Mock protocol registry for /api/protocols endpoint.

15-20 entries covering lending, DEX, staking, derivatives. TVL numbers are
illustrative for demo - replace with live DefiLlama feed in Phase 4 stretch.
Audit history references real firms (Trail of Bits, OpenZeppelin, Spearbit,
Certora) and dates that match what is publicly known at session time.
"""

from __future__ import annotations

from schemas import AuditRef, Protocol


def _audit(firm: str, date: str, slug: str) -> AuditRef:
    return AuditRef(
        firm=firm,
        date=date,
        report_url=f"https://github.com/{slug}",
    )


MOCK_PROTOCOLS: list[Protocol] = [
    Protocol(
        id="aave-v3",
        name="Aave v3",
        category="lending",
        chain="ethereum",
        tvl_usd=12_400_000_000.0,
        status="approved",
        risk_flags=[],
        audit_history=[
            _audit("Trail of Bits", "2024-09-12", "aave/audits/tob-aave-v3.pdf"),
            _audit("OpenZeppelin", "2024-06-04", "aave/audits/oz-aave-v3.pdf"),
            _audit("Certora", "2024-04-22", "aave/audits/certora-aave-v3.pdf"),
        ],
    ),
    Protocol(
        id="compound-v3",
        name="Compound v3",
        category="lending",
        chain="ethereum",
        tvl_usd=2_700_000_000.0,
        status="approved",
        risk_flags=[],
        audit_history=[
            _audit("OpenZeppelin", "2024-05-30", "compound/audits/oz-comet.pdf"),
            _audit("ChainSecurity", "2024-03-18", "compound/audits/cs-comet.pdf"),
        ],
    ),
    Protocol(
        id="uniswap-v4",
        name="Uniswap v4",
        category="dex",
        chain="ethereum",
        tvl_usd=4_800_000_000.0,
        status="approved",
        risk_flags=["new_protocol"],
        audit_history=[
            _audit("Trail of Bits", "2024-12-01", "uniswap/audits/tob-v4.pdf"),
            _audit("Spearbit", "2024-11-04", "uniswap/audits/spearbit-v4.pdf"),
        ],
    ),
    Protocol(
        id="curve-finance",
        name="Curve Finance",
        category="dex",
        chain="ethereum",
        tvl_usd=2_100_000_000.0,
        status="approved",
        risk_flags=["historical_exploit"],
        audit_history=[
            _audit("Trail of Bits", "2023-10-12", "curve/audits/tob-stableswap.pdf"),
            _audit("MixBytes", "2023-08-20", "curve/audits/mixbytes-tricrypto.pdf"),
        ],
    ),
    Protocol(
        id="lido",
        name="Lido (stETH)",
        category="staking",
        chain="ethereum",
        tvl_usd=33_500_000_000.0,
        status="approved",
        risk_flags=["validator_concentration"],
        audit_history=[
            _audit("StateMind", "2024-07-09", "lido/audits/statemind-lido.pdf"),
            _audit("OpenZeppelin", "2024-02-15", "lido/audits/oz-lido.pdf"),
        ],
    ),
    Protocol(
        id="rocketpool",
        name="Rocket Pool",
        category="staking",
        chain="ethereum",
        tvl_usd=3_900_000_000.0,
        status="approved",
        risk_flags=[],
        audit_history=[
            _audit("Sigma Prime", "2024-05-20", "rocketpool/audits/sigp.pdf"),
        ],
    ),
    Protocol(
        id="makerdao-spark",
        name="Spark (MakerDAO)",
        category="lending",
        chain="ethereum",
        tvl_usd=2_300_000_000.0,
        status="approved",
        risk_flags=[],
        audit_history=[
            _audit("ChainSecurity", "2024-04-11", "makerdao/audits/cs-spark.pdf"),
        ],
    ),
    Protocol(
        id="balancer-v3",
        name="Balancer v3",
        category="dex",
        chain="ethereum",
        tvl_usd=820_000_000.0,
        status="under_review",
        risk_flags=["new_version", "pending_audit"],
        audit_history=[
            _audit("Spearbit", "2024-10-29", "balancer/audits/spearbit-v3.pdf"),
        ],
    ),
    Protocol(
        id="gmx-v2",
        name="GMX v2",
        category="derivatives",
        chain="arbitrum",
        tvl_usd=560_000_000.0,
        status="approved",
        risk_flags=["oracle_dependency"],
        audit_history=[
            _audit("ABDK", "2024-02-01", "gmx/audits/abdk-v2.pdf"),
            _audit("Sherlock", "2024-01-10", "gmx/audits/sherlock-v2.pdf"),
        ],
    ),
    Protocol(
        id="dydx-v4",
        name="dYdX v4",
        category="derivatives",
        chain="dydx-chain",
        tvl_usd=420_000_000.0,
        status="light",
        risk_flags=["app_chain", "new_consensus"],
        audit_history=[
            _audit("Informal Systems", "2024-03-05", "dydx/audits/informal-v4.pdf"),
        ],
    ),
    Protocol(
        id="pendle",
        name="Pendle Finance",
        category="yield",
        chain="ethereum",
        tvl_usd=4_100_000_000.0,
        status="approved",
        risk_flags=[],
        audit_history=[
            _audit("Ackee Blockchain", "2024-08-21", "pendle/audits/ackee.pdf"),
            _audit("WatchPug", "2024-06-30", "pendle/audits/watchpug.pdf"),
        ],
    ),
    Protocol(
        id="morpho-blue",
        name="Morpho Blue",
        category="lending",
        chain="ethereum",
        tvl_usd=1_700_000_000.0,
        status="approved",
        risk_flags=[],
        audit_history=[
            _audit("Spearbit", "2024-07-14", "morpho/audits/spearbit-blue.pdf"),
            _audit("Cantina", "2024-05-22", "morpho/audits/cantina-blue.pdf"),
        ],
    ),
    Protocol(
        id="euler-v2",
        name="Euler v2",
        category="lending",
        chain="ethereum",
        tvl_usd=540_000_000.0,
        status="under_review",
        risk_flags=["historical_exploit", "v2_recent"],
        audit_history=[
            _audit("Spearbit", "2024-09-25", "euler/audits/spearbit-v2.pdf"),
            _audit("Certora", "2024-08-12", "euler/audits/certora-v2.pdf"),
        ],
    ),
    Protocol(
        id="ethena-usde",
        name="Ethena (USDe)",
        category="stablecoin",
        chain="ethereum",
        tvl_usd=3_200_000_000.0,
        status="under_review",
        risk_flags=["funding_rate_dependent", "synthetic_dollar"],
        audit_history=[
            _audit("Pashov", "2024-04-04", "ethena/audits/pashov.pdf"),
        ],
    ),
    Protocol(
        id="frax-v3",
        name="Frax v3",
        category="stablecoin",
        chain="ethereum",
        tvl_usd=620_000_000.0,
        status="approved",
        risk_flags=[],
        audit_history=[
            _audit("Trail of Bits", "2024-03-30", "frax/audits/tob-v3.pdf"),
        ],
    ),
    Protocol(
        id="convex",
        name="Convex Finance",
        category="yield",
        chain="ethereum",
        tvl_usd=2_400_000_000.0,
        status="approved",
        risk_flags=[],
        audit_history=[
            _audit("MixBytes", "2023-11-02", "convex/audits/mixbytes.pdf"),
        ],
    ),
    Protocol(
        id="uniswap-v3",
        name="Uniswap v3",
        category="dex",
        chain="ethereum",
        tvl_usd=5_100_000_000.0,
        status="approved",
        risk_flags=[],
        audit_history=[
            _audit("Trail of Bits", "2021-03-22", "uniswap/audits/tob-v3.pdf"),
            _audit("ABDK", "2021-04-08", "uniswap/audits/abdk-v3.pdf"),
        ],
    ),
    Protocol(
        id="anchor-protocol",
        name="Anchor Protocol",
        category="lending",
        chain="terra",
        tvl_usd=0.0,
        status="banned",
        risk_flags=["protocol_failed", "depeg_history"],
        audit_history=[],
    ),
]


def get_mock_protocols() -> list[Protocol]:
    """Return registry snapshot. Defensive copy so callers cannot mutate cache."""
    return list(MOCK_PROTOCOLS)
