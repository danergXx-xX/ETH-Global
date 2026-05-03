"""Tests for GET /api/treasury/portfolio (mock data, Wave 2)."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_portfolio_returns_200_with_full_shape(client: TestClient) -> None:
    r = client.get("/api/treasury/portfolio")
    assert r.status_code == 200
    body = r.json()
    assert set(body.keys()) >= {
        "total_usd",
        "tokens",
        "protocols",
        "pnl_7d",
        "recent_decisions",
    }


def test_portfolio_total_is_positive_and_sane(client: TestClient) -> None:
    body = client.get("/api/treasury/portfolio").json()
    assert body["total_usd"] > 0
    assert body["total_usd"] < 1_000_000_000_000  # well below 1T - sanity bound


def test_portfolio_tokens_have_required_fields(client: TestClient) -> None:
    body = client.get("/api/treasury/portfolio").json()
    assert len(body["tokens"]) >= 1
    for token in body["tokens"]:
        assert {"symbol", "balance", "usd_value", "allocation_pct"} <= set(token.keys())
        assert 0 <= token["allocation_pct"] <= 100


def test_portfolio_token_allocation_sums_close_to_100(client: TestClient) -> None:
    body = client.get("/api/treasury/portfolio").json()
    total = sum(t["allocation_pct"] for t in body["tokens"])
    # We allow rounding slack: demo numbers use 2 decimals.
    assert abs(total - 100.0) < 1.0


def test_portfolio_protocols_have_apy_and_risk_score(client: TestClient) -> None:
    body = client.get("/api/treasury/portfolio").json()
    assert len(body["protocols"]) >= 1
    for p in body["protocols"]:
        assert {"name", "balance_usd", "apy", "risk_score"} <= set(p.keys())
        assert 0 <= p["risk_score"] <= 100
        assert p["apy"] >= 0


def test_portfolio_recent_decisions_have_verdict(client: TestClient) -> None:
    body = client.get("/api/treasury/portfolio").json()
    assert len(body["recent_decisions"]) >= 1
    for d in body["recent_decisions"]:
        assert d["verdict"] in {"FOR", "AGAINST", "ABSTAIN", "SPLIT"}
        assert "executed_at" in d
