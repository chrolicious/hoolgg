# Deploying Progress API to Coolify

This guide covers deploying the progress-api service using Coolify on Hetzner VPS.

## Prerequisites

- Coolify installed and configured on Hetzner VPS
- PostgreSQL database running
- Redis instance running
- Guild-api service deployed and accessible
- Domain configured: `progress-api.dev.hool.gg` (or staging/prod)

---

## Coolify Configuration

### 1. Create New Application

1. Log into Coolify dashboard
2. Click "New Resource" → "Application"
3. Select "Git Repository" or "Docker Image"
4. Configure:
   - **Name**: `progress-api-dev` (or staging/prod)
   - **Repository**: `https://github.com/your-org/hoolgg`
   - **Branch**: `develop` (or staging/main)
   - **Build Pack**: Dockerfile
   - **Dockerfile Path**: `services/progress-api/Dockerfile`
   - **Port**: 5001

### 2. Environment Variables

Add these environment variables in Coolify:

```env
# Flask Configuration
SECRET_KEY=<generate-random-secret>
DEBUG=false
PORT=5001

# Database - use Coolify internal connection
DATABASE_URL=postgresql://hool:hool@postgres:5432/hoolgg

# Redis - use Coolify internal connection
REDIS_URL=redis://redis:6379

# JWT Configuration (MUST match guild-api)
JWT_SECRET_KEY=<same-as-guild-api>
JWT_ACCESS_TOKEN_EXPIRES=900
JWT_REFRESH_TOKEN_EXPIRES=604800

# Blizzard API
BLIZZARD_CLIENT_ID=<your-blizzard-client-id>
BLIZZARD_CLIENT_SECRET=<your-blizzard-secret>
BLIZZARD_REGION=us
BLIZZARD_API_TIMEOUT=10

# WarcraftLogs API
WARCRAFTLOGS_CLIENT_ID=<your-wcl-client-id>
WARCRAFTLOGS_CLIENT_SECRET=<your-wcl-secret>

# Guild API URL (internal Coolify URL)
GUILD_API_URL=http://guild-api:5000

# CORS
CORS_ORIGINS=https://dev.hool.gg

# Cache TTL
CHARACTER_CACHE_TTL=3600
```

### 3. Domain Configuration

Configure domain in Coolify:

- **Dev**: `progress-api.dev.hool.gg`
- **Staging**: `progress-api.staging.hool.gg`
- **Production**: `progress-api.hool.gg`

