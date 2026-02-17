# Recruitment API - Phase 2 Deployment Guide

Quick start guide for deploying recruitment-api to dev, staging, and production environments.

## Files Created

This deployment package includes:

1. **Integration Tests** (`tests/test_integration.py`)
   - Full candidate lifecycle tests
   - Permission integration tests with guild-api
   - External API integration tests
   - Comprehensive test coverage for all spec scenarios

2. **Docker Configuration**
   - `Dockerfile` - Multi-stage production build
   - `docker-compose.yml` - Local development
   - `docker-compose.dev.yml` - Dev environment
   - `docker-compose.staging.yml` - Staging environment
   - `docker-compose.prod.yml` - Production environment

3. **Documentation**
   - `docs/DEPLOYMENT.md` - Detailed deployment instructions
   - `docs/TESTING_CHECKLIST.md` - Manual testing checklist (50+ tests)
   - `docs/RUNBOOK.md` - Operations runbook for incident response
   - `docs/API.md` - API endpoint documentation

## Pre-Deployment Checklist

Before deploying to any environment:

- [ ] All unit tests passing (`pytest`)
- [ ] All integration tests passing (`pytest tests/test_integration.py`)
- [ ] Code reviewed and merged to appropriate branch
- [ ] Environment variables configured
- [ ] Database backup created (staging/prod only)
- [ ] Guild-api is running and healthy
- [ ] Redis is running and healthy

## Quick Deploy Commands

### Local Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f recruitment-api

# Run tests
docker-compose exec recruitment-api pytest

# Stop all services
docker-compose down
```

### Dev Environment (dev.hool.gg)

```bash
# Build and deploy
docker-compose -f docker-compose.dev.yml up -d --build

# Check health
curl https://dev.hool.gg:5001/health

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Run manual tests (see docs/TESTING_CHECKLIST.md)
```

### Staging Environment (staging.hool.gg)

```bash
# Set environment variables
export DATABASE_URL="postgresql://..."
export REDIS_URL="redis://..."
export GUILD_API_URL="https://staging.hool.gg:5000"
export JWT_SECRET_KEY="..."
export SECRET_KEY="..."

# Build and deploy
docker-compose -f docker-compose.staging.yml up -d --build

# Check health
curl https://staging.hool.gg:5001/health

# Verify migrations
docker exec recruitment-api-staging alembic current

# Run QA tests (see docs/TESTING_CHECKLIST.md)
```

### Production Environment (hool.gg)

**IMPORTANT:** Production deployments should go through Coolify or your CI/CD pipeline.

Manual deployment (emergency only):

```bash
# Set environment variables
export DATABASE_URL="postgresql://..."
export REDIS_URL="redis://..."
export GUILD_API_URL="https://api.hool.gg:5000"
export JWT_SECRET_KEY="..."
export SECRET_KEY="..."

# Build and deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Check health
curl https://hool.gg:5001/health

# Monitor logs for first hour
docker logs recruitment-api-prod -f
```

## Manual Testing

Use the comprehensive testing checklist at `docs/TESTING_CHECKLIST.md`:

**Key Test Categories:**
1. Health Check
2. Authentication & Authorization (3 tests)
3. Candidate Search (2 tests)
4. Candidate Management (6 tests)
5. Contact Tracking (2 tests)
6. Pipeline Management (4 tests)
7. Candidate Comparison (1 test)
8. Raid Composition (1 test)
9. Filtering and Sorting (6 tests)
10. Guild Isolation (2 tests)
11. External API Integration (3 tests)
12. Error Handling (4 tests)
13. Performance & Rate Limiting (2 tests)
14. Database Migrations (2 tests)

**Total: 50+ manual tests**

### Example Test Run

```bash
# Set up environment
export API_URL="https://dev.hool.gg:5001"
export GUILD_ID="1"
export ACCESS_TOKEN="your-jwt-token"

# Test 1: Health Check
curl $API_URL/health
# Expected: {"status": "ok", "service": "recruitment-api"}

# Test 2: List Candidates
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates
# Expected: 200 OK, JSON array

# Test 3: Add Candidate
curl -X POST -H "Cookie: access_token=$ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"candidate_name": "TestWarrior", "character_class": "Warrior", "role": "Tank", "ilvl": 295, "source": "manual"}' \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates
# Expected: 201 Created, candidate ID returned

# ... continue with all tests from checklist
```

## Deployment Flow (Git Flow)

### To Dev (Auto-Deploy)

```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/deployment-phase2

