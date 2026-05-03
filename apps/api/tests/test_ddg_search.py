"""Mocked tests dla DDG HTML scraping fallback."""

from __future__ import annotations

from pathlib import Path

import httpx
import pytest
import respx

from data.web_search import (
    MAX_QUERIES_PER_MINUTE,
    WebSearchSource,
    _RateLimiter,
    ddg_search,
)
from services.cache import _set_client_for_tests, reset_cache_for_tests

HTML_FIXTURE = Path(__file__).parent / "fixtures" / "ddg_html_sample.html"


@pytest.fixture
def ddg_html() -> str:
    return HTML_FIXTURE.read_text(encoding="utf-8")


@pytest.fixture
def fresh_limiter() -> _RateLimiter:
    return _RateLimiter(MAX_QUERIES_PER_MINUTE, 60.0)


@pytest.fixture(autouse=True)
async def _isolate_cache() -> None:
    await reset_cache_for_tests()
    _set_client_for_tests(None, connected=False)
    yield
    await reset_cache_for_tests()


class TestDDGSearch:
    @pytest.mark.asyncio
    @respx.mock
    async def test_happy_path_parses_html(
        self,
        ddg_html: str,
        fresh_limiter: _RateLimiter,
    ) -> None:
        respx.post("https://html.duckduckgo.com/html/").mock(
            return_value=httpx.Response(200, text=ddg_html)
        )
        results = await ddg_search("aave audits", max_results=5, limiter=fresh_limiter)

        assert len(results) == 3
        assert results[0]["title"]
        assert results[0]["url"].startswith("https://")
        assert "Aave" in results[0]["snippet"] or "audit" in results[0]["snippet"].lower()
        # uddg-wrapped link decoded
        assert any("blog.openzeppelin.com" in r["url"] for r in results)

    @pytest.mark.asyncio
    async def test_rate_limit_blocks(self) -> None:
        limiter = _RateLimiter(2, 60.0)
        assert limiter.allow() is True
        assert limiter.allow() is True
        assert limiter.allow() is False  # bucket empty

        results = await ddg_search("query", max_results=3, limiter=limiter)
        assert results == []

    @pytest.mark.asyncio
    @respx.mock
    async def test_parse_error_graceful(self, fresh_limiter: _RateLimiter) -> None:
        respx.post("https://html.duckduckgo.com/html/").mock(
            return_value=httpx.Response(200, text="<html>no results here</html>")
        )
        results = await ddg_search("anything", max_results=5, limiter=fresh_limiter)
        assert results == []  # nothing matched but no crash

    @pytest.mark.asyncio
    @respx.mock
    async def test_cache_hit_skips_http(
        self,
        ddg_html: str,
        fresh_limiter: _RateLimiter,
    ) -> None:
        # Pre-populate cache via real call, then check second call uses cache
        # fake in-memory cache shim
        store: dict[str, object] = {}

        class _FakeRedis:
            async def get(self, k: str) -> str | None:
                v = store.get(k)
                import json as _json

                return _json.dumps(v) if v is not None else None

            async def set(self, k: str, v: str, ex: int = 0) -> None:
                import json as _json

                store[k] = _json.loads(v)

            async def delete(self, k: str) -> None:
                store.pop(k, None)

            async def aclose(self) -> None:
                store.clear()

        _set_client_for_tests(_FakeRedis(), connected=True)

        respx.post("https://html.duckduckgo.com/html/").mock(
            return_value=httpx.Response(200, text=ddg_html)
        )
        first = await ddg_search("aave", max_results=5, limiter=fresh_limiter)
        assert len(first) == 3

        # Drugi call - cache hit, brak HTTP
        respx.reset()
        respx.post("https://html.duckduckgo.com/html/").mock(
            side_effect=AssertionError("should not call HTTP on cache hit")
        )
        second = await ddg_search("aave", max_results=5, limiter=fresh_limiter)
        assert len(second) == 3
        assert second[0]["url"] == first[0]["url"]

    @pytest.mark.asyncio
    @respx.mock
    async def test_network_error_graceful(self, fresh_limiter: _RateLimiter) -> None:
        respx.post("https://html.duckduckgo.com/html/").mock(
            side_effect=httpx.ConnectTimeout("timeout")
        )
        results = await ddg_search("query", max_results=5, limiter=fresh_limiter)
        assert results == []


class TestWebSearchSource:
    @pytest.mark.asyncio
    @respx.mock
    async def test_fetch_returns_source_objects(self, ddg_html: str) -> None:
        respx.post("https://html.duckduckgo.com/html/").mock(
            return_value=httpx.Response(200, text=ddg_html)
        )
        src = WebSearchSource()
        try:
            results = await src.fetch("aave", limit=3)
            assert len(results) == 3
            assert all(s.source_type == "web_search" for s in results)
            assert all(0.0 < s.weight <= 1.0 for s in results)
        finally:
            await src.close()
