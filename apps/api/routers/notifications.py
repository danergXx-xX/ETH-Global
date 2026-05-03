"""
Notifications: REST history + read-marker, plus WS /ws/notifications fanout.

WS contract:
  - Connect: /ws/notifications?address=<eth>
  - Server pushes Notification JSON envelopes as they happen.
  - Client may send {"type": "ping"} to keepalive (server replies {"type": "pong"}).
  - 10 connections/min/IP rate limit (DoS protection, identical to /ws/debate).
"""

import asyncio
import re

import structlog
from eth_utils import to_checksum_address
from fastapi import APIRouter, HTTPException, Query, Request, WebSocket, WebSocketDisconnect
from limits import parse as parse_limit
from limits.storage import MemoryStorage
from limits.strategies import MovingWindowRateLimiter
from slowapi import Limiter
from slowapi.util import get_remote_address

from schemas import (
    ETH_ADDRESS_PATTERN,
    Notification,
    NotificationListResponse,
    NotificationReadRequest,
)
from services.in_memory_store import (
    list_notifications,
    mark_notifications_read,
)
from services.notification_manager import get_notification_manager

log = structlog.get_logger()

router = APIRouter(prefix="/api/notifications", tags=["notifications"])
_limiter = Limiter(key_func=get_remote_address)

_ws_storage = MemoryStorage()
_ws_rate_limiter = MovingWindowRateLimiter(_ws_storage)
_WS_NOTIF_LIMIT = parse_limit("10/minute")


def _validate_address(raw: str) -> str:
    if not re.fullmatch(ETH_ADDRESS_PATTERN, raw):
        raise HTTPException(
            status_code=422,
            detail="address must match 0x[a-fA-F0-9]{40}",
        )
    return to_checksum_address(raw)


@router.get(
    "",
    response_model=NotificationListResponse,
    summary="List notifications for an address",
)
@_limiter.limit("60/minute")
async def get_notifications(
    request: Request,
    address: str = Query(..., min_length=42, max_length=42),
    unread: bool = Query(default=False),
) -> NotificationListResponse:
    addr = _validate_address(address)
    all_items = await list_notifications(addr, unread_only=False)
    unread_count = sum(1 for n in all_items if not n.read)
    items = [n for n in all_items if not n.read] if unread else all_items
    return NotificationListResponse(
        notifications=items,
        unread_count=unread_count,
    )


@router.post(
    "/read",
    summary="Mark notifications as read",
)
@_limiter.limit("60/minute")
async def post_mark_read(
    request: Request,
    payload: NotificationReadRequest,
) -> dict[str, int]:
    addr = _validate_address(payload.address)
    flipped = await mark_notifications_read(addr, payload.ids)
    log.info("notifications_marked_read", address=addr, flipped=flipped)
    return {"updated": flipped}


# -----------------------------------------------------------------
# WebSocket fanout
# -----------------------------------------------------------------

ws_router = APIRouter()


@ws_router.websocket("/ws/notifications")
async def ws_notifications(websocket: WebSocket) -> None:
    """Per-address fanout. Connect with ?address=<eth>."""
    client_ip = websocket.client.host if websocket.client else "unknown"
    if not _ws_rate_limiter.hit(_WS_NOTIF_LIMIT, "ws_notifications", client_ip):
        await websocket.accept()
        await websocket.send_json(
            {"type": "error", "message": "rate limit exceeded (10/min)"}
        )
        await websocket.close(code=1008)
        return

    address_raw = websocket.query_params.get("address", "")
    if not re.fullmatch(ETH_ADDRESS_PATTERN, address_raw):
        await websocket.accept()
        await websocket.send_json(
            {"type": "error", "message": "address must match 0x[a-fA-F0-9]{40}"}
        )
        await websocket.close(code=1008)
        return
    address = to_checksum_address(address_raw)

    manager = get_notification_manager()
    await websocket.accept()
    await manager.connect(address, websocket)
    await websocket.send_json({"type": "connected", "address": address})
    try:
        while True:
            try:
                # Slow-loris guard: drop a connection that goes silent.
                msg = await asyncio.wait_for(websocket.receive_json(), timeout=120)
            except asyncio.TimeoutError:
                await websocket.send_json({"type": "idle_timeout"})
                await websocket.close(code=1000)
                return
            if isinstance(msg, dict) and msg.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        log.info("notif_ws_disconnect", address=address)
    except Exception as exc:
        log.error(
            "notif_ws_failed",
            address=address,
            error_type=type(exc).__name__,
            error=str(exc),
        )
    finally:
        await manager.disconnect(address, websocket)


# Convenience export so main.py can publish a Notification synchronously.
async def publish_notification(address: str, notification: Notification) -> int:
    """Persist + push. Returns count of live sockets that received the push."""
    from services.in_memory_store import push_notification  # avoid cycle

    addr = to_checksum_address(address)
    await push_notification(addr, notification)
    delivered = await get_notification_manager().push_to_address(
        addr, {"type": "notification", **notification.model_dump(mode="json")}
    )
    return delivered
