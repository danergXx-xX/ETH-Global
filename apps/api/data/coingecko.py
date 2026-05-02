"""CoinGecko free tier API adapter with rate limiting and caching."""
from __future__ import annotations

import re
import time

import httpx
import structlog

from schemas import Source

log = structlog.get_logger()

BASE_URL = "https://api.coingecko.com/api/v3"
CACHE_TTL_SECONDS = 300
# CoinGecko = primary on-chain/market data source, higher weight than news (RSS 0.7)
DEFAULT_WEIGHT = 0.85
REQUEST_TIMEOUT = 15.0

_SAFE_SLUG = re.compile(r"^[a-z0-9][a-z0-9\-]{0,63}$")

TOKEN_ALIASES: dict[str, str] = {
    "eth": "ethereum",
    "btc": "bitcoin",
    "matic": "polygon",
    "sol": "solana",
    "avax": "avalanche-2",
    "arb": "arbitrum",
    "op": "optimism",
    "aave": "aave",
    "uni": "uniswap",
    "link": "chainlink",
    "comp": "compound-governance-token",
    "mkr": "maker",
    "snx": "synthetix-network-token",
    "crv": "curve-dao-token",
    "ldo": "lido-dao",
    "dot": "polkadot",
    "ada": "cardano",
    "bnb": "binancecoin",
    "atom": "cosmos",
    "near": "near",
}


class CoinGeckoSource:
    """Fetches token price and market data from CoinGecko free API."""

    def __init__(self) -> None:
        self._cache: dict[str, tuple[float, Source]] = {}
        self._client: httpx.AsyncClient | None = None

    @property
    def source_type(self) -> str:
        return "coingecko"

    async def fetch(self, query: str, limit: int = 5) -> list[Source]:
        """Fetch market data for a token query."""
        token_id = self._resolve_token_id(query)
        if not token_id:
            return []

        cached = self._get_cached(token_id)
        if cached:
            return [cached]

        client = self._get_client()
        try:
            data = await self._fetch_coin_data(client, token_id)
            if not data:
                return []

            source = self._build_source(data, token_id)
            self._cache[token_id] = (time.monotonic(), source)
            return [source]
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 429:
                log.warning("coingecko_rate_limited", token=token_id)
                cached_stale = self._get_cached(token_id, ignore_ttl=True)
                if cached_stale:
                    return [cached_stale]
            log.error("coingecko_http_error", status=exc.response.status_code, token=token_id)
            return []
        except (httpx.RequestError, httpx.TimeoutException):
            log.exception("coingecko_request_error", token=token_id)
            return []

    def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT)
        return self._client

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def __aenter__(self) -> CoinGeckoSource:
        return self

    async def __aexit__(self, *exc: object) -> None:
        await self.close()

    def _resolve_token_id(self, query: str) -> str | None:
        """Map ticker/name to CoinGecko slug. Validates against safe pattern to prevent SSRF."""
        q = query.lower().strip()
        if q in TOKEN_ALIASES:
            return TOKEN_ALIASES[q]
        if _SAFE_SLUG.match(q):
            return q
        return None

    def _get_cached(self, token_id: str, ignore_ttl: bool = False) -> Source | None:
        cached = self._cache.get(token_id)
        if not cached:
            return None
        ts, source = cached
        if ignore_ttl or (time.monotonic() - ts) < CACHE_TTL_SECONDS:
            return source
        return None

    @staticmethod
    async def _fetch_coin_data(client: httpx.AsyncClient, token_id: str) -> dict | None:
        """Fetch /coins/{id} with market_data."""
        url = f"{BASE_URL}/coins/{token_id}"
        params = {
            "localization": "false",
            "tickers": "false",
            "market_data": "true",
            "community_data": "false",
            "developer_data": "false",
            "sparkline": "false",
        }
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        return resp.json()

    @staticmethod
    def _build_source(data: dict, token_id: str) -> Source:
        """Build Source from CoinGecko response."""
        name = data.get("name", token_id)
        market = data.get("market_data", {})

        price_usd = market.get("current_price", {}).get("usd")
        change_24h = market.get("price_change_percentage_24h")
        change_7d = market.get("price_change_percentage_7d")
        market_cap = market.get("market_cap", {}).get("usd")
        tvl = market.get("total_value_locked", {}).get("usd") if market.get("total_value_locked") else None

        parts = [f"{name}:"]
        if price_usd is not None:
            parts.append(f"${price_usd:,.2f}")
        if change_24h is not None:
            parts.append(f"24h {change_24h:+.1f}%")
        if change_7d is not None:
            parts.append(f"7d {change_7d:+.1f}%")
        if market_cap is not None:
            parts.append(f"MCap ${market_cap/1e9:.1f}B")
        if tvl is not None:
            parts.append(f"TVL ${tvl/1e6:.0f}M")

        snippet = " | ".join(parts)[:500]
        cg_url = f"https://www.coingecko.com/en/coins/{token_id}"

        return Source(
            url=cg_url,
            title=f"{name} Market Data",
            snippet=snippet,
            weight=DEFAULT_WEIGHT,
            source_type="coingecko",
        )
