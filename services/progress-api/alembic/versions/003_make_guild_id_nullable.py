"""make guild_id nullable

Revision ID: 003
Revises: 002
Create Date: 2026-02-21

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make guild_id nullable
    op.alter_column('character_progress', 'guild_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    
    # Drop the old composite index that required guild_id
    op.drop_index('idx_character_guild', table_name='character_progress', if_exists=True)
    
    # Create a new index based on user_bnet_id instead of guild_id (ignore if already exists)
    op.execute("CREATE INDEX IF NOT EXISTS idx_character_user ON character_progress (character_name, realm, user_bnet_id)")


def downgrade() -> None:
    # Drop the new index
    op.drop_index('idx_character_user', table_name='character_progress')
    
    # Recreate the old index
    op.create_index('idx_character_guild', 'character_progress', ['character_name', 'realm', 'guild_id'])
    
    # Make guild_id not nullable again (might fail if there are rows with null guild_id)
    op.alter_column('character_progress', 'guild_id',
               existing_type=sa.INTEGER(),
               nullable=False)
