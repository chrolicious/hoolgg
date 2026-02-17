# Progress API - Deployment Guide

This guide covers deployment of the progress-api service to dev, staging, and production environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Deployment to Dev](#deployment-to-dev)
4. [Manual Testing Checklist](#manual-testing-checklist)
5. [Deployment to Staging](#deployment-to-staging)
6. [QA Testing Checklist](#qa-testing-checklist)
7. [Deployment to Production](#deployment-to-production)
8. [Rollback Procedure](#rollback-procedure)
9. [Monitoring & Health Checks](#monitoring--health-checks)

---

## Pre-Deployment Checklist

Before deploying to any environment, ensure:

- [ ] All unit tests pass: `pytest tests/`
- [ ] Integration tests pass: `pytest tests/test_integration.py`
- [ ] Code coverage is >= 80%: `pytest --cov=app tests/`
- [ ] Database migrations are created and tested
- [ ] Environment variables are configured in deployment environment
- [ ] Docker image builds successfully: `docker build -t progress-api .`
- [ ] Guild-api is running and accessible (for permission checks)
- [ ] Redis is running and accessible (for caching)
- [ ] PostgreSQL is running with correct schema

---

## Environment Setup

### Required Environment Variables

All environments require these environment variables:

```bash
# Flask Configuration
SECRET_KEY=<random-secret-key>
DEBUG=False
PORT=5001

# Database
DATABASE_URL=postgresql://<user>:<pass>@<host>:<port>/<db>

# Redis Cache
REDIS_URL=redis://<host>:<port>

# JWT Configuration (MUST match guild-api)
JWT_SECRET_KEY=<same-as-guild-api>
JWT_ACCESS_TOKEN_EXPIRES=900
JWT_REFRESH_TOKEN_EXPIRES=604800

# Blizzard API
BLIZZARD_CLIENT_ID=<your-client-id>
BLIZZARD_CLIENT_SECRET=<your-client-secret>
BLIZZARD_REGION=us

# WarcraftLogs API
WARCRAFTLOGS_CLIENT_ID=<your-wcl-client-id>
WARCRAFTLOGS_CLIENT_SECRET=<your-wcl-client-secret>

# Guild API URL (for permission checks)
GUILD_API_URL=http://guild-api:5000  # or https://api.dev.hool.gg for deployed envs

# CORS
CORS_ORIGINS=http://localhost:3000  # or https://dev.hool.gg for deployed envs

# Cache TTL (seconds)
CHARACTER_CACHE_TTL=3600
BLIZZARD_API_TIMEOUT=10
```

### Environment-Specific Configurations

**Development (dev.hool.gg):**
- `DEBUG=False`
- `GUILD_API_URL=https://api.dev.hool.gg`
- `CORS_ORIGINS=https://dev.hool.gg`

**Staging (staging.hool.gg):**
- `DEBUG=False`
- `GUILD_API_URL=https://api.staging.hool.gg`
- `CORS_ORIGINS=https://staging.hool.gg`

**Production (hool.gg):**
- `DEBUG=False`
- `GUILD_API_URL=https://api.hool.gg`
- `CORS_ORIGINS=https://hool.gg`

---

## Deployment to Dev

### Steps

1. **Build Docker Image**
   ```bash
   cd services/progress-api
   docker build -t progress-api:dev .
   ```

2. **Run Database Migrations**
   ```bash
   # Connect to dev database
   export DATABASE_URL=postgresql://hool:hool@dev.hool.gg:5432/hoolgg

   # Run migrations
   alembic upgrade head
   ```

3. **Seed Weekly Targets** (first time only)
   ```bash
   python scripts/seed_weekly_targets.py
   ```

4. **Deploy to Coolify/Docker**
   - Push image to registry or use Coolify Git deployment
   - Set environment variables in Coolify dashboard
   - Deploy service on port 5001
   - Configure reverse proxy (Traefik) for `https://progress-api.dev.hool.gg`

5. **Verify Health Check**
   ```bash
   curl https://progress-api.dev.hool.gg/health
   ```

   Expected response:
   ```json
   {
     "status": "healthy",
     "service": "progress-api",
     "database": "connected",
     "redis": "connected",
     "timestamp": "2026-02-17T..."
   }
   ```

6. **Verify Guild API Integration**
   ```bash
   # Test permission check (requires valid JWT token from guild-api)
   curl -X GET https://progress-api.dev.hool.gg/guilds/1/progress/characters \
     -H "Cookie: access_token=<valid-jwt-token>"
   ```

---

## Manual Testing Checklist

Test all API scenarios from the spec on dev environment:

### Authentication & Authorization

- [ ] **Scenario: User views their character progress**
  - Login via guild-api OAuth flow
  - Navigate to `/guilds/{guild_id}/progress/characters`
  - Verify characters are displayed with current iLvl, target, and progress

- [ ] **Scenario: Unauthorized user is denied**
  - Attempt to access `/guilds/{guild_id}/progress/characters` without token
  - Verify 401 Unauthorized response
  - Attempt with token but no permission
  - Verify 403 Forbidden response

### Character Progress Tracking

- [ ] **Scenario: Character progression is fetched from Blizzard**
  - View `/guilds/{guild_id}/progress/character/{character_name}?realm=area-52`
  - Verify Blizzard API is queried (check logs)
  - Verify iLvl is calculated from equipped items
  - Verify progress is compared to weekly target

- [ ] **Scenario: User can see multi-alt progress**
  - User with multiple alts views progress
  - Verify all alts in the guild are shown
  - Verify alts in other guilds are NOT shown

- [ ] **Scenario: Data is cached**
  - View character progress twice
  - Verify second request uses cached data (check logs/Redis)
  - Wait for cache expiry (1 hour) and verify refresh

### Weekly Targets

- [ ] **Scenario: User sees progress against target**
  - View character with iLvl < target (e.g., 260 vs 265)
  - Verify message: "5 iLvl behind. Target: 265, Current: 260"

- [ ] **Scenario: User ahead of target sees encouragement**
  - View character with iLvl > target (e.g., 285 vs 265)
  - Verify message: "Ahead of schedule! Target: 265, Current: 285"

### Gear Priorities

- [ ] **Scenario: System identifies lowest iLvl slots**
  - View character details
  - Verify gear_priorities list shows lowest iLvl slots first

### Guild Progress Overview (Officer+)

- [ ] **Scenario: Officer views guild progress**
  - Login as Officer or GM
  - Navigate to `/guilds/{guild_id}/progress/members`
  - Verify table shows all guild members with status (On Track / Behind)

- [ ] **Scenario: Sorting and filtering**
  - Sort by iLvl: `/guilds/{guild_id}/progress/members?sort=ilvl`
  - Filter by class: `?class=Warrior`
  - Filter by role: `?role=Tank`
  - Filter by status: `?status=behind`

- [ ] **Scenario: Member cannot access guild overview**
  - Login as regular member (rank > 1)
  - Attempt to access `/guilds/{guild_id}/progress/members`
  - Verify 403 Forbidden response

### Weekly Guidance (GM Only)

- [ ] **Scenario: GM writes weekly guidance**
  - Login as GM
  - PUT `/guilds/{guild_id}/progress/message` with `{"message": "Focus on DPS!"}`
  - Verify 200 response

- [ ] **Scenario: All guild members see guidance**
  - Login as member
  - GET `/guilds/{guild_id}/progress/message`
  - Verify message is displayed

- [ ] **Scenario: Non-GM cannot set message**
  - Login as non-GM
  - Attempt PUT `/guilds/{guild_id}/progress/message`
  - Verify 403 Forbidden response

### Expansion Roadmap

- [ ] **Scenario: Roadmap shows milestones**
  - GET `/guilds/{guild_id}/progress/roadmap`
  - Verify all weekly targets are returned

### WarcraftLogs Comparison

- [ ] **Scenario: Guild can compare to realm rankings**
  - GET `/guilds/{guild_id}/progress/comparisons?guild_name=Test&realm=area-52&region=us`
  - Verify comparison data is returned (or mock is working)

### Error Handling

- [ ] **Scenario: Blizzard API is slow/down**
  - Simulate Blizzard API failure
  - Verify cached data is used (if available)
  - Verify appropriate error message is returned

- [ ] **Scenario: Invalid character name**
  - Request character that doesn't exist
  - Verify 404 response

---

## Deployment to Staging

After successful testing on dev:

1. **Merge to staging branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout staging
   git merge develop
   git push origin staging
   ```

2. **CI/CD Auto-Deploy**
   - GitHub Actions automatically deploys to staging.hool.gg
   - Monitor deployment logs

3. **Run Migrations on Staging DB**
   ```bash
   export DATABASE_URL=postgresql://hool:hool@staging.hool.gg:5432/hoolgg
   alembic upgrade head
   ```

4. **Verify Health Check**
   ```bash
   curl https://progress-api.staging.hool.gg/health
   ```

---

## QA Testing Checklist

Run full QA suite on staging environment:

### API-Level Testing

- [ ] All scenarios from Manual Testing Checklist (above)
- [ ] Performance testing: measure response times (target: <500ms p95)
- [ ] Load testing: simulate multiple concurrent users
- [ ] Integration with guild-api: verify permission flow end-to-end
- [ ] Integration with Blizzard API: verify character data fetching
- [ ] Integration with WarcraftLogs API: verify comparison data

### Edge Cases

- [ ] User with no characters in guild
- [ ] Character leaves guild (rank sync, access revoked)
- [ ] Character demoted (permission changes)
- [ ] Database connection failure (graceful degradation)
- [ ] Redis connection failure (fallback behavior)
- [ ] Guild API unavailable (permission check fails gracefully)

### Security

- [ ] Verify JWT tokens are validated
- [ ] Verify HTTPS is enforced
- [ ] Verify CORS is properly configured
- [ ] Verify rate limiting is in place (if configured)
- [ ] Verify sensitive data is not logged

---

## Deployment to Production

After successful QA on staging:

1. **Create PR: staging → main**
   ```bash
   git checkout staging
   git pull origin staging
   # Open PR from staging to main
   ```

2. **Code Review & Approval**
   - Require at least one approval
   - Verify all tests pass in CI/CD

3. **Manual Approval in GitHub Actions**
   - GitHub Actions workflow requires manual approval for production deploy

4. **Run Migrations on Production DB**
   ```bash
   export DATABASE_URL=postgresql://hool:hool@hool.gg:5432/hoolgg
   alembic upgrade head
   ```

5. **Deploy**
   - Approve GitHub Actions deployment
   - Monitor deployment logs
   - Verify health check: `curl https://progress-api.hool.gg/health`

6. **Tag Release**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

7. **Monitor First 24 Hours**
   - Watch error rates (target: <1%)
   - Watch response times (target: <500ms p95)
   - Monitor database performance
   - Monitor Redis hit rate

---

## Rollback Procedure

If critical issues are discovered in production:

### Immediate Rollback (Application)

1. **Revert to Previous Docker Image**
   ```bash
   # In Coolify or Docker
   docker pull progress-api:v0.9.0  # previous stable version
   docker stop progress-api
   docker run -d --name progress-api progress-api:v0.9.0
   ```

2. **Verify Health Check**
   ```bash
   curl https://progress-api.hool.gg/health
   ```

### Database Rollback (if needed)

1. **Identify Migration to Rollback**
   ```bash
   alembic current
   ```

2. **Rollback to Previous Migration**
   ```bash
   alembic downgrade -1
   ```

3. **Verify Application Works**

### Post-Rollback

- [ ] Notify team of rollback
- [ ] Create incident report
- [ ] Fix issue in develop branch
- [ ] Re-test in dev/staging before re-deploying

---

## Monitoring & Health Checks

### Health Check Endpoint

`GET /health`

Returns:
```json
{
  "status": "healthy",
  "service": "progress-api",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2026-02-17T12:00:00Z"
}
```

### Key Metrics to Monitor

1. **Response Time**
   - Target: <500ms p95
   - Alert if p95 > 1000ms

2. **Error Rate**
   - Target: <1%
   - Alert if error rate > 5%

3. **Database Connections**
   - Monitor active connections
   - Alert if connection pool exhausted

4. **Redis Hit Rate**
   - Target: >80% hit rate for character data
   - Monitor cache effectiveness

5. **Blizzard API Rate Limits**
   - Monitor rate limit headers
   - Alert if approaching limits

### Logs to Monitor

- Authentication failures (401/403 errors)
- Blizzard API errors
- Database errors
- Permission check failures (guild-api integration)

### Alerting

Configure alerts for:
- Service downtime (health check fails)
- High error rate (>5%)
- Slow response times (p95 >1000ms)
- Database connection failures
- Redis connection failures

---

## Troubleshooting

### Common Issues

**Issue: Permission checks fail (403 errors)**
- Verify GUILD_API_URL is correct
- Verify guild-api is running and accessible
- Check JWT_SECRET_KEY matches between services
- Check user has valid character in guild with sufficient rank

**Issue: Character data not fetching**
- Verify Blizzard API credentials are correct
- Check Blizzard API rate limits
- Verify character name and realm are correct
- Check Blizzard API service status

**Issue: Slow response times**
- Check Redis cache hit rate
- Verify database query performance
- Check Blizzard API response times
- Consider increasing cache TTL

**Issue: Database connection errors**
- Verify DATABASE_URL is correct
- Check database is running and accessible
- Check connection pool settings
- Verify database migrations are up to date

---

## Support Contacts

- **Guild API Issues**: Check guild-api service logs and health
- **Blizzard API Issues**: https://develop.battle.net/
- **WarcraftLogs API Issues**: https://www.warcraftlogs.com/api/docs
- **Infrastructure Issues**: Check Coolify/Hetzner status

---

## Version History

- **v1.0.0** - Initial release (Progress tracking, weekly targets, GM messages, WCL comparisons)
