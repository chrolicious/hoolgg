# Deployment Guide - Recruitment API

## Prerequisites

- PostgreSQL 15+
- Redis 7+
- Python 3.11+
- Access to guild-api for permission checks
- Docker & Docker Compose (for containerized deployment)

## Environment Variables

Required environment variables:

```bash
# Database & Cache
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://host:6379

# Authentication & Security
JWT_SECRET_KEY=your-secret-key  # MUST match guild-api JWT_SECRET_KEY
SECRET_KEY=your-secret-key  # Flask secret for sessions

# Service URLs
GUILD_API_URL=http://guild-api:5000  # Internal service URL

# External APIs
RAIDER_IO_API_URL=https://raider.io/api/v1
WOW_PROGRESS_API_URL=https://www.wowprogress.com/api
WARCRAFT_LOGS_API_URL=https://www.warcraftlogs.com/api/v2

# Application Settings
FLASK_ENV=production
CORS_ORIGINS=https://hool.gg,https://dev.hool.gg,https://staging.hool.gg

# Optional
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR
GUNICORN_WORKERS=4  # Number of worker processes
GUNICORN_TIMEOUT=120  # Timeout in seconds
```

### Environment-Specific Variables

#### Development (dev.hool.gg)
```bash
FLASK_ENV=development
CORS_ORIGINS=https://dev.hool.gg
GUILD_API_URL=https://dev.hool.gg:5000
LOG_LEVEL=DEBUG
```

#### Staging (staging.hool.gg)
```bash
FLASK_ENV=production
CORS_ORIGINS=https://staging.hool.gg
GUILD_API_URL=https://staging.hool.gg:5000
LOG_LEVEL=INFO
```

#### Production (hool.gg)
```bash
FLASK_ENV=production
CORS_ORIGINS=https://hool.gg
GUILD_API_URL=https://api.hool.gg:5000
LOG_LEVEL=WARNING
```

## Database Setup

1. Run migrations:

```bash
alembic upgrade head
```

2. Verify tables created:

```bash
psql $DATABASE_URL -c "\dt"
```

Expected tables:
- `recruitment_candidates`
- `recruitment_categories`
- `recruitment_history`

## Local Development

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Set up environment:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run migrations:

```bash
alembic upgrade head
```

4. Start development server:

```bash
python run.py
```

Server will start on `http://localhost:5001`

## Docker Deployment

1. Build image:

```bash
docker build -t hool/recruitment-api:latest .
```

2. Run with docker-compose:

```bash
docker-compose up -d
```

3. Check logs:

```bash
docker-compose logs -f recruitment-api
```

## Production Deployment (Coolify)

### Pre-Deployment Checklist

- [ ] All tests passing (unit + integration)
- [ ] Code merged to appropriate branch (develop/staging/main)
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] Guild-api is healthy and accessible
- [ ] Redis is healthy and accessible

### Deployment Steps

#### 1. Prepare Environment

```bash
# Create .env file with production values
cp .env.example .env.production

# Edit with production values
vim .env.production
```

#### 2. Configure Coolify

**General Settings:**
- Service Name: `recruitment-api`
- Port: `5001`
- Health Check Path: `/health`
- Health Check Interval: `30s`
- Health Check Timeout: `5s`
- Health Check Retries: `3`

**Build Settings:**
- Dockerfile Path: `./Dockerfile`
- Build Context: `./`
- Build Args: (none required)

**Environment Variables:**
Set all required environment variables from `.env.production`

**Volumes:**
- None required (stateless service)

**Networks:**
- Connect to same network as guild-api
- Connect to database network
- Connect to redis network

#### 3. Deploy

**Option A: Git Webhook (Automatic)**
```bash
# Push to deployment branch
git push origin develop  # for dev
git push origin staging  # for staging
git push origin main     # for production
```

Coolify will automatically:
1. Pull latest code
2. Build Docker image
3. Run database migrations
4. Deploy new container
5. Health check before switching traffic

**Option B: Manual Trigger**
1. Go to Coolify dashboard
2. Select recruitment-api service
3. Click "Deploy"
4. Monitor build logs
5. Verify health checks

#### 4. Post-Deployment Verification

```bash
# Check health endpoint
curl https://dev.hool.gg:5001/health

# Check service logs
docker logs recruitment-api -f

# Verify database migrations
docker exec recruitment-api alembic current

# Test a simple endpoint
curl -H "Cookie: access_token=$TOKEN" \
  https://dev.hool.gg:5001/guilds/1/recruitment/candidates
```

#### 5. Monitor Deployment

**Immediate (first 5 minutes):**
- [ ] Health check passing
- [ ] No error logs
- [ ] Database connections working
- [ ] Redis connections working
- [ ] Guild-api communication working

**Short-term (first hour):**
- [ ] No 5xx errors
- [ ] Response times < 500ms
- [ ] Memory usage stable
- [ ] CPU usage normal

**Long-term (first 24 hours):**
- [ ] Error rate < 1%
- [ ] No memory leaks
- [ ] No unusual patterns in logs

## Health Check

```bash
curl http://localhost:5001/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "recruitment-api"
}
```

## Rollback Procedure

If deployment fails:

1. Rollback code deployment via Coolify

2. Rollback database migrations:

```bash
alembic downgrade -1
```

3. Verify service health

## Monitoring

- Health check endpoint: `/health`
- Expected response time: < 200ms
- Expected error rate: < 1%

## Troubleshooting

### Database connection errors

```bash
# Verify DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Migration errors

```bash
# Check current migration version
alembic current

# View migration history
alembic history

# Rollback if needed
alembic downgrade -1
```

### Permission errors

Verify guild-api is accessible:

```bash
curl $GUILD_API_URL/health
```

### External API errors

Check Raider.io connectivity:

```bash
curl https://raider.io/api/v1/characters/profile?region=us&realm=area-52&name=example
```

## Performance Tuning

- Gunicorn workers: 4-8 (adjust based on CPU cores)
- Timeout: 120s (for external API calls)
- Database connection pool: 10-20 connections
- Redis cache TTL: 5 minutes for permission checks

## Security Checklist

- [ ] JWT_SECRET_KEY is strong and unique
- [ ] DATABASE_URL uses encrypted connection (SSL)
- [ ] CORS_ORIGINS restricted to production domains
- [ ] Rate limiting enabled
- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS only in production
