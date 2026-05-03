"""
SQLAlchemy 2.0 async engine + session factory for AI Treasury Council.

Connects via DATABASE_URL env var (Railway Postgres plugin auto-injects).
Falls back to None when DATABASE_URL is unset - callers must handle (the
in-memory store remains as fallback during local dev without Postgres).

Migration runner: db.migrations.run_alembic_upgrade() called from main lifespan.
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

import structlog
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

log = structlog.get_logger()

_engine: AsyncEngine | None = None
_sessionmaker: async_sessionmaker[AsyncSession] | None = None


def _async_database_url() -> str | None:
    """Read DATABASE_URL and normalize to asyncpg driver."""
    raw = os.environ.get("DATABASE_URL")
    if not raw:
        return None
    if raw.startswith("postgres://"):
        raw = "postgresql+asyncpg://" + raw[len("postgres://"):]
    elif raw.startswith("postgresql://"):
        raw = "postgresql+asyncpg://" + raw[len("postgresql://"):]
    return raw


async def db_connect() -> bool:
    """
    Create async engine + sessionmaker. Returns True on success, False when
    DATABASE_URL is missing or initial connection fails.
    """
    global _engine, _sessionmaker
    if _engine is not None:
        return True
    url = _async_database_url()
    if not url:
        log.info("db_disabled_no_url")
        return False
    try:
        engine = create_async_engine(
            url,
            pool_size=5,
            max_overflow=5,
            pool_pre_ping=True,
            pool_recycle=300,
        )
        # Smoke test: open a connection so we surface errors at startup.
        async with engine.connect() as conn:
            await conn.exec_driver_sql("SELECT 1")
    except Exception as exc:
        log.warning(
            "db_connect_failed",
            error_type=type(exc).__name__,
            error=str(exc),
        )
        return False
    _engine = engine
    _sessionmaker = async_sessionmaker(engine, expire_on_commit=False)
    log.info("db_connected")
    return True


async def db_disconnect() -> None:
    global _engine, _sessionmaker
    if _engine is not None:
        try:
            await _engine.dispose()
        except Exception as exc:
            log.warning("db_disconnect_error", error=str(exc))
    _engine = None
    _sessionmaker = None


def is_connected() -> bool:
    return _engine is not None and _sessionmaker is not None


def get_engine() -> AsyncEngine | None:
    return _engine


@asynccontextmanager
async def session_scope() -> AsyncIterator[AsyncSession]:
    """
    Async context manager: yields a session, commits on success, rolls back on
    exception. Raises RuntimeError if Postgres is not connected (caller should
    branch on is_connected() before invoking).
    """
    if _sessionmaker is None:
        raise RuntimeError("Database not connected. Call db_connect() first.")
    session = _sessionmaker()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()


def _set_engine_for_tests(engine: AsyncEngine | None) -> None:
    """Test helper - inject in-memory SQLite engine."""
    global _engine, _sessionmaker
    _engine = engine
    _sessionmaker = (
        async_sessionmaker(engine, expire_on_commit=False) if engine is not None else None
    )
