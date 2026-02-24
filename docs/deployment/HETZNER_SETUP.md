# Hetzner VPS Deployment Guide

This guide covers setting up hool.gg on Hetzner Cloud with Coolify.

## Overview

**Infrastructure:**
- **Provider**: Hetzner Cloud
- **Location**: Falkenstein, Germany (EU datacenter - fsn1-dc14)
- **Server**: CPX31 (4 vCPUs, 8GB RAM, 80GB SSD)
- **Deployment Platform**: Coolify (self-hosted PaaS)
- **Domain**: hool.gg

**Services to deploy:**
1. PostgreSQL database
2. Redis
3. Progress API (Flask)
4. Recruitment API (Flask)
5. Next.js web app
6. (Optional) Umami analytics

## Step 1: Provision Hetzner VPS

### 1.1 Create Hetzner Cloud Account

1. Sign up at https://www.hetzner.com/cloud
2. Add payment method
3. Activate account

### 1.2 Create New Project

1. Navigate to Cloud Console
2. Click "New Project"
3. Name: `hoolgg-production`

### 1.3 Create Server

1. Click "Add Server"
2. **Location**: Falkenstein, Germany (fsn1-dc14)
3. **Image**: Ubuntu 24.04 (latest LTS)
4. **Type**: CPX31
   - 4 vCPUs
   - 8 GB RAM
   - 80 GB SSD
   - ~€13/month
5. **Networking**:
   - IPv4: ✅ Enabled
   - IPv6: ✅ Enabled
6. **SSH Keys**:
   - Add your SSH public key
   - Name it descriptively (e.g., "MacBook Pro")
7. **Firewall**: Create new firewall
   - Name: `hoolgg-firewall`
   - Inbound Rules:
     - SSH (22): Your IP only (for security)
     - HTTP (80): 0.0.0.0/0, ::/0
     - HTTPS (443): 0.0.0.0/0, ::/0
   - Outbound Rules: Allow all
8. **Name**: `hoolgg-prod-01`
9. Click "Create & Buy Now"

**Note your server's IP address** (e.g., 135.181.x.x)

### 1.4 Initial Server Access

```bash
ssh root@<server-ip>
```

## Step 2: Configure DNS

### 2.1 Point Domain to Server

In your domain registrar (e.g., Namecheap, Cloudflare):

1. Create A record:
   - **Name**: `@`
   - **Type**: A
   - **Value**: `<server-ip>`
   - **TTL**: 300

2. Create A record for wildcard:
   - **Name**: `*`
   - **Type**: A
   - **Value**: `<server-ip>`
   - **TTL**: 300

3. Create AAAA record (IPv6):
   - **Name**: `@`
   - **Type**: AAAA
   - **Value**: `<server-ipv6>`
   - **TTL**: 300

Wait 5-10 minutes for DNS propagation. Verify with:
```bash
dig hool.gg +short
nslookup hool.gg
```

## Step 3: Install Coolify

### 3.1 System Prerequisites

Update system:
```bash
apt update && apt upgrade -y
```

### 3.2 Install Coolify

Run the official installer:
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

This will:
- Install Docker and Docker Compose
- Set up Coolify services
- Configure SSL certificates via Let's Encrypt
- Start Coolify on port 8000

### 3.3 Access Coolify Dashboard

1. Open browser: `http://<server-ip>:8000`
2. Create admin account:
   - Email: your email
   - Password: strong password
   - Save credentials securely

### 3.4 Configure Coolify Instance

1. Navigate to **Settings** → **Configuration**
2. Set **Instance Domain**: `coolify.hool.gg`
3. Enable **Automatic HTTPS**: ✅
4. Click **Save**

## Step 4: Configure Coolify Project

### 4.1 Create New Project

1. Click **+ New Project**
2. Name: `hool.gg`
3. Description: `WoW guild platform - roster tracking, recruitment, guild finder`

### 4.2 Create New Environment

