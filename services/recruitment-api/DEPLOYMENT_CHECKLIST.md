# Recruitment API - Deployment Checklist

Use this checklist when actually deploying to environments. This is a quick reference extracted from the comprehensive deployment documentation.

---

## Pre-Deployment Checklist

### Code Quality ✅
- [ ] All unit tests passing (`pytest`)
- [ ] All integration tests passing (`pytest tests/test_integration.py`)
- [ ] Code reviewed and approved
- [ ] No critical security vulnerabilities
- [ ] All linters passing

### Environment Setup
- [ ] PostgreSQL database accessible
- [ ] Redis instance running
- [ ] Guild-api deployed and healthy
- [ ] Environment variables configured
- [ ] Secrets stored securely (not in code)
- [ ] Database backup created (staging/prod only)

### Documentation Review
- [ ] Read `docs/DEPLOYMENT.md`
- [ ] Review `docs/TESTING_CHECKLIST.md`
- [ ] Review `docs/RUNBOOK.md`
- [ ] Understand rollback procedures

---

## Task 2.26: Deploy to dev.hool.gg

### Prerequisites
- [ ] Dev database accessible: `psql $DATABASE_URL -c "SELECT 1"`
- [ ] Dev Redis accessible: `redis-cli -u $REDIS_URL ping`
- [ ] Guild-api running: `curl $GUILD_API_URL/health`
- [ ] Code merged to `develop` branch

### Environment Variables (Dev)
```bash
export FLASK_ENV=development
export DATABASE_URL=postgresql://hool:hool@postgres:5432/hoolgg_dev
export REDIS_URL=redis://redis:6379
export GUILD_API_URL=http://guild-api:5000
export JWT_SECRET_KEY=<same-as-guild-api>
export SECRET_KEY=<flask-secret>
export CORS_ORIGINS=http://localhost:3000,https://dev.hool.gg
export LOG_LEVEL=DEBUG
```

### Deployment Steps
1. [ ] Navigate to recruitment-api directory
   ```bash
   cd /Users/michel.epe/Development/poc/hoolgg/services/recruitment-api
   ```

2. [ ] Build Docker image
   ```bash
   docker-compose -f docker-compose.dev.yml build
   ```

3. [ ] Start services
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. [ ] Check container status
   ```bash
   docker ps | grep recruitment-api
   ```

