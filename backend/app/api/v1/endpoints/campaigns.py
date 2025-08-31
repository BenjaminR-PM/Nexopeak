from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.models.user import User
from app.services.campaign_service import CampaignAnalyzerService
from app.services.auth_service import AuthService
from app.core.security import verify_token
from app.services.logging_service import get_logging_service, LogModule
from app.schemas.campaign import (
    Campaign, CampaignCreate, CampaignUpdate, CampaignListResponse,
    CampaignQuestionnaire, StartAnalysisRequest,
    CampaignAnalysis, CampaignAnalysisResponse
)

router = APIRouter()
security = HTTPBearer()
logging_service = get_logging_service()

# Constants
CAMPAIGN_NOT_FOUND = "Campaign not found"

# Dependency to get current user with proper JWT authentication
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from JWT token."""
    try:
        payload = verify_token(credentials.credentials)
        user = AuthService.get_user_by_email(db, payload.get("sub"))
        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )
        return user
    except Exception as e:
        logging_service.log(LogModule.AUTH, f"Invalid authentication credentials: {e}", "ERROR")
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )

@router.post("/", response_model=Campaign)
async def create_campaign(
    campaign_data: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new campaign"""
    service = CampaignAnalyzerService(db)
    campaign = service.create_campaign(campaign_data, current_user.id, current_user.org_id)
    return campaign

