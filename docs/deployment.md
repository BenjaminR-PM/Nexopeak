# Nexopeak Deployment Guide

This guide covers deploying Nexopeak to various environments, from local development to production.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and npm (for local development)
- Python 3.11+ and pip (for local development)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd Nexopeak
```

### 2. Environment Configuration
Create environment files:

**Backend (.env)**
```bash
# Database
DATABASE_URL=postgresql://nexopeak:nexopeak123@localhost:5432/nexopeak

# Security
SECRET_KEY=your-super-secret-key-here-change-in-production

# Google APIs
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CLOUD_PROJECT=your-gcp-project-id

# Redis
REDIS_URL=redis://localhost:6379

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com

# Slack
SLACK_BOT_TOKEN=your-slack-bot-token
SLACK_SIGNING_SECRET=your-slack-signing-secret
```

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GA_CLIENT_ID=your-google-client-id
```

### 3. Start Services
```bash
# Start all services
docker-compose up -d

# Or start specific services
docker-compose up postgres redis -d
docker-compose up backend -d
docker-compose up frontend -d
```

### 4. Verify Deployment
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## 🏗️ Production Deployment

### Option 1: Google Cloud Platform (Recommended)

#### 1.1 Project Setup
```bash
# Install Google Cloud CLI
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sql-component.googleapis.com \
  redis.googleapis.com \
  bigquery.googleapis.com \
  analytics.googleapis.com \
  searchconsole.googleapis.com
```

#### 1.2 Database Setup
```bash
# Create Cloud SQL instance
gcloud sql instances create nexopeak-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB

# Create database
gcloud sql databases create nexopeak --instance=nexopeak-db

# Create user
gcloud sql users create nexopeak \
  --instance=nexopeak-db \
  --password=your-secure-password
```

#### 1.3 Redis Setup
```bash
# Create Redis instance
gcloud redis instances create nexopeak-redis \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0
```

#### 1.4 BigQuery Setup
```bash
# Create dataset
bq mk --dataset nexopeak:analytics

# Create tables (run SQL scripts from backend/sql/)
bq query --use_legacy_sql=false < backend/sql/create_tables.sql
```

#### 1.5 Deploy Backend
```bash
# Build and deploy to Cloud Run
gcloud run deploy nexopeak-backend \
  --source backend/ \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="DATABASE_URL=postgresql://nexopeak:password@/nexopeak?host=/cloudsql/YOUR_PROJECT_ID:us-central1:nexopeak-db"
```

#### 1.6 Deploy Frontend
```bash
# Build and deploy to Cloud Run
gcloud run deploy nexopeak-frontend \
  --source frontend/ \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Option 2: AWS

#### 2.1 Infrastructure as Code (Terraform)
```bash
# Install Terraform
terraform init
terraform plan
terraform apply
```

#### 2.2 Manual Setup
- **RDS**: PostgreSQL instance
- **ElastiCache**: Redis instance
- **ECS/Fargate**: Container orchestration
- **CloudFront**: CDN for frontend
- **Route 53**: DNS management

### Option 3: DigitalOcean

#### 3.1 App Platform
```bash
# Deploy using DigitalOcean App Platform
doctl apps create --spec app.yaml
```

#### 3.2 Managed Databases
- **PostgreSQL**: Managed database cluster
- **Redis**: Managed Redis cluster

## 🔐 Security Configuration

### 1. Environment Variables
```bash
# Generate secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Use strong passwords
# Enable SSL/TLS for all connections
# Rotate credentials regularly
```

### 2. OAuth Setup
```bash
# Google Cloud Console
1. Create OAuth 2.0 credentials
2. Add authorized redirect URIs
3. Configure consent screen
4. Set scopes for GA4 and Search Console
```

### 3. SSL/TLS
```bash
# Let's Encrypt (free)
certbot --nginx -d yourdomain.com

# Or use managed certificates from your cloud provider
```

## 📊 Monitoring and Observability

### 1. Application Monitoring
```bash
# Health checks
curl https://yourdomain.com/health

# Metrics endpoint
curl https://yourdomain.com/metrics
```

### 2. Logging
```bash
# Structured logging with JSON
# Log aggregation (ELK stack, DataDog, etc.)
# Error tracking (Sentry)
```

### 3. Performance Monitoring
```bash
# APM tools (New Relic, DataDog APM)
# Database performance monitoring
# Infrastructure monitoring
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy Backend
        run: |
          gcloud run deploy nexopeak-backend \
            --source backend/ \
            --region us-central1
            
      - name: Deploy Frontend
        run: |
          gcloud run deploy nexopeak-frontend \
            --source frontend/ \
            --region us-central1
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection
```bash
# Check connection
psql -h localhost -U nexopeak -d nexopeak

# Verify environment variables
echo $DATABASE_URL
```

#### 2. Redis Connection
```bash
# Test Redis
redis-cli ping

# Check Redis logs
docker logs nexopeak-redis
```

#### 3. OAuth Issues
```bash
# Verify Google credentials
# Check redirect URIs
# Verify scopes
```

#### 4. BigQuery Access
```bash
# Test BigQuery connection
bq ls nexopeak:analytics

# Verify service account permissions
```

## 📈 Scaling Considerations

### 1. Database Scaling
- Read replicas for analytics queries
- Connection pooling
- Query optimization

### 2. Application Scaling
- Horizontal scaling with load balancers
- Auto-scaling based on metrics
- CDN for static assets

### 3. Data Processing
- Batch processing for large datasets
- Stream processing for real-time insights
- Data partitioning strategies

## 🔒 Compliance and Privacy

### 1. GDPR Compliance
- Data retention policies
- User consent management
- Data export/deletion capabilities

### 2. Security Standards
- SOC 2 compliance
- Regular security audits
- Penetration testing

## 📚 Additional Resources

- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Google Cloud Best Practices](https://cloud.google.com/architecture/best-practices)
- [Docker Production Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🆘 Support

For deployment issues:
1. Check logs: `docker-compose logs [service-name]`
2. Verify environment variables
3. Check network connectivity
4. Review security group/firewall rules
5. Consult cloud provider documentation
