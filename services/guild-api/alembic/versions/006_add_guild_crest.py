"""Add guild crest fields

Revision ID: 006
Revises: 005
Create Date: 2026-02-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision: str = '006'
down_revision: Union[str, None] = '005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add crest_data and crest_updated_at to guilds table"""
    op.add_column('guilds', sa.Column('crest_data', JSONB, nullable=True))
    op.add_column('guilds', sa.Column('crest_updated_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    """Remove crest fields from guilds table"""
    op.drop_column('guilds', 'crest_updated_at')
    op.drop_column('guilds', 'crest_data')
