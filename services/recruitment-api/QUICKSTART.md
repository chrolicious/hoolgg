# Quick Start Guide - Recruitment API

## Prerequisites

- Python 3.11+
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)
- guild-api running (for permission checks)

## Local Development (5 minutes)

### Option 1: Docker (Recommended)

```bash
# Navigate to recruitment-api
cd /Users/michel.epe/Development/poc/hoolgg/services/recruitment-api

# Start all services (PostgreSQL + Redis + recruitment-api)
docker-compose up -d

# Check logs
docker-compose logs -f recruitment-api

# Health check
curl http://localhost:5001/health
```

Expected output:
```json
{"status": "ok", "service": "recruitment-api"}
```

### Option 2: Manual Setup

```bash
# 1. Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment
cp .env.example .env
# Edit .env - set DATABASE_URL, REDIS_URL, etc.

# 4. Run migrations
alembic upgrade head

# 5. Start server
python run.py
```

Server starts on http://localhost:5001

## Verify Installation

```bash
# Health check
curl http://localhost:5001/health

# Expected: {"status": "ok", "service": "recruitment-api"}
```

## Database Schema

Migrations automatically create three tables:
- `recruitment_candidates` - Candidate data
- `recruitment_categories` - Pipeline categories
- `recruitment_history` - Contact tracking

To verify:
```bash
psql $DATABASE_URL -c "\dt"
```

## Example API Calls

### 1. Search for Candidates

```bash
curl -X POST http://localhost:5001/guilds/1/recruitment/search \
  -H "Content-Type: application/json" \
  -b "access_token=YOUR_JWT_TOKEN" \
  -d '{
    "name": "Exampleplayer",
    "realm": "area-52",
    "region": "us",
    "role": "Tank",
    "sources": ["raider_io"]
  }'
```

### 2. Add a Candidate

```bash
curl -X POST http://localhost:5001/guilds/1/recruitment/candidates \
  -H "Content-Type: application/json" \
  -b "access_token=YOUR_JWT_TOKEN" \
  -d '{
    "candidate_name": "Testplayer",
    "realm": "area-52",
    "region": "us",
    "character_class": "Warrior",
    "role": "Tank",
    "ilvl": 290,
    "notes": "Great player from trade chat"
  }'
```

### 3. List Candidates

```bash
curl http://localhost:5001/guilds/1/recruitment/candidates \
  -b "access_token=YOUR_JWT_TOKEN"
```

### 4. Get Pipeline View

```bash
curl http://localhost:5001/guilds/1/recruitment/pipeline \
  -b "access_token=YOUR_JWT_TOKEN"
```

### 5. Rate a Candidate

```bash
curl -X PUT http://localhost:5001/guilds/1/recruitment/candidates/1 \
  -H "Content-Type: application/json" \
  -b "access_token=YOUR_JWT_TOKEN" \
  -d '{
    "rating": 5,
    "notes": "Excellent tank, very experienced"
  }'
```

## Authentication

All endpoints (except `/health`) require authentication.

**JWT Token**: Issued by guild-api, passed in cookie named `access_token`.

To get a token:
1. Login via guild-api (`/auth/login`)
2. Token is set in cookie automatically
3. Use cookie in requests to recruitment-api

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_health.py

# View coverage report
open htmlcov/index.html
```

## Development Workflow

```bash
# 1. Make changes to code
# 2. Create migration (if models changed)
alembic revision --autogenerate -m "Description of changes"

# 3. Review migration file
# Edit alembic/versions/XXX_description_of_changes.py if needed

# 4. Apply migration
alembic upgrade head

# 5. Test changes
pytest

# 6. Format code
black app/
isort app/

# 7. Type check
mypy app/
```

## Environment Variables

Minimum required for local development:

```bash
DATABASE_URL=postgresql://hool:hool@localhost:5432/hoolgg
REDIS_URL=redis://localhost:6379
JWT_SECRET_KEY=dev-jwt-secret
GUILD_API_URL=http://localhost:5000
```

Full list in `.env.example`

## Troubleshooting

### "ModuleNotFoundError: No module named 'app'"

```bash
# Ensure you're in the right directory
cd /path/to/recruitment-api

# Reinstall dependencies
pip install -r requirements.txt
```

### "Connection refused" on database

```bash
# If using Docker:
docker-compose up -d postgres

# If using local PostgreSQL:
# Check PostgreSQL is running
pg_isready

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### "Permission denied" errors on endpoints

```bash
# Verify guild-api is running
curl http://localhost:5000/health

# Check JWT_SECRET_KEY matches between services
# guild-api and recruitment-api must use same secret
```

### Migrations fail

```bash
# Check current version
alembic current

# Rollback one version
alembic downgrade -1

# View history
alembic history

# Start fresh (CAUTION: destroys data)
alembic downgrade base
alembic upgrade head
```

## API Documentation

Full API documentation: [docs/API.md](docs/API.md)

Deployment guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Next Steps

1. **Run locally**: Follow Quick Start above
2. **Test endpoints**: Use Postman or curl
3. **Review code**: Check `app/routes/recruitment.py` for endpoint logic
4. **Deploy to dev**: See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
5. **Build frontend**: See Phase 3 tasks in `tasks.md`

## Support

- Check [README.md](README.md) for overview
- Review [docs/API.md](docs/API.md) for API reference
- See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production setup
- Check [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for complete details

## Production Checklist

Before deploying to production:

- [ ] Set strong `JWT_SECRET_KEY` (32+ random characters)
- [ ] Set strong `SECRET_KEY` (32+ random characters)
- [ ] Use SSL/TLS for database connection
- [ ] Restrict `CORS_ORIGINS` to production domains
- [ ] Set `FLASK_ENV=production`
- [ ] Configure health check monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure logging
- [ ] Test all endpoints with real data
- [ ] Run load tests
- [ ] Set up database backups
- [ ] Document rollback procedure

---

**Status**: Phase 2 (Tasks 2.1-2.25) Complete ✅

**Ready for**: Deployment (Tasks 2.26-2.30) and Phase 3 (Frontend)
