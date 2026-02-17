"""Create recruitment tables

Revision ID: 001
Revises:
Create Date: 2026-02-17

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create recruitment_categories table
    op.create_table(
        "recruitment_categories",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("guild_id", sa.Integer(), nullable=False),
        sa.Column("category_name", sa.String(length=100), nullable=False),
        sa.Column("custom", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_recruitment_categories_id"), "recruitment_categories", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_recruitment_categories_guild_id"),
        "recruitment_categories",
        ["guild_id"],
        unique=False,
    )
    op.create_index(
        "idx_guild_category_name",
        "recruitment_categories",
        ["guild_id", "category_name"],
        unique=True,
    )

    # Create recruitment_candidates table
    op.create_table(
        "recruitment_candidates",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("guild_id", sa.Integer(), nullable=False),
        sa.Column("candidate_name", sa.String(length=255), nullable=False),
        sa.Column("realm", sa.String(length=255), nullable=True),
        sa.Column("region", sa.String(length=10), nullable=True, server_default="us"),
        sa.Column("character_class", sa.String(length=50), nullable=True),
        sa.Column("role", sa.String(length=50), nullable=True),
        sa.Column("spec", sa.String(length=50), nullable=True),
        sa.Column("ilvl", sa.Integer(), nullable=True),
        sa.Column("raid_progress", sa.String(length=255), nullable=True),
        sa.Column("mythic_plus_rating", sa.Integer(), nullable=True),
        sa.Column("raider_io_score", sa.Integer(), nullable=True),
        sa.Column("source", sa.String(length=50), nullable=False, server_default="manual"),
        sa.Column("external_url", sa.String(length=512), nullable=True),
        sa.Column("rating", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="pending"),
        sa.Column("category_id", sa.Integer(), nullable=True),
        sa.Column("contacted", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("contacted_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("avg_parse_percentile", sa.Float(), nullable=True),
        sa.Column("best_parse_percentile", sa.Float(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_recruitment_candidates_id"), "recruitment_candidates", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_recruitment_candidates_guild_id"),
        "recruitment_candidates",
        ["guild_id"],
        unique=False,
    )
    op.create_index(
        "idx_guild_candidate",
        "recruitment_candidates",
        ["guild_id", "candidate_name", "realm"],
        unique=False,
    )
    op.create_index(
        "idx_guild_status",
        "recruitment_candidates",
        ["guild_id", "status"],
        unique=False,
    )
    op.create_index(
        "idx_guild_category",
        "recruitment_candidates",
        ["guild_id", "category_id"],
        unique=False,
    )

    # Create recruitment_history table
    op.create_table(
        "recruitment_history",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("guild_id", sa.Integer(), nullable=False),
        sa.Column("candidate_id", sa.Integer(), nullable=False),
        sa.Column("contacted_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("method", sa.String(length=50), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("response_received", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("logged_by_bnet_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_recruitment_history_id"), "recruitment_history", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_recruitment_history_guild_id"),
        "recruitment_history",
        ["guild_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_recruitment_history_candidate_id"),
        "recruitment_history",
        ["candidate_id"],
        unique=False,
    )
    op.create_index(
        "idx_guild_candidate_history",
        "recruitment_history",
        ["guild_id", "candidate_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("idx_guild_candidate_history", table_name="recruitment_history")
    op.drop_index(
        op.f("ix_recruitment_history_candidate_id"), table_name="recruitment_history"
    )
    op.drop_index(op.f("ix_recruitment_history_guild_id"), table_name="recruitment_history")
    op.drop_index(op.f("ix_recruitment_history_id"), table_name="recruitment_history")
    op.drop_table("recruitment_history")

    op.drop_index("idx_guild_category", table_name="recruitment_candidates")
    op.drop_index("idx_guild_status", table_name="recruitment_candidates")
    op.drop_index("idx_guild_candidate", table_name="recruitment_candidates")
    op.drop_index(
        op.f("ix_recruitment_candidates_guild_id"), table_name="recruitment_candidates"
    )
    op.drop_index(op.f("ix_recruitment_candidates_id"), table_name="recruitment_candidates")
    op.drop_table("recruitment_candidates")

    op.drop_index("idx_guild_category_name", table_name="recruitment_categories")
    op.drop_index(
        op.f("ix_recruitment_categories_guild_id"), table_name="recruitment_categories"
    )
    op.drop_index(op.f("ix_recruitment_categories_id"), table_name="recruitment_categories")
    op.drop_table("recruitment_categories")
