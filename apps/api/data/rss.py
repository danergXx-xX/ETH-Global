"""RSS data source adapter (CoinDesk + Reuters crypto feeds)."""

from __future__ import annotations

import asyncio
import time

import feedparser
import structlog

from schemas import Source

log = structlog.get_logger()

FEEDS: dict[str, str] = {
    "coindesk": "https://www.coindesk.com/arc/outboundfeeds/rss/",
    "reuters": "https://www.reutersagency.com/feed/?best-topics=tech&post_type=best",
}

CACHE_TTL_SECONDS = 300
# RSS = secondary source (news articles), lower than on-chain/market API data
DEFAULT_WEIGHT = 0.7
MIN_QUERY_LENGTH = 2


class RSSSource:
    """Fetches and filters RSS feed entries from CoinDesk and Reuters."""

    def __init__(self, feeds: dict[str, str] | None = None) -> None:
        self._feeds = feeds or FEEDS
        self._cache: dict[str, tuple[float, list[dict]]] = {}

    @property
    def source_type(self) -> str:
        return "rss"

    async def close(self) -> None:
        """No-op for interface consistency with CoinGecko/DefiLlama."""

    async def __aenter__(self) -> RSSSource:
        return self

    async def __aexit__(self, *exc: object) -> None:
        await self.close()

    async def fetch(self, query: str, limit: int = 5) -> list[Source]:
        """Fetch RSS entries matching query across all configured feeds."""
        if len(query.strip()) < MIN_QUERY_LENGTH:
            return []

        results: list[Source] = []
        query_lower = query.lower().strip()

        for feed_name, feed_url in self._feeds.items():
            entries = await self._get_cached_or_parse(feed_name, feed_url)
            for entry in entries:
                title = entry.get("title", "")
                summary = entry.get("summary", "")
                if query_lower in title.lower() or query_lower in summary.lower():
                    results.append(self._to_source(entry, feed_name))

        results.sort(key=lambda s: s.weight, reverse=True)
        return results[:limit]

    async def _get_cached_or_parse(self, feed_name: str, feed_url: str) -> list[dict]:
        """Return cached feed entries or parse fresh. Runs feedparser in thread to avoid blocking."""
        now = time.monotonic()
        cached = self._cache.get(feed_name)
        if cached and (now - cached[0]) < CACHE_TTL_SECONDS:
            return cached[1]

        try:
            # feedparser.parse() is synchronous (uses urllib) - run in thread pool
            parsed = await asyncio.to_thread(feedparser.parse, feed_url)
            entries: list[dict] = parsed.get("entries", [])
            self._cache[feed_name] = (now, entries)
            log.info("rss_feed_parsed", feed=feed_name, count=len(entries))
            return entries
        except Exception:  # feedparser has no specific exception hierarchy
            log.exception("rss_parse_error", feed=feed_name)
            if cached:
                return cached[1]
            return []

    @staticmethod
    def _to_source(entry: dict, feed_name: str) -> Source:
        """Convert feedparser entry dict to Source schema."""
        link = entry.get("link", "")
        title = entry.get("title", "")
        summary = entry.get("summary", "")
        snippet = summary[:500] if summary else title[:500]

        return Source(
            url=link,
            title=title,
            snippet=snippet,
            weight=DEFAULT_WEIGHT,
            source_type="rss",
        )
