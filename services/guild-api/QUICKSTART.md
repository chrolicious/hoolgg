# Quick Start Guide - guild-api

Fast setup for development, staging, and production.

## Development Setup (5 minutes)

```bash
# 1. Clone and navigate
cd services/guild-api

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set environment variables
cp .env.example .env
# Edit .env with your values

# 4. Start PostgreSQL and Redis
docker compose up -d postgres redis

# 5. Apply database migrations
export DATABASE_URL="postgresql://hool:hool@localhost:5432/hoolgg"
alembic upgrade head

# 6. Verify migrations
alembic current

# 7. Start development server
python -m flask run --debug
```

Visit: http://localhost:5000/health

## Testing Migrations (2 minutes)

```bash
# Set test database
export DATABASE_URL="postgresql://hool:hool@localhost:5432/hoolgg_test"

# Run automated tests
./test_migrations.sh
```

## Staging Deployment (10 minutes)

```bash
# 1. SSH to staging
ssh staging.hool.gg

# 2. Backup database
pg_dump hoolgg_staging > backup_staging_$(date +%Y%m%d).sql

# 3. Pull latest code
git pull origin staging

# 4. Apply migrations
export DATABASE_URL="postgresql://user:pass@localhost:5432/hoolgg_staging"
alembic upgrade head

# 5. Restart application
# (depends on your deployment method: Docker, systemd, etc.)

# 6. Verify
curl https://staging.hool.gg/health
```

## Production Deployment (15 minutes)

```bash
# 1. SSH to production
ssh hool.gg

# 2. CREATE BACKUP (CRITICAL!)
pg_dump hoolgg > backup_prod_$(date +%Y%m%d_%H%M%S).sql

# 3. Pull latest code
git pull origin main

# 4. Apply migrations
export DATABASE_URL="postgresql://user:pass@localhost:5432/hoolgg"
alembic upgrade head

# 5. Restart application
# (depends on your deployment method)

# 6. Verify
curl https://hool.gg/health

# 7. Monitor logs
tail -f /var/log/guild-api/app.log
```

## Common Commands

### Migrations
```bash
alembic current              # Show current revision
alembic upgrade head         # Apply all migrations
alembic downgrade -1         # Rollback one migration
alembic downgrade base       # Rollback all migrations
alembic history --verbose    # Show migration history
```

### Database
```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# Describe table
\d users

# Check migration version
SELECT * FROM alembic_version;
```

### Redis
```bash
# Connect to Redis
redis-cli -h localhost -p 6379

# Check if running
PING

# View all keys (use carefully in production)
KEYS *

# Get specific key
GET "permission:123:456789:progress"

# Clear all cache (DANGEROUS in production)
FLUSHDB
```

## Troubleshooting

### Can't connect to database
```bash
# Check database is running
pg_isready -h localhost -p 5432

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Can't connect to Redis
```bash
# Check Redis is running
redis-cli ping

# Test connection
redis-cli -h localhost -p 6379 ping
```

### Migrations fail
```bash
# Check current state
alembic current

# Rollback problematic migration
alembic downgrade -1

# Check database schema
psql $DATABASE_URL -c "\dt"
```

### Health endpoint returns 500
```bash
# Check logs
tail -f /var/log/guild-api/app.log

# Verify environment variables
echo $DATABASE_URL
echo $REDIS_URL

# Test database manually
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

## Environment Variables

Required:
```bash
DATABASE_URL=postgresql://user:pass@host:5432/database
REDIS_URL=redis://host:6379/0
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
BLIZZARD_CLIENT_ID=your-client-id
BLIZZARD_CLIENT_SECRET=your-client-secret
BLIZZARD_REDIRECT_URI=https://your-domain.com/auth/callback
```

Optional:
```bash
BLIZZARD_REGION=us                    # Default: us
JWT_ACCESS_TOKEN_EXPIRES=900          # Default: 900 (15 min)
JWT_REFRESH_TOKEN_EXPIRES=604800      # Default: 604800 (7 days)
CORS_ORIGINS=https://hool.gg          # Default: http://localhost:3000
```

## Emergency Rollback

### Code rollback (safe)
```bash
# Revert to previous version
git checkout previous-tag
# Restart application
```

### Database rollback (careful!)
```bash
# Rollback migrations
alembic downgrade -1

# OR restore from backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
```

## Documentation

- [README.md](./README.md) - Development guide
- [MIGRATIONS.md](./MIGRATIONS.md) - Database migrations
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment procedures
- [CACHING.md](./CACHING.md) - Redis caching
- [TASKS_0.30-0.37_COMPLETION.md](./TASKS_0.30-0.37_COMPLETION.md) - Task completion details

## Health Check Endpoints

```bash
# Basic health
curl http://localhost:5000/health

# Should return:
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected"
}
```

## Support

For issues or questions:
1. Check documentation above
2. Check logs: `tail -f /var/log/guild-api/app.log`
3. Contact DevOps team

## Next Steps

After setup:
1. Test authentication flow: `/auth/login`
2. Create a test guild: `POST /guilds`
3. Test permissions: `GET /guilds/{id}/permissions/check`
4. Monitor cache performance
5. Set up monitoring/alerting
