# Progress API

Character progress tracking API for hool.gg - handles iLvl tracking, weekly targets, and guild progress monitoring.

## Features

- Character gear progression tracking
- Weekly iLvl target comparison
- Gear priority recommendations
- Guild progress overview (GM feature)
- Weekly guidance messages (GM feature)
- Expansion roadmap display
- WarcraftLogs public data comparison
- Blizzard API integration for real-time gear data

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run database migrations:
```bash
alembic upgrade head
```

4. Start the development server:
```bash
python run.py
```

## API Endpoints

### Character Progress

- `GET /guilds/{guild_id}/progress/characters` - List all characters in guild with progress
- `GET /guilds/{guild_id}/progress/character/{character_name}` - Get detailed character progress
- `GET /guilds/{guild_id}/progress/members` - Guild overview (GM only)

### GM Features

- `PUT /guilds/{guild_id}/progress/message` - Set weekly guidance message (GM only)
- `GET /guilds/{guild_id}/progress/roadmap` - Get expansion roadmap
- `GET /guilds/{guild_id}/progress/comparisons` - Get WarcraftLogs comparison data

### Health

- `GET /health` - Service health check

## Development

Run tests:
```bash
pytest
```

Format code:
```bash
black .
isort .
```

Type check:
```bash
mypy app/
```

## Architecture

- **Flask** - Web framework
- **SQLAlchemy** - ORM for database operations
- **Alembic** - Database migrations
- **Redis** - Caching layer
- **JWT** - Authentication (via guild-api)
- **Requests** - External API calls (Blizzard, WarcraftLogs)

## Dependencies

This service depends on `guild-api` for:
- User authentication (JWT tokens)
- Permission checks
- Guild membership validation

## Documentation

### Quick Start
- **[Quick Start Guide](QUICKSTART.md)** - Get up and running quickly
- **[Implementation Details](IMPLEMENTATION.md)** - How the service works

### Deployment
- **[Deployment Runbook](docs/DEPLOYMENT_RUNBOOK.md)** - Quick deployment reference
- **[Full Deployment Guide](DEPLOYMENT.md)** - Comprehensive deployment documentation
- **[Phase 1 Complete](PHASE1_DEPLOYMENT_COMPLETE.md)** - Summary of deployment artifacts

### Testing
- **[Testing Guide](TESTING.md)** - How to run tests
- **[Integration Tests](docs/INTEGRATION_TESTS.md)** - Integration test documentation
- **[Manual Testing Checklist](docs/MANUAL_TESTING_CHECKLIST.md)** - 36 manual test scenarios

### Pre-Deployment
Before deploying, run:
```bash
./scripts/pre_deployment_check.sh
```

This validates:
- Code quality
- Docker configuration
- Tests pass
- Documentation exists
- Environment variables configured

## Deployment

### To Dev
```bash
docker-compose -f docker-compose.dev.yml up -d
curl https://progress-api.dev.hool.gg/health
```

### To Staging
```bash
git checkout staging
git merge develop
git push origin staging
# CI/CD auto-deploys
```

### To Production
```bash
git checkout main
git merge staging
git tag v1.0.0
git push origin main v1.0.0
# Manual approval required in GitHub Actions
```

See [Deployment Runbook](docs/DEPLOYMENT_RUNBOOK.md) for detailed steps.

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Core
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
SECRET_KEY=<random-secret>
JWT_SECRET_KEY=<must-match-guild-api>

# APIs
BLIZZARD_CLIENT_ID=<your-id>
BLIZZARD_CLIENT_SECRET=<your-secret>
WARCRAFTLOGS_CLIENT_ID=<your-id>
WARCRAFTLOGS_CLIENT_SECRET=<your-secret>

# Integration
GUILD_API_URL=https://api.hool.gg
CORS_ORIGINS=https://hool.gg
```

## Project Status

**Phase 1 Deployment**: ✅ Complete

All deployment artifacts ready:
- ✅ Integration tests (94% coverage)
- ✅ Docker configuration (all environments)
- ✅ Deployment documentation
- ✅ Manual testing checklist (36 scenarios)
- ✅ QA procedures
- ✅ Rollback procedures

Ready to deploy to dev, staging, and production.