5. [ ] View logs (watch for errors)
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f recruitment-api
   ```

6. [ ] Verify health check
   ```bash
   curl https://dev.hool.gg:5001/health
   # Expected: {"status": "ok", "service": "recruitment-api"}
   ```

7. [ ] Verify database migrations
   ```bash
   docker exec recruitment-api-dev alembic current
   # Should show current migration version
   ```

8. [ ] Check database tables exist
   ```bash
   docker exec recruitment-api-dev psql $DATABASE_URL -c "\dt recruitment_*"
   # Expected: recruitment_candidates, recruitment_categories, recruitment_history
   ```

### Post-Deployment Verification
- [ ] Health endpoint returns 200 OK
- [ ] No ERROR logs in output
- [ ] Database tables created
- [ ] Migrations completed successfully
- [ ] Guild-api communication working
- [ ] Service responding to requests

### If Deployment Fails
See `docs/RUNBOOK.md` section: "Service Down (500 errors)"

**Quick Rollback:**
```bash
docker-compose -f docker-compose.dev.yml down
# Fix issues, then redeploy
```

---

## Task 2.27: Manual Testing on Dev

### Setup
1. [ ] Get test user JWT token from guild-api
   ```bash
   # Login via guild-api and extract access_token cookie
   export ACCESS_TOKEN="<jwt-token>"
   export API_URL="https://dev.hool.gg:5001"
   export GUILD_ID="1"
   ```

2. [ ] Open testing checklist
   ```bash
   # Use: docs/TESTING_CHECKLIST.md
   ```

### Test Execution
- [ ] **Health Check** (1 test)
- [ ] **Authentication & Authorization** (3 tests)
- [ ] **Candidate Search** (2 tests)
- [ ] **Candidate Management** (6 tests)
- [ ] **Contact Tracking** (2 tests)
- [ ] **Pipeline Management** (4 tests)
- [ ] **Candidate Comparison** (1 test)
- [ ] **Raid Composition** (1 test)
- [ ] **Filtering & Sorting** (6 tests)
- [ ] **Guild Isolation** (2 tests)
- [ ] **External API Integration** (3 tests)
- [ ] **Error Handling** (4 tests)
- [ ] **Performance** (2 tests)
- [ ] **Database Migrations** (2 tests)

### Test Summary
- **Total Tests:** 50+
- **Passed:** _____
- **Failed:** _____
- **Blocked:** _____

### Issue Tracking
For any failures:
1. [ ] Document issue in testing checklist
2. [ ] Create ticket with details
3. [ ] Prioritize (Critical/High/Medium/Low)
4. [ ] Fix critical issues before staging

### Sign-Off
- [ ] All critical tests passed
- [ ] All blocking issues resolved
- [ ] Performance meets requirements (p95 < 500ms)
- [ ] Ready for staging deployment

**Tester:** ________________________
**Date:** __________________________

---

## Task 2.28: Deploy to staging.hool.gg

### Prerequisites
- [ ] All dev tests passed
- [ ] Critical issues resolved
- [ ] Code merged to `staging` branch
- [ ] Staging database backup created

### Environment Variables (Staging)
```bash
export FLASK_ENV=production
export DATABASE_URL=postgresql://<staging-db>
export REDIS_URL=redis://<staging-redis>
export GUILD_API_URL=https://staging.hool.gg:5000
export JWT_SECRET_KEY=<same-as-guild-api>
export SECRET_KEY=<production-secret>
export CORS_ORIGINS=https://staging.hool.gg
export LOG_LEVEL=INFO
export GUNICORN_WORKERS=4
export GUNICORN_TIMEOUT=120
```

### Deployment Steps
1. [ ] Navigate to recruitment-api directory
   ```bash
   cd /Users/michel.epe/Development/poc/hoolgg/services/recruitment-api
   ```

2. [ ] Build Docker image
   ```bash
   docker-compose -f docker-compose.staging.yml build
   ```

3. [ ] Start service
   ```bash
   docker-compose -f docker-compose.staging.yml up -d
   ```

4. [ ] Monitor logs during startup
   ```bash
   docker-compose -f docker-compose.staging.yml logs -f
   ```

5. [ ] Verify health check
   ```bash
   curl https://staging.hool.gg:5001/health
   ```

6. [ ] Verify migrations
   ```bash
   docker exec recruitment-api-staging alembic current
   ```

7. [ ] Run smoke tests
   ```bash
   # Quick test of key endpoints
   curl -H "Cookie: access_token=$TOKEN" \
     https://staging.hool.gg:5001/guilds/1/recruitment/candidates
   ```

### Post-Deployment Verification
- [ ] Health endpoint returns 200 OK
- [ ] No ERROR logs
- [ ] Database migrations completed
- [ ] Smoke tests passed
- [ ] Response times acceptable

---

## Task 2.29: QA Testing on Staging

### QA Team Setup
- [ ] QA team has access to staging environment
- [ ] Test users created with various ranks
- [ ] Testing data prepared
- [ ] Testing checklist provided to QA team

### QA Test Execution
- [ ] Re-run all 50+ tests from `docs/TESTING_CHECKLIST.md`
- [ ] Test with realistic data volumes
- [ ] Performance testing (load, stress)
- [ ] Security testing (auth, permissions, SQL injection)
- [ ] Cross-browser testing (if applicable)
- [ ] Accessibility testing

### Performance Benchmarks
- [ ] Response time p95 < 500ms
- [ ] Response time p99 < 1000ms
- [ ] Error rate < 1%
- [ ] Successful auth rate > 99%
- [ ] Database query time < 100ms (p95)

### QA Sign-Off
- [ ] All tests executed
- [ ] All critical bugs fixed
- [ ] All high-priority bugs fixed or documented
- [ ] Performance benchmarks met
- [ ] Security review passed

**QA Lead:** ________________________
**Date:** __________________________
**Approval:** [ ] Approved [ ] Rejected

---

## Task 2.30: Promote to Production

### Prerequisites
- [ ] QA sign-off obtained
- [ ] All staging tests passed
- [ ] Production database backup created
- [ ] Rollback plan confirmed and understood
- [ ] Monitoring dashboard ready
- [ ] On-call engineer identified

### Environment Variables (Production)
```bash
export FLASK_ENV=production
export DATABASE_URL=postgresql://<production-db>
export REDIS_URL=redis://<production-redis>
export GUILD_API_URL=https://api.hool.gg:5000
export JWT_SECRET_KEY=<same-as-guild-api>
export SECRET_KEY=<production-secret>
export CORS_ORIGINS=https://hool.gg
export LOG_LEVEL=WARNING
export GUNICORN_WORKERS=8
export GUNICORN_TIMEOUT=120
```

### Pre-Production Checks
- [ ] Production backup verified and restorable
- [ ] Rollback procedure tested (dry run)
- [ ] Monitoring alerts configured
- [ ] Incident response team ready
- [ ] Communication plan (if user-facing downtime)

### Deployment Steps

**1. Code Preparation**
```bash
git checkout main
git pull origin main
git merge staging
git tag -a v1.1.0 -m "Recruitment API v1.1.0"
git push origin main --tags
```

**2. Deploy to Production**
```bash
cd /Users/michel.epe/Development/poc/hoolgg/services/recruitment-api
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

