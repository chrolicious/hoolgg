# Progress API - Quick Start Guide

## Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Access to Blizzard API credentials
- Access to WarcraftLogs API credentials (optional)

## Setup (5 minutes)

### 1. Install Dependencies

```bash
cd services/progress-api
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set:
```bash
DATABASE_URL=postgresql://hool:hool@localhost:5432/hoolgg
REDIS_URL=redis://localhost:6379
JWT_SECRET_KEY=<same-as-guild-api>
BLIZZARD_CLIENT_ID=<your-client-id>
BLIZZARD_CLIENT_SECRET=<your-client-secret>
WARCRAFTLOGS_CLIENT_ID=<your-wcl-client-id>  # Optional
WARCRAFTLOGS_CLIENT_SECRET=<your-wcl-secret>  # Optional
GUILD_API_URL=http://localhost:5000
```

### 3. Run Migrations

```bash
alembic upgrade head
```

### 4. Seed Weekly Targets

```bash
python scripts/seed_weekly_targets.py
```

### 5. Start the Service

```bash
python run.py
```

Service runs on: `http://localhost:5001`

## Quick Test

```bash
# Health check
curl http://localhost:5001/health

# Should return:
# {"status": "healthy", "service": "progress-api", "version": "0.1.0"}
```

## Docker Setup (Alternative)

```bash
# Start all services (Postgres, Redis, API)
docker-compose up

# Run migrations
docker-compose exec progress-api alembic upgrade head

# Seed data
docker-compose exec progress-api python scripts/seed_weekly_targets.py
```

## Common Tasks

### Run Tests
```bash
pytest
```

### Run Tests with Coverage
```bash
pytest --cov=app --cov-report=html
```

### Format Code
```bash
black .
isort .
```

### Type Check
```bash
mypy app/
```

### Create New Migration
```bash
alembic revision --autogenerate -m "description"
```

### Rollback Migration
```bash
alembic downgrade -1
```

## API Endpoints

### Character Progress
- `GET /guilds/{guild_id}/progress/characters` - List characters
- `GET /guilds/{guild_id}/progress/character/{name}?realm=area-52` - Character details

### GM Features
- `GET /guilds/{guild_id}/progress/members` - Guild overview (Officer+)
- `PUT /guilds/{guild_id}/progress/message` - Set weekly message (GM only)
- `GET /guilds/{guild_id}/progress/roadmap` - View roadmap
- `GET /guilds/{guild_id}/progress/comparisons?guild_name=X&realm=Y` - WCL data

### Health
- `GET /health` - Service health

## Authentication

All endpoints (except `/health`) require a valid JWT token in the `access_token` cookie. Tokens are issued by guild-api.

For local testing, you can:
1. Start guild-api
2. Login via guild-api to get a token
3. Use that token to call progress-api endpoints

## Troubleshooting

### "DATABASE_URL not configured"
- Make sure `.env` file exists and `DATABASE_URL` is set

### "Blizzard API credentials not configured"
- Set `BLIZZARD_CLIENT_ID` and `BLIZZARD_CLIENT_SECRET` in `.env`
- Register at: https://develop.battle.net/

### "Permission service unavailable"
- Make sure guild-api is running on the configured `GUILD_API_URL`
- Check that guild-api is accessible

### "Redis connection failed"
- Make sure Redis is running: `redis-cli ping`
- Check `REDIS_URL` in `.env`

### Character data not fetching
- Verify Blizzard API credentials are correct
- Check character name and realm are correct (case-insensitive)
- Check Blizzard API logs in console

## Development Tips

1. **Use Docker Compose** for local development - it sets up Postgres, Redis, and the API in one command

2. **Watch the logs** - Flask debug mode provides detailed error messages

3. **Test with real characters** - Use actual WoW character names from your realm for testing

4. **Cache TTL** - Character data is cached for 1 hour by default. Set `CHARACTER_CACHE_TTL=60` for 1-minute cache during development

5. **Permission testing** - Create test guilds in guild-api first, then test progress-api endpoints

## Next Steps

- Read [API.md](docs/API.md) for complete API documentation
- Read [IMPLEMENTATION.md](IMPLEMENTATION.md) for architecture details
- Integrate with guild-api for authentication
- Deploy to dev.hool.gg for testing

## Support

- Check logs: `tail -f /var/log/progress-api.log` (production)
- Enable debug: Set `DEBUG=True` in `.env`
- Run tests: `pytest -v` for verbose output
