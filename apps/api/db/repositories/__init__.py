"""DAO-pattern repositories per model.

Each repo:
- accepts an AsyncSession in the constructor
- exposes typed CRUD primitives (get, list, upsert, mark_read etc.)
- never commits/rollbacks itself - that's the session_scope() responsibility.

Use via:
    async with session_scope() as session:
        repo = DebateRepo(session)
        await repo.create(...)
"""

from db.repositories.debate_repo import DebateRepo
from db.repositories.user_repo import UserRepo
from db.repositories.vote_repo import VoteRepo
from db.repositories.notification_repo import NotificationRepo
from db.repositories.custom_agent_repo import CustomAgentRepo
from db.repositories.settings_repo import SettingsRepo

__all__ = [
    "DebateRepo",
    "UserRepo",
    "VoteRepo",
    "NotificationRepo",
    "CustomAgentRepo",
    "SettingsRepo",
]
