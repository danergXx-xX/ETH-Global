"""
Redis cache layer with graceful degradation.

Connects via REDIS_URL env var (auto-injected by Railway Redis plugin). When
Redis is unavailable, all cache_get/cache_set calls return None / silently
no-op so callers fall back to source-of-truth reads (RPC, HTTP, DB).

JSON-serializable values only. For complex objects, callers should pre-encode.

Connection lifecycle:
  - lifespan startup: cache_connect()
  - lifespan shutdown: cache_disconnect()
  - tests: reset_cache_for_tests() then optionally cache_connect()

WARNING: never cache secrets or PII via cache_set. Audit log emits the key,
not the value, but a leaky key still surfaces what was looked up.
"""

from __future__ import annotations

import json
import os
from typing import Any

import structlog

try:
    import redis.asyncio as redis_async
    from redis.exceptions import RedisError
except ImportError:  # pragma: no cover - guarded by requirements.txt
    redis_async = None  # type: ignore[assignment]
    RedisError = Exception  # type: ignore[assignment,misc]

log = structlog.get_logger()

DEFAULT_TTL_SECONDS = 300

_client: Any | None = None
_connected: bool = False


def _redis_url() -> str | None:
    return os.environ.get("REDIS_URL") or None


async def cache_connect() -> bool:
    """
    Initialize Redis client and verify connectivity with PING. Returns True on
    success, False when REDIS_URL is unset OR redis is unreachable. Safe to
    call repeatedly - second call is a no-op if already connected.
    """
    global _client, _connected
    if _connected and _client is not None:
        return True
    url = _redis_url()
    if not url:
        log.info("cache_disabled_no_url")
        return False
    if redis_async is None:
        log.warning("cache_disabled_redis_lib_missing")
        return False
    try:
        client = redis_async.from_url(
            url,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=2.0,
            socket_timeout=2.0,
            health_check_interval=30,
        )
        await client.ping()
    except (RedisError, OSError, ConnectionError, TimeoutError) as exc:
        log.warning(
            "cache_connect_failed",
            error_type=type(exc).__name__,
            error=str(exc),
        )
        _client = None
        _connected = False
        return False
    _client = client
    _connected = True
    log.info("cache_connected")
    return True


async def cache_disconnect() -> None:
    global _client, _connected
    if _client is not None:
        try:
            await _client.aclose()
        except (RedisError, OSError) as exc:
            log.warning("cache_disconnect_error", error=str(exc))
        finally:
            _client = None
            _connected = False


def is_connected() -> bool:
    return _connected and _client is not None


async def cache_get(key: str) -> Any | None:
    """Returns deserialized JSON value or None when miss / Redis down / parse error."""
    if not is_connected() or _client is None:
        return None
    try:
        raw = await _client.get(key)
    except (RedisError, OSError, ConnectionError, TimeoutError) as exc:
        log.warning("cache_get_failed", key=key, error=str(exc))
        return None
    if raw is None:
        return None
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError) as exc:
        log.warning("cache_parse_failed", key=key, error=str(exc))
        return None


async def cache_set(
    key: str,
    value: Any,
    ttl_seconds: int = DEFAULT_TTL_SECONDS,
) -> bool:
    """Store JSON-encoded value with TTL. Returns True on success, False on any failure."""
    if not is_connected() or _client is None:
        return False
    try:
        encoded = json.dumps(value, default=str)
    except (TypeError, ValueError) as exc:
        log.warning("cache_encode_failed", key=key, error=str(exc))
        return False
    try:
        await _client.set(key, encoded, ex=max(1, int(ttl_seconds)))
    except (RedisError, OSError, ConnectionError, TimeoutError) as exc:
        log.warning("cache_set_failed", key=key, error=str(exc))
        return False
    return True


async def cache_delete(key: str) -> bool:
    if not is_connected() or _client is None:
        return False
    try:
        await _client.delete(key)
    except (RedisError, OSError, ConnectionError, TimeoutError) as exc:
        log.warning("cache_delete_failed", key=key, error=str(exc))
        return False
    return True


async def reset_cache_for_tests() -> None:
    """Disconnect + reset client. Tests can then patch _client / call cache_connect."""
    await cache_disconnect()


def _set_client_for_tests(client: Any | None, connected: bool = True) -> None:
    """Inject a fake Redis client for unit tests (no real Redis needed)."""
    global _client, _connected
    _client = client
    _connected = connected and client is not None
