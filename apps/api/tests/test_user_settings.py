"""Tests for /api/user/settings (in-memory storage)."""

from __future__ import annotations

import asyncio

import pytest
from fastapi.testclient import TestClient

from services.in_memory_store import clear_all_state

ADDR = "0xAbCDef0123456789aBCdEF0123456789abCDef01"


@pytest.fixture(autouse=True)
def _reset_state() -> None:
    asyncio.run(clear_all_state())


def test_default_settings_returned_for_unknown_address(client: TestClient) -> None:
    r = client.get(f"/api/user/settings?address={ADDR}")
    assert r.status_code == 200
    body = r.json()
    assert body["theme"] == "dark"
    assert body["preferred_language"] == "en"
    assert body["notifications_enabled"] is True
    assert body["trust_gate_threshold"] == 70


def test_post_then_get_roundtrip(client: TestClient) -> None:
    payload = {
        "address": ADDR,
        "notifications_enabled": False,
        "theme": "conclave",
        "preferred_language": "pl",
        "trust_gate_threshold": 85,
        "agent_weights": {"bull": 1.5, "bear": 0.8},
        "council_rules_overrides": None,
    }
    saved = client.post("/api/user/settings", json=payload).json()
    assert saved["theme"] == "conclave"
    fetched = client.get(f"/api/user/settings?address={ADDR}").json()
    assert fetched["theme"] == "conclave"
    assert fetched["agent_weights"]["bull"] == 1.5


def test_invalid_theme_rejected(client: TestClient) -> None:
    payload = {
        "address": ADDR,
        "notifications_enabled": True,
        "theme": "rainbow",
        "preferred_language": "en",
        "trust_gate_threshold": 70,
        "agent_weights": {},
        "council_rules_overrides": None,
    }
    r = client.post("/api/user/settings", json=payload)
    assert r.status_code == 422


def test_trust_gate_below_50_rejected(client: TestClient) -> None:
    payload = {
        "address": ADDR,
        "notifications_enabled": True,
        "theme": "dark",
        "preferred_language": "en",
        "trust_gate_threshold": 30,
        "agent_weights": {},
        "council_rules_overrides": None,
    }
    r = client.post("/api/user/settings", json=payload)
    assert r.status_code == 422


def test_invalid_address_rejected(client: TestClient) -> None:
    r = client.get("/api/user/settings?address=not-an-address-1234")
    assert r.status_code == 422


def test_lowercase_and_checksum_addresses_share_state(client: TestClient) -> None:
    """Different case representations of the same address must hit one bucket."""
    payload = {
        "address": ADDR.lower(),
        "notifications_enabled": False,
        "theme": "light",
        "preferred_language": "en",
        "trust_gate_threshold": 70,
        "agent_weights": {},
        "council_rules_overrides": None,
    }
    client.post("/api/user/settings", json=payload)
    fetched_lower = client.get(f"/api/user/settings?address={ADDR.lower()}").json()
    fetched_checksum = client.get(f"/api/user/settings?address={ADDR}").json()
    assert fetched_lower["theme"] == fetched_checksum["theme"] == "light"
