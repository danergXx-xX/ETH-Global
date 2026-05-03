"""
SQLAlchemy 2.0 models for AI Treasury Council persistence.

7 tables:
  users, debates, agent_statements, votes, notifications, custom_agents,
  user_settings

Indices: covering predicates for hot reads (history, vote-by-debate,
notifications-by-recipient). Foreign keys protect cascades (a debate's
statements + votes go away when the debate is deleted).

JSON fields use SQLAlchemy JSON type (Postgres jsonb under asyncpg). For
SQLite test engines they fall back to TEXT - tests use small payloads.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
)


class Base(DeclarativeBase):
    pass


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    address: Mapped[str] = mapped_column(String(42), primary_key=True)
    role: Mapped[str | None] = mapped_column(String(64), nullable=True)
    onboarding_status: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class Debate(Base):
    __tablename__ = "debates"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    proposal_id: Mapped[str] = mapped_column(String(128), index=True)
    proposal_text: Mapped[str] = mapped_column(Text)
    consensus: Mapped[str] = mapped_column(String(16))  # FOR/AGAINST/ABSTAIN/SPLIT
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    cost_usd: Mapped[float] = mapped_column(Float, default=0.0)
    audit_trail_cid: Mapped[str | None] = mapped_column(String(128), nullable=True)
    storage_provider: Mapped[str | None] = mapped_column(String(16), nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    statements: Mapped[list["AgentStatement"]] = relationship(
        back_populates="debate",
        cascade="all, delete-orphan",
    )
    votes: Mapped[list["Vote"]] = relationship(
        back_populates="debate",
        cascade="all, delete-orphan",
    )


class AgentStatement(Base):
    __tablename__ = "agent_statements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    debate_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("debates.id", ondelete="CASCADE"), index=True
    )
    persona: Mapped[str] = mapped_column(String(32))
    decision: Mapped[str] = mapped_column(String(16))  # FOR/AGAINST/ABSTAIN
    text: Mapped[str] = mapped_column(Text)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    sources_json: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    debate: Mapped[Debate] = relationship(back_populates="statements")


class Vote(Base):
    __tablename__ = "votes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    debate_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("debates.id", ondelete="CASCADE"), index=True
    )
    voter_address: Mapped[str] = mapped_column(String(42), index=True)
    support: Mapped[bool] = mapped_column(Boolean)
    weight: Mapped[float] = mapped_column(Float, default=1.0)
    tx_hash: Mapped[str | None] = mapped_column(String(80), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    debate: Mapped[Debate] = relationship(back_populates="votes")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    recipient_address: Mapped[str] = mapped_column(String(42), index=True)
    category: Mapped[str] = mapped_column(String(32))
    title: Mapped[str] = mapped_column(String(200))
    summary: Mapped[str] = mapped_column(Text)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    read: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class CustomAgent(Base):
    __tablename__ = "custom_agents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    owner_address: Mapped[str] = mapped_column(String(42), index=True)
    persona_spec_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(32), default="testing")
    multisig_signatures: Mapped[list[str]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class UserSettings(Base):
    __tablename__ = "user_settings"

    user_address: Mapped[str] = mapped_column(
        String(42),
        ForeignKey("users.address", ondelete="CASCADE"),
        primary_key=True,
    )
    settings_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )
