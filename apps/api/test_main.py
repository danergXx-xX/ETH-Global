from __future__ import annotations

from fastapi.testclient import TestClient


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "0.1.0"
    assert "timestamp" in data


def test_debate_happy_path(client: TestClient) -> None:
    response = client.post(
        "/api/debate",
        json={"text": "Allocate 100k USDC to Aave for yield"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["consensus"] == "FOR"
    assert len(data["decisions"]) == 5
    assert data["vote_id"] == "mock-vote-uuid"
    personas = {d["persona"] for d in data["decisions"]}
    assert personas == {"bull", "bear", "risk", "tech", "sentiment"}


def test_debate_empty_text(client: TestClient) -> None:
    response = client.post("/api/debate", json={"text": ""})
    assert response.status_code == 422


def test_health_returns_request_id(client: TestClient) -> None:
    response = client.get("/health")
    assert "x-request-id" in response.headers
