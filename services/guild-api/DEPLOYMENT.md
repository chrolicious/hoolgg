# Deployment Guide - guild-api

This guide covers deploying the guild-api service to staging and production environments.

## Prerequisites

- Docker (for containerized deployments)
- PostgreSQL 14+ database
- Redis 7+ (for caching)
- Python 3.11+

## Environment Variables

Required environment variables for deployment:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Redis Cache
REDIS_URL=redis://host:port/0

# Security
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ACCESS_TOKEN_EXPIRES=900  # 15 minutes
JWT_REFRESH_TOKEN_EXPIRES=604800  # 7 days

# Blizzard OAuth
BLIZZARD_CLIENT_ID=your-client-id
BLIZZARD_CLIENT_SECRET=your-client-secret
BLIZZARD_REDIRECT_URI=https://your-domain.com/auth/callback
BLIZZARD_REGION=us  # or eu, kr, tw, cn

# CORS
CORS_ORIGINS=https://hool.gg,https://www.hool.gg
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing locally
- [ ] Migrations tested locally and on staging
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] Team notified of deployment window
- [ ] Rollback plan prepared

### Deployment Steps

#### 1. Database Backup

**Always create a backup before deploying!**

```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh backup_*.sql
```

#### 2. Apply Database Migrations

```bash
# Set database URL
export DATABASE_URL="postgresql://user:password@host:port/database"

# Check current revision
alembic current

# Show pending migrations
alembic history

# Apply migrations
alembic upgrade head

# Verify migrations
alembic current
```

#### 3. Deploy Application

**Option A: Docker Deployment (Recommended)**

```bash
# Build Docker image
docker build -t guild-api:latest .

# Run container
docker run -d \
  --name guild-api \
  --env-file .env.production \
  -p 5000:5000 \
  guild-api:latest

# Verify deployment
docker logs guild-api
curl http://localhost:5000/health
```

**Option B: Direct Python Deployment**

```bash
# Install dependencies
pip install -r requirements.txt

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

#### 4. Verify Deployment

```bash
# Check health endpoint
curl https://your-domain.com/health

# Check database connection
curl https://your-domain.com/health | jq '.database'

# Check Redis connection
curl https://your-domain.com/health | jq '.redis'

# Monitor logs
tail -f /var/log/guild-api/app.log
```

### Post-Deployment

- [ ] Health checks passing
- [ ] API endpoints responding correctly
- [ ] No errors in logs
- [ ] Database migrations applied successfully
- [ ] Redis cache working
- [ ] Monitoring alerts configured

## Staging Deployment

Staging environment: `staging.hool.gg`

```bash
# 1. Set staging environment
export ENV=staging
export DATABASE_URL="postgresql://hool:hool@localhost:5432/hoolgg_staging"

# 2. Create backup
pg_dump $DATABASE_URL > backup_staging_$(date +%Y%m%d_%H%M%S).sql

# 3. Apply migrations
alembic upgrade head

# 4. Deploy application
# (Use your deployment method: Docker, Coolify, etc.)

# 5. Verify
curl https://staging.hool.gg/health
```

### Testing on Staging

After deployment, test the following:

1. **Authentication Flow**
   ```bash
   # Test Blizzard OAuth login
   curl https://staging.hool.gg/auth/login
   # Follow OAuth flow in browser
   ```

2. **Guild Management**
   ```bash
   # Create guild
   curl -X POST https://staging.hool.gg/guilds \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "Test Guild", "realm": "Stormrage"}'

   # Get guild roster
   curl https://staging.hool.gg/guilds/1/members \
     -H "Authorization: Bearer $TOKEN"
   ```

3. **Permission System**
   ```bash
   # Check permissions
   curl https://staging.hool.gg/guilds/1/permissions/check?tool=progress \
     -H "Authorization: Bearer $TOKEN"
   ```

4. **Caching**
   ```bash
   # Verify Redis is working (should be faster on second request)
   time curl https://staging.hool.gg/guilds/1/members \
     -H "Authorization: Bearer $TOKEN"
   ```

## Production Deployment

Production environment: `hool.gg`

### Pre-Production Checklist

- [ ] All staging tests passed
- [ ] Team approval received
- [ ] Database backup created
- [ ] Rollback plan documented
- [ ] Monitoring configured
- [ ] Deployment window scheduled (low traffic time)

### Production Deployment Steps

```bash
# 1. Set production environment
export ENV=production
export DATABASE_URL="postgresql://hool:hool@localhost:5432/hoolgg"

