"""Add vault auto-fill fields to character_progress

Revision ID: 005_vault_autofill
Revises: 004_bnet_token
Create Date: 2026-02-26
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '005_vault_autofill'
down_revision: Union[str, None] = '004_bnet_token'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column('character_progress', sa.Column('raid_snapshot', sa.JSON(), nullable=True))
    op.add_column('character_progress', sa.Column('raid_snapshot_week', sa.Integer(), nullable=True))
    op.add_column('character_progress', sa.Column('warcraftlogs_data', sa.JSON(), nullable=True))
    op.add_column('character_progress', sa.Column('last_warcraftlogs_sync', sa.DateTime(timezone=True), nullable=True))
    op.add_column('character_progress', sa.Column('last_encounters_sync', sa.DateTime(timezone=True), nullable=True))

def downgrade() -> None:
    op.drop_column('character_progress', 'last_encounters_sync')
    op.drop_column('character_progress', 'last_warcraftlogs_sync')
    op.drop_column('character_progress', 'warcraftlogs_data')
    op.drop_column('character_progress', 'raid_snapshot_week')
    op.drop_column('character_progress', 'raid_snapshot')
