"""
Sesja 21: tests for the 4 new persona agents (Bear, Risk, Tech, Sentiment).

Mirrors test_bull_agent.py structure to keep coverage symmetric across the
roster. Each persona gets:
- mocked golden questions (parametrized over GOLDEN_QUESTIONS[persona])
- statement-with-sources test (Phase 3 contract)
- min-2-sources-per-claim invariant for Bear and Risk (analyst personas
  that should not commit on a single data point)
- retry-on-invalid-json test
- backward-compat test (no pre_fetched_sources)
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Awaitable, Callable
from unittest.mock import AsyncMock, patch

import pytest

from agents.anthropic_client import AnthropicClient, UsageStats
from agents.bear_agent import run_bear
from agents.personas import GOLDEN_QUESTIONS
from agents.risk_agent import run_risk
from agents.sentiment_agent import run_sentiment
from agents.tech_agent import run_tech
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
        url="https://defillama.com/protocol/aave",
        title="Aave TVL",
        snippet="Aave TVL $12.5B, 30d -2%",
        weight=0.85,
        source_type="defillama",
    ),
    Source(
        url="https://www.coingecko.com/en/coins/ethereum",
        title="ETH Market Data",
        snippet="ETH $3200, 30d vol 4%",
        weight=0.85,
        source_type="coingecko",
    ),
    Source(
        url="https://coindesk.com/markets/eth-incident",
        title="DeFi Hack Roundup Q2",
        snippet="Three protocols exploited, $40M total losses",
        weight=0.8,
        source_type="rss",
    ),
]


def _make_response(
    persona: str,
    decision: str,
    confidence: float,
    sources: list[Source] | None = None,
    num_claims: int = 2,
) -> str:
    """Generate valid AgentDecision JSON string for a persona under test."""
    use_sources = sources if sources is not None else SAMPLE_SOURCES
    serialized_sources = [
        {
            "url": s.url,
            "title": s.title,
            "snippet": s.snippet,
            "weight": s.weight,
            "source_type": s.source_type,
        }
        for s in use_sources[: max(1, num_claims)]
    ]
    claims = [
        {
            "text": f"Claim {i + 1} from {persona}",
            "confidence": confidence,
            "sources": [serialized_sources[i % len(serialized_sources)]],
        }
        for i in range(num_claims)
    ]
    return json.dumps(
        {
            "persona": persona,
            "decision": decision,
            "confidence": confidence,
            "reasoning": (
                f"{persona.capitalize()} reasoning with specifics. "
                "Numbers cited, protocol named, source-aware. "
                "Three sentences gives the model space to commit."
            ),
            "claims": claims,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )


# ============================================================
# PARAMETRIZED GOLDEN QUESTIONS - mocked
# ============================================================


PERSONA_RUNNERS: dict[
    str,
    Callable[..., Awaitable[AgentDecision]],
] = {
    "bear": run_bear,
    "risk": run_risk,
    "tech": run_tech,
    "sentiment": run_sentiment,
}


@pytest.mark.asyncio
@pytest.mark.parametrize("persona", ["bear", "risk", "tech", "sentiment"])
@pytest.mark.parametrize("scenario_idx", range(5))
async def test_persona_golden_mocked(persona: str, scenario_idx: int) -> None:
    """Each persona returns expected decision for its 5 golden questions (mocked)."""
    scenario = GOLDEN_QUESTIONS[persona][scenario_idx]
    expected = scenario["expected_decision"]
    lo, hi = scenario["expected_confidence_range"]
    mock_confidence = (lo + hi) / 2 if hi > lo else lo

    mock_json = _make_response(persona, expected, mock_confidence)
    client = AnthropicClient(api_key="test-key")
    runner = PERSONA_RUNNERS[persona]

    with patch.object(client, "call_with_cache", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = (mock_json, MOCK_USAGE)
        result = await runner(scenario["scenario"], client, pre_fetched_sources=SAMPLE_SOURCES)

    assert isinstance(result, AgentDecision)
    assert result.persona == persona
    assert result.decision == expected
    assert lo <= result.confidence <= hi
    assert result.tokens_used == 800
    assert result.cost_usd == 0.008


# ============================================================
# STATEMENT WITH SOURCES (Phase 3 contract)
# ============================================================


@pytest.mark.asyncio
@pytest.mark.parametrize("persona", ["bear", "risk", "tech", "sentiment"])
async def test_persona_generates_statement_with_sources(persona: str) -> None:
    """Each persona produces claims that cite at least one source from the prompt."""
    mock_json = _make_response(persona, "FOR", 0.7)
    client = AnthropicClient(api_key="test-key")
    runner = PERSONA_RUNNERS[persona]

    with patch.object(client, "call_with_cache", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = (mock_json, MOCK_USAGE)
        result = await runner("Sample proposal", client, pre_fetched_sources=SAMPLE_SOURCES)

        user_msg = mock_call.call_args.kwargs.get("user_message", "")
        assert "AVAILABLE DATA SOURCES" in user_msg
        assert "Aave TVL" in user_msg

    assert len(result.claims) >= 1
    for claim in result.claims:
        assert len(claim.sources) >= 1
        assert claim.sources[0].url.startswith("http")


# ============================================================
# MIN 2 SOURCES PER CLAIM - Bear and Risk specifically
# Per handoff: Bear and Risk have stricter source attribution
# ("min 2 zrodla per claim").
# ============================================================


@pytest.mark.asyncio
@pytest.mark.parametrize("persona", ["bear", "risk"])
async def test_persona_min_2_sources_invariant(persona: str) -> None:
    """Bear and Risk should accept claims with 2+ sources without rejection."""
    response_data = {
        "persona": persona,
        "decision": "AGAINST",
        "confidence": 0.7,
        "reasoning": "Risk concentration plus volatility above tolerance threshold.",
        "claims": [
            {
                "text": "Volatility 30d at 18% exceeds 12% target with TVL flat",
                "confidence": 0.8,
                "sources": [
                    {
                        "url": "https://www.coingecko.com/en/coins/ethereum",
                        "title": "ETH Market Data",
                        "snippet": "30d vol 18%",
                        "weight": 0.9,
                        "source_type": "coingecko",
                    },
                    {
                        "url": "https://defillama.com/protocol/aave",
                        "title": "Aave TVL",
                        "snippet": "Aave TVL flat 30d",
                        "weight": 0.8,
                        "source_type": "defillama",
                    },
                ],
            }
        ],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    mock_json = json.dumps(response_data)

    client = AnthropicClient(api_key="test-key")
    runner = PERSONA_RUNNERS[persona]

    with patch.object(client, "call_with_cache", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = (mock_json, MOCK_USAGE)
        result = await runner("Test", client, pre_fetched_sources=SAMPLE_SOURCES)

    assert len(result.claims) == 1
    assert len(result.claims[0].sources) == 2


# ============================================================
# RETRY ON INVALID JSON
# ============================================================


@pytest.mark.asyncio
@pytest.mark.parametrize("persona", ["bear", "risk", "tech", "sentiment"])
async def test_persona_retries_on_invalid_json(persona: str) -> None:
    """Each persona retries once and recovers when first response is malformed."""
    invalid = "I think... { broken json"
    valid = _make_response(persona, "FOR", 0.7)

    client = AnthropicClient(api_key="test-key")
    runner = PERSONA_RUNNERS[persona]

    with patch.object(client, "call_with_cache", new_callable=AsyncMock) as mock_call:
        mock_call.side_effect = [(invalid, MOCK_USAGE), (valid, MOCK_USAGE)]
        result = await runner("Test proposal", client, pre_fetched_sources=SAMPLE_SOURCES)

    assert result.decision == "FOR"
    assert mock_call.call_count == 2


@pytest.mark.asyncio
@pytest.mark.parametrize("persona", ["bear", "risk", "tech", "sentiment"])
async def test_persona_raises_on_double_invalid_json(persona: str) -> None:
    """Each persona raises ValueError when both attempts fail."""
    client = AnthropicClient(api_key="test-key")
    runner = PERSONA_RUNNERS[persona]

    with patch.object(client, "call_with_cache", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = ("not json {{{ broken", MOCK_USAGE)
        with pytest.raises(ValueError, match="failed to produce valid JSON"):
            await runner("Test", client, pre_fetched_sources=SAMPLE_SOURCES)


# ============================================================
# BACKWARD COMPAT: no pre_fetched_sources
# ============================================================


@pytest.mark.asyncio
@pytest.mark.parametrize("persona", ["bear", "risk", "tech", "sentiment"])
async def test_persona_backward_compat_no_sources(persona: str) -> None:
    """Each persona works with no pre_fetched_sources (Phase 0 mode)."""
    mock_json = _make_response(persona, "ABSTAIN", 0.4)
    client = AnthropicClient(api_key="test-key")
    runner = PERSONA_RUNNERS[persona]

    with patch.object(client, "call_with_cache", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = (mock_json, MOCK_USAGE)
        result = await runner("Test proposal", client)

        user_msg = mock_call.call_args.kwargs.get("user_message", "")
        assert "AVAILABLE DATA SOURCES" not in user_msg

    assert isinstance(result, AgentDecision)
    assert result.persona == persona


# ============================================================
# MARKDOWN FENCE STRIPPING
# ============================================================


@pytest.mark.asyncio
@pytest.mark.parametrize("persona", ["bear", "risk", "tech", "sentiment"])
async def test_persona_strips_markdown_fences(persona: str) -> None:
    """Each persona handles ```json wrapped responses."""
    fenced = f"```json\n{_make_response(persona, 'AGAINST', 0.85)}\n```"
    client = AnthropicClient(api_key="test-key")
    runner = PERSONA_RUNNERS[persona]

    with patch.object(client, "call_with_cache", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = (fenced, MOCK_USAGE)
        result = await runner("Test", client, pre_fetched_sources=SAMPLE_SOURCES)

    assert result.decision == "AGAINST"
    assert result.confidence == 0.85
