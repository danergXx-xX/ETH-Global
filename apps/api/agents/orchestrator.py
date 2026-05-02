# Phase 0: Bull live, remaining mock. Phase 1 = all live.
# Phase 3: source attribution wired - pre-fetch sources, inject into agents.
"""
Debate orchestrator for AI Treasury Council.

Runs all 5 agents on a proposal and returns consensus.
Phase 0: Only Bull calls real Anthropic API. Bear/Risk/Tech/Sentiment return mocks.
Phase 3: Pre-fetches sources via DataAggregator, passes to agents.
"""

from __future__ import annotations

import time
from datetime import datetime, timezone
from uuid import uuid4

import asyncio

import structlog

from agents.anthropic_client import AnthropicClient
from agents.bull_agent import run_bull
from agents.personas import ALL_PERSONAS, PersonaSpec

from config import get_settings
from data.aggregator import DataAggregator
from schemas import AgentDecision, Source

log = structlog.get_logger()

# TODO(Phase 1): use asyncio.Lock or FastAPI Depends for thread-safe singleton
_client: AnthropicClient | None = None
_aggregator: DataAggregator | None = None


def get_client() -> AnthropicClient:
    """Lazy singleton for AnthropicClient."""
    global _client
    if _client is None:
        settings = get_settings()
        _client = AnthropicClient(
            api_key=settings.anthropic_api_key or None,
            model_id=settings.model_id,
        )
    return _client


def get_aggregator() -> DataAggregator:
    """Lazy singleton for DataAggregator. Shared across agents to reuse caches."""
    global _aggregator
    if _aggregator is None:
        _aggregator = DataAggregator()
    return _aggregator


async def _fetch_global_sources(
    aggregator: DataAggregator,
    proposal_text: str,
    personas: list[PersonaSpec],
) -> dict[str, list[Source]]:
    """
    Pre-fetch sources for all personas, deduplicating API calls.

    Strategy: collect unique source types across all personas,
    fetch each once, then distribute to personas by their priority.
    This avoids hitting CoinGecko/DefiLlama rate limits with duplicate calls.
    """
    all_source_types: set[str] = set()
    for persona in personas:
        all_source_types.update(persona.sources_priority)

    async def _fetch_one(src_type: str) -> tuple[str, list[Source]]:
        try:
            result = await aggregator.fetch_for_query(
                proposal_text,
                source_priority=[src_type],
                limit_per_source=3,
            )
            return src_type, result
        except Exception as exc:
            log.warning("source_fetch_failed", source_type=src_type, error=str(exc))
            return src_type, []

    fetch_results = await asyncio.gather(*[_fetch_one(st) for st in all_source_types])

    global_cache: dict[str, list[Source]] = {}
    for src_type, sources in fetch_results:
        global_cache[src_type] = sources

    persona_sources: dict[str, list[Source]] = {}
    for persona in personas:
        combined: list[Source] = []
        for src_type in persona.sources_priority:
            combined.extend(global_cache.get(src_type, []))
        persona_sources[persona.persona_id] = combined

    log.info(
        "global_sources_fetched",
        source_types=list(all_source_types),
        total_unique_sources=sum(len(v) for v in global_cache.values()),
        personas_served=len(persona_sources),
    )
    return persona_sources


def _mock_decision(
    persona: str,
    decision: str,
    confidence: float,
    reasoning: str,
    sources: list[Source] | None = None,
) -> AgentDecision:
    """Generate a mock AgentDecision for Phase 0 non-Bull agents."""
    mock_sources = [
        {
            "url": "https://defillama.com",
            "title": f"Mock source for {persona}",
            "snippet": "This is a placeholder source. Real data in Phase 1.",
            "weight": 0.5,
            "source_type": "defillama",
        }
    ]

    if sources:
        mock_sources = [
            {
                "url": s.url,
                "title": s.title,
                "snippet": s.snippet,
                "weight": s.weight,
                "source_type": s.source_type,
            }
            for s in sources[:2]
        ]

    return AgentDecision(
        persona=persona,  # type: ignore[arg-type]
        decision=decision,  # type: ignore[arg-type]
        confidence=confidence,
        reasoning=reasoning,
        claims=[
            {
                "text": f"Mock claim from {persona} agent (Phase 0 placeholder)",
                "confidence": confidence,
                "sources": mock_sources,
            }
        ],
        timestamp=datetime.now(timezone.utc),
        tokens_used=0,
        cost_usd=0.0,
    )


