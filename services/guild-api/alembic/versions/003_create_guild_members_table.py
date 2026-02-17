"""create guild_members table

Revision ID: 003
Revises: 002
Create Date: 2026-02-17 18:38:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create guild_members table for character membership and rank tracking"""
    op.create_table(
        'guild_members',
        sa.Column('character_name', sa.String(length=255), nullable=False),
        sa.Column('guild_id', sa.Integer(), nullable=True),
        sa.Column('bnet_id', sa.Integer(), nullable=False),
        sa.Column('rank_id', sa.Integer(), nullable=False),
        sa.Column('rank_name', sa.String(length=255), nullable=False),
        sa.Column('last_sync', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['bnet_id'], ['users.bnet_id'], ),
        sa.ForeignKeyConstraint(['guild_id'], ['guilds.id'], ),
        sa.PrimaryKeyConstraint('character_name')
    )
    op.create_index(op.f('ix_guild_members_bnet_id'), 'guild_members', ['bnet_id'], unique=False)
    op.create_index(op.f('ix_guild_members_character_name'), 'guild_members', ['character_name'], unique=False)
    op.create_index(op.f('ix_guild_members_guild_id'), 'guild_members', ['guild_id'], unique=False)


def downgrade() -> None:
    """Drop guild_members table"""
    op.drop_index(op.f('ix_guild_members_guild_id'), table_name='guild_members')
    op.drop_index(op.f('ix_guild_members_character_name'), table_name='guild_members')
    op.drop_index(op.f('ix_guild_members_bnet_id'), table_name='guild_members')
    op.drop_table('guild_members')
