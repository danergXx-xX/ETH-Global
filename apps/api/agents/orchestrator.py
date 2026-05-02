"""
Debate orchestrator for AI Treasury Council.

Sesja 21: full roster live - all 5 personas (Bull, Bear, Risk, Tech, Sentiment)
call real Anthropic SDK in parallel via asyncio.gather. Phase 0 mocks removed.
Partial failures are logged and excluded from consensus rather than killing
the whole debate (Charter #6 No silent failures - failures are logged loud).

Source attribution: pre-fetch globally (one call per source_type, deduplicated)
then distribute to personas by their priority. Avoids hitting CoinGecko /
DefiLlama rate limits with duplicate calls when 5 agents run in parallel.

Contract: Hugo calls run_debate from /api/debate endpoint.
"""

from __future__ import annotations

import asyncio
import time
from datetime import datetime, timezone
from uuid import uuid4

import structlog

from agents.adversarial_agent import run_adversarial
from agents.anthropic_client import AnthropicClient
from agents.bear_agent import run_bear
from agents.bull_agent import run_bull
from agents.personas import ADVERSARIAL, ALL_PERSONAS, PersonaSpec
from agents.risk_agent import run_risk
from agents.sentiment_agent import run_sentiment
from agents.tech_agent import run_tech
from agents.tools import compute_consensus

from config import get_settings
from data.aggregator import DataAggregator
from schemas import AgentDecision, Source

log = structlog.get_logger()

# Sentinel embedded in reasoning of crashed-persona decisions. Used to distinguish
# orchestrator failures from intentional low-confidence abstains (e.g. Risk
# explicitly returning confidence=0.0 when no data is available - that is a
# valid analytical position, not a crash).
FAILURE_MARKER = "[orchestrator-failure]"

# TODO(Phase 1): use asyncio.Lock or FastAPI Depends for thread-safe singleton
_client: AnthropicClient | None = None
_aggregator: DataAggregator | None = None


# persona_id -> async runner. Keep in sync with ALL_PERSONAS in personas.py.
# Adversarial is intentionally registered here so the runner is callable when
# include_adversarial=True is passed to run_debate, but ADVERSARIAL is not
# part of ALL_PERSONAS (Phase 3 STRETCH, opt-in only).
PERSONA_RUNNERS = {
    "bull": run_bull,
    "bear": run_bear,
    "risk": run_risk,
    "tech": run_tech,
    "sentiment": run_sentiment,
    "adversarial": run_adversarial,
}


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
    Avoids duplicate hits on CoinGecko / DefiLlama / RSS rate limits.
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

    fetch_results = await asyncio.gather(
        *[_fetch_one(st) for st in all_source_types]
    )

    global_cache: dict[str, list[Source]] = {}
    for src_type, sources in fetch_results:
        global_cache[src_type] = sources

    # Global dedup: identical URLs across persona buckets are kept only once
    # per persona so prompts stay compact, but personas with overlapping
    # priorities still see the same authoritative source.
    persona_sources: dict[str, list[Source]] = {}
    for persona in personas:
        seen_urls: set[str] = set()
        combined: list[Source] = []
        for src_type in persona.sources_priority:
            for src in global_cache.get(src_type, []):
                if src.url in seen_urls:
                    continue
                seen_urls.add(src.url)
                combined.append(src)
        persona_sources[persona.persona_id] = combined

    log.info(
        "global_sources_fetched",
        source_types=list(all_source_types),
        total_unique_sources=sum(len(v) for v in global_cache.values()),
        personas_served=len(persona_sources),
    )
    return persona_sources


def _failure_decision(persona_id: str, error: str) -> AgentDecision:
    """
    Build a fallback AgentDecision for a persona that crashed.

    Charter #6 (No silent failures): the debate continues but the failure is
    explicit in the audit trail. Confidence 0.0 + ABSTAIN signals the caller
    that this agent's verdict should not be weighted in consensus.
    """
    return AgentDecision(
        persona=persona_id,  # type: ignore[arg-type]
        decision="ABSTAIN",
        confidence=0.0,
        reasoning=(
            f"{FAILURE_MARKER} Agent {persona_id} failed during debate: "
            f"{error[:200]}. Excluded from consensus. See audit trail."
        ),
        claims=[],
        timestamp=datetime.now(timezone.utc),
        tokens_used=0,
        cost_usd=0.0,
    )


async def _run_persona_safe(
    persona: PersonaSpec,
    proposal_text: str,
    client: AnthropicClient,
    sources: list[Source],
) -> AgentDecision:
    """Run one persona, catch any exception, return failure decision instead."""
    runner = PERSONA_RUNNERS.get(persona.persona_id)
    if runner is None:
        log.error("no_runner_for_persona", persona=persona.persona_id)
        return _failure_decision(persona.persona_id, "no runner registered")

    try:
        return await runner(proposal_text, client, pre_fetched_sources=sources)
    except Exception as exc:
        log.exception("persona_run_failed", persona=persona.persona_id)
        return _failure_decision(persona.persona_id, str(exc))


async def run_debate(
    proposal_text: str,
    include_adversarial: bool = False,
) -> dict:
    """
    Run full council debate on a proposal.

    Sesja 21: all 5 personas (Bull/Bear/Risk/Tech/Sentiment) execute in
    parallel via asyncio.gather. A failure in one persona does not abort the
    others - it produces a failure decision excluded from consensus weighting.

    Args:
        proposal_text: The DAO treasury proposal under debate.
        include_adversarial: When True, also runs the Adversarial Auditor
            (6th agent, Phase 3 STRETCH) in parallel. Default False to keep
            the 5-agent contract stable for the MVP and bound token cost.

    Returns:
        dict with decisions (5 or 6), consensus, vote_id, plus structured
        cost_per_persona breakdown for audit trail.
    """
    start = time.perf_counter()
    client = get_client()
    aggregator = get_aggregator()

    personas = list(ALL_PERSONAS)
    if include_adversarial:
        personas.append(ADVERSARIAL)

    persona_sources = await _fetch_global_sources(
        aggregator, proposal_text, personas
    )

    persona_tasks = [
        _run_persona_safe(
            persona=p,
            proposal_text=proposal_text,
            client=client,
            sources=persona_sources.get(p.persona_id, []),
        )
        for p in personas
    ]
    decisions: list[AgentDecision] = await asyncio.gather(*persona_tasks)

    consensus = compute_consensus(decisions)
    total_latency = round(time.perf_counter() - start, 2)
    cost_per_persona = {
        d.persona: round(d.cost_usd or 0.0, 6) for d in decisions
    }
    tokens_per_persona = {d.persona: d.tokens_used or 0 for d in decisions}
    total_cost = round(sum(cost_per_persona.values()), 6)
    failures = [d.persona for d in decisions if FAILURE_MARKER in d.reasoning]

    log.info(
        "debate_complete",
        agents_count=len(decisions),
        consensus=consensus,
        total_cost_usd=total_cost,
        cost_per_persona=cost_per_persona,
        tokens_per_persona=tokens_per_persona,
        total_latency_s=total_latency,
        sources_fetched=sum(len(v) for v in persona_sources.values()),
        failures=failures,
        adversarial_enabled=include_adversarial,
    )

    return {
        "decisions": decisions,
        "consensus": consensus,
        "vote_id": str(uuid4()),
        "cost_per_persona": cost_per_persona,
        "total_cost_usd": total_cost,
    }
