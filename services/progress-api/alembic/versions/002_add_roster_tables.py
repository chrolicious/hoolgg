"""Add roster tracking tables and extend character_progress

Revision ID: 002
Revises: 001
Create Date: 2026-02-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to character_progress
    op.add_column('character_progress', sa.Column('user_bnet_id', sa.Integer(), nullable=True))
    op.add_column('character_progress', sa.Column('level', sa.Integer(), nullable=True))
    op.add_column('character_progress', sa.Column('avatar_url', sa.String(length=512), nullable=True))
    op.add_column('character_progress', sa.Column('display_order', sa.Integer(), server_default='0', nullable=True))
    op.add_column('character_progress', sa.Column('last_gear_sync', sa.DateTime(timezone=True), nullable=True))
    op.add_column('character_progress', sa.Column('parsed_gear', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('character_progress', sa.Column('character_stats', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.create_index('ix_character_progress_user_bnet_id', 'character_progress', ['user_bnet_id'])

    # Create crest_entries table
    op.create_table(
        'crest_entries',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('character_id', sa.Integer(), nullable=False),
        sa.Column('crest_type', sa.String(length=50), nullable=False),
        sa.Column('week_number', sa.Integer(), nullable=False),
        sa.Column('collected', sa.Integer(), server_default='0', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['character_id'], ['character_progress.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('character_id', 'crest_type', 'week_number', name='uq_crest_character_type_week'),
    )
    op.create_index('ix_crest_entries_id', 'crest_entries', ['id'])
    op.create_index('ix_crest_entries_character_id', 'crest_entries', ['character_id'])

    # Create profession_progress table
    op.create_table(
        'profession_progress',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('character_id', sa.Integer(), nullable=False),
        sa.Column('profession_name', sa.String(length=100), nullable=False),
        sa.Column('week_number', sa.Integer(), nullable=False),
        sa.Column('weekly_quest', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('patron_orders', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('treatise', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('knowledge_points', sa.Integer(), server_default='0', nullable=True),
        sa.Column('concentration', sa.Integer(), server_default='0', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['character_id'], ['character_progress.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('character_id', 'profession_name', 'week_number', name='uq_profession_character_name_week'),
    )
    op.create_index('ix_profession_progress_id', 'profession_progress', ['id'])
    op.create_index('ix_profession_progress_character_id', 'profession_progress', ['character_id'])

    # Create weekly_task_completions table
    op.create_table(
        'weekly_task_completions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('character_id', sa.Integer(), nullable=False),
        sa.Column('week_number', sa.Integer(), nullable=False),
        sa.Column('task_type', sa.String(length=20), nullable=False),
        sa.Column('task_id', sa.String(length=100), nullable=False),
        sa.Column('completed', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['character_id'], ['character_progress.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('character_id', 'week_number', 'task_type', 'task_id', name='uq_task_character_week_type_id'),
    )
    op.create_index('ix_weekly_task_completions_id', 'weekly_task_completions', ['id'])
    op.create_index('ix_weekly_task_completions_character_id', 'weekly_task_completions', ['character_id'])

    # Create bis_items table
    op.create_table(
        'bis_items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('character_id', sa.Integer(), nullable=False),
        sa.Column('slot', sa.String(length=50), nullable=False),
        sa.Column('item_name', sa.String(length=255), nullable=False),
        sa.Column('item_id', sa.Integer(), nullable=True),
        sa.Column('target_ilvl', sa.Integer(), nullable=True),
        sa.Column('obtained', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('synced', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['character_id'], ['character_progress.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_bis_items_id', 'bis_items', ['id'])
    op.create_index('ix_bis_items_character_id', 'bis_items', ['character_id'])

    # Create talent_builds table
    op.create_table(
        'talent_builds',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('character_id', sa.Integer(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('talent_string', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['character_id'], ['character_progress.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_talent_builds_id', 'talent_builds', ['id'])
    op.create_index('ix_talent_builds_character_id', 'talent_builds', ['character_id'])

    # Create great_vault_entries table
    op.create_table(
        'great_vault_entries',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('character_id', sa.Integer(), nullable=False),
        sa.Column('week_number', sa.Integer(), nullable=False),
        sa.Column('raid_lfr', sa.Integer(), server_default='0', nullable=True),
        sa.Column('raid_normal', sa.Integer(), server_default='0', nullable=True),
        sa.Column('raid_heroic', sa.Integer(), server_default='0', nullable=True),
        sa.Column('raid_mythic', sa.Integer(), server_default='0', nullable=True),
        sa.Column('m_plus_runs', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('highest_delve', sa.Integer(), server_default='0', nullable=True),
        sa.Column('world_vault', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['character_id'], ['character_progress.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('character_id', 'week_number', name='uq_vault_character_week'),
    )
    op.create_index('ix_great_vault_entries_id', 'great_vault_entries', ['id'])
    op.create_index('ix_great_vault_entries_character_id', 'great_vault_entries', ['character_id'])

    # Create character_professions table
    op.create_table(
        'character_professions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('character_id', sa.Integer(), nullable=False),
        sa.Column('profession_name', sa.String(length=100), nullable=False),
        sa.Column('slot_index', sa.Integer(), server_default='0', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['character_id'], ['character_progress.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('character_id', 'profession_name', name='uq_character_profession'),
    )
    op.create_index('ix_character_professions_id', 'character_professions', ['id'])
    op.create_index('ix_character_professions_character_id', 'character_professions', ['character_id'])

    # Create season_config table
    op.create_table(
        'season_config',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('expansion_id', sa.Integer(), nullable=False),
        sa.Column('region', sa.String(length=10), server_default='us', nullable=True),
        sa.Column('week_number', sa.Integer(), nullable=False),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('crest_cap_per_week', sa.Integer(), server_default='90', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('expansion_id', 'region', 'week_number', name='uq_season_expansion_region_week'),
    )
    op.create_index('ix_season_config_id', 'season_config', ['id'])
    op.create_index('ix_season_config_expansion_id', 'season_config', ['expansion_id'])


def downgrade() -> None:
    # Drop new tables in reverse order
    op.drop_index('ix_season_config_expansion_id', table_name='season_config')
    op.drop_index('ix_season_config_id', table_name='season_config')
    op.drop_table('season_config')

    op.drop_index('ix_character_professions_character_id', table_name='character_professions')
    op.drop_index('ix_character_professions_id', table_name='character_professions')
    op.drop_table('character_professions')

    op.drop_index('ix_great_vault_entries_character_id', table_name='great_vault_entries')
    op.drop_index('ix_great_vault_entries_id', table_name='great_vault_entries')
    op.drop_table('great_vault_entries')

    op.drop_index('ix_talent_builds_character_id', table_name='talent_builds')
    op.drop_index('ix_talent_builds_id', table_name='talent_builds')
    op.drop_table('talent_builds')

    op.drop_index('ix_bis_items_character_id', table_name='bis_items')
    op.drop_index('ix_bis_items_id', table_name='bis_items')
    op.drop_table('bis_items')

    op.drop_index('ix_weekly_task_completions_character_id', table_name='weekly_task_completions')
    op.drop_index('ix_weekly_task_completions_id', table_name='weekly_task_completions')
    op.drop_table('weekly_task_completions')

    op.drop_index('ix_profession_progress_character_id', table_name='profession_progress')
    op.drop_index('ix_profession_progress_id', table_name='profession_progress')
    op.drop_table('profession_progress')

    op.drop_index('ix_crest_entries_character_id', table_name='crest_entries')
    op.drop_index('ix_crest_entries_id', table_name='crest_entries')
    op.drop_table('crest_entries')

    # Remove added columns from character_progress
    op.drop_index('ix_character_progress_user_bnet_id', table_name='character_progress')
    op.drop_column('character_progress', 'character_stats')
    op.drop_column('character_progress', 'parsed_gear')
    op.drop_column('character_progress', 'last_gear_sync')
    op.drop_column('character_progress', 'display_order')
    op.drop_column('character_progress', 'avatar_url')
    op.drop_column('character_progress', 'level')
    op.drop_column('character_progress', 'user_bnet_id')
