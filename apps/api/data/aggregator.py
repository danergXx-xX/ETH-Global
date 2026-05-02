"""
DataAggregator - fetches from multiple sources per agent persona priority.

Usage for Nova/Aiko:
    from data.aggregator import DataAggregator
    agg = DataAggregator()
    sources = await agg.fetch_for_query("aave", source_priority=["coingecko", "defillama", "rss"])
    # source_priority per persona: see agents/personas.py sources_priority field

Lifecycle: call close() on app shutdown to release HTTP clients.
"""
from __future__ import annotations

import logging

import httpx

from data.coingecko import CoinGeckoSource
from data.defillama import DefiLlamaSource
from data.rss import RSSSource
from data.sources import DataSource
from schemas import Source

logger = logging.getLogger(__name__)


def create_default_registry() -> dict[str, DataSource]:
    """Factory for default data source registry. Creates fresh instances."""
    return {
        "rss": RSSSource(),
        "coingecko": CoinGeckoSource(),
        "defillama": DefiLlamaSource(),
    }


class DataAggregator:
    """Aggregates data from multiple sources per persona priority order."""

    def __init__(self, registry: dict[str, DataSource] | None = None) -> None:
        self._registry = registry if registry is not None else create_default_registry()

    async def fetch_for_query(
        self,
        query: str,
        source_priority: list[str],
        limit_per_source: int = 3,
    ) -> list[Source]:
        """
        Fetch sources in priority order defined by agent persona.

        Per personas.py: Bull=['coingecko','defillama','rss'],
        Bear=['defillama','rss','coingecko'], etc.
        """
        all_sources: list[Source] = []
        for src_name in source_priority:
            adapter = self._registry.get(src_name)
            if not adapter:
                logger.debug("source_not_registered", extra={"source": src_name})
                continue
            try:
                sources = await adapter.fetch(query, limit=limit_per_source)
                all_sources.extend(sources)
                logger.info(
                    "source_fetched",
                    extra={"source": src_name, "results": len(sources), "query": query},
                )
            except (httpx.HTTPStatusError, httpx.RequestError, httpx.TimeoutException, ValueError, OSError) as exc:
                logger.warning("source_fetch_failed", extra={"source": src_name, "query": query, "error": str(exc)})

        return all_sources

    async def close(self) -> None:
        """Close all adapter HTTP clients. Call on app shutdown."""
        for adapter in self._registry.values():
            if hasattr(adapter, "close"):
                await adapter.close()
