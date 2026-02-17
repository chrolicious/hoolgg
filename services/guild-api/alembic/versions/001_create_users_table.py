"""create users table

Revision ID: 001
Revises:
Create Date: 2026-02-17 18:36:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create users table for Blizzard Battle.net accounts"""
    op.create_table(
        'users',
        sa.Column('bnet_id', sa.Integer(), nullable=False),
        sa.Column('bnet_username', sa.String(length=255), nullable=False),
        sa.Column('last_login', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('bnet_id')
    )
    op.create_index(op.f('ix_users_bnet_id'), 'users', ['bnet_id'], unique=False)


def downgrade() -> None:
    """Drop users table"""
    op.drop_index(op.f('ix_users_bnet_id'), table_name='users')
    op.drop_table('users')
