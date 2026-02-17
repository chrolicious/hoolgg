# Progress API - Documentation

This directory contains deployment and testing documentation for the progress-api service.

## Quick Links

### Deployment

- **[Deployment Runbook](DEPLOYMENT_RUNBOOK.md)** - Quick reference for deploying to dev/staging/production
- **[Full Deployment Guide](../DEPLOYMENT.md)** - Comprehensive deployment documentation
- **[Manual Testing Checklist](MANUAL_TESTING_CHECKLIST.md)** - Complete testing scenarios (36 tests)

### Testing

- **[Integration Tests Documentation](INTEGRATION_TESTS.md)** - Guide to integration tests with guild-api
- **[Testing Guide](../TESTING.md)** - How to run all tests and coverage reports

### Getting Started

- **[Phase 1 Deployment Complete](../PHASE1_DEPLOYMENT_COMPLETE.md)** - Summary of all deployment artifacts

## Documentation Structure

```
progress-api/
├── docs/
│   ├── README.md (this file)
│   ├── DEPLOYMENT_RUNBOOK.md          # Quick deployment steps
│   ├── MANUAL_TESTING_CHECKLIST.md    # 36 manual test scenarios
│   └── INTEGRATION_TESTS.md           # Integration test documentation
├── DEPLOYMENT.md                       # Full deployment guide
├── TESTING.md                          # Testing guide
├── PHASE1_DEPLOYMENT_COMPLETE.md      # Deployment artifacts summary
├── README.md                           # Service overview
├── QUICKSTART.md                       # Quick start guide
└── IMPLEMENTATION.md                   # Implementation details
```

## Common Tasks

### Deploy to Dev

```bash
# See: DEPLOYMENT_RUNBOOK.md > Deploy to Dev
docker build -t progress-api:dev .
docker-compose -f docker-compose.dev.yml up -d
curl https://progress-api.dev.hool.gg/health
```

### Run Tests

```bash
# See: ../TESTING.md
pytest tests/test_integration.py -v
pytest --cov=app --cov-report=html
```

### Manual Testing

```bash
# Follow: MANUAL_TESTING_CHECKLIST.md
# - 12 sections
# - 36 test scenarios
# - Covers all API scenarios from spec
```

### Rollback

```bash
# See: DEPLOYMENT_RUNBOOK.md > Rollback
docker stop progress-api
docker run -d --name progress-api progress-api:v0.9.0
```

## Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Local | http://localhost:5001 | Development |
| Dev | https://progress-api.dev.hool.gg | Testing |
| Staging | https://progress-api.staging.hool.gg | QA |
| Production | https://progress-api.hool.gg | Live |

## Support

For questions or issues:

1. Check the relevant documentation above
2. Review troubleshooting sections in deployment guides
3. Check health endpoint: `GET /health`
4. Review service logs: `docker logs progress-api`

## Next Steps

After deploying:

1. Verify health check passes
2. Run manual testing checklist
3. Monitor key metrics (response time, error rate)
4. Check integration with guild-api
5. Verify Blizzard API integration
