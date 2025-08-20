# Heroku Deployment Guide for Nexopeak

This guide covers deploying Nexopeak to Heroku for testing and production environments.

## 🚀 **Prerequisites**

### **1. Install Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### **2. Login to Heroku**
```bash
heroku login
```

### **3. Install Git (if not already installed)**
```bash
# macOS
brew install git

# Ubuntu/Debian
sudo apt-get install git

# Windows
# Download from: https://git-scm.com/download/win
```

## 🏗️ **Project Setup**

### **1. Initialize Git Repository**
```bash
git init
git add .
git commit -m "Initial commit for Heroku deployment"
```

### **2. Create Heroku Apps**
```bash
# Create backend app
heroku create nexopeak-backend --buildpack heroku/python

# Create frontend app
heroku create nexopeak-frontend --buildpack heroku/nodejs
```

## 🔧 **Backend Deployment**

### **1. Deploy Backend to Heroku**
```bash
# Navigate to backend directory
cd backend

# Add Heroku remote
heroku git:remote -a nexopeak-backend

# Deploy
git add .
git commit -m "Deploy backend to Heroku"
git push heroku main
```

### **2. Configure Backend Environment Variables**
```bash
# Set required environment variables
heroku config:set SECRET_KEY="your-super-secret-key-here"
heroku config:set GOOGLE_CLIENT_ID="your-google-client-id"
heroku config:set GOOGLE_CLIENT_SECRET="your-google-client-secret"
heroku config:set GOOGLE_CLOUD_PROJECT="your-gcp-project-id"

# Optional variables
heroku config:set SENDGRID_API_KEY="your-sendgrid-key"
heroku config:set FROM_EMAIL="noreply@yourdomain.com"
heroku config:set SLACK_BOT_TOKEN="your-slack-token"
heroku config:set SLACK_SIGNING_SECRET="your-slack-secret"
```

### **3. Add Database and Redis Add-ons**
```bash
# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Add Redis
heroku addons:create heroku-redis:mini
```

### **4. Run Database Migrations**
```bash
# Run migrations (if you have them)
heroku run python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"

# Or run a specific migration script
heroku run python manage.py migrate
```

### **5. Scale the Backend**
```bash
# Scale web dynos
heroku ps:scale web=1

# Scale worker dynos for Celery
heroku ps:scale worker=1

# Scale beat dynos for scheduled tasks
heroku ps:scale beat=1
```

## 🎨 **Frontend Deployment**

### **1. Deploy Frontend to Heroku**
```bash
# Navigate to frontend directory
cd frontend

# Add Heroku remote
heroku git:remote -a nexopeak-frontend

# Deploy
git add .
git commit -m "Deploy frontend to Heroku"
git push heroku main
```

### **2. Configure Frontend Environment Variables**
```bash
# Set backend API URL
heroku config:set NEXT_PUBLIC_API_URL="https://nexopeak-backend.herokuapp.com"

# Set Google Analytics Client ID
heroku config:set NEXT_PUBLIC_GA_CLIENT_ID="your-google-client-id"
```

### **3. Scale the Frontend**
```bash
# Scale web dynos
heroku ps:scale web=1
```

## 🔍 **Verify Deployment**

### **1. Check Backend Status**
```bash
# Check backend app
heroku open -a nexopeak-backend

# Check logs
heroku logs --tail -a nexopeak-backend

# Check dynos
heroku ps -a nexopeak-backend
```

### **2. Check Frontend Status**
```bash
# Check frontend app
heroku open -a nexopeak-frontend

# Check logs
heroku logs --tail -a nexopeak-frontend

# Check dynos
heroku ps -a nexopeak-frontend
```

### **3. Test API Endpoints**
```bash
# Test health endpoint
curl https://nexopeak-backend.herokuapp.com/health

# Test API docs
curl https://nexopeak-backend.herokuapp.com/docs
```

## 🗄️ **Database Management**

### **1. Access PostgreSQL Database**
```bash
# Connect to database
heroku pg:psql -a nexopeak-backend

# View database info
heroku pg:info -a nexopeak-backend

# Create database backup
heroku pg:backups:capture -a nexopeak-backend

# Download backup
heroku pg:backups:download -a nexopeak-backend
```

