"""add delve runs tracking

Revision ID: 6284db8bd426
Revises: 20260224_001758
Create Date: 2026-02-24 09:01:26.068411

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6284db8bd426'
down_revision = '20260224_001758'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add delve_runs JSON column
    op.add_column('great_vault_entries', sa.Column('delve_runs', sa.JSON(), nullable=True))

    # Migrate existing highest_delve data to delve_runs
    # For any row where highest_delve > 0, create a single-element array [highest_delve]
    op.execute("""
        UPDATE great_vault_entries
        SET delve_runs = json_build_array(highest_delve)
        WHERE highest_delve > 0
    """)


def downgrade() -> None:
    # Migrate delve_runs back to highest_delve (take max value)
    op.execute("""
        UPDATE great_vault_entries
        SET highest_delve = (
            SELECT MAX(value::int)
            FROM json_array_elements_text(delve_runs)
        )
        WHERE delve_runs IS NOT NULL AND json_array_length(delve_runs) > 0
    """)

    # Drop the delve_runs column
    op.drop_column('great_vault_entries', 'delve_runs')
