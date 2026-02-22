"""add region to character_progress

Revision ID: cecddcdee0dc
Revises: 110e4988dec4
Create Date: 2026-02-22 11:18:44.892503

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cecddcdee0dc'
down_revision = '110e4988dec4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('character_progress', sa.Column('region', sa.String(10), nullable=True, server_default='us'))


def downgrade() -> None:
    op.drop_column('character_progress', 'region')
