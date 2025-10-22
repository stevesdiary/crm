# CI/CD Pipeline & Monitoring Guide

Complete guide for CI/CD pipeline, Docker containerization, and monitoring setup.

## CI/CD Pipeline

### GitHub Actions Workflows

#### Main Pipeline (`.github/workflows/ci.yml`)
Triggers on push to `main` and `develop` branches.

**Stages:**
1. **Test** - Run tests with PostgreSQL and Redis
2. **Security** - Security audit and secret scanning
3. **Build** - Build and push Docker image
4. **Deploy** - Deploy to production ECS

#### Staging Pipeline (`.github/workflows/staging.yml`)
Triggers on push to `develop` branch.

**Features:**
- Automated testing with services
- Docker image caching
- Security scanning
- Coverage reporting
- Slack notifications

### Required GitHub Secrets

```bash
AWS_ACCESS_KEY_ID          # AWS credentials
AWS_SECRET_ACCESS_KEY      # AWS credentials
SLACK_WEBHOOK              # Slack notifications
CODECOV_TOKEN              # Code coverage (optional)
```

### Running Locally

```bash
# Run tests
npm test

# Run with coverage
npm run test:cov

# Lint code
npm run lint

# Build
npm run build
```

## Docker Containerization

### Dockerfile

Multi-stage build for optimized image size:
- **Builder stage**: Install dependencies and build
- **Production stage**: Minimal runtime image

**Features:**
- Non-root user for security
- Health checks
- Signal handling with dumb-init
- Optimized layer caching

### Build Docker Image

```bash
# Build
docker build -t crm-app:latest .

# Run locally
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  crm-app:latest
```

### Docker Compose

Full stack with monitoring:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

**Services:**
- `app` - CRM application (port 3000)
- `postgres` - PostgreSQL database (port 5432)
- `redis` - Redis cache (port 6379)
- `prometheus` - Metrics collection (port 9090)
- `grafana` - Dashboards (port 3001)
- `loki` - Log aggregation (port 3100)
- `promtail` - Log shipping

## Monitoring & Logging

### Prometheus Metrics

**Endpoint:** `http://localhost:3000/metrics`

**Available Metrics:**
- `http_requests_total` - Total HTTP requests
- `active_connections` - Active connections
- `db_query_duration_seconds` - Database query duration

**Access Prometheus:** `http://localhost:9090`

### Grafana Dashboards

**Access:** `http://localhost:3001`
**Credentials:** admin/admin

**Pre-configured Datasources:**
- Prometheus (metrics)
- Loki (logs)

**Dashboard Panels:**
- HTTP Request Rate
- Response Time (p95)
- Active Connections
- Error Rate
- Database Performance

### Loki Log Aggregation

**Access:** `http://localhost:3100`

**Query Examples:**
```logql
# All logs
{job="crm-api"}

# Error logs only
{job="crm-api"} |= "ERROR"

# HTTP requests
{job="crm-api"} |= "HTTP"
```

### Health Checks

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-01T12:00:00Z",
  "uptime": 3600,
  "database": "connected",
  "redis": "connected"
}
```

**Docker Health Check:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js
```

### Alerting

**Alert Rules** (`monitoring/alert_rules.yml`):
- High error rate (>5%)
- High response time (>2s)
- Service down
- Database connection issues
- High memory usage

**Alert Channels:**
- Slack
- Email
- PagerDuty

## Environment Management

### Environment Variables

**Development:**
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/crm_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret
NODE_ENV=development
```

**Staging:**
```bash
DATABASE_URL=postgresql://user:pass@staging-db:5432/crm_staging
REDIS_URL=redis://staging-redis:6379
JWT_SECRET=staging-secret
NODE_ENV=staging
```

**Production:**
```bash
DATABASE_URL=postgresql://user:pass@prod-db:5432/crm_prod
REDIS_URL=redis://prod-redis:6379
JWT_SECRET=prod-secret-from-secrets-manager
NODE_ENV=production
```

### Secrets Management

**AWS Secrets Manager:**
```bash
# Store secret
aws secretsmanager create-secret \
  --name crm/prod/jwt-secret \
  --secret-string "your-secret"

