# Deployment Checklist

Quick reference checklist for deploying hool.gg to production.

## Pre-Deployment

- [ ] Code merged to `main` branch
- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] Database migration scripts ready
- [ ] Blizzard API credentials obtained

## 1. Server Setup (30-45 min)

- [ ] Create Hetzner Cloud account
- [ ] Create new project: `hoolgg-production`
- [ ] Provision CPX31 server in Falkenstein (fsn1)
  - Ubuntu 24.04
  - Add SSH key
  - Configure firewall (22, 80, 443)
- [ ] Note server IP address: `___________________`
- [ ] Test SSH access: `ssh root@<server-ip>`

## 2. DNS Configuration (10 min + propagation time)

- [ ] Create A record: `@` → `<server-ip>`
- [ ] Create A record: `*` → `<server-ip>`
- [ ] Create AAAA record: `@` → `<server-ipv6>`
- [ ] Wait for DNS propagation (5-10 min)
- [ ] Verify with: `dig hool.gg +short`

## 3. Install Coolify (15 min)

- [ ] Update system: `apt update && apt upgrade -y`
- [ ] Install Coolify: `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`
- [ ] Access dashboard: `http://<server-ip>:8000`
- [ ] Create admin account (save credentials!)
- [ ] Set instance domain: `coolify.hool.gg`
- [ ] Enable automatic HTTPS

## 4. Create Coolify Project (5 min)

- [ ] Create project: `hool.gg`
- [ ] Create environment: `production`

## 5. Deploy Database Services (20 min)

### PostgreSQL
- [ ] Add PostgreSQL 16 service
  - Name: `hoolgg-postgres`
  - Database: `hoolgg`
  - Username: `hool`
  - Password: `___________________` (save in password manager!)
- [ ] Deploy and verify: `docker exec -it <postgres-id> pg_isready`

### Redis
- [ ] Add Redis 7 service
  - Name: `hoolgg-redis`
- [ ] Deploy and verify: `docker exec -it <redis-id> redis-cli ping`

## 6. Deploy Progress API (30 min)

- [ ] Add new application from GitHub
  - Repository: `chrolicious/hoolgg`
  - Branch: `main`
  - Base directory: `services/progress-api`
  - Port: 5000
- [ ] Configure environment variables:
  ```
  DATABASE_URL=postgresql://hool:<password>@hoolgg-postgres:5432/hoolgg
  REDIS_URL=redis://hoolgg-redis:6379
  BLIZZARD_CLIENT_ID=___________________
  BLIZZARD_CLIENT_SECRET=___________________
  FLASK_ENV=production
  SECRET_KEY=___________________
  ```
- [ ] Set domain: `api.hool.gg`
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Deploy
- [ ] Verify: `curl https://api.hool.gg/health`

## 7. Deploy Recruitment API (30 min)

- [ ] Add new application from GitHub
  - Repository: `chrolicious/hoolgg`
  - Branch: `main`
  - Base directory: `services/recruitment-api`
  - Port: 5000
- [ ] Configure environment variables (same as Progress API)
- [ ] Set domain: `recruit.hool.gg`
- [ ] Enable HTTPS
- [ ] Deploy
- [ ] Verify: `curl https://recruit.hool.gg/health`

## 8. Deploy Next.js Web App (30 min)

- [ ] Add new application from GitHub
  - Repository: `chrolicious/hoolgg`
  - Branch: `main`
  - Base directory: `apps/web`
  - Port: 3000
- [ ] Configure environment variables:
  ```
  NEXT_PUBLIC_API_URL=https://api.hool.gg
  NEXT_PUBLIC_RECRUIT_API_URL=https://recruit.hool.gg
  DATABASE_URL=postgresql://hool:<password>@hoolgg-postgres:5432/hoolgg
  REDIS_URL=redis://hoolgg-redis:6379
  NEXTAUTH_SECRET=___________________
  NEXTAUTH_URL=https://hool.gg
  BLIZZARD_CLIENT_ID=___________________
  BLIZZARD_CLIENT_SECRET=___________________
  ```
- [ ] Set domain: `hool.gg`
- [ ] Enable HTTPS
- [ ] Deploy
- [ ] Verify: `curl https://hool.gg`

## 9. Database Migrations (10 min)

