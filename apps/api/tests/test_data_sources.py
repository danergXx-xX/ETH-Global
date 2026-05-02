"""Mocked tests for data sources (RSS, CoinGecko, DefiLlama, Aggregator).

NO real API calls - all HTTP mocked via respx/monkeypatch.
Use @pytest.mark.live for optional real-API smoke tests.
"""
from __future__ import annotations

import pytest
import httpx
import respx

from data.rss import RSSSource
from data.coingecko import CoinGeckoSource, BASE_URL as CG_BASE
from data.defillama import DefiLlamaSource, BASE_URL as DL_BASE
from data.aggregator import DataAggregator, create_default_registry
from schemas import Source


# ============================================================
# RSS TESTS (8 + 2 new)
# ============================================================

SAMPLE_RSS_XML = """<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>CoinDesk</title>
  <item>
    <title>Aave TVL hits new high</title>
    <link>https://coindesk.com/aave-tvl</link>
    <description>Aave protocol total value locked reaches $15B milestone.</description>
  </item>
  <item>
    <title>Bitcoin rallies past $100k</title>
    <link>https://coindesk.com/btc-100k</link>
    <description>BTC surges on institutional demand.</description>
  </item>
  <item>
    <title>NFT market cools down</title>
    <link>https://coindesk.com/nft-cool</link>
    <description>NFT trading volumes drop 40% month-over-month.</description>
  </item>
</channel>
</rss>"""


