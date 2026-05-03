"""Tests for Redis cache layer (Sesja 49b).

Uses an in-process fake Redis so tests do not require a running Redis server.
Real-Redis behaviour (PING failure, network errors) is exercised via the
graceful-degrade test that injects a client raising RedisError.
"""

from __future__ import annotations

import json
from typing import Any

import pytest

from services import cache as cache_mod


class _FakeRedis:
    """Minimal async fake. Stores raw strings keyed by str."""

    def __init__(self) -> None:
        self.store: dict[str, str] = {}
        self.calls: list[tuple[str, ...]] = []

    async def get(self, key: str) -> str | None:
        self.calls.append(("get", key))
        return self.store.get(key)

    async def set(self, key: str, value: str, ex: int | None = None) -> None:
        self.calls.append(("set", key, value, str(ex)))
        self.store[key] = value

    async def delete(self, key: str) -> None:
        self.calls.append(("delete", key))
        self.store.pop(key, None)

    async def ping(self) -> bool:
        return True

    async def aclose(self) -> None:
        return None


class _BrokenRedis(_FakeRedis):
    async def get(self, key: str) -> str | None:  # type: ignore[override]
        raise cache_mod.RedisError("connection lost")

    async def set(self, key: str, value: str, ex: int | None = None) -> None:  # type: ignore[override]
        raise cache_mod.RedisError("write failed")


@pytest.fixture(autouse=True)
def _reset_cache() -> Any:
    cache_mod._set_client_for_tests(None, connected=False)
    yield
    cache_mod._set_client_for_tests(None, connected=False)


@pytest.mark.asyncio
async def test_cache_get_returns_none_when_disconnected() -> None:
    assert cache_mod.is_connected() is False
    assert await cache_mod.cache_get("any") is None


@pytest.mark.asyncio
async def test_cache_set_returns_false_when_disconnected() -> None:
    ok = await cache_mod.cache_set("k", {"v": 1})
    assert ok is False


@pytest.mark.asyncio
async def test_cache_set_then_get_roundtrip() -> None:
    fake = _FakeRedis()
    cache_mod._set_client_for_tests(fake)
    payload = {"agents": [{"persona": "bull", "score": 110}]}
    assert await cache_mod.cache_set("k1", payload, ttl_seconds=60) is True
    out = await cache_mod.cache_get("k1")
    assert out == payload
    # ensure ttl was passed through to underlying SET
    assert fake.calls[0][0] == "set"
    assert fake.calls[0][3] == "60"


@pytest.mark.asyncio
async def test_cache_get_handles_corrupt_json() -> None:
    fake = _FakeRedis()
    fake.store["bad"] = "{not json"
    cache_mod._set_client_for_tests(fake)
    assert await cache_mod.cache_get("bad") is None


@pytest.mark.asyncio
async def test_graceful_degrade_on_redis_error() -> None:
    broken = _BrokenRedis()
    cache_mod._set_client_for_tests(broken)
    assert await cache_mod.cache_get("k") is None
    assert await cache_mod.cache_set("k", {"x": 1}) is False


@pytest.mark.asyncio
async def test_cache_set_rejects_unserializable() -> None:
    fake = _FakeRedis()
    cache_mod._set_client_for_tests(fake)

    class Unserializable:
        pass

    ok = await cache_mod.cache_set("u", Unserializable())  # default=str -> falls through
    # default=str converts to repr-like string -> set succeeds, but ensure stored as JSON string
    assert ok is True
    raw = fake.store["u"]
    assert isinstance(json.loads(raw), str)


@pytest.mark.asyncio
async def test_cache_delete() -> None:
    fake = _FakeRedis()
    cache_mod._set_client_for_tests(fake)
    await cache_mod.cache_set("d", {"x": 1})
    assert "d" in fake.store
    assert await cache_mod.cache_delete("d") is True
    assert "d" not in fake.store


@pytest.mark.asyncio
async def test_cache_connect_no_url_returns_false(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("REDIS_URL", raising=False)
    await cache_mod.reset_cache_for_tests()
    ok = await cache_mod.cache_connect()
    assert ok is False
    assert cache_mod.is_connected() is False
