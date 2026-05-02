"""RSS data source adapter (CoinDesk + Reuters crypto feeds)."""
from __future__ import annotations

import hashlib
import logging
import time

import feedparser

from schemas import Source

logger = logging.getLogger(__name__)

FEEDS: dict[str, str] = {
    "coindesk": "https://www.coindesk.com/arc/outboundfeeds/rss/",
    "reuters": "https://www.reutersagency.com/feed/?best-topics=tech&post_type=best",
}

CACHE_TTL_SECONDS = 300
DEFAULT_WEIGHT = 0.7


class RSSSource:
    """Fetches and filters RSS feed entries from CoinDesk and Reuters."""

    def __init__(self, feeds: dict[str, str] | None = None) -> None:
        self._feeds = feeds or FEEDS
        self._cache: dict[str, tuple[float, list[Source]]] = {}

    @property
    def source_type(self) -> str:
        return "rss"

    async def fetch(self, query: str, limit: int = 5) -> list[Source]:
        """Fetch RSS entries matching query across all configured feeds."""
        results: list[Source] = []
        query_lower = query.lower()

        for feed_name, feed_url in self._feeds.items():
            entries = self._get_cached_or_parse(feed_name, feed_url)
            for entry in entries:
                title = entry.get("title", "")
                summary = entry.get("summary", "")
                if query_lower in title.lower() or query_lower in summary.lower():
                    results.append(self._to_source(entry, feed_name))

        results.sort(key=lambda s: s.weight, reverse=True)
        return results[:limit]

    def _get_cached_or_parse(self, feed_name: str, feed_url: str) -> list[dict]:
        """Return cached feed entries or parse fresh."""
        now = time.monotonic()
        cached = self._cache.get(feed_name)
        if cached and (now - cached[0]) < CACHE_TTL_SECONDS:
            return [_source_to_entry(s) for s in cached[1]]

        try:
            parsed = feedparser.parse(feed_url)
            entries = parsed.get("entries", [])
            sources = [self._to_source(e, feed_name) for e in entries]
            self._cache[feed_name] = (now, sources)
            logger.info("rss_feed_parsed", extra={"feed": feed_name, "count": len(entries)})
            return entries
        except Exception:
            logger.exception("rss_parse_error", extra={"feed": feed_name})
            if cached:
                return [_source_to_entry(s) for s in cached[1]]
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


def _source_to_entry(source: Source) -> dict:
    """Convert Source back to entry dict for cache re-filtering."""
    return {
        "link": source.url,
        "title": source.title,
        "summary": source.snippet,
    }


def _entry_id(url: str) -> str:
    """Stable ID from URL hash."""
    return hashlib.md5(url.encode()).hexdigest()
