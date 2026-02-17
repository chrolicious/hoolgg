"""create guilds table

Revision ID: 002
Revises: 001
Create Date: 2026-02-17 18:37:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create guilds table for WoW guilds with hool.gg instances"""
    op.create_table(
        'guilds',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('realm', sa.String(length=255), nullable=False),
        sa.Column('gm_bnet_id', sa.Integer(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['gm_bnet_id'], ['users.bnet_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_guilds_id'), 'guilds', ['id'], unique=False)
    op.create_index(op.f('ix_guilds_name'), 'guilds', ['name'], unique=False)
    op.create_index(op.f('ix_guilds_realm'), 'guilds', ['realm'], unique=False)


def downgrade() -> None:
    """Drop guilds table"""
    op.drop_index(op.f('ix_guilds_realm'), table_name='guilds')
    op.drop_index(op.f('ix_guilds_name'), table_name='guilds')
    op.drop_index(op.f('ix_guilds_id'), table_name='guilds')
    op.drop_table('guilds')