- [ ] Access Progress API container: `docker exec -it <container-id> bash`
- [ ] Run migrations: `python run_migrations.py`
- [ ] Or manually: `docker exec -it <postgres-id> psql -U hool -d hoolgg -f schema.sql`
- [ ] Verify tables exist

## 10. Testing & Verification (30 min)

### Health Checks
- [ ] `curl https://api.hool.gg/health` → 200 OK
- [ ] `curl https://recruit.hool.gg/health` → 200 OK
- [ ] `curl https://hool.gg` → 200 OK

### Functional Tests
- [ ] Visit https://hool.gg in browser
- [ ] Sign in with Battle.net
- [ ] Add character to roster
- [ ] View character detail page
- [ ] Check equipment loads correctly
- [ ] Check BiS tracker works
- [ ] Test weekly tasks tracking
- [ ] Test vault progress

### Error Monitoring
- [ ] Check Progress API logs: `docker logs <container-name>`
- [ ] Check Recruitment API logs
- [ ] Check Next.js logs
- [ ] Check PostgreSQL logs
- [ ] No critical errors found

## 11. Security Hardening (15 min)

- [ ] Disable SSH password authentication
  ```bash
  sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
  systemctl restart sshd
  ```
- [ ] Verify firewall rules (only 22, 80, 443)
- [ ] Set up fail2ban for SSH protection
  ```bash
  apt install fail2ban -y
  systemctl enable fail2ban
  systemctl start fail2ban
  ```
- [ ] Enable unattended security updates
  ```bash
  apt install unattended-upgrades -y
  dpkg-reconfigure -plow unattended-upgrades
  ```

## 12. Backups Setup (10 min)

- [ ] Create backup script: `/root/backup-postgres.sh`
- [ ] Make executable: `chmod +x /root/backup-postgres.sh`
- [ ] Add to crontab: `0 2 * * * /root/backup-postgres.sh`
- [ ] Create backup directory: `mkdir -p /backups/postgres`
- [ ] Test backup manually: `/root/backup-postgres.sh`
- [ ] Verify backup created: `ls -lh /backups/postgres/`

## 13. (Optional) Umami Analytics (20 min)

- [ ] Add Umami application (Docker image)
  - Image: `ghcr.io/umami-software/umami:postgresql-latest`
- [ ] Configure environment variables
- [ ] Set domain: `analytics.hool.gg`
- [ ] Enable HTTPS
- [ ] Deploy
- [ ] Configure tracking code in Next.js

## Post-Deployment

### Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, Better Uptime)
- [ ] Configure error tracking (Sentry)
- [ ] Monitor server resources (CPU, RAM, disk)

### Performance
- [ ] Test page load times
- [ ] Check API response times
- [ ] Monitor database query performance

### Documentation
- [ ] Update CLAUDE.md with production URLs
- [ ] Document deployment process improvements
- [ ] Update README with production status

## Future Optimizations (see TODO.md)

- [ ] Add Cloudflare CDN
  - Point nameservers to Cloudflare
  - Enable proxy mode
  - Configure caching rules
  - Test performance improvements

- [ ] Set up CI/CD
  - Auto-deploy from `main` branch
  - Run tests before deployment
  - Rollback on failure

- [ ] Scale as needed
  - Monitor resource usage
  - Upgrade server if needed
  - Consider load balancer for high traffic

## Credentials to Save

**Hetzner:**
- Account email: `___________________`
- SSH key: `___________________`
- Server IP: `___________________`

**Coolify:**
- Admin email: `___________________`
- Admin password: `___________________`
- Instance URL: `https://coolify.hool.gg`

**PostgreSQL:**
- Username: `hool`
- Password: `___________________`
- Database: `hoolgg`

**Redis:**
- No password (internal network only)

**Environment Secrets:**
- `BLIZZARD_CLIENT_ID`: `___________________`
- `BLIZZARD_CLIENT_SECRET`: `___________________`
- `NEXTAUTH_SECRET`: `___________________`
- `SECRET_KEY` (Flask): `___________________`

## Estimated Total Time

**First deployment:** 4-5 hours
**With this checklist:** 3-4 hours

## Support Resources

- Hetzner Docs: https://docs.hetzner.com/
- Coolify Docs: https://coolify.io/docs
- Project Docs: `docs/deployment/HETZNER_SETUP.md`
