"""
Phase 3 source attribution integration tests.

Tests that agents receive pre-fetched sources, inject them into prompts,
and produce claims with source citations.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from agents.anthropic_client import AnthropicClient, UsageStats
from agents.bull_agent import run_bull
from agents.orchestrator import _fetch_global_sources
from agents.personas import ALL_PERSONAS
from agents.tools import format_sources_context
from data.aggregator import DataAggregator
from schemas import AgentDecision, Source


MOCK_USAGE = UsageStats(
    input_tokens=500,
    output_tokens=300,
    cache_read_input_tokens=400,
    cache_creation_input_tokens=0,
    cost_usd=0.008,
    latency_s=2.5,
)

SAMPLE_SOURCES = [
    Source(
        url="https://www.coingecko.com/en/coins/ethereum",
        title="Ethereum Market Data",
        snippet="Ethereum: $3,200 | 24h +5.2% | 7d +12.3% | MCap $385B",
        weight=0.85,
        source_type="coingecko",
    ),
    Source(
        url="https://defillama.com/protocol/aave",
        title="Aave TVL Data",
        snippet="Aave (Lending): TVL $12,500M | Chains: Ethereum, Polygon, Avalanche",
        weight=0.85,
        source_type="defillama",
    ),
    Source(
        url="https://coindesk.com/markets/eth-rally",
        title="ETH Rally Continues as Fed Signals Rate Cuts",
        snippet="Ethereum surged 12% this week as the Federal Reserve...",
        weight=0.7,
        source_type="rss",
    ),
]


def _make_bull_response_with_sources() -> str:
    """Generate valid AgentDecision JSON with source citations."""
    return json.dumps(
        {
            "persona": "bull",
            "decision": "FOR",
            "confidence": 0.82,
            "reasoning": (
                "ETH shows strong momentum with 12% weekly gain and $385B market cap. "
                "Aave TVL at $12.5B indicates healthy DeFi ecosystem. "
                "Fed dovish stance provides macro tailwind for risk assets."
            ),
            "claims": [
                {
                    "text": "ETH price momentum strong with +12.3% in 7 days",
                    "confidence": 0.85,
                    "sources": [
                        {
                            "url": "https://www.coingecko.com/en/coins/ethereum",
                            "title": "Ethereum Market Data",
                            "snippet": "Ethereum: $3,200 | 24h +5.2% | 7d +12.3%",
                            "weight": 0.9,
                            "source_type": "coingecko",
                        }
                    ],
                },
                {
                    "text": "Aave TVL at $12.5B shows strong DeFi adoption",
                    "confidence": 0.8,
                    "sources": [
                        {
                            "url": "https://defillama.com/protocol/aave",
                            "title": "Aave TVL Data",
                            "snippet": "Aave (Lending): TVL $12,500M",
                            "weight": 0.85,
                            "source_type": "defillama",
                        }
                    ],
                },
            ],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )


# ============================================================
# TEST 1: Bull agent receives sources in prompt
# ============================================================


@pytest.mark.asyncio
async def test_bull_agent_uses_sources() -> None:
    """Bull agent receives pre-fetched sources and includes them in the prompt sent to Anthropic."""
    mock_response = _make_bull_response_with_sources()
    client = AnthropicClient(api_key="test-key")

    with patch.object(client, "call_with_cache", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = (mock_response, MOCK_USAGE)

        result = await run_bull("Swap 50 ETH for USDC", client, pre_fetched_sources=SAMPLE_SOURCES)

        assert mock_call.call_count == 1
        user_msg = mock_call.call_args.kwargs.get("user_message", "")
        assert user_msg, "Failed to extract user_message from mock call"

        assert "AVAILABLE DATA SOURCES" in user_msg
        assert "Ethereum Market Data" in user_msg
        assert "Aave TVL Data" in user_msg
        assert "coingecko" in user_msg
        assert "EVERY claim MUST cite" in user_msg

    assert isinstance(result, AgentDecision)
    assert result.persona == "bull"


# ============================================================
# TEST 2: Bull claims have sources (not empty)
# ============================================================


@pytest.mark.asyncio
async def test_bull_agent_claims_have_sources() -> None:
    """AgentDecision.claims[].sources is NOT empty when sources provided."""
    mock_response = _make_bull_response_with_sources()
    client = AnthropicClient(api_key="test-key")

    with patch.object(client, "call_with_cache", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = (mock_response, MOCK_USAGE)

        result = await run_bull("Deposit 10 ETH to Aave", client, pre_fetched_sources=SAMPLE_SOURCES)

    assert len(result.claims) >= 1, "Bull must produce at least 1 claim"
    for claim in result.claims:
        assert len(claim.sources) >= 1, f"Claim '{claim.text[:50]}' has no sources"
        for source in claim.sources:
            assert source.url, "Source must have URL"
            assert source.title, "Source must have title"


# ============================================================
# TEST 3: Orchestrator fetches sources globally (shared cache)
# ============================================================


@pytest.mark.asyncio
async def test_orchestrator_aggregates_sources_globally() -> None:
    """Global source fetch deduplicates: each source_type fetched only once."""
    mock_aggregator = AsyncMock(spec=DataAggregator)

    async def mock_fetch(query: str, source_priority: list[str], limit_per_source: int = 3) -> list[Source]:
        src_type = source_priority[0] if source_priority else "unknown"
        return [
            Source(
                url=f"https://example.com/{src_type}",
                title=f"Mock {src_type} data",
                snippet=f"Data from {src_type}",
                weight=0.8,
                source_type=src_type,
            )
        ]

    mock_aggregator.fetch_for_query = AsyncMock(side_effect=mock_fetch)

    persona_sources = await _fetch_global_sources(
        mock_aggregator, "Swap ETH for USDC", ALL_PERSONAS
    )

    unique_types = set()
    for persona in ALL_PERSONAS:
        unique_types.update(persona.sources_priority)

    assert mock_aggregator.fetch_for_query.call_count == len(unique_types), (
        f"Expected {len(unique_types)} calls (one per source type), "
        f"got {mock_aggregator.fetch_for_query.call_count}"
    )

    for persona in ALL_PERSONAS:
        assert persona.persona_id in persona_sources
        assert len(persona_sources[persona.persona_id]) >= 1


# ============================================================
# TEST 4: Graceful degradation when DataAggregator fails
# ============================================================


@pytest.mark.asyncio
async def test_data_aggregator_failure_graceful() -> None:
    """Bull still returns valid decision even when source fetch returns empty."""
    mock_response = json.dumps(
        {
            "persona": "bull",
            "decision": "ABSTAIN",
            "confidence": 0.3,
            "reasoning": (
                "No external data sources available. Cannot make confident assessment. "
                "Abstaining due to lack of market data, TVL metrics, and news."
            ),
            "claims": [
                {
                    "text": "Unable to verify market conditions due to data unavailability",
                    "confidence": 0.2,
                    "sources": [
                        {
                            "url": "https://aicouncil.eth",
                            "title": "No external data available",
                            "snippet": "Source fetch failed - decision made without external data",
                            "weight": 0.1,
                            "source_type": None,
                        }
                    ],
                }
            ],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )

    client = AnthropicClient(api_key="test-key")

    with patch.object(client, "call_with_cache", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = (mock_response, MOCK_USAGE)

        result = await run_bull("Swap 100 ETH for SHIB", client, pre_fetched_sources=[])

    assert isinstance(result, AgentDecision)
    assert result.persona == "bull"
    assert len(result.claims) >= 1

    user_msg = mock_call.call_args.kwargs.get("user_message", "")
    assert user_msg, "Failed to extract user_message from mock call"
    assert "No external data sources were available" in user_msg


# ============================================================
# TEST 5: format_sources_context output structure
# ============================================================


def test_format_sources_context_with_sources() -> None:
    """format_sources_context produces structured text block with all sources."""
    context = format_sources_context(SAMPLE_SOURCES)

    assert "AVAILABLE DATA SOURCES" in context
    assert "END SOURCES" in context
    assert "Ethereum Market Data" in context
    assert "Aave TVL Data" in context
    assert "[1]" in context
    assert "[2]" in context
    assert "[3]" in context
    assert "EVERY claim MUST cite" in context


def test_format_sources_context_empty() -> None:
    """format_sources_context handles empty sources list gracefully."""
    context = format_sources_context([])

    assert "No external data sources were available" in context
    assert "lower your confidence" in context


# ============================================================
# TEST 6: Bull backward compatibility (no sources = Phase 0 mode)
# ============================================================


@pytest.mark.asyncio
async def test_bull_backward_compatible_no_sources() -> None:
    """Bull works without pre_fetched_sources (Phase 0 backward compat)."""
    mock_response = json.dumps(
        {
            "persona": "bull",
            "decision": "FOR",
            "confidence": 0.75,
            "reasoning": "Strong opportunity based on market conditions and adoption trends.",
            "claims": [
                {
                    "text": "Market shows bullish momentum",
                    "confidence": 0.75,
                    "sources": [
                        {
                            "url": "https://defillama.com",
                            "title": "DeFi data",
                            "snippet": "General DeFi metrics",
                            "weight": 0.5,
                            "source_type": "defillama",
                        }
                    ],
                }
            ],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )

    client = AnthropicClient(api_key="test-key")

    with patch.object(client, "call_with_cache", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = (mock_response, MOCK_USAGE)

        result = await run_bull("Swap 50 ETH for USDC", client)

    assert isinstance(result, AgentDecision)

    user_msg = mock_call.call_args.kwargs.get("user_message", "")
    assert user_msg, "Failed to extract user_message from mock call"
    assert "AVAILABLE DATA SOURCES" not in user_msg
