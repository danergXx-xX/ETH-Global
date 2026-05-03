"""Tests for services.historical_context (Sesja 50.5)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import AsyncIterator
from unittest.mock import AsyncMock, patch

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import db as db_pkg
from db.models import Base
from db.repositories import DebateRepo
from services import historical_context as hc


@pytest_asyncio.fixture
async def session() -> AsyncIterator[AsyncSession]:
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    sm = async_sessionmaker(engine, expire_on_commit=False)
    db_pkg._set_engine_for_tests(engine)
    sess = sm()
    try:
        yield sess
    finally:
        await sess.close()
        db_pkg._set_engine_for_tests(None)
        await engine.dispose()


@pytest.fixture(autouse=True)
def _disable_cache(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(hc.cache, "is_connected", lambda: False)


async def _seed_debate(
    session: AsyncSession,
    debate_id: str,
    proposal_text: str,
    consensus: str,
    persona_decisions: list[tuple[str, str, float, str]],
) -> None:
    """Helper - insert one debate + statements."""
    repo = DebateRepo(session)
    await repo.create(
        debate_id=debate_id,
        proposal_id=f"prop-{debate_id}",
        proposal_text=proposal_text,
        consensus=consensus,
    )
    await repo.add_statements(
        debate_id,
        [
            {"persona": p, "decision": d, "text": t, "confidence": c}
            for p, d, c, t in persona_decisions
        ],
    )
    await session.commit()


@pytest.mark.asyncio
async def test_happy_path_three_debates_returned_newest_first(
    session: AsyncSession,
) -> None:
    await _seed_debate(
        session, "d-old", "Buy 100 ETH", "FOR",
        [("bull", "FOR", 0.87, "Strong tailwinds")],
    )
    await _seed_debate(
        session, "d-mid", "Add Aave to whitelist", "REJECTED",
        [("bull", "AGAINST", 0.65, "Smart contract risk")],
    )
    await _seed_debate(
        session, "d-new", "Bridge to Base", "FOR",
        [("bull", "FOR", 0.9, "L2 adoption growing")],
    )

    entries = await hc.get_agent_history("bull", limit=3)

    assert len(entries) == 3
    assert entries[0].proposal_summary.startswith("Bridge to Base")
    assert entries[0].agent_decision == "FOR"
    assert entries[0].agent_confidence == 0.9
    assert entries[-1].proposal_summary.startswith("Buy 100 ETH")


@pytest.mark.asyncio
async def test_no_history_returns_empty_list(session: AsyncSession) -> None:
    entries = await hc.get_agent_history("bull", limit=3)
    assert entries == []


@pytest.mark.asyncio
async def test_more_than_three_debates_trimmed_to_limit(
    session: AsyncSession,
) -> None:
    for i in range(5):
        await _seed_debate(
            session, f"d-{i}", f"Proposal {i}", "FOR",
            [("bear", "AGAINST", 0.7, f"Reason {i}")],
        )

    entries = await hc.get_agent_history("bear", limit=3)
    assert len(entries) == 3
    # Newest seeded last - should appear first
    assert entries[0].proposal_summary.startswith("Proposal 4")


@pytest.mark.asyncio
async def test_cache_hit_skips_db_query() -> None:
    """When Redis hits, DB is never touched."""
    cached_payload = [
        {
            "proposal_id": "p1",
            "proposal_summary": "Cached prop",
            "agent_decision": "FOR",
            "agent_confidence": 0.8,
            "agent_statement": "From cache",
            "council_verdict": "FOR",
            "completed_at": None,
        }
    ]
    with patch.object(hc.cache, "is_connected", return_value=True):
        with patch.object(hc.cache, "cache_get", AsyncMock(return_value=cached_payload)):
            with patch.object(hc, "db") as mock_db:
                entries = await hc.get_agent_history("risk", limit=3)
                # is_connected on the patched module should never be reached
                assert mock_db.is_connected.called is False or mock_db.is_connected.call_count == 0

    assert len(entries) == 1
    assert entries[0].proposal_summary == "Cached prop"


@pytest.mark.asyncio
async def test_db_unavailable_returns_empty(monkeypatch: pytest.MonkeyPatch) -> None:
    """If db.is_connected() False, return [] without raising."""
    monkeypatch.setattr(hc.db, "is_connected", lambda: False)
    entries = await hc.get_agent_history("tech", limit=3)
    assert entries == []


def test_format_history_for_prompt_renders_block() -> None:
    entries = [
        hc.HistoricalEntry(
            proposal_id="p1",
            proposal_summary="Buy 100 ETH",
            agent_decision="FOR",
            agent_confidence=0.87,
            agent_statement="Strong tailwinds, ETH adoption growing",
            council_verdict="FOR",
            completed_at="2026-04-01T12:00:00+00:00",
        ),
    ]
    block = hc.format_history_for_prompt(entries)
    assert "PAST DECISIONS CONTEXT" in block
    assert "Buy 100 ETH" in block
    assert "FOR" in block
    assert "87%" in block
    assert "Maintain consistency" in block


def test_format_history_for_prompt_empty_returns_empty_string() -> None:
    assert hc.format_history_for_prompt([]) == ""


def test_truncate_long_proposal() -> None:
    long_text = "A" * 500
    entries = [
        hc.HistoricalEntry(
            proposal_id="p1",
            proposal_summary=hc._truncate(long_text, hc.MAX_PROPOSAL_SUMMARY_CHARS),
            agent_decision="FOR",
            agent_confidence=0.5,
            agent_statement="x",
            council_verdict="FOR",
            completed_at=None,
        )
    ]
    assert len(entries[0].proposal_summary) <= hc.MAX_PROPOSAL_SUMMARY_CHARS


@pytest.mark.asyncio
async def test_persona_filter_excludes_others(session: AsyncSession) -> None:
    """Bear's history must not leak Bull's statements."""
    await _seed_debate(
        session, "d-1", "Mixed debate", "FOR",
        [
            ("bull", "FOR", 0.9, "Bull view"),
            ("bear", "AGAINST", 0.6, "Bear view"),
        ],
    )

    bear_entries = await hc.get_agent_history("bear", limit=5)
    assert len(bear_entries) == 1
    assert bear_entries[0].agent_statement == "Bear view"
    assert bear_entries[0].agent_decision == "AGAINST"


_ = datetime.now(timezone.utc)  # suppress unused-import lint
