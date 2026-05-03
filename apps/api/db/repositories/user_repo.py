"""User DAO."""

from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import User


class UserRepo:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, address: str) -> User | None:
        stmt = select(User).where(User.address == address)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def upsert(
        self,
        address: str,
        *,
        role: str | None = None,
        onboarding_status: dict[str, Any] | None = None,
    ) -> User:
        existing = await self.get(address)
        if existing is None:
            user = User(
                address=address,
                role=role,
                onboarding_status=onboarding_status or {},
            )
            self.session.add(user)
            await self.session.flush()
            return user
        if role is not None:
            existing.role = role
        if onboarding_status is not None:
            existing.onboarding_status = onboarding_status
        await self.session.flush()
        return existing
