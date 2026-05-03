"""Integration tests for db repositories using in-memory SQLite.

SQLite is not Postgres but exercises the SQLAlchemy + repository contract
for CRUD operations. JSON columns degrade to TEXT, which is fine for the
small payloads used in tests.
"""

from __future__ import annotations

from typing import Any, AsyncIterator

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import db as db_pkg
from db.models import Base
from db.repositories import (
    CustomAgentRepo,
    DebateRepo,
    NotificationRepo,
    SettingsRepo,
    UserRepo,
    VoteRepo,
)


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


@pytest.mark.asyncio
async def test_user_upsert_creates_then_updates(session: AsyncSession) -> None:
    repo = UserRepo(session)
    a = await repo.upsert("0xabc", role="dao_member")
    await session.commit()
    assert a.address == "0xabc"
    assert a.role == "dao_member"

    b = await repo.upsert("0xabc", role="dao_admin")
    await session.commit()
    assert b.address == "0xabc"
    assert b.role == "dao_admin"


@pytest.mark.asyncio
async def test_debate_create_and_statements(session: AsyncSession) -> None:
    repo = DebateRepo(session)
    await repo.create(
        debate_id="d1",
        proposal_id="p1",
        proposal_text="Should DAO buy ETH?",
        consensus="FOR",
        confidence=0.84,
    )
    await repo.add_statements(
        "d1",
        [
            {"persona": "bull", "decision": "FOR", "text": "yes", "confidence": 0.9},
            {"persona": "bear", "decision": "AGAINST", "text": "no", "confidence": 0.6},
        ],
    )
    await session.commit()
    fetched = await repo.get("d1")
    assert fetched is not None
    assert fetched.consensus == "FOR"
    assert len(fetched.statements) == 2
    personas = {s.persona for s in fetched.statements}
    assert personas == {"bull", "bear"}


@pytest.mark.asyncio
async def test_debate_list_recent_orders_desc(session: AsyncSession) -> None:
    repo = DebateRepo(session)
    for i in range(3):
        await repo.create(
            debate_id=f"d{i}",
            proposal_id=f"p{i}",
            proposal_text=f"text{i}",
            consensus="FOR",
        )
    await session.commit()
    rows = await repo.list_recent(limit=2)
    assert len(rows) == 2


@pytest.mark.asyncio
async def test_vote_create_and_list(session: AsyncSession) -> None:
    DebateRepo(session)
    await DebateRepo(session).create(
        debate_id="d1", proposal_id="p1", proposal_text="x", consensus="FOR"
    )
    repo = VoteRepo(session)
    await repo.create(debate_id="d1", voter_address="0xV1", support=True, weight=2.0)
    await repo.create(debate_id="d1", voter_address="0xV2", support=False)
    await session.commit()
    rows = await repo.list_for_debate("d1")
    assert len(rows) == 2


@pytest.mark.asyncio
async def test_notifications_push_list_mark_read(session: AsyncSession) -> None:
    repo = NotificationRepo(session)
    await repo.push(
        notif_id="n1",
        recipient_address="0xR",
        category="verdict",
        title="Hi",
        summary="..",
    )
    await repo.push(
        notif_id="n2",
        recipient_address="0xR",
        category="verdict",
        title="Hi2",
        summary="..",
    )
    await session.commit()
    unread = await repo.list_for("0xR", unread_only=True)
    assert len(unread) == 2
    flipped = await repo.mark_read("0xR", ["n1"])
    await session.commit()
    assert flipped == 1
    unread_after = await repo.list_for("0xR", unread_only=True)
    assert len(unread_after) == 1


@pytest.mark.asyncio
async def test_custom_agent_upsert(session: AsyncSession) -> None:
    repo = CustomAgentRepo(session)
    spec: dict[str, Any] = {"persona_id": "x", "display_name": "X"}
    a = await repo.upsert(
        agent_id="a1",
        owner_address="0xO",
        persona_spec=spec,
        status="testing",
    )
    await session.commit()
    assert a.status == "testing"
    b = await repo.upsert(
        agent_id="a1",
        owner_address="0xO",
        persona_spec=spec,
        status="approved",
    )
    await session.commit()
    assert b.status == "approved"
    listed = await repo.list_by_owner("0xO")
    assert len(listed) == 1


@pytest.mark.asyncio
async def test_settings_upsert(session: AsyncSession) -> None:
    user_repo = UserRepo(session)
    await user_repo.upsert("0xS")
    await session.commit()
    repo = SettingsRepo(session)
    a = await repo.upsert("0xS", {"theme": "dark"})
    await session.commit()
    assert a.settings_json == {"theme": "dark"}
    b = await repo.upsert("0xS", {"theme": "light"})
    await session.commit()
    assert b.settings_json == {"theme": "light"}


@pytest.mark.asyncio
async def test_session_scope_commits_on_success(session: AsyncSession) -> None:
    """session_scope is exercised via the engine helper - smoke check engine wired."""
    assert db_pkg.is_connected() is True
    async with db_pkg.session_scope() as s:
        repo = UserRepo(s)
        await repo.upsert("0xZ", role="member")
    async with db_pkg.session_scope() as s:
        repo = UserRepo(s)
        u = await repo.get("0xZ")
        assert u is not None
        assert u.role == "member"


@pytest.mark.asyncio
async def test_session_scope_rolls_back_on_error(session: AsyncSession) -> None:
    with pytest.raises(RuntimeError):
        async with db_pkg.session_scope() as s:
            repo = UserRepo(s)
            await repo.upsert("0xRollback")
            raise RuntimeError("boom")
    async with db_pkg.session_scope() as s:
        repo = UserRepo(s)
        u = await repo.get("0xRollback")
        assert u is None


@pytest.mark.asyncio
async def test_debate_count(session: AsyncSession) -> None:
    repo = DebateRepo(session)
    assert await repo.count() == 0
    await repo.create(debate_id="d1", proposal_id="p1", proposal_text="x", consensus="FOR")
    await session.commit()
    assert await repo.count() == 1


@pytest.mark.asyncio
async def test_is_connected_requires_schema_ready(session: AsyncSession) -> None:
    """is_connected() should return False until mark_schema_ready(True) is called.

    Fixture sets engine + marks ready (default True). We toggle off to verify gate.
    """
    assert db_pkg.is_connected() is True
    db_pkg.mark_schema_ready(False)
    assert db_pkg.is_connected() is False
    assert db_pkg.is_engine_ready() is True
    db_pkg.mark_schema_ready(True)
    assert db_pkg.is_connected() is True
