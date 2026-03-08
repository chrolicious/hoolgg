"""add users table

Revision ID: 20260224_001758
Revises: c2ba3b3bd4db
Create Date: 2026-02-24 00:17:58.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func

# revision identifiers, used by Alembic.
revision = '20260224_001758'
down_revision = 'c2ba3b3bd4db'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('bnet_id', sa.Integer(), nullable=False),
        sa.Column('bnet_username', sa.String(length=255), nullable=False),
        sa.Column('last_login', sa.DateTime(timezone=True), server_default=func.now()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=func.now(), onupdate=func.now()),
        sa.PrimaryKeyConstraint('bnet_id')
    )
    op.create_index(op.f('ix_users_bnet_id'), 'users', ['bnet_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_users_bnet_id'), table_name='users')
    op.drop_table('users')