def _generate_mocks(persona_sources: dict[str, list[Source]]) -> list[AgentDecision]:
    """Generate mock decisions for Bear, Risk, Tech, Sentiment with real sources."""
    return [
        _mock_decision(
            persona="bear",
            decision="AGAINST",
            confidence=0.65,
            reasoning=(
                "Mock Bear analysis: potential downside risks identified. "
                "Smart contract risk and market volatility require caution. "
                "Waiting for Phase 1 live analysis with real data sources."
            ),
            sources=persona_sources.get("bear"),
        ),
        _mock_decision(
            persona="risk",
            decision="ABSTAIN",
            confidence=0.50,
            reasoning=(
                "Mock Risk analysis: insufficient quantitative data for Phase 0. "
                "Expected value calculation requires live market feeds. "
                "Abstaining until Phase 1 data integration is complete."
            ),
            sources=persona_sources.get("risk"),
        ),
        _mock_decision(
            persona="tech",
            decision="FOR",
            confidence=0.70,
            reasoning=(
                "Mock Tech analysis: target protocol has multiple audits. "
                "No critical vulnerabilities in public audit reports. "
                "Technical risk appears manageable based on available data."
            ),
            sources=persona_sources.get("tech"),
        ),
        _mock_decision(
            persona="sentiment",
            decision="FOR",
            confidence=0.55,
            reasoning=(
                "Mock Sentiment analysis: community reception is neutral to positive. "
                "No extreme fear or greed signals detected. "
                "Social media volume within normal range."
            ),
            sources=persona_sources.get("sentiment"),
        ),
    ]


def _calculate_consensus(decisions: list[AgentDecision]) -> str:
    """Simple majority: FOR vs AGAINST. ABSTAIN does not count."""
    votes_for = sum(1 for d in decisions if d.decision == "FOR")
    votes_against = sum(1 for d in decisions if d.decision == "AGAINST")

    if votes_for > votes_against:
        return "FOR"
    if votes_against > votes_for:
        return "AGAINST"
    if votes_for == 0 and votes_against == 0:
        return "ABSTAIN"
    return "SPLIT"


async def run_debate(proposal_text: str) -> dict:
    """
    Run full council debate on a proposal.

    Phase 3: Pre-fetches sources globally (shared cache) then passes
    persona-specific sources to each agent. Avoids duplicate API calls
    for same data across multiple agents.

    Contract: Hugo calls this from /api/debate endpoint.
    Returns dict with decisions, consensus, vote_id.
    """
    start = time.perf_counter()
    client = get_client()
    aggregator = get_aggregator()

    persona_sources = await _fetch_global_sources(aggregator, proposal_text, ALL_PERSONAS)

    bull_sources = persona_sources.get("bull", [])
    bull_decision = await run_bull(proposal_text, client, pre_fetched_sources=bull_sources)

    mock_decisions = _generate_mocks(persona_sources)

    all_decisions = [bull_decision] + mock_decisions
    consensus = _calculate_consensus(all_decisions)
    total_latency = round(time.perf_counter() - start, 2)

    total_cost = sum(d.cost_usd or 0.0 for d in all_decisions)

    log.info(
        "debate_complete",
        agents_count=len(all_decisions),
        consensus=consensus,
        total_cost_usd=total_cost,
        total_latency_s=total_latency,
        bull_live=True,
        sources_fetched=sum(len(v) for v in persona_sources.values()),
    )

    return {
        "decisions": all_decisions,
        "consensus": consensus,
        "vote_id": str(uuid4()),
    }
