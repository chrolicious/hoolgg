"""add raiderio columns to character progress

Revision ID: 110e4988dec4
Revises: 003
Create Date: 2026-02-21 15:26:42.072769

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '110e4988dec4'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('character_progress', sa.Column('mythic_plus_score', sa.Float(), nullable=True))
    op.add_column('character_progress', sa.Column('raid_progress', sa.JSON(), nullable=True))
    op.add_column('character_progress', sa.Column('last_raiderio_sync', sa.DateTime(timezone=True), nullable=True))

def downgrade() -> None:
    op.drop_column('character_progress', 'last_raiderio_sync')
    op.drop_column('character_progress', 'raid_progress')
    op.drop_column('character_progress', 'mythic_plus_score')
