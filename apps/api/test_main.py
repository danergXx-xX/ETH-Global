from __future__ import annotations

from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from schemas import AgentDecision


def _mock_decisions() -> list[AgentDecision]:
    """Build realistic mock AgentDecision list for testing."""
    now = datetime.now(timezone.utc)
    personas = [
        ("bull", "FOR", 0.7),
        ("bear", "AGAINST", 0.6),
        ("risk", "ABSTAIN", 0.5),
        ("tech", "FOR", 0.6),
        ("sentiment", "FOR", 0.55),
    ]
    return [
        AgentDecision(
            persona=p,  # type: ignore[arg-type]
            decision=d,  # type: ignore[arg-type]
            confidence=c,
            reasoning=f"Test mock reasoning from {p} agent",
            claims=[
                {
                    "text": f"Test claim from {p}",
                    "confidence": c,
                    "sources": [
                        {
                            "url": "https://example.com",
                            "title": f"Test source for {p}",
                            "snippet": "Test snippet",
                            "weight": 0.5,
                            "source_type": "rss",
                        }
                    ],
                }
            ],
            timestamp=now,
            tokens_used=100,
            cost_usd=0.01,
        )
        for p, d, c in personas
    ]


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "0.1.0"
    assert "timestamp" in data


@patch("main.run_debate", new_callable=AsyncMock)
def test_debate_happy_path(mock_debate: AsyncMock, client: TestClient) -> None:
    mock_debate.return_value = {
        "decisions": _mock_decisions(),
        "consensus": "FOR",
        "vote_id": "test-vote-uuid",
    }
    response = client.post(
        "/api/debate",
        json={"text": "Allocate 100k USDC to Aave for yield"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["consensus"] == "FOR"
    assert len(data["decisions"]) == 5
    assert data["vote_id"] == "test-vote-uuid"
    personas = {d["persona"] for d in data["decisions"]}
    assert personas == {"bull", "bear", "risk", "tech", "sentiment"}
    mock_debate.assert_called_once()


def test_debate_empty_text(client: TestClient) -> None:
    response = client.post("/api/debate", json={"text": ""})
    assert response.status_code == 422


def test_debate_text_too_short(client: TestClient) -> None:
    response = client.post("/api/debate", json={"text": "short"})
    assert response.status_code == 422


def test_debate_text_too_long(client: TestClient) -> None:
    response = client.post("/api/debate", json={"text": "x" * 2001})
    assert response.status_code == 422


@patch("main.run_debate", new_callable=AsyncMock)
def test_debate_null_audit_on_storage_error(mock_debate: AsyncMock, client: TestClient) -> None:
    mock_debate.return_value = {
        "decisions": _mock_decisions(),
        "consensus": "FOR",
        "vote_id": "test-id",
    }
    with patch("main.upload_with_fallback", side_effect=ConnectionError("storage down")):
        response = client.post(
            "/api/debate",
            json={"text": "Test proposal for storage failure"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["audit_trail_cid"] is None
    assert data["storage_provider"] is None
    assert data["consensus"] == "FOR"


def test_health_returns_request_id(client: TestClient) -> None:
    response = client.get("/health")
    assert "x-request-id" in response.headers