@router.get("/", response_model=CampaignListResponse)
async def get_campaigns(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    campaign_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get campaigns with filtering and pagination"""
    service = CampaignAnalyzerService(db)
    campaigns, total = service.get_campaigns(
        org_id=current_user.org_id,
        user_id=None,  # Get all campaigns for the organization
        status=status,
        campaign_type=campaign_type,
        page=page,
        per_page=per_page
    )
    
    return CampaignListResponse(
        campaigns=campaigns,
        total=total,
        page=page,
        per_page=per_page
    )

@router.get("/{campaign_id}", response_model=Campaign)
async def get_campaign(
    campaign_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific campaign"""
    service = CampaignAnalyzerService(db)
    campaign = service.get_campaign(campaign_id, current_user.org_id)
    
    if not campaign:
        raise HTTPException(status_code=404, detail=CAMPAIGN_NOT_FOUND)
    
    return campaign

@router.put("/{campaign_id}", response_model=Campaign)
async def update_campaign(
    campaign_id: UUID,
    campaign_data: CampaignUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a campaign"""
    service = CampaignAnalyzerService(db)
    campaign = service.update_campaign(campaign_id, campaign_data, current_user.org_id)
    
    if not campaign:
        raise HTTPException(status_code=404, detail=CAMPAIGN_NOT_FOUND)
    
    return campaign

@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a campaign"""
    service = CampaignAnalyzerService(db)
    success = service.delete_campaign(campaign_id, current_user.org_id)
    
    if not success:
        raise HTTPException(status_code=404, detail=CAMPAIGN_NOT_FOUND)
    
    return {"message": "Campaign deleted successfully"}

@router.post("/from-questionnaire", response_model=Campaign)
async def create_campaign_from_questionnaire(
    questionnaire: CampaignQuestionnaire,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a campaign from questionnaire data"""
    service = CampaignAnalyzerService(db)
    campaign = service.create_campaign_from_questionnaire(
        questionnaire, current_user.id, current_user.org_id
    )
    return campaign

@router.post("/{campaign_id}/analyze", response_model=CampaignAnalysis)
async def start_campaign_analysis(
    campaign_id: UUID,
    request: StartAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start campaign analysis"""
    service = CampaignAnalyzerService(db)
    
    # Check if campaign exists
    campaign = service.get_campaign(campaign_id, current_user.org_id)
    if not campaign:
        raise HTTPException(status_code=404, detail=CAMPAIGN_NOT_FOUND)
    
    # Update campaign with questionnaire data if provided
    if request.questionnaire_data:
        # You might want to update the campaign with new questionnaire data
        pass
    
    analysis = service.start_campaign_analysis(
        campaign_id, current_user.id, current_user.org_id, request.force_reanalysis
    )
    
    return analysis

@router.post("/analyze-questionnaire", response_model=CampaignAnalysisResponse)
async def analyze_questionnaire(
    request: StartAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create campaign from questionnaire and start analysis"""
    service = CampaignAnalyzerService(db)
    
    # Create campaign from questionnaire
    campaign = service.create_campaign_from_questionnaire(
        request.questionnaire_data, current_user.id, current_user.org_id
    )
    
    # Start analysis
    analysis = service.start_campaign_analysis(
        campaign.id, current_user.id, current_user.org_id, True
    )
    
    return CampaignAnalysisResponse(
        analysis=analysis,
        campaign=campaign
    )

@router.get("/{campaign_id}/analysis", response_model=CampaignAnalysis)
async def get_campaign_analysis(
    campaign_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the latest analysis for a campaign"""
    service = CampaignAnalyzerService(db)
    
    # Check if campaign exists
    campaign = service.get_campaign(campaign_id, current_user.org_id)
    if not campaign:
        raise HTTPException(status_code=404, detail=CAMPAIGN_NOT_FOUND)
    
    analysis = service.get_campaign_analysis(campaign_id, current_user.org_id)
    
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found for this campaign")
    
    return analysis

@router.get("/{campaign_id}/analysis/full", response_model=CampaignAnalysisResponse)
async def get_campaign_analysis_full(
    campaign_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get campaign analysis with full campaign details"""
    service = CampaignAnalyzerService(db)
    
    # Check if campaign exists
    campaign = service.get_campaign(campaign_id, current_user.org_id)
    if not campaign:
        raise HTTPException(status_code=404, detail=CAMPAIGN_NOT_FOUND)
    
    analysis = service.get_campaign_analysis(campaign_id, current_user.org_id)
    
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found for this campaign")
    
    return CampaignAnalysisResponse(
        analysis=analysis,
        campaign=campaign
    )

# Additional utility endpoints
@router.get("/types/options")
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

@router.get("/templates/questionnaire")
async def get_questionnaire_template():
    """Get questionnaire template for frontend"""
    return {
        "sections": [
            {
                "id": "basic_info",
                "title": "Basic Information",
                "fields": [
                    {
                        "name": "campaign_name",
                        "type": "text",
                        "label": "Campaign Name",
                        "required": True,
                        "placeholder": "Enter a descriptive name for your campaign"
                    },
                    {
                        "name": "business_goals",
                        "type": "multiselect",
                        "label": "Primary Business Goals",
                        "required": True,
                        "options": ["Brand Awareness", "Website Traffic", "Lead Generation", "Sales", "Engagement"]
                    },
                    {
                        "name": "target_action",
                        "type": "text",
                        "label": "What action do you want users to take?",
                        "required": True,
                        "placeholder": "e.g., Purchase product, Sign up for newsletter, Download app"
                    }
                ]
            },
            {
                "id": "budget_timeline",
                "title": "Budget & Timeline",
                "fields": [
                    {
                        "name": "budget_range",
                        "type": "select",
                        "label": "Budget Range",
                        "required": True,
                        "options": ["$500-1K", "$1K-5K", "$5K-10K", "$10K-25K", "$25K+"]
                    },
                    {
                        "name": "campaign_duration",
                        "type": "select",
                        "label": "Campaign Duration",
                        "required": True,
                        "options": ["1-2 weeks", "1 month", "2-3 months", "6 months", "Ongoing"]
                    },
                    {
                        "name": "seasonality",
                        "type": "text",
                        "label": "Seasonal Considerations",
                        "required": True,
                        "placeholder": "Are there seasonal factors that affect your business?"
                    }
                ]
            },
            {
                "id": "audience",
                "title": "Target Audience",
                "fields": [
                    {
                        "name": "target_audience_description",
                        "type": "textarea",
                        "label": "Describe Your Target Audience",
                        "required": True,
                        "placeholder": "Who is your ideal customer? Be as specific as possible."
                    },
                    {
                        "name": "audience_interests",
                        "type": "tags",
                        "label": "Audience Interests",
                        "required": False,
                        "placeholder": "Enter interests and hobbies of your target audience"
                    },
                    {
                        "name": "audience_pain_points",
                        "type": "tags",
                        "label": "Audience Pain Points",
                        "required": False,
                        "placeholder": "What problems does your audience face?"
                    }
                ]
            }
        ]
    }
