"""DataAggregator - fetches from multiple sources per agent persona priority."""
from __future__ import annotations

import logging

from data.coingecko import CoinGeckoSource
from data.defillama import DefiLlamaSource
from data.rss import RSSSource
from data.sources import DataSource
from schemas import Source

logger = logging.getLogger(__name__)

SOURCE_REGISTRY: dict[str, DataSource] = {
    "rss": RSSSource(),
    "coingecko": CoinGeckoSource(),
    "defillama": DefiLlamaSource(),
}


class DataAggregator:
    """Aggregates data from multiple sources per persona priority order."""

    def __init__(self, registry: dict[str, DataSource] | None = None) -> None:
        self._registry = registry or SOURCE_REGISTRY

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
            except Exception:
                logger.exception("source_fetch_failed", extra={"source": src_name, "query": query})

        return all_sources
