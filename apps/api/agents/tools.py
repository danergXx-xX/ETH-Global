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
from schemas import Source

log = structlog.get_logger()


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