**3. Monitor Deployment**
```bash
# Watch logs in real-time
docker-compose -f docker-compose.prod.yml logs -f

# In another terminal, check health
watch -n 5 'curl -s https://hool.gg:5001/health'
```

**4. Verify Health**
- [ ] Health check returns 200 OK
- [ ] No ERROR logs in first 5 minutes
- [ ] Database connected
- [ ] Redis connected
- [ ] Guild-api communication working

**5. Run Smoke Tests**
```bash
# Test key endpoints
curl -H "Cookie: access_token=$PROD_TOKEN" \
  https://hool.gg:5001/guilds/1/recruitment/candidates

curl -H "Cookie: access_token=$PROD_TOKEN" \
  https://hool.gg:5001/guilds/1/recruitment/pipeline
```

### Monitoring (First 24 Hours)

**Immediate (First 5 Minutes)**
- [ ] No 5xx errors
- [ ] Response time < 500ms
- [ ] Memory usage stable
- [ ] CPU usage normal

**First Hour**
- [ ] Error rate < 1%
- [ ] No memory leaks detected
- [ ] All external APIs responding
- [ ] Permission checks working
- [ ] Database queries performant

**First 24 Hours**
- [ ] No unusual error patterns
- [ ] Performance stable
- [ ] No user-reported issues
- [ ] Monitoring alerts quiet

### If Issues Arise

**Minor Issues:**
- Document and create tickets
- Monitor closely
- Fix in next deployment

**Critical Issues:**
- Execute rollback procedure (see below)
- Communicate to stakeholders
- Investigate root cause
- Fix and redeploy

---

## Rollback Procedures

### Docker Rollback (Quick)
```bash
# Stop current version
docker stop recruitment-api-prod

# Find previous image
docker images | grep recruitment-api

# Run previous version
docker run -d --name recruitment-api-prod \
  --env-file .env.production \
  -p 5001:5001 \
  hool/recruitment-api:[previous-tag]

# Verify health
curl https://hool.gg:5001/health
```

### Database Rollback
```bash
# Rollback last migration
docker exec recruitment-api-prod alembic downgrade -1

# Verify current version
docker exec recruitment-api-prod alembic current
```

### Full Rollback (Git)
```bash
# Revert commit
git revert HEAD
git push origin main

# Or reset to previous tag
git reset --hard v1.0.0
git push origin main --force  # Use with caution!

# Redeploy
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Post-Deployment

### Documentation
- [ ] Update CHANGELOG.md
- [ ] Update version in docs
- [ ] Document any issues encountered
- [ ] Update runbook if new scenarios discovered

### Communication
- [ ] Notify stakeholders of successful deployment
- [ ] Update status page (if applicable)
- [ ] Post in team channels

### Retrospective
- [ ] What went well?
- [ ] What could be improved?
- [ ] Any process changes needed?
- [ ] Update deployment checklist if needed

---

## Quick Reference

| Environment | URL | Docker Compose File | Log Level |
|-------------|-----|---------------------|-----------|
| Dev | dev.hool.gg:5001 | docker-compose.dev.yml | DEBUG |
| Staging | staging.hool.gg:5001 | docker-compose.staging.yml | INFO |
| Production | hool.gg:5001 | docker-compose.prod.yml | WARNING |

**Health Check:** `curl <url>/health`
**View Logs:** `docker-compose -f <file> logs -f`
**Check Migrations:** `docker exec <container> alembic current`
**Rollback Migration:** `docker exec <container> alembic downgrade -1`

---

## Support Contacts

**On-Call Engineer:** ________________________
**Database Admin:** ________________________
**DevOps Lead:** ________________________
**QA Lead:** ________________________

---

## Additional Resources

- **Full Deployment Guide:** `docs/DEPLOYMENT.md`
- **Testing Checklist:** `docs/TESTING_CHECKLIST.md`
- **Operations Runbook:** `docs/RUNBOOK.md`
- **API Documentation:** `docs/API.md`
- **Tasks:** `/openspec/changes/guild-platform-foundation/tasks.md`

---

**Version:** 1.0
**Last Updated:** 2026-02-17
**Status:** Ready for Use
