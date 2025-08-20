# Nexopeak — Digital Marketing Analytics MVP

A lean, GA4-anchored platform that enriches daily website performance with free public signals to generate actionable campaign recommendations.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+ and pip
- Google Cloud Platform account with BigQuery enabled
- Google Analytics 4 property
- Google Search Console property

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Environment Variables
Create `.env.local` in frontend and `.env` in backend:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GA_CLIENT_ID=your_ga_client_id

# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost/nexopeak
GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

## 🏗️ Architecture

- **Frontend**: Next.js 14 + Tailwind CSS + Recharts
- **Backend**: FastAPI + SQLAlchemy + Celery
- **Database**: PostgreSQL (app state) + BigQuery (analytics)
- **ETL**: Cloud Functions + scheduled jobs
- **Auth**: OAuth 2.0 with Google

## 📊 Core Features

1. **Daily Progress Tracking** - GA4 metrics with trend analysis
2. **Contextual Enrichment** - Search Console + Google Trends integration
3. **Insight Engine** - AI-generated recommendations with evidence
4. **Smart Alerts** - Email/Slack notifications for significant changes
5. **Multi-User Access** - Organization-level governance

## 🔄 Data Flow

1. Daily ETL jobs pull data from GA4, GSC, and Google Trends
2. Data flows: RAW → CORE → MARTS
3. Insight engine analyzes patterns and generates recommendations
4. Users receive actionable insights via dashboard and alerts

## 📈 Success Metrics

- Time to Value: < 10 minutes from signup
- 15+ actionable insights/user/month
- 60%+ weekly active users per org

## 🚧 Development Status

- [x] Project structure and architecture
- [x] Authentication and OAuth setup
- [x] GA4 data integration
- [x] Dashboard and insights engine
- [x] ETL pipeline
- [x] Alerting system
- [x] Production deployment
- [x] Heroku deployment configuration

## 🚀 Deployment Options

### Local Development
```bash
# Use the setup script for local development
./setup.sh
```

### Heroku Deployment (Recommended for Testing)
```bash
# Automated Heroku deployment
./deploy-heroku.sh

# Or follow the manual guide
# See docs/heroku-deployment.md
```

### Other Cloud Platforms
- **Google Cloud Platform**: See `docs/deployment.md`
- **AWS**: Infrastructure as Code with Terraform
- **DigitalOcean**: App Platform deployment

## 📚 Documentation

- [API Reference](./docs/api.md)
- [Data Model](./docs/data-model.md)
- [Deployment Guide](./docs/deployment.md)
- [Heroku Deployment](./docs/heroku-deployment.md)
- [Insight Rules](./docs/insights.md)

## 💰 Cost Comparison for Testing

| Platform | Free Tier | Test Environment Cost |
|----------|-----------|----------------------|
| **Local** | ✅ Free | $0/month |
| **Heroku** | ❌ None | $34/month (basic) |
| **Vercel + Supabase** | ✅ Generous | $0-25/month |
| **Google Cloud** | ✅ Generous | $0-50/month |

## 🔧 Quick Heroku Setup

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Login
   heroku login
   ```

2. **Deploy with One Command**
   ```bash
   ./deploy-heroku.sh
   ```

3. **Access Your App**
   - Frontend: `https://your-app-name.herokuapp.com`
   - Backend: `https://your-backend-name.herokuapp.com`
   - API Docs: `https://your-backend-name.herokuapp.com/docs`

## 🆘 Support

For deployment issues:
1. Check the relevant deployment guide
2. Review logs: `heroku logs --tail -a your-app-name`
3. Verify environment variables
4. Check service status and add-ons
