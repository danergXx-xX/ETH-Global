"""Vote DAO."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import Vote


class VoteRepo:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(
        self,
        *,
        debate_id: str,
        voter_address: str,
        support: bool,
        weight: float = 1.0,
        tx_hash: str | None = None,
    ) -> Vote:
        vote = Vote(
            debate_id=debate_id,
            voter_address=voter_address,
            support=support,
            weight=weight,
            tx_hash=tx_hash,
        )
        self.session.add(vote)
        await self.session.flush()
        return vote

    async def list_for_debate(self, debate_id: str) -> list[Vote]:
        stmt = select(Vote).where(Vote.debate_id == debate_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def list_by_voter(self, voter_address: str, limit: int = 50) -> list[Vote]:
        stmt = (
            select(Vote)
            .where(Vote.voter_address == voter_address)
            .order_by(Vote.created_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
