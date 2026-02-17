"""create guild_permissions table

Revision ID: 004
Revises: 003
Create Date: 2026-02-17 18:39:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '004'
down_revision: Union[str, None] = '003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create guild_permissions table for rank-based access control"""
    op.create_table(
        'guild_permissions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('guild_id', sa.Integer(), nullable=False),
        sa.Column('tool_name', sa.String(length=100), nullable=False),
        sa.Column('min_rank_id', sa.Integer(), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['guild_id'], ['guilds.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_guild_permissions_guild_id'), 'guild_permissions', ['guild_id'], unique=False)
    op.create_index(op.f('ix_guild_permissions_id'), 'guild_permissions', ['id'], unique=False)


def downgrade() -> None:
    """Drop guild_permissions table"""
    op.drop_index(op.f('ix_guild_permissions_id'), table_name='guild_permissions')
    op.drop_index(op.f('ix_guild_permissions_guild_id'), table_name='guild_permissions')
    op.drop_table('guild_permissions')
