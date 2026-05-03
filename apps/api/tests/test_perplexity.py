"""Mocked tests dla Perplexity API adapter (no real API calls)."""

from __future__ import annotations

import json
from pathlib import Path

import httpx
import pytest
import respx

from data.perplexity import PerplexitySource, query_perplexity
from services.cache import _set_client_for_tests, reset_cache_for_tests

FIXTURE = Path(__file__).parent / "fixtures" / "perplexity_response.json"


@pytest.fixture
def perplexity_response() -> dict:
    return json.loads(FIXTURE.read_text(encoding="utf-8"))


@pytest.fixture(autouse=True)
async def _isolate_cache() -> None:
    await reset_cache_for_tests()
    _set_client_for_tests(None, connected=False)
    yield
    await reset_cache_for_tests()


class TestQueryPerplexity:
    @pytest.mark.asyncio
    @respx.mock
    async def test_happy_path_with_mock(
        self,
        perplexity_response: dict,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        monkeypatch.setenv("PERPLEXITY_API_KEY", "test-fake-key")
        respx.post("https://api.perplexity.ai/chat/completions").mock(
            return_value=httpx.Response(200, json=perplexity_response)
        )

        result = await query_perplexity("Aave audit history?")

        assert result is not None
        assert "Aave" in result["answer"]
        assert len(result["sources"]) == 3
        assert result["sources"][0]["url"].startswith("https://")
        assert 0.0 <= result["confidence"] <= 1.0

    @pytest.mark.asyncio
    async def test_no_api_key_returns_none(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.delenv("PERPLEXITY_API_KEY", raising=False)
        result = await query_perplexity("anything")
        assert result is None

    @pytest.mark.asyncio
    async def test_placeholder_key_treated_as_missing(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setenv("PERPLEXITY_API_KEY", "pplx-xxxxx")
        result = await query_perplexity("anything")
        assert result is None

    @pytest.mark.asyncio
    @respx.mock
    async def test_network_error_graceful(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("PERPLEXITY_API_KEY", "test-fake-key")
        respx.post("https://api.perplexity.ai/chat/completions").mock(
            side_effect=httpx.ConnectError("boom")
        )
        result = await query_perplexity("Aave audits?")
        assert result is None

    @pytest.mark.asyncio
    @respx.mock
    async def test_malformed_response(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("PERPLEXITY_API_KEY", "test-fake-key")
        respx.post("https://api.perplexity.ai/chat/completions").mock(
            return_value=httpx.Response(200, json={"unexpected": "shape"})
        )
        result = await query_perplexity("query")
        assert result is None


class TestPerplexitySource:
    @pytest.mark.asyncio
    @respx.mock
    async def test_fetch_returns_sources(
        self,
        perplexity_response: dict,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        monkeypatch.setenv("PERPLEXITY_API_KEY", "test-fake-key")
        respx.post("https://api.perplexity.ai/chat/completions").mock(
            return_value=httpx.Response(200, json=perplexity_response)
        )
        src = PerplexitySource()
        try:
            results = await src.fetch("Aave audits?", limit=3)
            assert len(results) == 3
            assert all(s.source_type == "perplexity" for s in results)
            assert all(s.weight > 0 for s in results)
        finally:
            await src.close()

    @pytest.mark.asyncio
    async def test_fetch_no_key_returns_empty(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.delenv("PERPLEXITY_API_KEY", raising=False)
        src = PerplexitySource()
        try:
            results = await src.fetch("anything", limit=3)
            assert results == []
        finally:
            await src.close()