1. Click **+ New Environment**
2. Name: `production`

## Step 5: Deploy PostgreSQL Database

### 5.1 Add PostgreSQL Service

1. In `production` environment, click **+ New Resource**
2. Select **PostgreSQL**
3. Configuration:
   - **Name**: `hoolgg-postgres`
   - **Version**: 16 (latest stable)
   - **Database Name**: `hoolgg`
   - **Username**: `hool`
   - **Password**: Generate strong password (save in password manager)
   - **Port**: 5432
   - **Volume Mount**: `/var/lib/postgresql/data`
4. Click **Deploy**

### 5.2 Verify Database

Wait for deployment, then test connection:
```bash
docker exec -it <postgres-container-id> psql -U hool -d hoolgg
```

## Step 6: Deploy Redis

### 6.1 Add Redis Service

1. Click **+ New Resource**
2. Select **Redis**
3. Configuration:
   - **Name**: `hoolgg-redis`
   - **Version**: 7 (latest stable)
   - **Port**: 6379
   - **Volume Mount**: `/data`
4. Click **Deploy**

### 6.2 Verify Redis

```bash
docker exec -it <redis-container-id> redis-cli ping
# Should return: PONG
```

## Step 7: Deploy Progress API (Flask)

### 7.1 Add GitHub Repository

1. Click **+ New Resource**
2. Select **Application**
3. Source: **GitHub**
4. Repository: `chrolicious/hoolgg`
5. Branch: `main`

### 7.2 Configure Build

- **Build Pack**: Nixpacks (auto-detected)
- **Base Directory**: `services/progress-api`
- **Port**: 5000
- **Health Check**: `/health`

### 7.3 Environment Variables

Add these in Coolify:

```env
DATABASE_URL=postgresql://hool:<password>@hoolgg-postgres:5432/hoolgg
REDIS_URL=redis://hoolgg-redis:6379
BLIZZARD_CLIENT_ID=<from-blizzard-dev-portal>
BLIZZARD_CLIENT_SECRET=<from-blizzard-dev-portal>
FLASK_ENV=production
SECRET_KEY=<generate-random-secret>
```

### 7.4 Custom Domain

