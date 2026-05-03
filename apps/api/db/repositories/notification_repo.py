"""Notification DAO."""

from __future__ import annotations

from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import Notification


class NotificationRepo:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def push(
        self,
        *,
        notif_id: str,
        recipient_address: str,
        category: str,
        title: str,
        summary: str,
        metadata: dict[str, Any] | None = None,
    ) -> Notification:
        notif = Notification(
            id=notif_id,
            recipient_address=recipient_address,
            category=category,
            title=title,
            summary=summary,
            metadata_json=metadata or {},
        )
        self.session.add(notif)
        await self.session.flush()
        return notif

    async def list_for(
        self,
        recipient_address: str,
        unread_only: bool = False,
        limit: int = 100,
    ) -> list[Notification]:
        stmt = select(Notification).where(Notification.recipient_address == recipient_address)
        if unread_only:
            stmt = stmt.where(Notification.read.is_(False))
        stmt = stmt.order_by(Notification.created_at.desc()).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def mark_read(self, recipient_address: str, ids: list[str]) -> int:
        if not ids:
            return 0
        stmt = (
            update(Notification)
            .where(
                Notification.recipient_address == recipient_address,
                Notification.id.in_(ids),
                Notification.read.is_(False),
            )
            .values(read=True)
        )
        result = await self.session.execute(stmt)
        return int(result.rowcount or 0)
