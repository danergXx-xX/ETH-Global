"""
DuckDuckGo HTML scraping fallback dla Tech/Sentiment personas.

Uzywany w fallback chain (aggregator): Perplexity (1st) -> DDG (2nd) -> cached RSS (3rd).
HTML scraping bo DDG nie ma wolnego API. Endpoint: https://html.duckduckgo.com/html/

Cache TTL 600s (DDG mniej tolerancyjny na request volume niz Perplexity).
Rate limit: max 10 queries/min per process (token bucket).

Graceful degrade: brak crash, log warning + empty list.

Owner: Lumen + Hugo (LUMEN-HUGO-RESEARCH Sesja 50).
"""

from __future__ import annotations

import hashlib
import time
from collections import deque
from urllib.parse import parse_qs, urlparse

import httpx
import structlog
from bs4 import BeautifulSoup  # type: ignore[import-untyped]

from schemas import Source
from services.cache import cache_get, cache_set

log = structlog.get_logger()

DDG_URL = "https://html.duckduckgo.com/html/"
CACHE_TTL_SECONDS = 600
REQUEST_TIMEOUT = 15.0
DEFAULT_WEIGHT = 0.6
MAX_QUERIES_PER_MINUTE = 10
MIN_QUERY_LENGTH = 2

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36"
)


class _RateLimiter:
    """Prosty in-memory token bucket. Per-process (nie distributed)."""

    def __init__(self, max_calls: int, window_seconds: float) -> None:
        self._max = max_calls
        self._window = window_seconds
        self._calls: deque[float] = deque()

    def allow(self) -> bool:
        now = time.monotonic()
        while self._calls and (now - self._calls[0]) > self._window:
            self._calls.popleft()
        if len(self._calls) >= self._max:
            return False
        self._calls.append(now)
        return True

    def reset(self) -> None:
        self._calls.clear()


_default_limiter = _RateLimiter(MAX_QUERIES_PER_MINUTE, 60.0)


def _cache_key(query: str, max_results: int) -> str:
    digest = hashlib.sha256(query.encode("utf-8")).hexdigest()[:16]
    return f"datasrc:ddg:{digest}:n{max_results}"


def _normalize_ddg_url(href: str) -> str:
    """DDG owrapowuje linki w /l/?uddg=encoded_url. Wyciaga prawdziwy URL."""
    if href.startswith("//"):
        href = "https:" + href
    if "duckduckgo.com/l/" in href or href.startswith("/l/"):
        try:
            parsed = urlparse(href if href.startswith("http") else "https://duckduckgo.com" + href)
            qs = parse_qs(parsed.query)
            uddg = qs.get("uddg", [None])[0]
            if uddg:
                return uddg
        except (ValueError, KeyError):
            pass
    return href


async def ddg_search(
    query: str,
    max_results: int = 5,
    *,
    client: httpx.AsyncClient | None = None,
    limiter: _RateLimiter | None = None,
) -> list[dict[str, str]]:
    """
    Szuka w DDG przez HTML scraping. Zwraca [{title, url, snippet}, ...].

    Empty list gdy: rate limit hit, network error, parse error.
    """
    if len(query.strip()) < MIN_QUERY_LENGTH:
        return []

    limiter = limiter or _default_limiter
    if not limiter.allow():
        log.warning("ddg_rate_limited", query_len=len(query))
        return []

    cache_id = _cache_key(query, max_results)
    cached = await cache_get(cache_id)
    if isinstance(cached, list):
        log.debug("ddg_cache_hit")
        return cached

    own_client = client is None
    if own_client:
        client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT, follow_redirects=True)
    try:
        assert client is not None
        resp = await client.post(
            DDG_URL,
            data={"q": query},
            headers={"User-Agent": USER_AGENT},
        )
        resp.raise_for_status()
        html = resp.text
    except (httpx.HTTPStatusError, httpx.RequestError, httpx.TimeoutException) as exc:
        log.warning("ddg_request_failed", error=str(exc), error_type=type(exc).__name__)
        return []
    finally:
        if own_client and client is not None:
            await client.aclose()

    try:
        results = _parse_html(html, max_results)
    except (ValueError, AttributeError) as exc:
        log.warning("ddg_parse_failed", error=str(exc))
        return []

    if results:
        await cache_set(cache_id, results, ttl_seconds=CACHE_TTL_SECONDS)
        log.info("ddg_fetched", n=len(results), query_len=len(query))
    return results


def _parse_html(html: str, max_results: int) -> list[dict[str, str]]:
    """Parse DDG HTML. Tolerancyjny na zmiany w markup."""
    soup = BeautifulSoup(html, "html.parser")
    results: list[dict[str, str]] = []

    for div in soup.select("div.result")[: max_results * 2]:
        title_el = div.select_one("a.result__a")
        snippet_el = div.select_one(".result__snippet")
        if not title_el:
            continue

        title = title_el.get_text(strip=True)
        href_attr = title_el.get("href") or ""
        href = href_attr if isinstance(href_attr, str) else ""
        url = _normalize_ddg_url(href)
        if not url.startswith(("http://", "https://")):
            continue
        snippet = snippet_el.get_text(strip=True) if snippet_el else ""

        results.append({"title": title[:200], "url": url, "snippet": snippet[:500]})
        if len(results) >= max_results:
            break

    return results


class WebSearchSource:
    """DataSource adapter dla aggregator factory."""

    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None

    @property
    def source_type(self) -> str:
        return "web_search"

    def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT, follow_redirects=True)
        return self._client

    async def fetch(self, query: str, limit: int = 5) -> list[Source]:
        results = await ddg_search(query, max_results=limit, client=self._get_client())
        items: list[Source] = []
        for r in results:
            try:
                items.append(
                    Source(
                        url=r["url"],
                        title=r.get("title") or "DuckDuckGo result",
                        snippet=(r.get("snippet") or query)[:500],
                        weight=DEFAULT_WEIGHT,
                        source_type="web_search",
                    )
                )
            except (KeyError, ValueError):
                continue
        return items[:limit]

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def __aenter__(self) -> WebSearchSource:
        return self

    async def __aexit__(self, *exc: object) -> None:
        await self.close()
