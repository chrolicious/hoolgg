"""add_render_url_to_character_progress

Revision ID: c2ba3b3bd4db
Revises: cecddcdee0dc
Create Date: 2026-02-23 12:15:39.313518

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c2ba3b3bd4db'
down_revision = 'cecddcdee0dc'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add render_url column for full-body character renders
    op.add_column('character_progress', sa.Column('render_url', sa.String(length=512), nullable=True))


def downgrade() -> None:
    # Remove render_url column
    op.drop_column('character_progress', 'render_url')
