# Database Migrations Guide

This guide covers database migrations for the guild-api service using Alembic.

## Overview

The guild-api uses [Alembic](https://alembic.sqlalchemy.org/) for database schema migrations. All migrations are versioned and reversible, allowing safe database schema changes in development, staging, and production environments.

## Migration Files

Migrations are located in `alembic/versions/`:

- `001_create_users_table.py` - Users table (Blizzard Battle.net accounts)
- `002_create_guilds_table.py` - Guilds table (WoW guilds with hool.gg instances)
- `003_create_guild_members_table.py` - Guild members table (character membership and ranks)
- `004_create_guild_permissions_table.py` - Guild permissions table (rank-based access control)

## Prerequisites

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set the `DATABASE_URL` environment variable:
   ```bash
   export DATABASE_URL="postgresql://user:password@host:port/database"
   ```

## Common Commands

### Check current migration status
```bash
alembic current
```

### Apply all pending migrations
```bash
alembic upgrade head
```

### Rollback all migrations
```bash
alembic downgrade base
```

### Rollback to a specific revision
```bash
alembic downgrade 003  # Rollback to revision 003
```

### Show migration history
```bash
alembic history --verbose
```

### Create a new migration
```bash
alembic revision -m "description of changes"
```

### Auto-generate migration from model changes
```bash
alembic revision --autogenerate -m "description of changes"
```

## Testing Migrations

A test script is provided to verify that all migrations are reversible:

```bash
# Set test database URL
export DATABASE_URL="postgresql://hool:hool@localhost:5432/hoolgg_test"

# Run migration tests
./test_migrations.sh
```

The test script will:
1. Apply all migrations
2. Verify they were applied successfully
3. Rollback all migrations
4. Verify the database is empty
5. Re-apply migrations
6. Test individual migration downgrades
7. Verify all migrations are reversible

## Deployment Workflows

### Local Development

```bash
# Start local PostgreSQL
docker compose up -d postgres

# Apply migrations
export DATABASE_URL="postgresql://hool:hool@localhost:5432/hoolgg"
alembic upgrade head

# Start development server
python -m flask run
```

### Staging Deployment

1. **Before deploying code changes**, backup the database:
   ```bash
   # SSH to staging server
   ssh staging.hool.gg

   # Create database backup
   pg_dump -h localhost -U hool hoolgg_staging > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Test migrations in staging**:
   ```bash
   # On staging server, set DATABASE_URL
   export DATABASE_URL="postgresql://hool:hool@localhost:5432/hoolgg_staging"

   # Show pending migrations
   alembic current
   alembic history

   # Apply migrations
   alembic upgrade head
   ```

3. **Verify migrations succeeded**:
   ```bash
   # Check current revision
   alembic current

   # Verify tables exist
   psql $DATABASE_URL -c "\dt"

   # Test application
   curl https://staging.hool.gg/health
   ```

4. **If something goes wrong**, rollback:
   ```bash
   # Rollback to previous revision
   alembic downgrade -1

   # Or restore from backup
   psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
   ```

### Production Deployment

Follow the same process as staging, but with production database credentials:

1. **Create backup** (critical!)
   ```bash
   pg_dump -h localhost -U hool hoolgg > backup_prod_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Test migrations on staging first** (never skip this!)

3. **Apply migrations in production**:
   ```bash
   export DATABASE_URL="postgresql://hool:hool@localhost:5432/hoolgg"
   alembic upgrade head
   ```

4. **Verify and monitor**:
   ```bash
   # Check migration status
   alembic current

   # Verify application health
   curl https://hool.gg/health

   # Monitor logs for errors
   tail -f /var/log/guild-api/app.log
   ```

## Migration Safety Checklist

Before applying migrations in staging/production:

- [ ] Migrations tested locally
- [ ] All migrations are reversible (tested with `./test_migrations.sh`)
- [ ] Database backup created
- [ ] Staging deployment successful
- [ ] Rollback plan documented
- [ ] Team notified of deployment window

## Common Issues and Solutions

### Issue: "Target database is not up to date"

**Cause**: Database has pending migrations

**Solution**:
```bash
alembic upgrade head
```

### Issue: "Can't locate revision identified by 'xyz'"

**Cause**: Migration files are out of sync with database

**Solution**:
1. Check migration files exist in `alembic/versions/`
2. Verify `alembic_version` table in database
3. If needed, stamp database to correct revision:
   ```bash
   alembic stamp head
   ```

### Issue: Migration fails with foreign key constraint error

**Cause**: Data exists that violates new constraints

**Solution**:
1. Rollback migration:
   ```bash
   alembic downgrade -1
   ```
2. Fix data issues manually
3. Re-apply migration:
   ```bash
   alembic upgrade head
   ```

### Issue: Need to rollback a production migration

**Solution**:
1. **DO NOT PANIC**
2. Check if rollback is safe (no data loss)
3. Create backup first:
   ```bash
   pg_dump $DATABASE_URL > emergency_backup.sql
   ```
4. Rollback:
   ```bash
   alembic downgrade -1
   ```
5. Verify application is working
6. Investigate and fix migration issue

## Database Schema

### Current Schema (after all migrations)

```sql
-- users: Blizzard Battle.net accounts
CREATE TABLE users (
    bnet_id INTEGER PRIMARY KEY,
    bnet_username VARCHAR(255) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- guilds: WoW guilds with hool.gg instances
CREATE TABLE guilds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    realm VARCHAR(255) NOT NULL,
    gm_bnet_id INTEGER NOT NULL REFERENCES users(bnet_id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- guild_members: Character membership and rank tracking
CREATE TABLE guild_members (
    character_name VARCHAR(255) PRIMARY KEY,
    guild_id INTEGER REFERENCES guilds(id),
    bnet_id INTEGER NOT NULL REFERENCES users(bnet_id),
    rank_id INTEGER NOT NULL,
    rank_name VARCHAR(255) NOT NULL,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- guild_permissions: Rank-based access control
CREATE TABLE guild_permissions (
    id SERIAL PRIMARY KEY,
    guild_id INTEGER NOT NULL REFERENCES guilds(id),
    tool_name VARCHAR(100) NOT NULL,
    min_rank_id INTEGER NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Emergency Contacts

For production migration issues:

- DevOps Lead: [Contact info]
- Database Admin: [Contact info]
- On-call Engineer: [Contact info]

## References

- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