# 2. Create backup (CRITICAL!)
pg_dump $DATABASE_URL > backup_prod_$(date +%Y%m%d_%H%M%S).sql

# Verify backup file
ls -lh backup_prod_*.sql
wc -l backup_prod_*.sql  # Should have many lines

# 3. Apply migrations
alembic current  # Check current state
alembic upgrade head  # Apply migrations

# 4. Deploy application
# (Use your deployment method)

# 5. Verify deployment
curl https://hool.gg/health
```

### Production Verification

After deployment, verify:

1. Health endpoint returns 200 OK
2. Database connection working
3. Redis connection working
4. No errors in logs
5. Authentication flow working
6. Guild operations working

### Monitoring

Monitor the following metrics:

- **Response times**: < 500ms for p95
- **Error rate**: < 1%
- **Database connections**: Monitor pool usage
- **Redis hit rate**: > 80%
- **CPU/Memory usage**: Normal levels

## Rollback Procedures

If deployment fails or issues are detected:

### Quick Rollback (Code Only)

```bash
# 1. Revert to previous Docker image
docker stop guild-api
docker run -d \
  --name guild-api \
  --env-file .env.production \
  -p 5000:5000 \
  guild-api:previous-tag

# 2. Verify
curl https://hool.gg/health
```

### Database Rollback

**Only if migrations caused issues:**

```bash
# 1. Rollback migrations
alembic downgrade -1  # Rollback one migration
# OR
alembic downgrade <revision>  # Rollback to specific revision

# 2. Verify
alembic current

# 3. Restart application
# (Use your deployment method)
```

### Full Rollback (Database Restore)

**Last resort - use only if migrations cannot be rolled back:**

```bash
# 1. Stop application
docker stop guild-api

# 2. Restore database from backup
psql $DATABASE_URL < backup_prod_YYYYMMDD_HHMMSS.sql

# 3. Verify restoration
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# 4. Restart application with previous code version
docker run -d \
  --name guild-api \
  --env-file .env.production \
  -p 5000:5000 \
  guild-api:previous-tag

# 5. Verify
curl https://hool.gg/health
```

## Common Issues

### Issue: Migration fails

**Solution**:
1. Check migration error message
2. Rollback migration: `alembic downgrade -1`
3. Fix migration file or data issues
4. Re-apply: `alembic upgrade head`

### Issue: Database connection refused

**Solution**:
1. Verify DATABASE_URL is correct
2. Check database is running: `pg_isready -h host -p port`
3. Verify credentials
4. Check firewall rules

### Issue: Redis connection timeout

**Solution**:
1. Verify REDIS_URL is correct
2. Check Redis is running: `redis-cli ping`
3. Verify network connectivity
4. Check Redis authentication

### Issue: Health endpoint returns 500

**Solution**:
1. Check application logs
2. Verify all environment variables are set
3. Test database connection manually
4. Test Redis connection manually

## CI/CD Integration

For automated deployments (GitHub Actions, GitLab CI, etc.):

```yaml
# Example GitHub Actions workflow
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          pip install -r requirements.txt
          alembic upgrade head

      - name: Deploy application
        # Your deployment steps here
        run: |
          # Docker build, push, deploy
          echo "Deploying..."
```

## Maintenance Windows

For major updates or risky migrations:

1. Schedule maintenance window (announce to users)
2. Enable maintenance mode (return 503 for all requests)
3. Create backup
4. Apply migrations
5. Deploy new code
6. Run verification tests
7. Disable maintenance mode
8. Monitor for issues

## Emergency Contacts

- **DevOps Lead**: [Contact info]
- **Database Admin**: [Contact info]
- **On-call Engineer**: [Contact info]

## References

- [MIGRATIONS.md](./MIGRATIONS.md) - Database migration guide
- [README.md](./README.md) - Development guide
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Gunicorn Documentation](https://docs.gunicorn.org/)
