"""Tests for /api/notifications and /ws/notifications."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from schemas import Notification
from services.in_memory_store import clear_all_state, push_notification
from services.notification_manager import reset_notification_manager
from routers.notifications import publish_notification

ADDR = "0xBeeF000000000000000000000000000000000003"


@pytest.fixture(autouse=True)
def _reset_state() -> None:
    asyncio.get_event_loop().run_until_complete(clear_all_state())
    reset_notification_manager()


def _make_notification(idx: int = 1, read: bool = False) -> Notification:
    return Notification(
        id=f"n-{idx}",
        category="verdict",
        title=f"Proposal {idx} verdict",
        summary="Council reached consensus FOR.",
        metadata={"proposal_id": f"prop-{idx}"},
        timestamp=datetime.now(timezone.utc),
        read=read,
    )


def test_empty_history_returns_zero(client: TestClient) -> None:
    r = client.get(f"/api/notifications?address={ADDR}")
    assert r.status_code == 200
    body = r.json()
    assert body["notifications"] == []
    assert body["unread_count"] == 0


def test_history_after_push(client: TestClient) -> None:
    asyncio.get_event_loop().run_until_complete(
        push_notification(ADDR, _make_notification(1))
    )
    body = client.get(f"/api/notifications?address={ADDR}").json()
    assert len(body["notifications"]) == 1
    assert body["unread_count"] == 1


def test_unread_filter(client: TestClient) -> None:
    loop = asyncio.get_event_loop()
    loop.run_until_complete(push_notification(ADDR, _make_notification(1, read=True)))
    loop.run_until_complete(push_notification(ADDR, _make_notification(2, read=False)))
    body = client.get(f"/api/notifications?address={ADDR}&unread=true").json()
    assert len(body["notifications"]) == 1
    assert body["notifications"][0]["id"] == "n-2"
    assert body["unread_count"] == 1


def test_mark_read_flips_state(client: TestClient) -> None:
    loop = asyncio.get_event_loop()
    loop.run_until_complete(push_notification(ADDR, _make_notification(1)))
    loop.run_until_complete(push_notification(ADDR, _make_notification(2)))
    r = client.post(
        "/api/notifications/read",
        json={"address": ADDR, "ids": ["n-1", "n-2"]},
    )
    assert r.status_code == 200
    assert r.json()["updated"] == 2
    body = client.get(f"/api/notifications?address={ADDR}").json()
    assert body["unread_count"] == 0


def test_mark_read_unknown_id_returns_zero(client: TestClient) -> None:
    r = client.post(
        "/api/notifications/read",
        json={"address": ADDR, "ids": ["nope"]},
    )
    assert r.status_code == 200
    assert r.json()["updated"] == 0


def test_invalid_address_query_rejected(client: TestClient) -> None:
    r = client.get("/api/notifications?address=0xnope")
    assert r.status_code == 422


def test_websocket_connect_and_receive_push(client: TestClient) -> None:
    """WS round-trip: connect, server publishes -> client receives."""
    with client.websocket_connect(f"/ws/notifications?address={ADDR}") as ws:
        hello = ws.receive_json()
        assert hello["type"] == "connected"

        async def _publish() -> int:
            return await publish_notification(ADDR, _make_notification(7))

        delivered = asyncio.get_event_loop().run_until_complete(_publish())
        assert delivered == 1
        msg = ws.receive_json()
        assert msg["type"] == "notification"
        assert msg["id"] == "n-7"


def test_websocket_rejects_invalid_address(client: TestClient) -> None:
    with client.websocket_connect("/ws/notifications?address=0xnope") as ws:
        msg = ws.receive_json()
        assert msg["type"] == "error"
