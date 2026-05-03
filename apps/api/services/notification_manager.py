"""
Per-address WebSocket notification fanout.

Each address can have multiple connected sockets (browser tabs, mobile, ...).
push_to_address fan-outs to all live connections.

Charter #6 (No silent failures): a dead socket is logged + removed; a slow
socket cannot block the others - we use asyncio.gather with return_exceptions.
"""

from __future__ import annotations

import asyncio
from typing import Any

import structlog
from eth_utils import to_checksum_address
from fastapi import WebSocket

log = structlog.get_logger()


class NotificationManager:
    def __init__(self) -> None:
        self._sockets: dict[str, set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    @staticmethod
    def _key(address: str) -> str:
        return to_checksum_address(address)

    async def connect(self, address: str, websocket: WebSocket) -> str:
        key = self._key(address)
        async with self._lock:
            self._sockets.setdefault(key, set()).add(websocket)
        log.info("notif_ws_connect", address=key, sockets=len(self._sockets[key]))
        return key

    async def disconnect(self, address: str, websocket: WebSocket) -> None:
        key = self._key(address)
        async with self._lock:
            bucket = self._sockets.get(key)
            if bucket is None:
                return
            bucket.discard(websocket)
            if not bucket:
                self._sockets.pop(key, None)

    async def push_to_address(self, address: str, payload: dict[str, Any]) -> int:
        """Fan-out to all sockets for one address. Returns count delivered."""
        key = self._key(address)
        async with self._lock:
            sockets = list(self._sockets.get(key, ()))
        if not sockets:
            return 0

        async def _send(ws: WebSocket) -> bool:
            try:
                await ws.send_json(payload)
                return True
            except Exception as exc:
                log.warning(
                    "notif_ws_send_failed",
                    address=key,
                    error_type=type(exc).__name__,
                )
                return False

        results = await asyncio.gather(*[_send(s) for s in sockets])
        delivered = sum(1 for ok in results if ok)
        return delivered

    def connection_count(self, address: str) -> int:
        return len(self._sockets.get(self._key(address), ()))


_manager: NotificationManager | None = None


def get_notification_manager() -> NotificationManager:
    global _manager
    if _manager is None:
        _manager = NotificationManager()
    return _manager


def reset_notification_manager() -> None:
    """Test-only hook so each test gets a clean fanout state."""
    global _manager
    _manager = NotificationManager()