# Retrieve secret
aws secretsmanager get-secret-value \
  --secret-id crm/prod/jwt-secret \
  --query SecretString \
  --output text
```

**Environment-specific configs:**
- `.env.development`
- `.env.staging`
- `.env.production`

## Deployment Process

### Manual Deployment

```bash
# Deploy to staging
./scripts/deploy.sh staging v1.0.0

# Deploy to production
./scripts/deploy.sh production v1.0.0
```

### Automated Deployment

**Staging:** Automatic on push to `develop`
**Production:** Automatic on push to `main`

### Rollback

```bash
# Rollback to previous version
aws ecs update-service \
  --cluster crm-cluster \
  --service crm-service \
  --task-definition crm-task:PREVIOUS_VERSION \
  --force-new-deployment
```

### Blue-Green Deployment

```bash
# Create new task definition
aws ecs register-task-definition --cli-input-json file://task-def.json

# Update service with new task definition
aws ecs update-service \
  --cluster crm-cluster \
  --service crm-service \
  --task-definition crm-task:NEW_VERSION

# Monitor deployment
aws ecs describe-services \
  --cluster crm-cluster \
  --services crm-service
```

## Performance Monitoring

### Key Metrics

**Application:**
- Request rate (req/s)
- Response time (p50, p95, p99)
- Error rate (%)
- Active connections

**Database:**
- Query duration
- Connection pool usage
- Slow queries
- Deadlocks

**Infrastructure:**
- CPU usage
- Memory usage
- Disk I/O
- Network traffic

### Performance Optimization

**Caching:**
```typescript
// Redis caching
await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 3600);
```

**Database Indexing:**
```sql
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_leads_status ON leads(status);
```

**Connection Pooling:**
```typescript
// Prisma connection pool
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  pool_timeout = 20
  connection_limit = 10
}
```

## Logging Best Practices

### Log Levels

```typescript
logger.error('Critical error', { error, context });
logger.warn('Warning message', { details });
logger.info('Info message', { data });
logger.debug('Debug message', { trace });
```

### Structured Logging

```typescript
logger.log({
  level: 'info',
  message: 'User login',
  userId: user.id,
  ip: request.ip,
  timestamp: new Date().toISOString(),
});
```

### Log Retention

- **Development:** 7 days
- **Staging:** 30 days
- **Production:** 90 days

## Troubleshooting

### Check Application Logs

```bash
# Docker logs
docker-compose logs -f app

# Kubernetes logs
kubectl logs -f deployment/crm-app

# CloudWatch logs
aws logs tail /aws/ecs/crm-app --follow
```

### Check Metrics

```bash
# Prometheus query
curl 'http://localhost:9090/api/v1/query?query=http_requests_total'

# Application metrics
curl http://localhost:3000/metrics
```

### Database Connection Issues

```bash
# Test connection
docker exec -it crm-postgres psql -U postgres -d crm_db

# Check connections
SELECT count(*) FROM pg_stat_activity;
```

### Redis Connection Issues

```bash
# Test connection
docker exec -it crm-redis redis-cli ping

# Check memory
docker exec -it crm-redis redis-cli info memory
```

## Maintenance

### Database Backups

```bash
# Backup
pg_dump -h localhost -U postgres crm_db > backup.sql

# Restore
psql -h localhost -U postgres crm_db < backup.sql
```

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update packages
npm update

# Security audit
npm audit fix
```

### Scale Services

```bash
# Scale ECS service
aws ecs update-service \
  --cluster crm-cluster \
  --service crm-service \
  --desired-count 5
```

## Monitoring Checklist

- [ ] Prometheus scraping metrics
- [ ] Grafana dashboards configured
- [ ] Loki collecting logs
- [ ] Alert rules configured
- [ ] Health checks passing
- [ ] SSL certificates valid
- [ ] Backups running
- [ ] Monitoring alerts working
- [ ] Log retention configured
- [ ] Performance baselines established

## Security Checklist

- [ ] Secrets in AWS Secrets Manager
- [ ] Non-root Docker user
- [ ] Security scanning in CI/CD
- [ ] Dependencies up to date
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Database encrypted
- [ ] Audit logging enabled
- [ ] Access controls configured
- [ ] Vulnerability scanning enabled
