"""Tests for WS hard cap middleware (Sesja 49a)."""

from __future__ import annotations

import pytest

from middleware.ws_cap import WSConnectionTracker, reset_ws_tracker_for_tests


@pytest.mark.asyncio
async def test_acquire_under_cap_succeeds() -> None:
    tracker = WSConnectionTracker(max_concurrent=3)
    cid = await tracker.try_acquire()
    assert cid is not None
    assert await tracker.open_count() == 1


@pytest.mark.asyncio
async def test_acquire_at_cap_returns_none() -> None:
    tracker = WSConnectionTracker(max_concurrent=2)
    a = await tracker.try_acquire()
    b = await tracker.try_acquire()
    c = await tracker.try_acquire()
    assert a is not None and b is not None
    assert c is None
    assert await tracker.open_count() == 2


@pytest.mark.asyncio
async def test_release_frees_slot() -> None:
    tracker = WSConnectionTracker(max_concurrent=1)
    a = await tracker.try_acquire()
    assert a is not None
    blocked = await tracker.try_acquire()
    assert blocked is None
    await tracker.release(a)
    assert await tracker.open_count() == 0
    new = await tracker.try_acquire()
    assert new is not None


@pytest.mark.asyncio
async def test_release_unknown_id_is_noop() -> None:
    tracker = WSConnectionTracker(max_concurrent=2)
    await tracker.release("not-an-id")
    assert await tracker.open_count() == 0


@pytest.mark.asyncio
async def test_would_exceed_signals_capacity() -> None:
    tracker = WSConnectionTracker(max_concurrent=1)
    assert await tracker.would_exceed() is False
    await tracker.try_acquire()
    assert await tracker.would_exceed() is True


@pytest.mark.asyncio
async def test_singleton_reset_helper_for_tests() -> None:
    a = reset_ws_tracker_for_tests(max_concurrent=5)
    assert a.max_concurrent == 5
    b = reset_ws_tracker_for_tests(max_concurrent=7)
    assert b.max_concurrent == 7
    assert a is not b
