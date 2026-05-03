"""Tests for GET /api/protocols (registry with filters)."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_list_returns_at_least_15_protocols(client: TestClient) -> None:
    r = client.get("/api/protocols")
    assert r.status_code == 200
    body = r.json()
    assert isinstance(body, list)
    assert len(body) >= 15


def test_each_protocol_has_required_fields(client: TestClient) -> None:
    body = client.get("/api/protocols").json()
    required = {
        "id",
        "name",
        "category",
        "chain",
        "tvl_usd",
        "status",
        "risk_flags",
        "audit_history",
    }
    for p in body:
        assert required <= set(p.keys()), f"missing keys in {p['id']}"
        assert p["status"] in {"approved", "under_review", "banned", "light"}


def test_filter_by_category_lending(client: TestClient) -> None:
    body = client.get("/api/protocols?category=lending").json()
    assert all(p["category"] == "lending" for p in body)
    assert len(body) >= 2


def test_filter_by_status_approved(client: TestClient) -> None:
    body = client.get("/api/protocols?status=approved").json()
    assert all(p["status"] == "approved" for p in body)
    assert len(body) >= 5


def test_combined_filters_lending_and_approved(client: TestClient) -> None:
    body = client.get("/api/protocols?category=lending&status=approved").json()
    assert all(p["category"] == "lending" and p["status"] == "approved" for p in body)


def test_invalid_category_rejected(client: TestClient) -> None:
    r = client.get("/api/protocols?category=ponzi")
    assert r.status_code == 422


def test_protocol_ids_are_unique(client: TestClient) -> None:
    body = client.get("/api/protocols").json()
    ids = [p["id"] for p in body]
    assert len(ids) == len(set(ids))


def test_banned_protocol_present_for_demo(client: TestClient) -> None:
    """Sędziowie should see at least one 'banned' entry to show the council enforces rules."""
    body = client.get("/api/protocols?status=banned").json()
    assert len(body) >= 1
