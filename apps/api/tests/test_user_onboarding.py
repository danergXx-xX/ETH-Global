"""Tests for /api/user/onboarding."""

from __future__ import annotations

import asyncio

import pytest
from fastapi.testclient import TestClient

from services.in_memory_store import clear_all_state

ADDR = "0xCAfe000000000000000000000000000000000001"


@pytest.fixture(autouse=True)
def _reset_state() -> None:
    asyncio.get_event_loop().run_until_complete(clear_all_state())


def test_initial_state_is_first_step(client: TestClient) -> None:
    body = client.get(f"/api/user/onboarding?address={ADDR}").json()
    assert body["completed_steps"] == []
    assert body["current_step"] == "wallet_connected"
    assert body["is_complete"] is False


def test_progress_advances_through_steps(client: TestClient) -> None:
    steps = [
        "wallet_connected",
        "dao_verified",
        "rules_read",
        "role_selected",
    ]
    for s in steps:
        r = client.post(
            "/api/user/onboarding",
            json={"address": ADDR, "step_id": s},
        )
        assert r.status_code == 200, r.text
    body = client.get(f"/api/user/onboarding?address={ADDR}").json()
    assert body["current_step"] == "first_proposal_submitted"
    assert body["is_complete"] is False


def test_complete_flag_after_all_steps(client: TestClient) -> None:
    for s in [
        "wallet_connected",
        "dao_verified",
        "rules_read",
        "role_selected",
        "first_proposal_submitted",
    ]:
        client.post("/api/user/onboarding", json={"address": ADDR, "step_id": s})
    body = client.get(f"/api/user/onboarding?address={ADDR}").json()
    assert body["is_complete"] is True
    assert body["current_step"] == "complete"


def test_unknown_step_rejected(client: TestClient) -> None:
    r = client.post(
        "/api/user/onboarding",
        json={"address": ADDR, "step_id": "skip_to_admin"},
    )
    assert r.status_code == 422


def test_idempotent_step_marking(client: TestClient) -> None:
    """Posting the same step twice should not advance current_step further."""
    client.post(
        "/api/user/onboarding",
        json={"address": ADDR, "step_id": "wallet_connected"},
    )
    client.post(
        "/api/user/onboarding",
        json={"address": ADDR, "step_id": "wallet_connected"},
    )
    body = client.get(f"/api/user/onboarding?address={ADDR}").json()
    assert body["completed_steps"].count("wallet_connected") == 1
    assert body["current_step"] == "dao_verified"


def test_invalid_address_rejected(client: TestClient) -> None:
    r = client.post(
        "/api/user/onboarding",
        json={"address": "0xnope", "step_id": "wallet_connected"},
    )
    assert r.status_code == 422
