"""Add region column to users table

Revision ID: 006
Revises: 005
"""

from alembic import op
import sqlalchemy as sa

revision = "006_add_region"
down_revision = "005_vault_autofill"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("region", sa.String(4), nullable=True))


def downgrade():
    op.drop_column("users", "region")
