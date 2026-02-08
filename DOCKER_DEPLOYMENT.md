# 🚀 Solana AI City - Docker Deployment Guide

This guide covers deploying Solana AI City using Docker for production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Development vs Production](#development-vs-production)
- [SSL/TLS Setup](#ssltls-setup)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Docker Engine** 20.10+ 
- **Docker Compose** 2.0+
- **Git**
- **Valid SSL certificates** (for production)

### Install Docker

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker

# macOS
brew install --cask docker

# Windows
# Download Docker Desktop from https://docker.com
```

### Verify Installation

```bash
docker --version          # Docker version20.10+
 docker-compose --version  # Docker Compose 2.0+
docker ps                 # Should show running containers
```

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/xixih6863-ctrl/solana-ai-city.git
cd solana-ai-city
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

### 3. Start Services

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost | Main application |
| API | http://localhost:4000 | Backend API |
| Prometheus | http://localhost:9090 | Metrics |
| Grafana | http://localhost:3001 | Dashboards |

---

## Environment Configuration

### Required Variables

```bash
# .env

# Solana Network
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
CLUSTER=mainnet-beta

# Database
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=solana_ai_city
DATABASE_URL=postgresql://user:pass@db:5432/solana_ai_city

# Redis
REDIS_URL=redis://redis:6379

# Application
NODE_ENV=production
VITE_APP_URL=https://yourdomain.com

# Security
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-character-encryption-key
```

### Optional Variables

```bash
# Monitoring
GRAFANA_USER=admin
GRAFANA_PASSWORD=secure_password

# Analytics
GA_TRACKING_ID=UA-XXXXX-Y
SENTRY_DSN=https://xxx@sentry.io/xxx

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

---

## Development vs Production

### Development Mode

```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Frontend with hot reload
# Backend with auto-restart
# Database with test data
```

### Production Mode

```bash
# Build optimized images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Services included:
# - Nginx reverse proxy
# - SSL/TLS certificates
# - Prometheus monitoring
# - Grafana dashboards
```

---

## SSL/TLS Setup

### Using Let's Encrypt (Free)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Using Self-Signed Certificates (Testing)

```bash
# Generate self-signed certificate
mkdir ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/private.key \
  -out ssl/certificate.crt \
  -subj "/C=US/ST=State/L=City/O=Organization"

# Update permissions
chmod 600 ssl/private.key
```

---

## Monitoring

### Access Prometheus

1. Open http://localhost:9090
2. Query examples:
   ```
   # Container CPU usage
   rate(container_cpu_usage_seconds_total{name="solana-ai-city-frontend"}[5m])
   
   # Memory usage
   container_memory_usage_bytes{name="solana-ai-city-backend"}
   
   # HTTP requests
   rate(http_requests_total{service="frontend"}[5m])
   ```

### Access Grafana

1. Open http://localhost:3001
2. Login with credentials from `.env`
3. Default dashboards:
   - **App Overview**: General metrics
   - **API Performance**: Response times
   - **Infrastructure**: CPU/Memory/Disk

### Set Up Alerts

```yaml
# prometheus/alert.yml
groups:
  - name: solana-ai-city-alerts
    rules:
      - alert: HighCPUUsage
        expr: rate(container_cpu_usage_seconds_total{name=~"solana-ai-city.*"}[5m]) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          
      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes{name=~"solana-ai-city.*"} / container_spec_memory_limit_bytes > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs frontend
docker-compose logs backend

# Check port conflicts
sudo netstat -tlnp | grep :80

# Restart container
docker-compose restart frontend
```

### Database Connection Issues

```bash
# Check database status
docker-compose exec db pg_isready

# View database logs
docker-compose logs db

# Reset database
docker-compose down -v
docker-compose up -d db
docker-compose up -d
```

### Frontend Not Loading

```bash
# Check if build exists
ls -la frontend/dist/

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend

# Check nginx logs
docker-compose logs nginx
```

### Out of Memory

```bash
# Check container stats
docker stats

# Increase Docker memory (Docker Desktop)
# Settings > Resources > Memory > 4GB+
```

### SSL Certificate Issues

```bash
# Check certificate expiration
openssl x509 -enddate -noout -in ssl/certificate.crt

# Renew Let's Encrypt
sudo certbot renew --quiet

# Test SSL configuration
curl -v https://yourdomain.com
```

---

## Scaling

### Horizontal Scaling

```bash
# Scale frontend instances
docker-compose scale frontend=3

# Scale backend instances
docker-compose scale backend=2

# Update load balancer
```

### Performance Tuning

```nginx
# nginx.conf optimizations
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 65535;
    use epoll;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

---

## Backup & Restore

### Database Backup

```bash
# Create backup
docker-compose exec db pg_dump -U user solana_ai_city > backup_$(date +%Y%m%d).sql

# Automated backups (cron)
0 2 * * * docker-compose exec db pg_dump -U user solana_ai_city | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```

### Database Restore

```bash
# Restore from backup
docker-compose exec -T db psql -U user -d solana_ai_city < backup_20240207.sql
```

### Volume Backup

```bash
# Backup volumes
docker run --rm -v solana-ai-city_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data

# Restore volumes
docker run --rm -v solana-ai-city_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /
```

---

## Security Best Practices

### 1. Use Secrets Management

```bash
# Create secrets
echo "your-password" | docker secret create postgresql_password -
echo "your-jwt-secret" | docker secret create jwt_secret -
```

### 2. Network Security

```yaml
# docker-compose.yml
services:
  frontend:
    networks:
      - solana-ai-city-network-internal
    expose:
      - "3000"
      
  backend:
    networks:
      - solana-ai-city-network-internal
    expose:
      - "4000"
      
networks:
  solana-ai-city-network-internal:
    internal: true
```

### 3. Regular Updates

```bash
# Update base images
docker-compose pull
docker-compose up -d

# Scan for vulnerabilities
docker scan solana-ai-city-frontend
```

---

## Support

- **GitHub Issues**: https://github.com/xixih6863-ctrl/solana-ai-city/issues
- **Documentation**: https://github.com/xixih6863-ctrl/solana-ai-city/tree/main/docs
- **Discord**: Join our Discord server

---

## License

MIT License - See [LICENSE](LICENSE) for details.
