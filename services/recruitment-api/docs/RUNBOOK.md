# Recruitment API - Operations Runbook

Quick reference guide for common operational tasks and incident response.

## Quick Links

- **Health Check**: `https://[environment].hool.gg:5001/health`
- **Logs**: `docker logs recruitment-api -f`
- **Metrics**: (TBD - Monitoring dashboard)

## Service Health

### Check Service Status

```bash
# Health endpoint
curl https://dev.hool.gg:5001/health

# Expected response
{"status": "ok", "service": "recruitment-api"}

# Docker status
docker ps | grep recruitment-api

# Service logs
docker logs recruitment-api --tail=100 -f
```

### Key Health Indicators

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Response Time (p95) | < 200ms | 200-500ms | > 500ms |
| Error Rate | < 0.1% | 0.1-1% | > 1% |
| CPU Usage | < 50% | 50-80% | > 80% |
| Memory Usage | < 70% | 70-90% | > 90% |
| Database Connections | < 10 | 10-18 | > 18 |

## Common Operations

### Restart Service

```bash
# Graceful restart (recommended)
docker restart recruitment-api

# Force restart (if hung)
docker stop recruitment-api && docker start recruitment-api

# Full rebuild and restart
docker-compose -f docker-compose.[env].yml up -d --build
```

### View Logs

```bash
# Real-time logs
docker logs recruitment-api -f

# Last 100 lines
docker logs recruitment-api --tail=100

# Filter for errors
docker logs recruitment-api 2>&1 | grep ERROR

# Save logs to file
docker logs recruitment-api > recruitment-api.log 2>&1
```

### Database Operations

#### Check Migration Status

```bash
# Current migration version
docker exec recruitment-api alembic current

# Migration history
docker exec recruitment-api alembic history

# Pending migrations
docker exec recruitment-api alembic heads
```

#### Run Migrations

```bash
# Upgrade to latest
docker exec recruitment-api alembic upgrade head

# Upgrade to specific version
docker exec recruitment-api alembic upgrade [revision]

# Downgrade one version
docker exec recruitment-api alembic downgrade -1
```

#### Database Connection Issues

```bash
# Test database connection
docker exec recruitment-api psql $DATABASE_URL -c "SELECT 1"

# Check active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity WHERE datname='hoolgg'"

# Kill idle connections (careful!)
psql $DATABASE_URL -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='hoolgg' AND state='idle' AND state_change < now() - interval '5 minutes'"
```

### Cache Operations

#### Check Redis Connection

```bash
# Test Redis connection
docker exec recruitment-api redis-cli -u $REDIS_URL ping

# Check Redis info
docker exec redis redis-cli INFO

# Monitor Redis commands
docker exec redis redis-cli MONITOR
```

#### Clear Cache

```bash
# Clear all cache (use with caution)
docker exec redis redis-cli FLUSHDB

# Clear specific pattern (e.g., permission cache)
docker exec redis redis-cli --scan --pattern "permission:*" | xargs docker exec redis redis-cli DEL
```

## Incident Response

### Service Down (500 errors)

**Symptoms:**
- Health check failing
- 500 Internal Server Error
- Container not running

**Diagnosis:**
```bash
# 1. Check if container is running
docker ps | grep recruitment-api

# 2. Check recent logs
docker logs recruitment-api --tail=50

# 3. Check resource usage
docker stats recruitment-api --no-stream
```

**Resolution:**
```bash
# 1. Restart service
docker restart recruitment-api

# 2. If restart fails, check logs for errors
docker logs recruitment-api 2>&1 | grep ERROR

# 3. Verify dependencies
curl $GUILD_API_URL/health
redis-cli -u $REDIS_URL ping
psql $DATABASE_URL -c "SELECT 1"

# 4. If all else fails, redeploy
docker-compose -f docker-compose.[env].yml up -d --force-recreate
```

### Slow Response Times

**Symptoms:**
- Response times > 500ms
- Timeouts
- High CPU or memory usage

**Diagnosis:**
```bash
# 1. Check resource usage
docker stats recruitment-api

# 2. Check active requests
docker logs recruitment-api | grep "request_duration"

# 3. Check database query performance
# (requires database monitoring)

# 4. Check external API latency
docker logs recruitment-api | grep "raider.io\|wowprogress\|warcraftlogs"
```

**Resolution:**
```bash
# 1. Clear cache if stale
docker exec redis redis-cli FLUSHDB

# 2. Restart service
docker restart recruitment-api

# 3. Scale up workers (if resource-bound)
# Edit docker-compose file: GUNICORN_WORKERS=8
docker-compose -f docker-compose.[env].yml up -d

# 4. Check for slow database queries
# (optimize or add indexes)
```

### Permission Check Failures

**Symptoms:**
- 403 Forbidden errors
- "Permission check failed" in logs
- Can't verify guild membership

**Diagnosis:**
```bash
# 1. Check guild-api health
curl $GUILD_API_URL/health

# 2. Test permission endpoint directly
curl "$GUILD_API_URL/guilds/1/permissions/check?bnet_id=12345&tool=recruitment"

# 3. Check logs for connection errors
docker logs recruitment-api | grep "Permission check failed"
```

