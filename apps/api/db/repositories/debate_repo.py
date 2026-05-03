"""Debate + AgentStatement DAO."""

from __future__ import annotations

from typing import Any, Iterable

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from db.models import AgentStatement, Debate


class DebateRepo:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(
        self,
        *,
        debate_id: str,
        proposal_id: str,
        proposal_text: str,
        consensus: str,
        confidence: float = 0.0,
        cost_usd: float = 0.0,
        audit_trail_cid: str | None = None,
        storage_provider: str | None = None,
    ) -> Debate:
        debate = Debate(
            id=debate_id,
            proposal_id=proposal_id,
            proposal_text=proposal_text,
            consensus=consensus,
            confidence=confidence,
            cost_usd=cost_usd,
            audit_trail_cid=audit_trail_cid,
            storage_provider=storage_provider,
        )
        self.session.add(debate)
        await self.session.flush()
        return debate

    async def add_statements(
        self,
        debate_id: str,
        statements: Iterable[dict[str, Any]],
    ) -> list[AgentStatement]:
        rows = [
            AgentStatement(
                debate_id=debate_id,
                persona=s["persona"],
                decision=s["decision"],
                text=s["text"],
                confidence=float(s.get("confidence", 0.0)),
                sources_json=list(s.get("sources_json", []) or []),
            )
            for s in statements
        ]
        self.session.add_all(rows)
        await self.session.flush()
        return rows

    async def get(self, debate_id: str) -> Debate | None:
        stmt = (
            select(Debate)
            .where(Debate.id == debate_id)
            .options(selectinload(Debate.statements), selectinload(Debate.votes))
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def list_recent(self, limit: int = 20) -> list[Debate]:
        stmt = (
            select(Debate)
            .order_by(desc(Debate.started_at))
            .limit(limit)
            .options(selectinload(Debate.statements))
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def list_recent_for_persona(
        self,
        persona: str,
        limit: int = 3,
    ) -> list[tuple[Debate, AgentStatement]]:
        """
        Return last N (debate, statement) pairs where this persona participated.

        Sesja 50.5: feeds historical context into persona system prompts so each
        agent maintains consistency across debates ("Crow always conservative").

        Joins on debate_id and orders by debate.started_at desc. We use the
        debate timestamp rather than statement.created_at - within one debate
        all statements share roughly the same timestamp, but debate time is
        the canonical "when did this council session happen" field.
        """
        stmt = (
            select(Debate, AgentStatement)
            .join(AgentStatement, AgentStatement.debate_id == Debate.id)
            .where(AgentStatement.persona == persona)
            .order_by(desc(Debate.started_at))
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return [(d, s) for d, s in result.all()]

    async def count(self) -> int:
        from sqlalchemy import func

        stmt = select(func.count(Debate.id))
        result = await self.session.execute(stmt)
        return int(result.scalar_one())
