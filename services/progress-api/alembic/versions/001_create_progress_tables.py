"""Create progress tracking tables

Revision ID: 001
Revises:
Create Date: 2026-02-17

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create character_progress table
    op.create_table(
        'character_progress',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('character_name', sa.String(length=255), nullable=False),
        sa.Column('realm', sa.String(length=255), nullable=False),
        sa.Column('guild_id', sa.Integer(), nullable=False),
        sa.Column('class_name', sa.String(length=50), nullable=True),
        sa.Column('spec', sa.String(length=50), nullable=True),
        sa.Column('role', sa.String(length=20), nullable=True),
        sa.Column('current_ilvl', sa.Float(), nullable=True),
        sa.Column('gear_details', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('last_updated', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_character_progress_id', 'character_progress', ['id'])
    op.create_index('ix_character_progress_character_name', 'character_progress', ['character_name'])
    op.create_index('ix_character_progress_realm', 'character_progress', ['realm'])
    op.create_index('ix_character_progress_guild_id', 'character_progress', ['guild_id'])
    op.create_index('idx_character_guild', 'character_progress', ['character_name', 'realm', 'guild_id'])

    # Create weekly_targets table
    op.create_table(
        'weekly_targets',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('expansion_id', sa.String(length=50), nullable=False),
        sa.Column('week', sa.Integer(), nullable=False),
        sa.Column('ilvl_target', sa.Float(), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('expansion_id', 'week', name='uq_expansion_week')
    )
    op.create_index('ix_weekly_targets_id', 'weekly_targets', ['id'])
    op.create_index('ix_weekly_targets_expansion_id', 'weekly_targets', ['expansion_id'])

    # Create guild_messages table
    op.create_table(
        'guild_messages',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('guild_id', sa.Integer(), nullable=False),
        sa.Column('gm_message', sa.Text(), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('guild_id', name='uq_guild_id')
    )
    op.create_index('ix_guild_messages_id', 'guild_messages', ['id'])
    op.create_index('ix_guild_messages_guild_id', 'guild_messages', ['guild_id'])


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index('ix_guild_messages_guild_id', table_name='guild_messages')
    op.drop_index('ix_guild_messages_id', table_name='guild_messages')
    op.drop_table('guild_messages')

    op.drop_index('ix_weekly_targets_expansion_id', table_name='weekly_targets')
    op.drop_index('ix_weekly_targets_id', table_name='weekly_targets')
    op.drop_table('weekly_targets')

    op.drop_index('idx_character_guild', table_name='character_progress')
    op.drop_index('ix_character_progress_guild_id', table_name='character_progress')
    op.drop_index('ix_character_progress_realm', table_name='character_progress')
    op.drop_index('ix_character_progress_character_name', table_name='character_progress')
    op.drop_index('ix_character_progress_id', table_name='character_progress')
    op.drop_table('character_progress')