### **2. Redis Management**
```bash
# Connect to Redis
heroku redis:cli -a nexopeak-backend

# View Redis info
heroku redis:info -a nexopeak-backend
```

## 📊 **Monitoring and Logs**

### **1. View Application Logs**
```bash
# Real-time logs
heroku logs --tail -a nexopeak-backend

# Recent logs
heroku logs -a nexopeak-backend

# Logs with specific source
heroku logs --source app -a nexopeak-backend
```

### **2. Monitor Performance**
```bash
# Check dyno usage
heroku ps -a nexopeak-backend

# Monitor add-ons
heroku addons -a nexopeak-backend

# Check app metrics
heroku metrics:web -a nexopeak-backend
```

## 🔄 **Continuous Deployment**

### **1. GitHub Integration**
```bash
# Connect GitHub repository
heroku pipelines:create nexopeak-pipeline

# Add apps to pipeline
heroku pipelines:add nexopeak-pipeline -a nexopeak-backend
heroku pipelines:add nexopeak-pipeline -a nexopeak-frontend

# Enable automatic deploys
heroku pipelines:enable-review-apps nexopeak-pipeline
```

### **2. Automatic Deploys**
```bash
# Enable automatic deploys from main branch
heroku pipelines:enable-review-apps nexopeak-pipeline --autodeploy
```

## 🚨 **Troubleshooting**

### **1. Common Issues**

#### **Build Failures**
```bash
# Check build logs
heroku builds:info -a nexopeak-backend

# Clear build cache
heroku plugins:install heroku-builds
heroku builds:cache:purge -a nexopeak-backend
```

#### **Database Connection Issues**
```bash
# Check database status
heroku pg:info -a nexopeak-backend

# Restart database
heroku pg:restart -a nexopeak-backend
```

#### **Memory Issues**
```bash
# Check memory usage
heroku ps:size -a nexopeak-backend

# Scale up dynos if needed
heroku ps:scale web=1:standard-1x -a nexopeak-backend
```

### **2. Performance Optimization**
```bash
# Enable dyno hibernation
heroku config:set DYNO_SLEEP=1

# Use connection pooling
heroku config:set DATABASE_POOL_SIZE=20

# Enable query logging
heroku config:set LOG_QUERIES=true
```

## 💰 **Cost Management**

### **1. Current Costs (as of 2024)**
- **Basic Dyno**: $7/month per dyno
- **Mini PostgreSQL**: $5/month
- **Mini Redis**: $15/month
- **Total**: ~$34/month for basic setup

### **2. Cost Optimization**
```bash
# Use hobby dynos for testing
heroku ps:scale web=1:hobby -a nexopeak-backend

# Use hobby database
heroku addons:create heroku-postgresql:hobby-dev

# Use hobby Redis
heroku addons:create heroku-redis:hobby-dev
```

## 🔒 **Security Best Practices**

### **1. Environment Variables**
```bash
# Never commit secrets to Git
# Use Heroku config vars for all sensitive data
# Rotate secrets regularly
```

### **2. SSL/TLS**
```bash
# Heroku provides SSL certificates automatically
# Custom domains require SSL certificate
heroku certs:auto:enable -a nexopeak-backend
```

### **3. Access Control**
```bash
# Limit access to production apps
# Use Heroku teams for collaboration
# Enable two-factor authentication
```

## 📚 **Additional Resources**

- [Heroku Dev Center](https://devcenter.heroku.com/)
- [Heroku CLI Commands](https://devcenter.heroku.com/articles/heroku-cli-commands)
- [Heroku Postgres](https://devcenter.heroku.com/articles/heroku-postgresql)
- [Heroku Redis](https://devcenter.heroku.com/articles/heroku-redis)
- [Heroku Buildpacks](https://devcenter.heroku.com/articles/buildpacks)

## 🆘 **Support**

For Heroku-specific issues:
1. Check [Heroku Status](https://status.heroku.com/)
2. Review [Heroku Dev Center](https://devcenter.heroku.com/)
3. Contact [Heroku Support](https://help.heroku.com/)
4. Check application logs: `heroku logs --tail -a your-app-name`
