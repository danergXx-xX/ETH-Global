"""
Sesja 21: orchestrator + consensus tests for the full 5-agent roster.

Covers:
- 5 personas execute in parallel via asyncio.gather (no mocks remain)
- Partial failure: one persona crashes, the debate still completes
- Consensus: confidence-weighted FOR/AGAINST/ABSTAIN/SPLIT
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

import pytest

import agents.orchestrator as orchestrator
from agents.anthropic_client import AnthropicClient, UsageStats
from agents.orchestrator import FAILURE_MARKER, _failure_decision
from agents.tools import compute_consensus
from schemas import AgentDecision, Source

MOCK_USAGE = UsageStats(
    input_tokens=500,
    output_tokens=300,
    cache_read_input_tokens=400,
    cache_creation_input_tokens=0,
    cost_usd=0.008,
    latency_s=2.5,
)


def _decision(persona: str, decision: str, confidence: float) -> AgentDecision:
    return AgentDecision(
        persona=persona,  # type: ignore[arg-type]
        decision=decision,  # type: ignore[arg-type]
        confidence=confidence,
        reasoning="Test decision with adequate length to satisfy schema validation.",
        claims=[],
        timestamp=datetime.now(timezone.utc),
        tokens_used=100,
        cost_usd=0.001,
    )


# ============================================================
# CONSENSUS - confidence-weighted voting
# ============================================================


def test_consensus_for_majority() -> None:
    """3 FOR (high confidence) vs 1 AGAINST -> FOR."""
    decisions = [
        _decision("bull", "FOR", 0.9),
        _decision("bear", "AGAINST", 0.7),
        _decision("risk", "FOR", 0.8),
        _decision("tech", "FOR", 0.7),
        _decision("sentiment", "ABSTAIN", 0.5),
    ]
    assert compute_consensus(decisions) == "FOR"


def test_consensus_against_majority() -> None:
    """Weighted AGAINST exceeds FOR -> AGAINST."""
    decisions = [
        _decision("bull", "FOR", 0.5),
        _decision("bear", "AGAINST", 0.95),
        _decision("risk", "AGAINST", 0.85),
        _decision("tech", "AGAINST", 0.8),
        _decision("sentiment", "FOR", 0.4),
    ]
    assert compute_consensus(decisions) == "AGAINST"


def test_consensus_split_on_tie() -> None:
    """Equal weighted FOR and AGAINST -> SPLIT."""
    decisions = [
        _decision("bull", "FOR", 0.8),
        _decision("bear", "AGAINST", 0.8),
        _decision("risk", "ABSTAIN", 0.5),
        _decision("tech", "FOR", 0.5),
        _decision("sentiment", "AGAINST", 0.5),
    ]
    assert compute_consensus(decisions) == "SPLIT"


def test_consensus_abstain_when_all_abstain() -> None:
    """All ABSTAIN -> ABSTAIN."""
    decisions = [_decision(p, "ABSTAIN", 0.5) for p in ["bull", "bear", "risk", "tech", "sentiment"]]
    assert compute_consensus(decisions) == "ABSTAIN"


def test_consensus_excludes_failures() -> None:
    """Decisions tagged with FAILURE_MARKER are excluded from voting."""
    decisions = [
        _decision("bull", "FOR", 0.9),
        _failure_decision("bear", "anthropic 503"),
        _decision("risk", "FOR", 0.8),
        _decision("tech", "FOR", 0.7),
        _failure_decision("sentiment", "anthropic 503"),
    ]
    # 3 valid FOR, 0 AGAINST -> FOR
    assert compute_consensus(decisions) == "FOR"


def test_consensus_all_failures_returns_abstain() -> None:
    """When every agent has FAILURE_MARKER -> ABSTAIN."""
    decisions = [_failure_decision(p, "outage") for p in ["bull", "bear", "risk", "tech", "sentiment"]]
    assert compute_consensus(decisions) == "ABSTAIN"


def test_consensus_intentional_zero_confidence_abstain_counted() -> None:
    """Intentional confidence=0.0 ABSTAIN (e.g. Risk no-data) is NOT a failure.

    Without FAILURE_MARKER the persona contributes a normal abstain vote.
    Other personas still drive the consensus.
    """
    decisions = [
        _decision("bull", "FOR", 0.8),
        _decision("bear", "AGAINST", 0.6),
        _decision("risk", "ABSTAIN", 0.0),  # legit "I cannot quantify" abstain
        _decision("tech", "FOR", 0.7),
        _decision("sentiment", "FOR", 0.5),
    ]
    # FOR (0.8 + 0.7 + 0.5 = 2.0) > AGAINST (0.6) -> FOR
    assert compute_consensus(decisions) == "FOR"
    # And the failures helper does NOT flag risk as a failure.
    failures = [d.persona for d in decisions if FAILURE_MARKER in d.reasoning]
    assert failures == []


def test_consensus_empty_list() -> None:
    """Empty decisions list -> ABSTAIN (no agents voted)."""
    assert compute_consensus([]) == "ABSTAIN"


# ============================================================
# ORCHESTRATOR - 5 agents parallel
# ============================================================


def _make_persona_response(persona: str, decision: str, confidence: float) -> str:
    """Generate AgentDecision JSON the runner will parse."""
    return json.dumps(
        {
            "persona": persona,
            "decision": decision,
            "confidence": confidence,
            "reasoning": (
                f"{persona} reasoning with specifics. "
                "Three sentences of substance. Numbers and protocol named."
            ),
            "claims": [
                {
                    "text": f"Claim from {persona}",
                    "confidence": confidence,
                    "sources": [
                        {
                            "url": f"https://example.com/{persona}",
                            "title": f"Source for {persona}",
                            "snippet": "Snippet of evidence.",
                            "weight": 0.8,
                            "source_type": "rss",
                        }
                    ],
                }
            ],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )


@pytest.fixture(autouse=True)
def _reset_singletons() -> None:
    """Avoid state bleed between orchestrator tests."""
    orchestrator._client = None
    orchestrator._aggregator = None


@pytest.mark.asyncio
async def test_orchestrator_runs_5_agents() -> None:
    """run_debate calls all 5 personas, returns 5 decisions + consensus + vote_id."""
    fake_client = AnthropicClient(api_key="test-key")
    fake_aggregator = AsyncMock()
    fake_aggregator.fetch_for_query = AsyncMock(return_value=[
        Source(
            url="https://example.com/data",
            title="Sample data",
            snippet="snippet",
            weight=0.7,
            source_type="rss",
        )
    ])

    persona_responses = {
        "bull": _make_persona_response("bull", "FOR", 0.8),
        "bear": _make_persona_response("bear", "AGAINST", 0.7),
        "risk": _make_persona_response("risk", "ABSTAIN", 0.5),
        "tech": _make_persona_response("tech", "FOR", 0.75),
        "sentiment": _make_persona_response("sentiment", "FOR", 0.6),
    }

    async def fake_call(
        system_prompt: str,
        persona_prompt: str,
        user_message: str,
        max_tokens: int = 1000,
        temperature: float | None = None,
    ) -> tuple[str, UsageStats]:
        # personas.build_system_prompt embeds persona_id in upper-case.
        for pid, response in persona_responses.items():
            if pid.upper() in persona_prompt:
                return response, MOCK_USAGE
        return _make_persona_response("bull", "FOR", 0.5), MOCK_USAGE

    with (
        patch("agents.orchestrator.get_client", return_value=fake_client),
        patch("agents.orchestrator.get_aggregator", return_value=fake_aggregator),
        patch.object(fake_client, "call_with_cache", side_effect=fake_call),
    ):
        result = await orchestrator.run_debate("Swap 50 ETH for USDC")

    assert "decisions" in result
    assert "consensus" in result
    assert "vote_id" in result
    decisions = result["decisions"]
    assert len(decisions) == 5

    personas_seen = {d.persona for d in decisions}
    assert personas_seen == {"bull", "bear", "risk", "tech", "sentiment"}

    # FOR (bull 0.8 + tech 0.75 + sentiment 0.6 = 2.15) > AGAINST (bear 0.7) -> FOR
    assert result["consensus"] == "FOR"


@pytest.mark.asyncio
async def test_orchestrator_handles_partial_failure() -> None:
    """One persona crashes -> debate still completes with 5 decisions, failure marked."""
    fake_client = AnthropicClient(api_key="test-key")
    fake_aggregator = AsyncMock()
    fake_aggregator.fetch_for_query = AsyncMock(return_value=[])

    call_count = {"n": 0}

    async def flaky_call(
        system_prompt: str,
        persona_prompt: str,
        user_message: str,
        max_tokens: int = 1000,
        temperature: float | None = None,
    ) -> tuple[str, UsageStats]:
        call_count["n"] += 1
        # First call (Bull or Bear depending on scheduling) raises - simulates Anthropic outage.
        if "BULL" in persona_prompt:
            raise RuntimeError("simulated anthropic 503")
        # Bear/Risk/Tech/Sentiment respond normally.
        for pid in ["bear", "risk", "tech", "sentiment"]:
            if pid.upper() in persona_prompt:
                return _make_persona_response(pid, "AGAINST", 0.7), MOCK_USAGE
        return _make_persona_response("bull", "FOR", 0.5), MOCK_USAGE

    with (
        patch("agents.orchestrator.get_client", return_value=fake_client),
        patch("agents.orchestrator.get_aggregator", return_value=fake_aggregator),
        patch.object(fake_client, "call_with_cache", side_effect=flaky_call),
    ):
        result = await orchestrator.run_debate("Swap proposal")

    decisions = result["decisions"]
    assert len(decisions) == 5

    bull = next(d for d in decisions if d.persona == "bull")
    assert bull.confidence == 0.0
    assert bull.decision == "ABSTAIN"
    assert "failed" in bull.reasoning.lower()

    # 4 AGAINST votes from non-failed personas -> AGAINST
    assert result["consensus"] == "AGAINST"


@pytest.mark.asyncio
async def test_orchestrator_global_source_dedup() -> None:
    """Each unique source_type fetched once even though 5 personas overlap."""
    fake_client = AnthropicClient(api_key="test-key")
    fake_aggregator = AsyncMock()

    async def fetch(
        query: str, source_priority: list[str], limit_per_source: int = 3
    ) -> list[Source]:
        st = source_priority[0] if source_priority else "unknown"
        return [
            Source(
                url=f"https://example.com/{st}",
                title=f"{st} data",
                snippet="snippet",
                weight=0.7,
                source_type=st if st in {"rss", "coingecko", "defillama", "aixbt"} else "rss",
            )
        ]

    fake_aggregator.fetch_for_query = AsyncMock(side_effect=fetch)

    async def fake_call(
        system_prompt: str,
        persona_prompt: str,
        user_message: str,
        max_tokens: int = 1000,
        temperature: float | None = None,
    ) -> tuple[str, UsageStats]:
        for pid in ["bull", "bear", "risk", "tech", "sentiment"]:
            if pid.upper() in persona_prompt:
                return _make_persona_response(pid, "FOR", 0.7), MOCK_USAGE
        return _make_persona_response("bull", "FOR", 0.5), MOCK_USAGE

    with (
        patch("agents.orchestrator.get_client", return_value=fake_client),
        patch("agents.orchestrator.get_aggregator", return_value=fake_aggregator),
        patch.object(fake_client, "call_with_cache", side_effect=fake_call),
    ):
        await orchestrator.run_debate("Test")

    # ALL_PERSONAS unique source types: rss, coingecko, defillama, aixbt = 4.
    # Each fetched once.
    assert fake_aggregator.fetch_for_query.call_count == 4
