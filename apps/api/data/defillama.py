"""DefiLlama API adapter for protocol TVL data."""

from __future__ import annotations

import re
import time

import httpx
import structlog

from schemas import Source

log = structlog.get_logger()

BASE_URL = "https://api.llama.fi"
CACHE_TTL_SECONDS = 300
# DefiLlama = primary on-chain TVL data, higher weight than news (RSS 0.7)
DEFAULT_WEIGHT = 0.85
REQUEST_TIMEOUT = 30.0
PROTOCOLS_CACHE_TTL = 600

_SAFE_SLUG = re.compile(r"^[a-z0-9][a-z0-9\-]{0,63}$")


class DefiLlamaSource:
    """Fetches protocol TVL and metadata from DefiLlama (free, no auth)."""

    def __init__(self) -> None:
        self._cache: dict[str, tuple[float, Source]] = {}
        self._protocols_cache: tuple[float, list[dict]] | None = None
        self._client: httpx.AsyncClient | None = None

    @property
    def source_type(self) -> str:
        return "defillama"

    async def fetch(self, query: str, limit: int = 5) -> list[Source]:
        """Fetch protocol data matching query."""
        client = self._get_client()
        slugs = await self._find_matching_slugs(client, query, limit)

        results: list[Source] = []
        for slug in slugs:
            cached = self._get_cached(slug)
            if cached:
                results.append(cached)
                continue

            try:
                source = await self._fetch_protocol(client, slug)
                if source:
                    self._cache[slug] = (time.monotonic(), source)
                    results.append(source)
            except (httpx.HTTPStatusError, httpx.RequestError, httpx.TimeoutException):
                log.exception("defillama_protocol_error", slug=slug)

        return results[:limit]

    def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT)
        return self._client

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def __aenter__(self) -> DefiLlamaSource:
        return self

    async def __aexit__(self, *exc: object) -> None:
        await self.close()

    async def _find_matching_slugs(
        self, client: httpx.AsyncClient, query: str, limit: int
    ) -> list[str]:
        """Search protocols list for matching names/slugs."""
        protocols = await self._get_protocols_list(client)
        q = query.lower().strip()

        matches: list[tuple[int, str]] = []
        for proto in protocols:
            name = proto.get("name", "").lower()
            slug = proto.get("slug", "").lower()
            if q == slug or q == name:
                matches.append((0, proto["slug"]))
            elif q in name or q in slug:
                matches.append((1, proto["slug"]))

        matches.sort(key=lambda x: x[0])
        return [m[1] for m in matches[:limit]]

    async def _get_protocols_list(self, client: httpx.AsyncClient) -> list[dict]:
        """Get cached protocols list or fetch fresh."""
        now = time.monotonic()
        if self._protocols_cache:
            ts, data = self._protocols_cache
            if (now - ts) < PROTOCOLS_CACHE_TTL:
                return data

        try:
            resp = await client.get(f"{BASE_URL}/protocols")
            resp.raise_for_status()
            data = resp.json()
            assert isinstance(data, list)
            self._protocols_cache = (now, data)
            log.info("defillama_protocols_fetched", count=len(data))
            return data
        except (httpx.HTTPStatusError, httpx.RequestError):
            log.exception("defillama_protocols_list_error")
            if self._protocols_cache:
                return self._protocols_cache[1]
            return []

    async def _fetch_protocol(self, client: httpx.AsyncClient, slug: str) -> Source | None:
        """Fetch individual protocol detail. Slug validated before URL insertion."""
        if not _SAFE_SLUG.match(slug.lower()):
            log.warning("defillama_invalid_slug", slug=slug)
            return None
        resp = await client.get(f"{BASE_URL}/protocol/{slug}")
        if resp.status_code == 404:
            log.warning("defillama_protocol_not_found", slug=slug)
            return None
        resp.raise_for_status()
        data = resp.json()
        return self._build_source(data, slug)

    def _get_cached(self, slug: str) -> Source | None:
        cached = self._cache.get(slug)
        if not cached:
            return None
        ts, source = cached
        if (time.monotonic() - ts) < CACHE_TTL_SECONDS:
            return source
        return None

    @staticmethod
    def _build_source(data: dict, slug: str) -> Source:
        """Build Source from DefiLlama protocol response."""
        name = data.get("name", slug)
        tvl = data.get("currentChainTvls", {})
        total_tvl = sum(v for v in tvl.values() if isinstance(v, (int, float)))
        category = data.get("category", "Unknown")
        chains = data.get("chains", [])
        audits = data.get("audits", "")
        audit_note = data.get("audit_note", "")

        parts = [f"{name} ({category}):"]
        if total_tvl > 0:
            parts.append(f"TVL ${total_tvl / 1e6:.0f}M")
        if chains:
            parts.append(f"Chains: {', '.join(chains[:5])}")
        if audits:
            parts.append(f"Audits: {audits}")
        if audit_note:
            parts.append(audit_note[:100])

        snippet = " | ".join(parts)[:500]
        dl_url = f"https://defillama.com/protocol/{slug}"

        return Source(
            url=dl_url,
            title=f"{name} TVL Data",
            snippet=snippet,
            weight=DEFAULT_WEIGHT,
            source_type="defillama",
        )