- **Domain**: `api.hool.gg`
- **HTTPS**: ✅ Auto (Let's Encrypt)

### 7.5 Deploy

Click **Deploy**. Coolify will:
- Clone repository
- Build Docker image
- Start container
- Configure HTTPS
- Set up health checks

## Step 8: Deploy Recruitment API (Flask)

Repeat Step 7 with:
- **Base Directory**: `services/recruitment-api`
- **Domain**: `recruit.hool.gg`
- Same environment variables

## Step 9: Deploy Next.js Web App

### 9.1 Add Application

1. Click **+ New Resource**
2. Select **Application**
3. Source: **GitHub**
4. Repository: `chrolicious/hoolgg`
5. Branch: `main`

### 9.2 Configure Build

- **Build Pack**: Nixpacks
- **Base Directory**: `apps/web`
- **Port**: 3000
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`

### 9.3 Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.hool.gg
NEXT_PUBLIC_RECRUIT_API_URL=https://recruit.hool.gg
DATABASE_URL=postgresql://hool:<password>@hoolgg-postgres:5432/hoolgg
REDIS_URL=redis://hoolgg-redis:6379
NEXTAUTH_SECRET=<generate-random-secret>
NEXTAUTH_URL=https://hool.gg
BLIZZARD_CLIENT_ID=<from-blizzard-dev-portal>
BLIZZARD_CLIENT_SECRET=<from-blizzard-dev-portal>
```

### 9.4 Custom Domain

- **Domain**: `hool.gg`
- **HTTPS**: ✅ Auto (Let's Encrypt)

### 9.5 Deploy

Click **Deploy**

## Step 10: Run Database Migrations

### 10.1 Access Progress API Container

```bash
docker exec -it <progress-api-container-id> bash
```

### 10.2 Run Migrations

```bash
cd /app
python run_migrations.py
```

Or manually via psql:
```bash
docker exec -it <postgres-container-id> psql -U hool -d hoolgg -f /path/to/schema.sql
```

## Step 11: Verify Deployment

### 11.1 Health Checks

```bash
curl https://api.hool.gg/health
curl https://recruit.hool.gg/health
curl https://hool.gg
```

### 11.2 Test Full Flow

1. Visit https://hool.gg
2. Sign in with Battle.net
3. Add character to roster
4. Verify data loads correctly
5. Check database logs for errors

## Step 12: (Optional) Deploy Umami Analytics

### 12.1 Add Umami Service

1. Click **+ New Resource**
2. Select **Application**
3. Docker Image: `ghcr.io/umami-software/umami:postgresql-latest`

### 12.2 Environment Variables

```env
DATABASE_URL=postgresql://hool:<password>@hoolgg-postgres:5432/umami
DATABASE_TYPE=postgresql
HASH_SALT=<generate-random-salt>
```

### 12.3 Custom Domain

- **Domain**: `analytics.hool.gg`
- **HTTPS**: ✅ Auto

## Monitoring & Maintenance

### Logs

View logs in Coolify dashboard:
- **Application** → Select app → **Logs**

Or via Docker:
```bash
docker logs -f <container-name>
```

### Backups

Set up automated PostgreSQL backups:
```bash
# Create backup script
cat > /root/backup-postgres.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/backups/postgres"
mkdir -p $BACKUP_DIR
docker exec hoolgg-postgres pg_dump -U hool hoolgg | gzip > $BACKUP_DIR/hoolgg-$(date +%Y%m%d-%H%M%S).sql.gz
# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
EOF

chmod +x /root/backup-postgres.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /root/backup-postgres.sh" | crontab -
```

### SSL Certificate Renewal

Coolify automatically renews Let's Encrypt certificates. Verify:
```bash
docker exec coolify-proxy ls /etc/letsencrypt/live/
```

## Troubleshooting

### Application Won't Start

Check logs:
```bash
docker logs <container-name>
```

Common issues:
- Missing environment variables
- Database connection failed
- Port conflicts

### Database Connection Failed

Verify PostgreSQL is running:
```bash
docker ps | grep postgres
docker exec -it <postgres-container-id> pg_isready
```

### HTTPS Not Working

Check Coolify proxy logs:
```bash
docker logs coolify-proxy
```

Verify DNS is pointing to server:
```bash
dig hool.gg +short
```

## Security Checklist

- ✅ SSH key authentication only (disable password auth)
- ✅ Firewall configured (ports 22, 80, 443 only)
- ✅ Strong passwords for all services
- ✅ Environment secrets not committed to git
- ✅ HTTPS enabled for all domains
- ✅ Database backups automated
- ✅ Coolify admin account secured
- ✅ Server updates automated

## Next Steps

After deployment:

1. **Add Cloudflare CDN** (see TODO.md)
   - Point nameservers to Cloudflare
   - Enable proxy mode
   - Configure caching rules

2. **Set up monitoring**
   - Uptime monitoring (UptimeRobot, Better Uptime)
   - Error tracking (Sentry)
   - Performance monitoring (Umami)

3. **Configure CI/CD**
   - Auto-deploy from `main` branch
   - Run tests before deployment
   - Rollback on failure

4. **Scale as needed**
   - Upgrade server (CPX41, CCX13, etc.)
   - Add load balancer for high traffic
   - Separate database server

## Cost Estimate

**Monthly costs:**
- Hetzner CPX31: €13/month
- Bandwidth: €1/TB (first 20TB included)
- Backups: €2.60/month (20% of server cost)

**Total: ~€16-17/month**

**Note**: This assumes moderate traffic (<20TB/month). Add Cloudflare CDN to reduce bandwidth costs significantly.
