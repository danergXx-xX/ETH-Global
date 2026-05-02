"""Tests for /ws/debate streaming + services.debate_streamer."""

from __future__ import annotations

from datetime import datetime, timezone
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from schemas import AgentClaim, AgentDecision, Source
from services import debate_streamer as ds


def _make_decision(persona: str, decision: str, *, confidence: float = 0.7) -> AgentDecision:
    return AgentDecision(
        persona=persona,  # type: ignore[arg-type]
        decision=decision,  # type: ignore[arg-type]
        confidence=confidence,
        reasoning=f"reasoning for {persona}",
        claims=[
            AgentClaim(
                text=f"{persona} claim text",
                confidence=confidence,
                sources=[
                    Source(
                        url=f"https://example.com/{persona}",
                        title=f"src-{persona}",
                        snippet="snippet",
                        weight=0.5,
                        source_type="defillama",
                    )
                ],
            )
        ],
        timestamp=datetime.now(timezone.utc),
        tokens_used=0,
        cost_usd=0.0,
    )


def _stub_debate_result() -> dict:
    return {
        "decisions": [
            _make_decision("bull", "FOR"),
            _make_decision("bear", "AGAINST"),
            _make_decision("risk", "ABSTAIN"),
            _make_decision("tech", "FOR"),
            _make_decision("sentiment", "FOR"),
        ],
        "consensus": "FOR",
        "vote_id": "vote-test-1",
    }


@pytest.mark.asyncio
class TestStreamDebate:
    async def test_streams_agent_statements_in_order(self) -> None:
        async def fake_run_debate(_text: str) -> dict:
            return _stub_debate_result()

        with patch.object(ds, "run_debate", fake_run_debate), patch.object(
            ds, "get_reputation_updater", return_value=None
        ):
            events = [
                ev
                async for ev in ds.stream_debate(
                    "prop-1", "Should we deposit 100 USDC into Aave?", step_delay_s=0
                )
            ]

        statements = [e for e in events if e["type"] == "agent_statement"]
        assert [e["agent"] for e in statements] == [
            "bull",
            "bear",
            "risk",
            "tech",
            "sentiment",
        ]
        for ev in statements:
            assert ev["proposal_id"] == "prop-1"
            assert ev["text"]
            assert isinstance(ev["sources"], list)
            assert len(ev["sources"]) >= 1

    async def test_emits_consensus_then_reputation_then_complete(self) -> None:
        async def fake_run_debate(_text: str) -> dict:
            return _stub_debate_result()

        with patch.object(ds, "run_debate", fake_run_debate), patch.object(
            ds, "get_reputation_updater", return_value=None
        ):
            events = [
                ev
                async for ev in ds.stream_debate(
                    "prop-2", "Test proposal text long enough", step_delay_s=0
                )
            ]

        types = [e["type"] for e in events]
        # 5 agent statements, then consensus, reputation_update, complete
        assert types[:5] == ["agent_statement"] * 5
        assert types[5] == "consensus"
        assert types[6] == "reputation_update"
        assert types[7] == "complete"

        consensus_event = events[5]
        assert consensus_event["verdict"] == "FOR"
        assert 0 <= consensus_event["confidence"] <= 100
        assert consensus_event["vote_id"] == "vote-test-1"

        rep_event = events[6]
        # 4 personas updated (risk abstained -> skipped)
        assert len(rep_event["updates"]) == 4
        for upd in rep_event["updates"]:
            # No reputation updater configured -> skipped_unauthorized
            assert upd["status"] == "skipped_unauthorized"


class TestWebSocketEndpoint:
    def test_websocket_handles_disconnect_gracefully(self) -> None:
        from main import app

        async def fake_run_debate(_text: str) -> dict:
            return _stub_debate_result()

        with patch.object(ds, "run_debate", fake_run_debate), patch.object(
            ds, "get_reputation_updater", return_value=None
        ):
            client = TestClient(app)
            # Connect, read first event, close early - server must not crash
            with client.websocket_connect(
                "/ws/debate?proposal_id=prop-3&text=Long+enough+proposal+text"
            ) as ws:
                first = ws.receive_json()
                assert first["type"] == "agent_statement"
                # Disconnect abruptly
                ws.close()

    def test_websocket_rejects_invalid_proposal_id(self) -> None:
        from main import app

        client = TestClient(app)
        with client.websocket_connect(
            "/ws/debate?proposal_id=bad%20id&text=Long+enough+text+here"
        ) as ws:
            msg = ws.receive_json()
            assert msg["type"] == "error"

    def test_websocket_rejects_short_text(self) -> None:
        from main import app

        client = TestClient(app)
        with client.websocket_connect("/ws/debate?proposal_id=ok&text=short") as ws:
            msg = ws.receive_json()
            assert msg["type"] == "error"
