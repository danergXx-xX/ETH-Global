"""
WebSocket hard cap middleware.

Limits concurrent WS connections to WS_MAX_CONCURRENT (default 30). When the cap
is hit, new WS connections are rejected with policy violation close code (1008)
and an error event before close. HTTP routes that mount WS upgrades can also
preflight-check via `ws_tracker.would_exceed()`.

Counter is in-memory per-process. Sufficient for single-replica Railway deploy
(numReplicas=1 in railway.json). Multi-replica future would migrate to Redis.
"""

from __future__ import annotations

import asyncio
import os
import uuid
from dataclasses import dataclass

import structlog

log = structlog.get_logger()

DEFAULT_WS_MAX_CONCURRENT = 30


def _read_cap_from_env() -> int:
    raw = os.environ.get("WS_MAX_CONCURRENT", str(DEFAULT_WS_MAX_CONCURRENT))
    try:
        value = int(raw)
    except ValueError:
        return DEFAULT_WS_MAX_CONCURRENT
    return max(1, value)


@dataclass
class WSConnectionTracker:
    """Track open WS connections. Acquire/release pattern with async lock."""

    max_concurrent: int

    def __post_init__(self) -> None:
        self._lock = asyncio.Lock()
        self._connections: set[str] = set()

    async def try_acquire(self, conn_id: str | None = None) -> str | None:
        """
        Reserve a slot. Returns connection id on success, None when at cap.
        Caller must call release(conn_id) when WS closes.
        """
        cid = conn_id or uuid.uuid4().hex
        async with self._lock:
            if len(self._connections) >= self.max_concurrent:
                log.warning(
                    "ws_cap_rejected",
                    open=len(self._connections),
                    cap=self.max_concurrent,
                )
                return None
            self._connections.add(cid)
            log.info(
                "ws_connection_opened",
                conn_id=cid,
                open=len(self._connections),
                cap=self.max_concurrent,
            )
            return cid

    async def release(self, conn_id: str) -> None:
        async with self._lock:
            existed = conn_id in self._connections
            self._connections.discard(conn_id)
            log.info(
                "ws_connection_closed",
                conn_id=conn_id,
                open=len(self._connections),
                existed=existed,
            )

    async def open_count(self) -> int:
        async with self._lock:
            return len(self._connections)

    async def would_exceed(self) -> bool:
        async with self._lock:
            return len(self._connections) >= self.max_concurrent


_singleton: WSConnectionTracker | None = None


def get_ws_tracker() -> WSConnectionTracker:
    global _singleton
    if _singleton is None:
        _singleton = WSConnectionTracker(max_concurrent=_read_cap_from_env())
    return _singleton


def reset_ws_tracker_for_tests(max_concurrent: int | None = None) -> WSConnectionTracker:
    """Test helper - reset and optionally override cap."""
    global _singleton
    cap = max_concurrent if max_concurrent is not None else _read_cap_from_env()
    _singleton = WSConnectionTracker(max_concurrent=cap)
    return _singleton
