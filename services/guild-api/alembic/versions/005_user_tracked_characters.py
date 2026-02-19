"""Add user_tracked_characters table

Revision ID: 005
Revises: 004
Create Date: 2026-02-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '005'
down_revision: Union[str, None] = '004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create user_tracked_characters table for tracking user characters per guild"""
    op.create_table(
        'user_tracked_characters',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('guild_id', sa.Integer(), nullable=False),
        sa.Column('bnet_id', sa.Integer(), nullable=False),
        sa.Column('character_name', sa.String(length=50), nullable=False),
        sa.Column('realm', sa.String(length=100), nullable=False),
        sa.Column('is_main', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('tracked', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['guild_id'], ['guilds.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('guild_id', 'bnet_id', 'character_name', 'realm', name='uix_guild_user_character'),
    )

    # Index for fast lookups by guild and user
    op.create_index('ix_user_tracked_characters_guild_bnet', 'user_tracked_characters', ['guild_id', 'bnet_id'])
    op.create_index(op.f('ix_user_tracked_characters_id'), 'user_tracked_characters', ['id'], unique=False)


def downgrade() -> None:
    """Drop user_tracked_characters table"""
    op.drop_index(op.f('ix_user_tracked_characters_id'), table_name='user_tracked_characters')
    op.drop_index('ix_user_tracked_characters_guild_bnet', table_name='user_tracked_characters')
    op.drop_table('user_tracked_characters')
