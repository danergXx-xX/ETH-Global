"""User settings DAO."""

from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import UserSettings


class SettingsRepo:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, user_address: str) -> UserSettings | None:
        stmt = select(UserSettings).where(UserSettings.user_address == user_address)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def upsert(self, user_address: str, settings: dict[str, Any]) -> UserSettings:
        existing = await self.get(user_address)
        if existing is None:
            row = UserSettings(user_address=user_address, settings_json=settings)
            self.session.add(row)
            await self.session.flush()
            return row
        existing.settings_json = settings
        await self.session.flush()
        return existing