class TestRSSSource:
    @pytest.fixture
    def rss(self, monkeypatch: pytest.MonkeyPatch) -> RSSSource:
        """RSS source with mocked feedparser."""
        import feedparser as fp

        original_parse = fp.parse

        def mock_parse(url: str, **kwargs):
            return original_parse(SAMPLE_RSS_XML)

        monkeypatch.setattr(fp, "parse", mock_parse)
        return RSSSource()

    @pytest.mark.asyncio
    async def test_happy_path(self, rss: RSSSource) -> None:
        results = await rss.fetch("aave", limit=5)
        assert len(results) >= 1
        assert all(isinstance(s, Source) for s in results)
        assert results[0].source_type == "rss"
        assert "aave" in results[0].title.lower() or "aave" in results[0].snippet.lower()

    @pytest.mark.asyncio
    async def test_query_filter(self, rss: RSSSource) -> None:
        results = await rss.fetch("bitcoin", limit=5)
        assert len(results) >= 1
        assert "bitcoin" in results[0].title.lower() or "bitcoin" in results[0].snippet.lower()

    @pytest.mark.asyncio
    async def test_no_match(self, rss: RSSSource) -> None:
        results = await rss.fetch("zzz_nonexistent_token_zzz", limit=5)
        assert results == []

    @pytest.mark.asyncio
    async def test_limit_respected(self, rss: RSSSource) -> None:
        results = await rss.fetch("a", limit=1)
        assert len(results) <= 1

    @pytest.mark.asyncio
    async def test_source_type(self, rss: RSSSource) -> None:
        assert rss.source_type == "rss"

    @pytest.mark.asyncio
    async def test_snippet_max_500(self, rss: RSSSource) -> None:
        results = await rss.fetch("aave")
        for s in results:
            assert len(s.snippet) <= 500

    @pytest.mark.asyncio
    async def test_weight_default(self, rss: RSSSource) -> None:
        results = await rss.fetch("aave")
        for s in results:
            assert s.weight == pytest.approx(0.7)

    @pytest.mark.asyncio
    async def test_cache_returns_same(self, rss: RSSSource) -> None:
        r1 = await rss.fetch("aave")
        r2 = await rss.fetch("aave")
        assert len(r1) == len(r2)

    @pytest.mark.asyncio
    async def test_feedparser_exception_returns_empty(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """When feedparser throws, gracefully return empty (no crash)."""
        import feedparser as fp

        def broken_parse(url: str, **kwargs):
            raise OSError("network unreachable")

        monkeypatch.setattr(fp, "parse", broken_parse)
        rss = RSSSource()
        results = await rss.fetch("aave")
        assert results == []

    @pytest.mark.asyncio
    async def test_close_is_noop(self) -> None:
        """RSSSource.close() exists and does not raise."""
        rss = RSSSource()
        await rss.close()


# ============================================================
# COINGECKO TESTS (7 + 4 new)
# ============================================================

SAMPLE_CG_RESPONSE = {
    "id": "ethereum",
    "name": "Ethereum",
    "market_data": {
        "current_price": {"usd": 3500.42},
        "price_change_percentage_24h": 2.5,
        "price_change_percentage_7d": -1.3,
        "market_cap": {"usd": 420_000_000_000},
        "total_value_locked": None,
    },
}

SAMPLE_CG_WITH_TVL = {
    "id": "aave",
    "name": "Aave",
    "market_data": {
        "current_price": {"usd": 92.50},
        "price_change_percentage_24h": -1.3,
        "price_change_percentage_7d": 4.2,
        "market_cap": {"usd": 1_400_000_000},
        "total_value_locked": {"usd": 15_000_000_000},
    },
}


class TestCoinGeckoSource:
    @pytest.fixture
    def cg(self) -> CoinGeckoSource:
        return CoinGeckoSource()

    @pytest.mark.asyncio
    @respx.mock
    async def test_happy_path(self, cg: CoinGeckoSource) -> None:
        respx.get(f"{CG_BASE}/coins/ethereum").mock(
            return_value=httpx.Response(200, json=SAMPLE_CG_RESPONSE)
        )
        results = await cg.fetch("eth")
        assert len(results) == 1
        assert results[0].source_type == "coingecko"
        assert "Ethereum" in results[0].title
        assert "$3,500.42" in results[0].snippet
        await cg.close()

    @pytest.mark.asyncio
    @respx.mock
    async def test_rate_limit_429(self, cg: CoinGeckoSource) -> None:
        respx.get(f"{CG_BASE}/coins/ethereum").mock(
            return_value=httpx.Response(429, json={"error": "rate limited"})
        )
        results = await cg.fetch("eth")
        assert results == []
        await cg.close()

    @pytest.mark.asyncio
    @respx.mock
    async def test_unknown_token(self, cg: CoinGeckoSource) -> None:
        respx.get(f"{CG_BASE}/coins/zzz_fake_token").mock(
            return_value=httpx.Response(404, json={"error": "not found"})
        )
        results = await cg.fetch("zzz_fake_token")
        assert results == []
        await cg.close()

    @pytest.mark.asyncio
    @respx.mock
    async def test_token_alias_resolution(self, cg: CoinGeckoSource) -> None:
        respx.get(f"{CG_BASE}/coins/bitcoin").mock(
            return_value=httpx.Response(200, json={
                "id": "bitcoin", "name": "Bitcoin",
                "market_data": {
                    "current_price": {"usd": 100000},
                    "price_change_percentage_24h": 1.0,
                    "price_change_percentage_7d": 5.0,
                    "market_cap": {"usd": 2_000_000_000_000},
                    "total_value_locked": None,
                },
            })
        )
        results = await cg.fetch("btc")
        assert len(results) == 1
        assert "Bitcoin" in results[0].title
        await cg.close()

    @pytest.mark.asyncio
    async def test_source_type(self, cg: CoinGeckoSource) -> None:
        assert cg.source_type == "coingecko"

    @pytest.mark.asyncio
    @respx.mock
    async def test_cache_hit(self, cg: CoinGeckoSource) -> None:
        route = respx.get(f"{CG_BASE}/coins/ethereum").mock(
            return_value=httpx.Response(200, json=SAMPLE_CG_RESPONSE)
        )
        await cg.fetch("eth")
        await cg.fetch("eth")
        assert route.call_count == 1
        await cg.close()

    @pytest.mark.asyncio
    @respx.mock
    async def test_weight_default(self, cg: CoinGeckoSource) -> None:
        respx.get(f"{CG_BASE}/coins/ethereum").mock(
            return_value=httpx.Response(200, json=SAMPLE_CG_RESPONSE)
        )
        results = await cg.fetch("eth")
        assert results[0].weight == pytest.approx(0.85)
        await cg.close()

    @pytest.mark.asyncio
    @respx.mock
    async def test_tvl_in_snippet(self, cg: CoinGeckoSource) -> None:
        """When total_value_locked is present, snippet includes TVL."""
        respx.get(f"{CG_BASE}/coins/aave").mock(
            return_value=httpx.Response(200, json=SAMPLE_CG_WITH_TVL)
        )
        results = await cg.fetch("aave")
        assert len(results) == 1
        assert "TVL" in results[0].snippet
        assert "$15000M" in results[0].snippet
        await cg.close()

    @pytest.mark.asyncio
    @respx.mock
    async def test_timeout_returns_empty(self, cg: CoinGeckoSource) -> None:
        """When API times out, return empty gracefully."""
        respx.get(f"{CG_BASE}/coins/ethereum").mock(
            side_effect=httpx.ReadTimeout("connection timed out")
        )
        results = await cg.fetch("eth")
        assert results == []
        await cg.close()

    @pytest.mark.asyncio
    async def test_path_traversal_rejected(self, cg: CoinGeckoSource) -> None:
        """Slug with path traversal characters is rejected by _SAFE_SLUG."""
        results = await cg.fetch("ethereum/../admin")
        assert results == []

    @pytest.mark.asyncio
    async def test_special_chars_rejected(self, cg: CoinGeckoSource) -> None:
        """Slug with special characters (dots, slashes) is rejected."""
        for bad_input in ["eth/../../etc", "a]b", "tok.en", "x;y", "a b"]:
            results = await cg.fetch(bad_input)
            assert results == [], f"Expected empty for input: {bad_input}"


# ============================================================
# DEFILLAMA TESTS (6 + 3 new)
# ============================================================

SAMPLE_DL_PROTOCOLS = [
    {"name": "Aave", "slug": "aave", "tvl": 15_000_000_000},
    {"name": "Compound", "slug": "compound", "tvl": 3_000_000_000},
    {"name": "Lido", "slug": "lido", "tvl": 20_000_000_000},
]

SAMPLE_DL_PROTOCOL = {
    "name": "Aave",
    "slug": "aave",
    "category": "Lending",
    "chains": ["Ethereum", "Polygon", "Arbitrum", "Optimism", "Avalanche", "Base"],
    "currentChainTvls": {
        "Ethereum": 10_000_000_000,
        "Polygon": 2_000_000_000,
        "Arbitrum": 1_500_000_000,
    },
    "audits": "2",
    "audit_note": "Audited by Trail of Bits, OpenZeppelin",
}


class TestDefiLlamaSource:
    @pytest.fixture
    def dl(self) -> DefiLlamaSource:
        return DefiLlamaSource()

    @pytest.mark.asyncio
    @respx.mock
    async def test_happy_path(self, dl: DefiLlamaSource) -> None:
        respx.get(f"{DL_BASE}/protocols").mock(
            return_value=httpx.Response(200, json=SAMPLE_DL_PROTOCOLS)
        )
        respx.get(f"{DL_BASE}/protocol/aave").mock(
            return_value=httpx.Response(200, json=SAMPLE_DL_PROTOCOL)
        )
        results = await dl.fetch("aave")
        assert len(results) == 1
        assert results[0].source_type == "defillama"
        assert "Aave" in results[0].title
        assert "TVL" in results[0].snippet
        await dl.close()

    @pytest.mark.asyncio
    @respx.mock
    async def test_protocol_not_found(self, dl: DefiLlamaSource) -> None:
        respx.get(f"{DL_BASE}/protocols").mock(
            return_value=httpx.Response(200, json=SAMPLE_DL_PROTOCOLS)
        )
        results = await dl.fetch("zzz_nonexistent")
        assert results == []
        await dl.close()

    @pytest.mark.asyncio
    @respx.mock
    async def test_protocols_list_error(self, dl: DefiLlamaSource) -> None:
        respx.get(f"{DL_BASE}/protocols").mock(
            return_value=httpx.Response(500, text="Internal Server Error")
        )
        results = await dl.fetch("aave")
        assert results == []
        await dl.close()

    @pytest.mark.asyncio
    @respx.mock
    async def test_partial_match(self, dl: DefiLlamaSource) -> None:
        respx.get(f"{DL_BASE}/protocols").mock(
            return_value=httpx.Response(200, json=SAMPLE_DL_PROTOCOLS)
        )
        respx.get(f"{DL_BASE}/protocol/compound").mock(
            return_value=httpx.Response(200, json={
                "name": "Compound", "slug": "compound", "category": "Lending",
                "chains": ["Ethereum"], "currentChainTvls": {"Ethereum": 3_000_000_000},
                "audits": "", "audit_note": "",
            })
        )
        results = await dl.fetch("comp", limit=5)
        assert len(results) >= 1
        await dl.close()

    @pytest.mark.asyncio
    async def test_source_type(self, dl: DefiLlamaSource) -> None:
        assert dl.source_type == "defillama"

    @pytest.mark.asyncio
    @respx.mock
    async def test_weight_default(self, dl: DefiLlamaSource) -> None:
        respx.get(f"{DL_BASE}/protocols").mock(
            return_value=httpx.Response(200, json=SAMPLE_DL_PROTOCOLS)
        )
        respx.get(f"{DL_BASE}/protocol/aave").mock(
            return_value=httpx.Response(200, json=SAMPLE_DL_PROTOCOL)
        )
        results = await dl.fetch("aave")
        assert results[0].weight == pytest.approx(0.85)
        await dl.close()

    @pytest.mark.asyncio
    @respx.mock
    async def test_protocol_detail_404(self, dl: DefiLlamaSource) -> None:
        """When individual protocol returns 404, skip it gracefully."""
        respx.get(f"{DL_BASE}/protocols").mock(
            return_value=httpx.Response(200, json=SAMPLE_DL_PROTOCOLS)
        )
        respx.get(f"{DL_BASE}/protocol/aave").mock(
            return_value=httpx.Response(404, text="Not Found")
        )
        results = await dl.fetch("aave")
        assert results == []
        await dl.close()

    @pytest.mark.asyncio
    @respx.mock
    async def test_timeout_returns_empty(self, dl: DefiLlamaSource) -> None:
        """When protocol detail times out, skip gracefully."""
        respx.get(f"{DL_BASE}/protocols").mock(
            return_value=httpx.Response(200, json=SAMPLE_DL_PROTOCOLS)
        )
        respx.get(f"{DL_BASE}/protocol/aave").mock(
            side_effect=httpx.ReadTimeout("connection timed out")
        )
        results = await dl.fetch("aave")
        assert results == []
        await dl.close()

    @pytest.mark.asyncio
    @respx.mock
    async def test_tvl_calculation(self, dl: DefiLlamaSource) -> None:
        """TVL snippet sums all chain TVLs correctly."""
        respx.get(f"{DL_BASE}/protocols").mock(
            return_value=httpx.Response(200, json=SAMPLE_DL_PROTOCOLS)
        )
        respx.get(f"{DL_BASE}/protocol/aave").mock(
            return_value=httpx.Response(200, json=SAMPLE_DL_PROTOCOL)
        )
        results = await dl.fetch("aave")
        assert len(results) == 1
        # 10B + 2B + 1.5B = 13.5B = 13500M
        assert "TVL $13500M" in results[0].snippet
        await dl.close()


# ============================================================
# AGGREGATOR TESTS (4 + 3 new)
# ============================================================

class TestDataAggregator:
    @pytest.mark.asyncio
    async def test_uses_source_priority_order(self) -> None:
        """Sources are fetched in priority order and results aggregated."""
        call_order: list[str] = []

        class MockCG:
            source_type = "coingecko"
            async def fetch(self, query: str, limit: int = 5) -> list[Source]:
                call_order.append("coingecko")
                return [Source(url="https://cg.com/eth", title="ETH CG", snippet="price data", weight=0.85, source_type="coingecko")]

        class MockDL:
            source_type = "defillama"
            async def fetch(self, query: str, limit: int = 5) -> list[Source]:
                call_order.append("defillama")
                return [Source(url="https://dl.com/aave", title="Aave DL", snippet="tvl data", weight=0.85, source_type="defillama")]

        class MockRSS:
            source_type = "rss"
            async def fetch(self, query: str, limit: int = 5) -> list[Source]:
                call_order.append("rss")
                return [Source(url="https://coindesk.com/news", title="News", snippet="article", weight=0.7, source_type="rss")]

        registry = {"coingecko": MockCG(), "defillama": MockDL(), "rss": MockRSS()}
        agg = DataAggregator(registry=registry)

        results = await agg.fetch_for_query("eth", source_priority=["coingecko", "defillama", "rss"])
        assert len(results) == 3
        assert call_order == ["coingecko", "defillama", "rss"]

    @pytest.mark.asyncio
    async def test_continues_on_one_source_failure(self) -> None:
        """Aggregator continues if one source throws."""
        class FailingSource:
            source_type = "failing"
            async def fetch(self, query: str, limit: int = 5) -> list[Source]:
                raise ConnectionError("network down")

        class WorkingSource:
            source_type = "working"
            async def fetch(self, query: str, limit: int = 5) -> list[Source]:
                return [Source(url="https://ok.com", title="OK", snippet="works", weight=0.5, source_type="rss")]

        registry = {"failing": FailingSource(), "working": WorkingSource()}
        agg = DataAggregator(registry=registry)

        results = await agg.fetch_for_query("test", source_priority=["failing", "working"])
        assert len(results) == 1
        assert results[0].title == "OK"

    @pytest.mark.asyncio
    async def test_unknown_source_skipped(self) -> None:
        """Unknown source names in priority are silently skipped."""
        agg = DataAggregator(registry={})
        results = await agg.fetch_for_query("test", source_priority=["nonexistent", "also_fake"])
        assert results == []

    @pytest.mark.asyncio
    async def test_empty_priority(self) -> None:
        """Empty priority list returns empty results."""
        agg = DataAggregator(registry={})
        results = await agg.fetch_for_query("test", source_priority=[])
        assert results == []

    @pytest.mark.asyncio
    async def test_limit_per_source(self) -> None:
        """Each source respects limit_per_source parameter."""
        class BigSource:
            source_type = "big"
            async def fetch(self, query: str, limit: int = 5) -> list[Source]:
                return [
                    Source(url=f"https://src.com/{i}", title=f"Item {i}", snippet=f"item {i}", weight=0.5, source_type="rss")
                    for i in range(limit)
                ]

        registry = {"big": BigSource()}
        agg = DataAggregator(registry=registry)

        results = await agg.fetch_for_query("test", source_priority=["big"], limit_per_source=2)
        assert len(results) == 2

    @pytest.mark.asyncio
    async def test_factory_creates_fresh_instances(self) -> None:
        """create_default_registry() returns new instances each call."""
        r1 = create_default_registry()
        r2 = create_default_registry()
        assert r1["coingecko"] is not r2["coingecko"]
        assert r1["defillama"] is not r2["defillama"]
        assert r1["rss"] is not r2["rss"]

    @pytest.mark.asyncio
    async def test_bear_priority_order(self) -> None:
        """Bear persona priority: defillama first, then rss, then coingecko."""
        call_order: list[str] = []

        class TrackingSource:
            def __init__(self, name: str):
                self._name = name
                self.source_type = name
            async def fetch(self, query: str, limit: int = 5) -> list[Source]:
                call_order.append(self._name)
                return []

        registry = {
            "defillama": TrackingSource("defillama"),
            "rss": TrackingSource("rss"),
            "coingecko": TrackingSource("coingecko"),
        }
        agg = DataAggregator(registry=registry)

        await agg.fetch_for_query("eth", source_priority=["defillama", "rss", "coingecko"])
        assert call_order == ["defillama", "rss", "coingecko"]