# Commit changes
git add .
git commit -m "feat: add Phase 2 deployment artifacts for recruitment-api"

# Push and merge to develop
git push origin feature/deployment-phase2
# Create PR to develop
# Auto-deploys to dev.hool.gg after merge
```

### To Staging

```bash
# After testing on dev
git checkout staging
git pull origin staging
git merge develop

# Push to staging
git push origin staging
# Auto-deploys to staging.hool.gg
```

### To Production

```bash
# After QA on staging
git checkout main
git pull origin main
git merge staging

# Tag release
git tag -a v1.1.0 -m "Release: Recruitment API v1.1.0"
git push origin main --tags
# Requires manual approval in Coolify
# Deploys to hool.gg
```

## Rollback Procedure

If deployment fails or issues arise:

### Quick Rollback (Docker)

```bash
# Stop current container
docker stop recruitment-api-[env]

# Run previous image version
docker run -d --name recruitment-api-[env] \
  --env-file .env \
  -p 5001:5001 \
  hool/recruitment-api:[previous-tag]
```

### Database Rollback

```bash
# Rollback last migration
docker exec recruitment-api-[env] alembic downgrade -1

# Verify
docker exec recruitment-api-[env] alembic current
```

### Full Rollback (Git)

```bash
# Revert to previous working commit
git revert [bad-commit]
git push origin [branch]

# Or hard reset (if safe)
git reset --hard [previous-commit]
git push origin [branch] --force
```

## Monitoring

After deployment, monitor these metrics:

### Immediate (First 5 Minutes)
- [ ] Health check responding
- [ ] No ERROR logs
- [ ] Database connected
- [ ] Redis connected
- [ ] Guild-api communication working

### Short Term (First Hour)
- [ ] No 5xx errors
- [ ] Response times < 500ms (p95)
- [ ] Memory usage stable
- [ ] CPU usage normal

### Long Term (First 24 Hours)
- [ ] Error rate < 1%
- [ ] No memory leaks
- [ ] No unusual log patterns
- [ ] All integrations working

## Common Issues

### Issue: Service won't start

```bash
# Check logs
docker logs recruitment-api-[env]

# Common causes:
# 1. Database not accessible
psql $DATABASE_URL -c "SELECT 1"

# 2. Redis not accessible
redis-cli -u $REDIS_URL ping

# 3. Migration failed
docker exec recruitment-api-[env] alembic current
```

### Issue: Permission checks failing

```bash
# Verify guild-api is accessible
curl $GUILD_API_URL/health

# Verify JWT secret matches
# Check JWT_SECRET_KEY in both services

# Clear permission cache
docker exec redis redis-cli FLUSHDB
```

### Issue: External APIs timing out

```bash
# Check API status
curl https://raider.io/api/v1/

# Check logs for rate limiting
docker logs recruitment-api-[env] | grep "rate limit"

# Increase timeout (if needed)
# Edit GUNICORN_TIMEOUT in docker-compose
```

## Support

For detailed troubleshooting, see:
- **Operations Runbook**: `docs/RUNBOOK.md`
- **Deployment Guide**: `docs/DEPLOYMENT.md`
- **API Documentation**: `docs/API.md`

## Next Steps After Deployment

1. **Complete Manual Testing** (Task 2.27 / 2.29)
   - Use `docs/TESTING_CHECKLIST.md`
   - Test all 50+ scenarios
   - Document any issues found

2. **Fix Any Issues**
   - Create tickets for bugs
   - Prioritize critical fixes
   - Re-test after fixes

3. **Promote to Next Environment**
   - Dev → Staging → Production
   - Follow Git Flow process
   - Monitor each deployment

4. **Phase 3: Frontend Development**
   - Begin building UI components
   - Integrate with recruitment-api
   - End-to-end testing

## Summary

**Phase 2 Deployment Artifacts Complete:**
- [x] Integration tests with guild-api permission flow
- [x] Docker configuration for all environments
- [x] Comprehensive deployment documentation
- [x] Manual testing checklist (50+ tests)
- [x] Operations runbook for incident response
- [x] Environment-specific docker-compose files

**Ready for:**
- [ ] Deploy to dev.hool.gg (Task 2.26)
- [ ] Manual testing on dev (Task 2.27)
- [ ] Deploy to staging.hool.gg (Task 2.28)
- [ ] QA testing on staging (Task 2.29)
- [ ] Promote to production (Task 2.30)

**Note:** Do NOT actually deploy to servers yet. This package provides all necessary configuration and documentation for deployment when ready.
