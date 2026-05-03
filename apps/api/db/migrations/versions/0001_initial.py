"""Initial schema: 7 tables (users, debates, agent_statements, votes, notifications, custom_agents, user_settings)

Revision ID: 0001_initial
Revises:
Create Date: 2026-05-03

"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("address", sa.String(length=42), primary_key=True),
        sa.Column("role", sa.String(length=64), nullable=True),
        sa.Column("onboarding_status", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )

    op.create_table(
        "debates",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("proposal_id", sa.String(length=128), nullable=False),
        sa.Column("proposal_text", sa.Text(), nullable=False),
        sa.Column("consensus", sa.String(length=16), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="0"),
        sa.Column("cost_usd", sa.Float(), nullable=False, server_default="0"),
        sa.Column("audit_trail_cid", sa.String(length=128), nullable=True),
        sa.Column("storage_provider", sa.String(length=16), nullable=True),
        sa.Column(
            "started_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_debates_proposal_id", "debates", ["proposal_id"])

    op.create_table(
        "agent_statements",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "debate_id",
            sa.String(length=64),
            sa.ForeignKey("debates.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("persona", sa.String(length=32), nullable=False),
        sa.Column("decision", sa.String(length=16), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="0"),
        sa.Column("sources_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_agent_statements_debate_id", "agent_statements", ["debate_id"])

    op.create_table(
        "votes",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "debate_id",
            sa.String(length=64),
            sa.ForeignKey("debates.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("voter_address", sa.String(length=42), nullable=False),
        sa.Column("support", sa.Boolean(), nullable=False),
        sa.Column("weight", sa.Float(), nullable=False, server_default="1"),
        sa.Column("tx_hash", sa.String(length=80), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_votes_debate_id", "votes", ["debate_id"])
    op.create_index("ix_votes_voter_address", "votes", ["voter_address"])

    op.create_table(
        "notifications",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("recipient_address", sa.String(length=42), nullable=False),
        sa.Column("category", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("metadata_json", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("read", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_notifications_recipient_address", "notifications", ["recipient_address"])
    op.create_index("ix_notifications_read", "notifications", ["read"])

    op.create_table(
        "custom_agents",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("owner_address", sa.String(length=42), nullable=False),
        sa.Column("persona_spec_json", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="testing"),
        sa.Column("multisig_signatures", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_custom_agents_owner_address", "custom_agents", ["owner_address"])

    op.create_table(
        "user_settings",
        sa.Column(
            "user_address",
            sa.String(length=42),
            sa.ForeignKey("users.address", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("settings_json", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )


def downgrade() -> None:
    op.drop_table("user_settings")
    op.drop_index("ix_custom_agents_owner_address", table_name="custom_agents")
    op.drop_table("custom_agents")
    op.drop_index("ix_notifications_read", table_name="notifications")
    op.drop_index("ix_notifications_recipient_address", table_name="notifications")
    op.drop_table("notifications")
    op.drop_index("ix_votes_voter_address", table_name="votes")
    op.drop_index("ix_votes_debate_id", table_name="votes")
    op.drop_table("votes")
    op.drop_index("ix_agent_statements_debate_id", table_name="agent_statements")
    op.drop_table("agent_statements")
    op.drop_index("ix_debates_proposal_id", table_name="debates")
    op.drop_table("debates")
    op.drop_table("users")
