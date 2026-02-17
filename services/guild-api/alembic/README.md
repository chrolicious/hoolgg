# Alembic Migrations

This directory contains database schema migrations for the guild-api service.

## Migration Files

### Current Migrations

1. **001_create_users_table.py** - Users table (Blizzard Battle.net accounts)
   - Primary key: `bnet_id` (INTEGER)
   - Fields: `bnet_username`, `last_login`, `created_at`, `updated_at`

2. **002_create_guilds_table.py** - Guilds table (WoW guilds)
   - Primary key: `id` (SERIAL)
   - Fields: `name`, `realm`, `gm_bnet_id`, `deleted_at`, `created_at`, `updated_at`
   - Foreign key: `gm_bnet_id` → `users.bnet_id`

3. **003_create_guild_members_table.py** - Guild members table
   - Primary key: `character_name` (VARCHAR)
   - Fields: `guild_id`, `bnet_id`, `rank_id`, `rank_name`, `last_sync`, `created_at`, `updated_at`
   - Foreign keys:
     - `guild_id` → `guilds.id`
     - `bnet_id` → `users.bnet_id`

4. **004_create_guild_permissions_table.py** - Guild permissions table
   - Primary key: `id` (SERIAL)
   - Fields: `guild_id`, `tool_name`, `min_rank_id`, `enabled`, `created_at`, `updated_at`
   - Foreign key: `guild_id` → `guilds.id`

## Usage

### Apply all migrations
```bash
alembic upgrade head
```

### Rollback all migrations
```bash
alembic downgrade base
```

### Rollback to specific revision
```bash
alembic downgrade 003  # Rollback to revision 003
```

### Check current revision
```bash
alembic current
```

### View migration history
```bash
alembic history --verbose
```

## Testing

Run the migration test script:
```bash
./test_migrations.sh
```

This will:
- Apply all migrations
- Test rollback functionality
- Verify all migrations are reversible

## Documentation

See the following files for more information:

- [MIGRATIONS.md](../MIGRATIONS.md) - Complete migration guide
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment procedures
- [CACHING.md](../CACHING.md) - Redis caching documentation

## Migration Dependencies

```
base → 001 → 002 → 003 → 004 → head
```

Each migration depends on the previous one and must be applied in order.

## Rollback Order

When rolling back, migrations must be reversed in the opposite order:

```
head → 004 → 003 → 002 → 001 → base
```

## Notes

- All migrations are fully reversible
- Each migration includes both `upgrade()` and `downgrade()` functions
- Timestamps are stored with timezone information (`TIMESTAMP WITH TIME ZONE`)
- All foreign keys are properly defined for referential integrity
