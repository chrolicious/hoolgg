"""Add region column to users table

Revision ID: 006_add_region
Revises: 005_vault_autofill
"""

from alembic import op
import sqlalchemy as sa

revision = "006_add_region"
down_revision = "005_vault_autofill"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    result = conn.execute(sa.text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name = 'users' AND column_name = 'region'"
    ))
    if result.fetchone() is None:
        op.add_column("users", sa.Column("region", sa.String(4), nullable=True))


def downgrade():
    op.drop_column("users", "region")
