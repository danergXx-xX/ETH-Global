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

import hashlib

import httpx
import structlog

from data.coingecko import CoinGeckoSource
from data.defillama import DefiLlamaSource
from data.rss import RSSSource
from data.sources import DataSource
from schemas import Source
from services.cache import cache_get, cache_set

log = structlog.get_logger()

DATA_CACHE_TTL_SECONDS = 300


def _cache_key(source_name: str, query: str, limit: int) -> str:
    digest = hashlib.sha256(query.encode("utf-8")).hexdigest()[:16]
    return f"datasrc:{source_name}:{digest}:n{limit}"


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

        Sequential (not asyncio.gather) to avoid thundering herd on rate-limited APIs.
        """
        all_sources: list[Source] = []
        for src_name in source_priority:
            adapter = self._registry.get(src_name)
            if not adapter:
                log.debug("source_not_registered", source=src_name)
                continue

            cache_key = _cache_key(src_name, query, limit_per_source)
            cached = await cache_get(cache_key)
            if isinstance(cached, list):
                try:
                    parsed = [Source(**item) for item in cached]
                    all_sources.extend(parsed)
                    log.debug(
                        "source_cache_hit",
                        source=src_name,
                        results=len(parsed),
                        query=query,
                    )
                    continue
                except Exception as exc:
                    log.warning(
                        "source_cache_decode_failed",
                        source=src_name,
                        error=str(exc),
                    )

            try:
                sources = await adapter.fetch(query, limit=limit_per_source)
                all_sources.extend(sources)
                if sources:
                    await cache_set(
                        cache_key,
                        [s.model_dump(mode="json") for s in sources],
                        ttl_seconds=DATA_CACHE_TTL_SECONDS,
                    )
                log.info(
                    "source_fetched",
                    source=src_name,
                    results=len(sources),
                    query=query,
                )
            except (
                httpx.HTTPStatusError,
                httpx.RequestError,
                httpx.TimeoutException,
                ValueError,
                OSError,
            ) as exc:
                log.warning("source_fetch_failed", source=src_name, query=query, error=str(exc))

        return all_sources

    async def close(self) -> None:
        """Close all adapter HTTP clients. Call on app shutdown."""
        for adapter in self._registry.values():
            if hasattr(adapter, "close"):
                await adapter.close()
