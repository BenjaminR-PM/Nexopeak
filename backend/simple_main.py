#!/usr/bin/env python3

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from sqlalchemy.orm import Session

from app.core.database import create_tables, get_db
from app.schemas.campaign import CampaignQuestionnaire

# Import our campaign endpoints without authentication
from app.services.campaign_service import CampaignAnalyzerService

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up Nexopeak Campaign Analyzer API...")
    # Create database tables
    create_tables()
    yield
    # Shutdown
    print("Shutting down Nexopeak Campaign Analyzer API...")

app = FastAPI(
    title="Nexopeak Campaign Analyzer API",
    description="Campaign Analysis Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000", 
        "https://nexopeak-frontend-d38117672e4d.herokuapp.com",
        "https://staging.nexopeak.ca",
        "https://nexopeak.ca",
        "https://www.nexopeak.ca"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Nexopeak Campaign Analyzer API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "Campaign Analyzer API is running"
    }

# Campaign endpoints (simplified without authentication)
@app.get("/api/v1/campaigns/types/options")
async def get_campaign_type_options():
    """Get available campaign type options"""
    return {
        "campaign_types": [
            {"value": "search", "label": "Search", "description": "Text ads on search results"},
            {"value": "display", "label": "Display", "description": "Visual ads on websites"},
            {"value": "video", "label": "Video", "description": "Video ads on platforms like YouTube"},
            {"value": "shopping", "label": "Shopping", "description": "Product ads with images and prices"},
            {"value": "performance_max", "label": "Performance Max", "description": "AI-driven cross-platform campaigns"},
            {"value": "app", "label": "App", "description": "Promote mobile app installs"},
            {"value": "local", "label": "Local", "description": "Drive visits to physical locations"}
        ],
        "platforms": [
            {"value": "google_ads", "label": "Google Ads", "description": "Google's advertising platform"},
            {"value": "facebook", "label": "Facebook", "description": "Facebook advertising"},
            {"value": "instagram", "label": "Instagram", "description": "Instagram advertising"},
            {"value": "linkedin", "label": "LinkedIn", "description": "Professional network advertising"},
            {"value": "twitter", "label": "Twitter", "description": "Twitter advertising"},
            {"value": "tiktok", "label": "TikTok", "description": "TikTok advertising"},
            {"value": "snapchat", "label": "Snapchat", "description": "Snapchat advertising"},
            {"value": "pinterest", "label": "Pinterest", "description": "Pinterest advertising"}
        ],
        "objectives": [
            {"value": "awareness", "label": "Brand Awareness", "description": "Increase brand visibility"},
            {"value": "traffic", "label": "Website Traffic", "description": "Drive visitors to website"},
            {"value": "leads", "label": "Lead Generation", "description": "Generate leads and inquiries"},
            {"value": "sales", "label": "Sales", "description": "Drive online sales"},
            {"value": "conversions", "label": "Conversions", "description": "Drive specific actions"},
            {"value": "engagement", "label": "Engagement", "description": "Increase social engagement"},
            {"value": "app_installs", "label": "App Installs", "description": "Drive mobile app downloads"}
        ]
    }

@app.post("/api/v1/campaigns/analyze-questionnaire")
async def analyze_questionnaire(
    questionnaire: CampaignQuestionnaire,
    db: Session = Depends(get_db)
):
    """Analyze questionnaire and create campaign with analysis"""
    try:
        service = CampaignAnalyzerService(db)
        
        # Mock user and org IDs for development
        mock_user_id = "demo-user-123"
        mock_org_id = "demo-org-123"
        
        # Create campaign from questionnaire
        campaign = service.create_campaign_from_questionnaire(
            questionnaire, mock_user_id, mock_org_id
        )
        
        # Start analysis
        analysis = service.start_campaign_analysis(
            campaign.id, mock_user_id, mock_org_id, True
        )
        
        return {
            "campaign": {
                "id": campaign.id,
                "name": campaign.name,
                "status": campaign.status,
                "created_at": campaign.created_at
            },
            "analysis": {
                "id": analysis.id,
                "status": analysis.status,
                "overall_score": analysis.overall_score,
                "gap_scores": analysis.gap_scores,
                "recommendations": analysis.recommendations,
                "priority_actions": analysis.priority_actions
            }
        }
    except Exception as e:
        print(f"Error in analyze_questionnaire: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)

