"""
Golden questions tests for Bull agent.

Two test sets:
1. @pytest.mark.live - calls real Anthropic API (requires ANTHROPIC_API_KEY)
2. Default (no mark) - mocked responses, tests parsing logic only
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

import pytest

from agents.anthropic_client import AnthropicClient, UsageStats
from agents.bull_agent import run_bull
from agents.personas import GOLDEN_QUESTIONS
from schemas import AgentDecision

BULL_SCENARIOS = GOLDEN_QUESTIONS["bull"]


# ============================================================
# LIVE TESTS - real Anthropic API
# ============================================================


@pytest.mark.live
@pytest.mark.asyncio
@pytest.mark.parametrize(
    "scenario_idx",
    range(len(BULL_SCENARIOS)),
    ids=[f"scenario_{i}" for i in range(len(BULL_SCENARIOS))],
)
async def test_bull_golden_live(scenario_idx: int) -> None:
    """Run Bull against golden questions with real API."""
    if not os.environ.get("ANTHROPIC_API_KEY"):
        pytest.skip("ANTHROPIC_API_KEY not set")

    scenario = BULL_SCENARIOS[scenario_idx]
    client = AnthropicClient()

    result = await run_bull(scenario["scenario"], client)

    assert isinstance(result, AgentDecision)
    assert result.persona == "bull"
    assert result.decision == scenario["expected_decision"], (
        f"Expected {scenario['expected_decision']}, got {result.decision}. "
        f"Reasoning: {result.reasoning}"
    )

    lo, hi = scenario["expected_confidence_range"]
    assert lo <= result.confidence <= hi, f"Confidence {result.confidence} outside [{lo}, {hi}]"

    assert len(result.claims) >= 1, "Bull must produce at least 1 claim"
    for claim in result.claims:
        assert len(claim.sources) >= 1, f"Claim '{claim.text[:50]}' has no sources"

    assert result.tokens_used is not None and result.tokens_used > 0
    assert result.cost_usd is not None and result.cost_usd > 0


# ============================================================
# MOCKED TESTS - parsing logic, CI-safe
# ============================================================


def _make_mock_response(decision: str, confidence: float) -> str:
    """Generate valid AgentDecision JSON for mocking."""
    return json.dumps(
        {
            "persona": "bull",
            "decision": decision,
            "confidence": confidence,
            "reasoning": (
                "Test reasoning with specific numbers: TVL grew 30% last month. "
                "Network effects accelerating with 50k daily active users. "
                "Macro conditions favorable with Fed rate cuts expected Q3."
            ),
            "claims": [
                {
                    "text": "TVL grew 30% in the last 30 days indicating strong adoption",
                    "confidence": confidence,
                    "sources": [
                        {
                            "url": "https://defillama.com/protocol/aave",
                            "title": "Aave TVL - DefiLlama",
                            "snippet": "Total Value Locked: $12.5B, 30d change: +30%",
                            "weight": 0.9,
                            "source_type": "defillama",
                        }
                    ],
                }
            ],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "tokens_used": None,
            "cost_usd": None,
        }
    )


MOCK_USAGE = UsageStats(
    input_tokens=500,
    output_tokens=300,
    cache_read_input_tokens=400,
    cache_creation_input_tokens=0,
    cost_usd=0.008,
    latency_s=2.5,
)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "scenario_idx",
    range(len(BULL_SCENARIOS)),
    ids=[f"mock_scenario_{i}" for i in range(len(BULL_SCENARIOS))],
)
async def test_bull_golden_mocked(scenario_idx: int) -> None:
    """Test parsing logic with mocked Anthropic responses."""
    scenario = BULL_SCENARIOS[scenario_idx]
    expected = scenario["expected_decision"]
    lo, hi = scenario["expected_confidence_range"]
    mock_confidence = (lo + hi) / 2

    mock_json = _make_mock_response(expected, mock_confidence)

    client = AnthropicClient(api_key="test-key")

    with patch.object(client, "call_with_cache", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = (mock_json, MOCK_USAGE)

        result = await run_bull(scenario["scenario"], client)

    assert isinstance(result, AgentDecision)
    assert result.persona == "bull"
    assert result.decision == expected
    assert lo <= result.confidence <= hi
    assert len(result.claims) >= 1
    assert result.claims[0].sources[0].url == "https://defillama.com/protocol/aave"
    assert result.tokens_used == 800  # 500 + 300
    assert result.cost_usd == 0.008


@pytest.mark.asyncio
async def test_bull_retries_on_invalid_json() -> None:
    """Bull retries once if first response is invalid JSON."""
    invalid_response = "Sure! Here's my analysis: {invalid json"
    valid_response = _make_mock_response("FOR", 0.8)

    client = AnthropicClient(api_key="test-key")

    with patch.object(client, "call_with_cache", new_callable=AsyncMock) as mock_call:
        mock_call.side_effect = [
            (invalid_response, MOCK_USAGE),
            (valid_response, MOCK_USAGE),
        ]

        result = await run_bull("Test proposal", client)

    assert result.decision == "FOR"
    assert mock_call.call_count == 2


@pytest.mark.asyncio
async def test_bull_strips_markdown_fences() -> None:
    """Bull handles response wrapped in markdown code fences."""
    fenced = f"```json\n{_make_mock_response('AGAINST', 0.85)}\n```"

    client = AnthropicClient(api_key="test-key")

    with patch.object(client, "call_with_cache", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = (fenced, MOCK_USAGE)

        result = await run_bull("Test proposal", client)

    assert result.decision == "AGAINST"
    assert result.confidence == 0.85
