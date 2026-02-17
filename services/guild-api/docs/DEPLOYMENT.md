# Guild API Deployment Guide

## Prerequisites

- Hetzner VPS with Docker and Coolify installed
- Domain configured (dev.hool.gg, staging.hool.gg, hool.gg)
- SSL certificates via Let's Encrypt (managed by Coolify)
- PostgreSQL database
- Redis instance

## Environment Variables

Create a `.env` file with:

```bash
# Database
DATABASE_URL=postgresql://hool:hool@postgres:5432/hoolgg

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET_KEY=<generate-secure-random-key>
JWT_ACCESS_TOKEN_EXPIRES=900
JWT_REFRESH_TOKEN_EXPIRES=604800

# Blizzard OAuth
BLIZZARD_CLIENT_ID=<from-blizzard-dev-portal>
BLIZZARD_CLIENT_SECRET=<from-blizzard-dev-portal>
BLIZZARD_REDIRECT_URI=https://dev.hool.gg/auth/callback
BLIZZARD_REGION=us

# Flask
FLASK_ENV=production
SECRET_KEY=<generate-secure-random-key>

# CORS
CORS_ORIGINS=https://dev.hool.gg,https://staging.hool.gg,https://hool.gg
```

## Deployment Steps

### 1. Build Docker Image

```bash
docker build -t guild-api:latest .
```

### 2. Run Database Migrations

```bash
# From the guild-api directory
alembic upgrade head
```

### 3. Deploy with Docker Compose (Local/Dev)

```bash
docker-compose up -d
```

### 4. Deploy to Coolify (Production)

1. Push code to GitHub
2. In Coolify dashboard:
   - Create new application
   - Connect to GitHub repository
   - Set build path: `services/guild-api`
   - Configure environment variables
   - Deploy

### 5. Verify Deployment

```bash
curl https://dev.hool.gg/health
```

Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "application": "ok"
  }
}
```

## Environments

### Development (dev.hool.gg)
- Auto-deploys on push to `develop` branch
- Database: dev_hoolgg_db
- Debug mode enabled
- Hot reload enabled

### Staging (staging.hool.gg)
- Auto-deploys on push to `staging` branch
- Database: staging_hoolgg_db
- Production-like configuration
- Used for QA testing

### Production (hool.gg)
- Manual deploy on push to `main` branch
- Database: hoolgg_db
- Debug mode disabled
- Requires approval before deploy

## Monitoring

### Health Checks

Coolify automatically monitors `/health` endpoint.

Configuration:
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3

### Logs

View logs:
```bash
docker logs guild-api -f
```

Or in Coolify dashboard: Applications → guild-api → Logs

### Metrics

Monitor:
- API response times
- Database query performance
- Redis cache hit rate
- Blizzard API rate limit usage

## Rollback

If deployment fails:

```bash
# Via Coolify: click "Rollback" in deployment history
# Or manually:
docker pull guild-api:v1.0.0  # previous version
docker-compose up -d
```

## Database Migrations

### Apply Migration

```bash
alembic upgrade head
```

### Rollback Migration

```bash
alembic downgrade -1
```

### Create New Migration

```bash
alembic revision --autogenerate -m "description"
```

## Troubleshooting

### Service Won't Start

1. Check logs: `docker logs guild-api`
2. Verify environment variables
3. Check database connectivity
4. Verify Redis connectivity

### Database Connection Errors

1. Check DATABASE_URL format
2. Verify database is running: `docker ps | grep postgres`
3. Test connection: `psql $DATABASE_URL`

### OAuth Redirect Errors

1. Verify BLIZZARD_REDIRECT_URI matches registered URI
2. Check that domain has SSL certificate
3. Verify Blizzard developer portal settings

## Security

### Generate Secure Keys

```bash
# JWT Secret
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Flask Secret
python -c "import secrets; print(secrets.token_hex(32))"
```

### SSL/TLS

- Managed by Coolify + Let's Encrypt
- Auto-renewal enabled
- Force HTTPS redirects

### Firewall Rules

```bash
# Allow only necessary ports
ufw allow 80/tcp   # HTTP (redirect to HTTPS)
ufw allow 443/tcp  # HTTPS
ufw allow 22/tcp   # SSH
ufw enable
```
