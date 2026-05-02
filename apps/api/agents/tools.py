"""
Source fetching tools for agent personas (Phase 3 source attribution).

Pre-fetch strategy (MVP): agents call these BEFORE Anthropic API call.
Sources injected as context in user_message, not as Anthropic tool_use.
Tool_use planned for Phase 4 enhancement.

Decision: pre-fetch vs tool_use -> pre-fetch wins for MVP:
- Deterministic (always fetches, no model choice variance)
- Simpler to test (mock DataAggregator, check prompt contains sources)
- Lower latency (parallel fetch before LLM call, not interleaved)
- Lower cost (no extra tool_use round-trips)

Owner: Hugo (backend integration) + Nova (prompt engineering) + Lumen (data adapters).
"""

from __future__ import annotations

import structlog

from data.aggregator import DataAggregator
from schemas import AgentDecision, Source

log = structlog.get_logger()


# Phase 4: per-source fetch functions for Anthropic tool_use integration.
# Currently unused - orchestrator uses fetch_sources_for_persona directly.


async def fetch_news(
    aggregator: DataAggregator,
    query: str,
    limit: int = 3,
) -> list[Source]:
    """Fetch news articles from RSS feeds (CoinDesk, Reuters)."""
    return await aggregator.fetch_for_query(query, source_priority=["rss"], limit_per_source=limit)


async def fetch_market_data(
    aggregator: DataAggregator,
    query: str,
    limit: int = 3,
) -> list[Source]:
    """Fetch token price/market data from CoinGecko."""
    return await aggregator.fetch_for_query(
        query, source_priority=["coingecko"], limit_per_source=limit
    )


async def fetch_protocol_tvl(
    aggregator: DataAggregator,
    query: str,
    limit: int = 3,
) -> list[Source]:
    """Fetch protocol TVL data from DefiLlama."""
    return await aggregator.fetch_for_query(
        query, source_priority=["defillama"], limit_per_source=limit
    )


async def fetch_sources_for_persona(
    aggregator: DataAggregator,
    query: str,
    sources_priority: list[str],
    limit_per_source: int = 3,
) -> list[Source]:
    """
    Fetch all sources for a persona based on their priority order.

    This is the main entry point for pre-fetch strategy.
    Each persona (Bull, Bear, etc.) has different sources_priority
    defined in personas.py.
    """
    sources = await aggregator.fetch_for_query(
        query,
        source_priority=sources_priority,
        limit_per_source=limit_per_source,
    )
    log.info(
        "sources_fetched_for_persona",
        query=query[:50],
        priorities=sources_priority,
        total_sources=len(sources),
    )
    return sources


def format_sources_context(sources: list[Source]) -> str:
    """
    Format fetched sources as text context for injection into user_message.

    Returns a block that the agent can reference when making claims.
    If no sources available, returns explicit note about missing data.
    """
    if not sources:
        return (
            "\n--- AVAILABLE DATA SOURCES ---\n"
            "No external data sources were available for this query. "
            "State this explicitly in your claims and lower your confidence accordingly.\n"
            "--- END SOURCES ---"
        )

    lines = ["\n--- AVAILABLE DATA SOURCES ---"]
    for i, src in enumerate(sources, 1):
        lines.append(
            f"[{i}] {src.title} ({src.source_type or 'unknown'})\n"
            f"    URL: {src.url}\n"
            f"    Data: {src.snippet}\n"
            f"    Weight: {src.weight}"
        )
    lines.append(
        "\nCite sources by referencing their URL and title in your claims. "
        "EVERY claim MUST cite at least 1 source from this list."
    )
    lines.append("--- END SOURCES ---")
    return "\n".join(lines)


# ============================================================
# CONSENSUS - confidence-weighted voting across personas
# ============================================================


# Kept in sync with agents.orchestrator.FAILURE_MARKER. Imported lazily where
# needed to avoid a circular import (orchestrator imports compute_consensus).
_FAILURE_MARKER = "[orchestrator-failure]"


def compute_consensus(decisions: list[AgentDecision]) -> str:
    """
    Aggregate persona verdicts into a council consensus.

    Voting rule: confidence-weighted. Each persona contributes its confidence
    to either the FOR or AGAINST tally. ABSTAIN does not count toward either.
    Agents that crashed mid-debate (reasoning contains FAILURE_MARKER) are
    silently ignored here - they are surfaced separately in the orchestrator
    log. An intentional confidence=0.0 ABSTAIN (e.g. Risk persona explicitly
    abstaining due to lack of data) is NOT a failure and is counted as a
    normal abstain vote.

    Outcomes:
        FOR     - weighted FOR > weighted AGAINST
        AGAINST - weighted AGAINST > weighted FOR
        ABSTAIN - all agents abstained or failed
        SPLIT   - non-zero ties (e.g. 2 vs 2 with same confidence sum).
                  SPLIT is intentional - downstream UI shows the council is
                  not aligned, prompting Adversarial Auditor (Phase 4) or
                  human review per Council Rules.

    Args:
        decisions: List of AgentDecision from all personas.

    Returns:
        One of "FOR", "AGAINST", "ABSTAIN", "SPLIT".
    """
    weight_for = 0.0
    weight_against = 0.0
    abstain_count = 0
    contributing = 0

    for decision in decisions:
        if _FAILURE_MARKER in decision.reasoning:
            continue
        contributing += 1
        if decision.decision == "FOR":
            weight_for += decision.confidence
        elif decision.decision == "AGAINST":
            weight_against += decision.confidence
        else:
            abstain_count += 1

    if contributing == 0:
        return "ABSTAIN"

    if weight_for == 0.0 and weight_against == 0.0:
        return "ABSTAIN"

    # Use a small epsilon to avoid floating-point near-tie surprises.
    epsilon = 1e-9
    if weight_for > weight_against + epsilon:
        return "FOR"
    if weight_against > weight_for + epsilon:
        return "AGAINST"
    return "SPLIT"
