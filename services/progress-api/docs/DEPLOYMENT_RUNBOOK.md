# Progress API - Deployment Runbook

Quick reference guide for deploying progress-api to dev, staging, and production.

## Quick Links

- [Pre-Deployment](#pre-deployment)
- [Deploy to Dev](#deploy-to-dev)
- [Deploy to Staging](#deploy-to-staging)
- [Deploy to Production](#deploy-to-production)
- [Rollback](#rollback)
- [Troubleshooting](#troubleshooting)

---

## Pre-Deployment

### Checklist

```bash
# 1. Run tests
cd /Users/michel.epe/Development/poc/hoolgg/services/progress-api
pytest tests/ --cov=app --cov-fail-under=80

# 2. Verify migrations
alembic current
alembic check

# 3. Build Docker image
docker build -t progress-api:latest .

# 4. Test locally
docker-compose up -d
curl http://localhost:5001/health
```

### Required Environment Variables

Ensure these are set in deployment environment:

```bash
# Core
SECRET_KEY=<random-secret-key>
DATABASE_URL=postgresql://<user>:<pass>@<host>:5432/<db>
REDIS_URL=redis://<host>:6379
JWT_SECRET_KEY=<must-match-guild-api>

# APIs
BLIZZARD_CLIENT_ID=<your-id>
BLIZZARD_CLIENT_SECRET=<your-secret>
WARCRAFTLOGS_CLIENT_ID=<your-id>
WARCRAFTLOGS_CLIENT_SECRET=<your-secret>

# Integration
GUILD_API_URL=<guild-api-url>
CORS_ORIGINS=<frontend-url>
```

---

## Deploy to Dev

### 1. Build and Push Image

```bash
# Build
cd services/progress-api
docker build -t progress-api:dev-$(date +%Y%m%d-%H%M%S) .

# Tag as latest
docker tag progress-api:dev-$(date +%Y%m%d-%H%M%S) progress-api:dev-latest

# Push to registry (if using)
docker push progress-api:dev-latest
```

### 2. Run Migrations

```bash
# Set database URL for dev
export DATABASE_URL=postgresql://hool:hool@dev.hool.gg:5432/hoolgg

# Run migrations
alembic upgrade head

# Seed weekly targets (first time only)
python scripts/seed_weekly_targets.py
```

### 3. Deploy Service

**Option A: Coolify (Recommended)**

1. Log into Coolify dashboard
2. Navigate to progress-api service
3. Set environment variables (if not already set)
4. Click "Deploy"
5. Monitor deployment logs

**Option B: Manual Docker**

```bash
# SSH to server
ssh user@dev.hool.gg

# Pull latest image
docker pull progress-api:dev-latest

# Stop old container
docker stop progress-api
docker rm progress-api

# Run new container
docker run -d \
  --name progress-api \
  --network hool-network \
  -p 5001:5001 \
  --env-file /path/to/progress-api.env \
  progress-api:dev-latest

# Verify
docker logs -f progress-api
```

### 4. Verify Deployment

```bash
# Health check
curl https://progress-api.dev.hool.gg/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "progress-api",
#   "database": "connected",
#   "redis": "connected"
# }

# Test permission integration
curl -X GET https://progress-api.dev.hool.gg/guilds/1/progress/characters \
  -H "Cookie: access_token=<valid-jwt-from-guild-api>"
```

### 5. Manual Testing

Use the [Manual Testing Checklist](MANUAL_TESTING_CHECKLIST.md) to verify all scenarios.

---

## Deploy to Staging

### 1. Merge to Staging Branch

```bash
git checkout develop
git pull origin develop
git checkout staging
git merge develop
git push origin staging
```

### 2. CI/CD Auto-Deploy

GitHub Actions automatically:
- Runs tests
- Builds Docker image
- Deploys to staging.hool.gg

Monitor: https://github.com/your-org/hoolgg/actions

### 3. Run Migrations

```bash
export DATABASE_URL=postgresql://hool:hool@staging.hool.gg:5432/hoolgg
alembic upgrade head
```

### 4. Verify Deployment

```bash
curl https://progress-api.staging.hool.gg/health
```

### 5. QA Testing

Run full QA test suite (see DEPLOYMENT.md section "QA Testing Checklist")

---

## Deploy to Production

### 1. Create PR: staging → main

```bash
git checkout staging
git pull origin staging
# Open PR from staging to main in GitHub
```

### 2. Code Review

- [ ] At least one approval required
- [ ] All CI tests pass
- [ ] QA sign-off on staging

### 3. Merge and Tag

```bash
git checkout main
git merge staging
git tag v1.0.0
git push origin main
git push origin v1.0.0
```

### 4. Manual Approval in GitHub Actions

1. Navigate to GitHub Actions
2. Find production deployment workflow
3. Click "Approve" to deploy

### 5. Run Migrations

```bash
export DATABASE_URL=postgresql://hool:hool@hool.gg:5432/hoolgg
alembic upgrade head
```

### 6. Verify Deployment

```bash
curl https://progress-api.hool.gg/health
```

### 7. Monitor First 24 Hours

```bash
# Watch logs
docker logs -f progress-api

# Check error rate (should be < 1%)
# Check response time (p95 should be < 500ms)
# Monitor database performance
# Monitor Redis hit rate
```

---

## Rollback

### Application Rollback (Quick)

```bash
# 1. Identify previous stable version
docker images | grep progress-api

# 2. Stop current version
docker stop progress-api
docker rm progress-api

# 3. Run previous version
docker run -d \
  --name progress-api \
  --network hool-network \
  -p 5001:5001 \
  --env-file /path/to/progress-api.env \
  progress-api:v0.9.0

# 4. Verify health check
curl https://progress-api.hool.gg/health
```

### Database Rollback (If Needed)

```bash
# 1. Check current migration
alembic current

# 2. Rollback one migration
alembic downgrade -1

# 3. Verify application works
curl https://progress-api.hool.gg/health
```

### Coolify Rollback

1. Log into Coolify dashboard
2. Navigate to progress-api service
3. Go to "Deployments" tab
4. Click "Rollback" on previous stable deployment
5. Monitor rollback logs

---

## Troubleshooting

### Health Check Fails

```bash
# Check logs
docker logs progress-api

# Common issues:
# - Database connection error → Check DATABASE_URL
# - Redis connection error → Check REDIS_URL
# - Service not running → Check docker ps
```

### Permission Checks Fail (403 errors)

```bash
# Verify guild-api is accessible
curl https://api.dev.hool.gg/health

# Check JWT_SECRET_KEY matches between services
# Verify user has valid character in guild

# Test permission endpoint directly
curl https://api.dev.hool.gg/guilds/1/permissions/check \
  -H "Cookie: access_token=<token>"
```

### Blizzard API Errors

```bash
# Check credentials
echo $BLIZZARD_CLIENT_ID
echo $BLIZZARD_CLIENT_SECRET

# Check rate limits in logs
docker logs progress-api | grep "rate limit"

# Verify Blizzard API status
curl https://us.api.blizzard.com/data/wow/token/?namespace=dynamic-us
```

### Database Migration Fails

```bash
# Check migration status
alembic current

# Check for conflicts
alembic check

# Manually fix if needed
alembic downgrade -1
# Fix migration file
alembic upgrade head

# Verify schema
psql $DATABASE_URL -c "\dt"
```

### Slow Response Times

```bash
# Check Redis cache hit rate
redis-cli info stats | grep keyspace_hits

# Check database query performance
# Look for slow queries in logs

# Increase cache TTL if needed
# Consider optimizing Blizzard API calls
```

---

## Emergency Contacts

- **On-Call Engineer**: [Contact Info]
- **Database Admin**: [Contact Info]
- **Infrastructure**: [Coolify/Hetzner Support]

---

## Deployment History

| Version | Date | Environment | Deployed By | Notes |
|---------|------|-------------|-------------|-------|
| v1.0.0  | 2026-02-17 | Production | - | Initial release |
| v1.0.0  | 2026-02-17 | Staging | - | QA testing |
| v1.0.0  | 2026-02-17 | Dev | - | Development testing |

---

## Post-Deployment Checklist

After deploying to any environment:

- [ ] Health check passes
- [ ] Database migrations applied
- [ ] Permission integration works (guild-api)
- [ ] Blizzard API integration works
- [ ] Redis cache working
- [ ] Manual test scenarios pass (at least smoke tests)
- [ ] Logs show no errors
- [ ] Monitoring/alerts configured
- [ ] Team notified of deployment

---

## Additional Resources

- [Full Deployment Guide](../DEPLOYMENT.md)
- [Manual Testing Checklist](MANUAL_TESTING_CHECKLIST.md)
- [Testing Guide](../TESTING.md)
- [API Specification](../../../openspec/changes/guild-platform-foundation/specs/character-progress-tracking/spec.md)
