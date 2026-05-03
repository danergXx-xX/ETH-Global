"""
In-memory state for foundation endpoints.

Replaces Postgres until Sesja 49c. Key design choices:
- Thread-safe via asyncio.Lock (FastAPI runs handlers concurrently in one loop).
- All keys (addresses) are normalized to checksum form to avoid case-sensitivity bugs.
- Reset hooks exposed for tests (clear_all_state) so each test starts fresh.

NOT for production. Postgres swap point is the public API of this module:
the routers should not import dicts directly, only the helper functions.
"""

from __future__ import annotations

import asyncio
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

from eth_utils import to_checksum_address

from schemas import (
    CustomAgent,
    Notification,
    OnboardingStatus,
    UserSettings,
    ONBOARDING_STEPS,
)


_lock = asyncio.Lock()
_settings: dict[str, UserSettings] = {}
_onboarding: dict[str, set[str]] = {}
_custom_agents: dict[str, CustomAgent] = {}
_notifications: dict[str, list[Notification]] = {}


def _normalize(address: str) -> str:
    """Checksum the address so 'mixed case' and 'lowercase' map to the same key."""
    return to_checksum_address(address)


# ============================================================
# USER SETTINGS
# ============================================================


async def get_user_settings(address: str) -> UserSettings:
    key = _normalize(address)
    async with _lock:
        existing = _settings.get(key)
    if existing is None:
        return UserSettings()
    return existing.model_copy(deep=True)


async def put_user_settings(address: str, settings: UserSettings) -> UserSettings:
    key = _normalize(address)
    snapshot = settings.model_copy(deep=True)
    async with _lock:
        _settings[key] = snapshot
    return snapshot.model_copy(deep=True)


# ============================================================
# ONBOARDING
# ============================================================


def _compute_status(completed: set[str]) -> OnboardingStatus:
    completed_ordered = [s for s in ONBOARDING_STEPS if s in completed]
    next_step = next((s for s in ONBOARDING_STEPS if s not in completed), "complete")
    return OnboardingStatus(
        completed_steps=completed_ordered,
        current_step=next_step,
        is_complete=next_step == "complete",
    )


async def get_onboarding(address: str) -> OnboardingStatus:
    key = _normalize(address)
    async with _lock:
        completed = set(_onboarding.get(key, set()))
    return _compute_status(completed)


async def mark_onboarding_step(address: str, step_id: str) -> OnboardingStatus:
    key = _normalize(address)
    async with _lock:
        bucket = _onboarding.setdefault(key, set())
        bucket.add(step_id)
        completed = set(bucket)
    return _compute_status(completed)


# ============================================================
# CUSTOM AGENTS
# ============================================================


async def save_custom_agent(agent: CustomAgent) -> None:
    async with _lock:
        _custom_agents[agent.agent_id] = agent.model_copy(deep=True)


async def get_custom_agent(agent_id: str) -> CustomAgent | None:
    async with _lock:
        existing = _custom_agents.get(agent_id)
    return existing.model_copy(deep=True) if existing else None


# ============================================================
# NOTIFICATIONS
# ============================================================


async def push_notification(address: str, notification: Notification) -> None:
    key = _normalize(address)
    snapshot = notification.model_copy(deep=True)
    async with _lock:
        _notifications.setdefault(key, []).append(snapshot)


async def list_notifications(
    address: str,
    unread_only: bool = False,
) -> list[Notification]:
    key = _normalize(address)
    async with _lock:
        items = list(_notifications.get(key, []))
    if unread_only:
        items = [n for n in items if not n.read]
    return [n.model_copy(deep=True) for n in items]


async def mark_notifications_read(address: str, ids: list[str]) -> int:
    """Return count of notifications actually flipped from unread to read."""
    key = _normalize(address)
    flipped = 0
    target = set(ids)
    async with _lock:
        for n in _notifications.get(key, []):
            if n.id in target and not n.read:
                n.read = True
                flipped += 1
    return flipped


# ============================================================
# TEST HELPERS
# ============================================================


async def clear_all_state() -> None:
    """Reset every store. Call from test fixture, NOT from production code."""
    async with _lock:
        _settings.clear()
        _onboarding.clear()
        _custom_agents.clear()
        _notifications.clear()


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def snapshot_for_debug() -> dict[str, Any]:
    """Read-only diagnostic dump (no lock - eventual consistency is fine)."""
    return {
        "settings": deepcopy(_settings),
        "onboarding": {k: list(v) for k, v in _onboarding.items()},
        "custom_agents": deepcopy(_custom_agents),
        "notifications": deepcopy(_notifications),
    }