**Resolution:**
```bash
# 1. Verify guild-api is accessible
curl $GUILD_API_URL/health

# 2. Check network connectivity
docker network inspect hool-[env]

# 3. Verify JWT secret matches
# Check that JWT_SECRET_KEY matches between recruitment-api and guild-api

# 4. Clear permission cache and retry
docker exec redis redis-cli FLUSHDB
```

### External API Failures

**Symptoms:**
- Search returning no results
- "External API error" in logs
- Candidate profiles incomplete

**Diagnosis:**
```bash
# 1. Check external API status
curl https://raider.io/api/v1/
curl https://www.wowprogress.com/

# 2. Check logs for API errors
docker logs recruitment-api | grep "raider.io\|wowprogress"

# 3. Check rate limiting
# (Raider.io has rate limits)
```

**Resolution:**
```bash
# 1. Verify API URLs are correct
echo $RAIDER_IO_API_URL
echo $WOW_PROGRESS_API_URL

# 2. Wait if rate limited (Raider.io: 300 req/min)

# 3. Implement exponential backoff (already in code)

# 4. Fall back to manual candidate entry if APIs down
```

### Database Migration Failures

**Symptoms:**
- Service won't start
- "Migration failed" in logs
- Database schema mismatch

**Diagnosis:**
```bash
# 1. Check current migration state
docker exec recruitment-api alembic current

# 2. Check for conflicts
docker exec recruitment-api alembic history

# 3. Check database logs
docker logs postgres | tail -100
```

**Resolution:**
```bash
# 1. Rollback failed migration
docker exec recruitment-api alembic downgrade -1

# 2. Fix migration script (if error in code)
# Edit alembic/versions/[revision].py

# 3. Re-run migration
docker exec recruitment-api alembic upgrade head

# 4. If migration is corrupted, stamp version manually (last resort)
docker exec recruitment-api alembic stamp head
```

## Deployment Rollback

### Quick Rollback (Docker Image)

```bash
# 1. Stop current container
docker stop recruitment-api

# 2. Find previous image tag
docker images | grep recruitment-api

# 3. Run previous version
docker run -d --name recruitment-api \
  --env-file .env \
  -p 5001:5001 \
  hool/recruitment-api:[previous-tag]

# 4. Verify health
curl http://localhost:5001/health
```

### Database Rollback

```bash
# 1. Identify target migration version
docker exec recruitment-api alembic history

# 2. Downgrade to specific version
docker exec recruitment-api alembic downgrade [revision]

# 3. Verify schema
docker exec recruitment-api alembic current
```

### Full Rollback (Git + Redeploy)

```bash
# 1. Checkout previous working commit
git log --oneline  # find last working commit
git checkout [commit-hash]

# 2. Rebuild and redeploy
docker-compose -f docker-compose.[env].yml build
docker-compose -f docker-compose.[env].yml up -d

# 3. Verify deployment
curl http://localhost:5001/health
```

## Monitoring & Alerts

### Check Error Rate

```bash
# Last hour error count
docker logs recruitment-api --since 1h 2>&1 | grep ERROR | wc -l

# Group errors by type
docker logs recruitment-api 2>&1 | grep ERROR | cut -d: -f3 | sort | uniq -c | sort -rn
```

### Check Request Volume

```bash
# Request count (last hour)
docker logs recruitment-api --since 1h | grep "request_path" | wc -l

# Requests by endpoint
docker logs recruitment-api | grep "request_path" | awk '{print $5}' | sort | uniq -c | sort -rn
```

### Database Connection Pool

```bash
# Active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity WHERE datname='hoolgg' AND application_name='recruitment-api'"

# Long-running queries
psql $DATABASE_URL -c "SELECT pid, now() - query_start as duration, query FROM pg_stat_activity WHERE state='active' AND now() - query_start > interval '5 seconds'"
```

## Security

### Rotate JWT Secret

```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -hex 32)

# 2. Update environment variable
# Edit .env or update in Coolify

# 3. Redeploy service
docker-compose -f docker-compose.[env].yml up -d

# 4. Coordinate with guild-api (must match)
```

### Check for Unauthorized Access

```bash
# 401 errors (missing auth)
docker logs recruitment-api | grep "401" | wc -l

# 403 errors (insufficient permissions)
docker logs recruitment-api | grep "403" | wc -l

# Failed permission checks
docker logs recruitment-api | grep "Permission check failed"
```

## Performance Tuning

### Increase Worker Count

```bash
# Edit docker-compose file
vim docker-compose.[env].yml

# Change GUNICORN_WORKERS
GUNICORN_WORKERS=8  # (2-4x CPU cores)

# Redeploy
docker-compose -f docker-compose.[env].yml up -d
```

### Database Query Optimization

```bash
# Find slow queries
psql $DATABASE_URL -c "SELECT query, mean_exec_time, calls FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10"

# Analyze query plan
psql $DATABASE_URL -c "EXPLAIN ANALYZE SELECT * FROM recruitment_candidates WHERE guild_id = 1"
```

### Cache Hit Rate

```bash
# Redis stats
docker exec redis redis-cli INFO stats | grep hit

# Cache hit ratio (should be > 80%)
```

## Contacts

**On-Call Engineer:** [Your contact info]
**Database Admin:** [DBA contact]
**Infrastructure Team:** [Infra contact]

## External Resources

- Raider.io API Status: https://raider.io/api
- WoW Progress: https://www.wowprogress.com/
- WarcraftLogs: https://www.warcraftlogs.com/

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-02-17 | Initial runbook created | Claude |