Enable:
- [x] HTTPS (Let's Encrypt)
- [x] Force HTTPS redirect
- [x] WWW redirect (optional)

### 4. Health Check

Configure health check in Coolify:

- **Path**: `/health`
- **Method**: GET
- **Expected Status**: 200
- **Interval**: 30s
- **Timeout**: 5s
- **Retries**: 3

### 5. Resource Limits

Set resource limits:

- **CPU**: 1 core (can increase for production)
- **Memory**: 512MB (can increase for production)
- **Storage**: 5GB

### 6. Network Configuration

Ensure service is on same network as:
- PostgreSQL
- Redis
- Guild-api

In Coolify, this is typically handled automatically.

---

## Database Setup in Coolify

### Option 1: Use Existing PostgreSQL

If you already have PostgreSQL running in Coolify:

1. Use internal connection: `postgresql://hool:hool@postgres:5432/hoolgg`
2. No additional setup needed

### Option 2: Create New PostgreSQL Database

1. In Coolify, create new PostgreSQL resource
2. Configure:
   - **Name**: `hoolgg-postgres`
   - **Version**: 15
   - **Database**: `hoolgg`
   - **User**: `hool`
   - **Password**: `<secure-password>`
3. Note the internal connection URL
4. Update `DATABASE_URL` in progress-api environment variables

---

## Redis Setup in Coolify

### Option 1: Use Existing Redis

If you already have Redis running in Coolify:

1. Use internal connection: `redis://redis:6379`
2. No additional setup needed

### Option 2: Create New Redis Instance

1. In Coolify, create new Redis resource
2. Configure:
   - **Name**: `hoolgg-redis`
   - **Version**: 7-alpine
   - **Port**: 6379
3. Note the internal connection URL
4. Update `REDIS_URL` in progress-api environment variables

---

## Initial Deployment Steps

### 1. Deploy the Service

1. Click "Deploy" in Coolify dashboard
2. Monitor build logs for errors
3. Wait for deployment to complete

### 2. Run Database Migrations

After deployment, connect to the container and run migrations:

```bash
# In Coolify, open terminal to progress-api container
alembic upgrade head
```

Or use Coolify's "Run Command" feature:

```bash
alembic upgrade head
```

### 3. Seed Weekly Targets (First Time Only)

```bash
# In container terminal
python scripts/seed_weekly_targets.py
```

### 4. Verify Deployment

Test health check:

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

### 5. Test Permission Integration

Test guild-api integration:

```bash
# Get a valid JWT token from guild-api first
curl -X GET https://progress-api.dev.hool.gg/guilds/1/progress/characters \
  -H "Cookie: access_token=<your-jwt-token>"
```

---

## Continuous Deployment

### Auto-Deploy on Git Push

Configure in Coolify:

1. Go to Application → Settings → Build
2. Enable "Auto Deploy"
3. Select branch (develop for dev, staging for staging, main for prod)
4. Configure webhook (optional)

Now, every push to the selected branch will trigger automatic deployment.

### Manual Deploy

To manually trigger deployment:

1. Go to Application in Coolify
2. Click "Deploy" button
3. Monitor build logs

---

## Monitoring in Coolify

### Logs

View logs in Coolify:

1. Go to Application → Logs
2. Filter by:
   - Application logs
   - Build logs
   - Error logs

### Metrics

Monitor in Coolify dashboard:

- CPU usage
- Memory usage
- Network traffic
- Response times (if configured)

### Alerts

Configure alerts in Coolify:

- Service down
- High CPU/memory usage
- Failed deployments

---

## Troubleshooting

### Build Fails

**Issue**: Docker build fails

1. Check build logs in Coolify
2. Verify Dockerfile is correct
3. Ensure all dependencies are in requirements.txt
4. Check build context path

**Issue**: Dependencies fail to install

1. Check requirements.txt syntax
2. Verify Python version (3.11)
3. Check for conflicting dependencies

### Deployment Fails

**Issue**: Container fails to start

1. Check application logs
2. Verify environment variables are set
3. Check database connection
4. Verify port configuration

**Issue**: Health check fails

1. Verify `/health` endpoint returns 200
2. Check database connectivity
3. Check Redis connectivity
4. Review application logs

### Runtime Issues

**Issue**: Database connection errors

1. Verify DATABASE_URL is correct
2. Check PostgreSQL is running
3. Verify network connectivity between services
4. Check database credentials

**Issue**: Redis connection errors

1. Verify REDIS_URL is correct
2. Check Redis is running
3. Verify network connectivity
4. Check Redis is on same network

**Issue**: Guild-api integration fails

1. Verify GUILD_API_URL is correct
2. Check guild-api is running
3. Verify JWT_SECRET_KEY matches
4. Test guild-api health: `curl http://guild-api:5000/health`

---

## Rollback in Coolify

### Rollback to Previous Deployment

1. Go to Application → Deployments
2. Find previous successful deployment
3. Click "Redeploy"
4. Confirm rollback

### Rollback Database Migration

If migration causes issues:

```bash
# Connect to container
alembic downgrade -1
```

Then redeploy application.

---

## Environment-Specific Configurations

### Development (dev.hool.gg)

```env
GUILD_API_URL=http://guild-api:5000
CORS_ORIGINS=https://dev.hool.gg
```

### Staging (staging.hool.gg)

```env
GUILD_API_URL=http://guild-api:5000
CORS_ORIGINS=https://staging.hool.gg
```

### Production (hool.gg)

```env
GUILD_API_URL=http://guild-api:5000
CORS_ORIGINS=https://hool.gg
# Consider increasing resources:
# CPU: 2 cores
# Memory: 1GB
```

---

## Security Best Practices

1. **Secrets Management**
   - Use Coolify's environment variable encryption
   - Never commit secrets to Git
   - Rotate secrets regularly

2. **HTTPS**
   - Always use HTTPS in production/staging
   - Let's Encrypt auto-renewal enabled

3. **Network Security**
   - Use internal network for service-to-service communication
   - Don't expose database/redis publicly
   - Configure firewall rules in Hetzner

4. **Access Control**
   - Limit Coolify access to authorized users
   - Use strong passwords
   - Enable 2FA if available

---

## Performance Optimization

### Scaling

To scale horizontally in Coolify:

1. Increase replica count
2. Configure load balancer
3. Ensure stateless application design

### Caching

Monitor Redis hit rate:

- Target: >80% hit rate
- Adjust CHARACTER_CACHE_TTL if needed

### Database

Monitor database performance:

- Watch slow queries
- Optimize indexes
- Consider connection pooling

---

## Support

- **Coolify Docs**: https://coolify.io/docs
- **Coolify Discord**: https://discord.gg/coolify
- **Hetzner Support**: https://www.hetzner.com/support

---

## Checklist for First Deployment

- [ ] Coolify application created
- [ ] Environment variables configured
- [ ] Domain configured with HTTPS
- [ ] PostgreSQL connected
- [ ] Redis connected
- [ ] Guild-api accessible
- [ ] Application deployed
- [ ] Migrations run
- [ ] Weekly targets seeded
- [ ] Health check passes
- [ ] Manual testing completed
- [ ] Auto-deploy configured
- [ ] Monitoring set up
- [ ] Alerts configured
