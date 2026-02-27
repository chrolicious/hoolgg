"""Add blizzard access token fields to users table

Revision ID: 004_bnet_token
Revises: 6284db8bd426
Create Date: 2026-02-26

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '004_bnet_token'
down_revision: Union[str, None] = '6284db8bd426'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add blizzard_access_token and blizzard_token_expires_at to users table"""
    op.add_column('users', sa.Column('blizzard_access_token', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('blizzard_token_expires_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    """Remove blizzard token fields from users table"""
    op.drop_column('users', 'blizzard_token_expires_at')
    op.drop_column('users', 'blizzard_access_token')
