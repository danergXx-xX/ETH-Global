"""Custom agent DAO."""

from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import CustomAgent


class CustomAgentRepo:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def upsert(
        self,
        *,
        agent_id: str,
        owner_address: str,
        persona_spec: dict[str, Any],
        status: str = "testing",
        multisig_signatures: list[str] | None = None,
    ) -> CustomAgent:
        existing = await self.get(agent_id)
        if existing is None:
            agent = CustomAgent(
                id=agent_id,
                owner_address=owner_address,
                persona_spec_json=persona_spec,
                status=status,
                multisig_signatures=multisig_signatures or [],
            )
            self.session.add(agent)
            await self.session.flush()
            return agent
        existing.persona_spec_json = persona_spec
        existing.status = status
        if multisig_signatures is not None:
            existing.multisig_signatures = multisig_signatures
        await self.session.flush()
        return existing

    async def get(self, agent_id: str) -> CustomAgent | None:
        stmt = select(CustomAgent).where(CustomAgent.id == agent_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def list_by_owner(self, owner_address: str) -> list[CustomAgent]:
        stmt = select(CustomAgent).where(CustomAgent.owner_address == owner_address)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
