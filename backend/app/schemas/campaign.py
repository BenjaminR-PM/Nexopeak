from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

# Base schemas
class CampaignBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    campaign_type: str = Field(..., description="Type of campaign: search, display, video, shopping, etc.")
    platform: str = Field(..., description="Platform: google_ads, facebook, instagram, etc.")
    primary_objective: str = Field(..., description="Primary campaign objective")
    secondary_objectives: List[str] = Field(default=[], description="Secondary objectives")
    target_kpis: Dict[str, Any] = Field(default={}, description="Target KPIs and metrics")
    
    # Budget and timeline
    total_budget: Optional[float] = Field(None, gt=0)
    daily_budget: Optional[float] = Field(None, gt=0)
    currency: str = Field(default="USD", max_length=3)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    
    # Target audience
    target_demographics: Dict[str, Any] = Field(default={}, description="Demographics targeting")
    target_locations: List[str] = Field(default=[], description="Geographic targeting")
    target_interests: List[str] = Field(default=[], description="Interest-based targeting")
    target_behaviors: List[str] = Field(default=[], description="Behavioral targeting")
    audience_size_estimate: Optional[int] = Field(None, gt=0)
    
    # Creative and messaging
    creative_assets: Dict[str, Any] = Field(default={}, description="Creative assets metadata")
    messaging_themes: List[str] = Field(default=[], description="Key messaging themes")
    call_to_action: Optional[str] = None
    landing_page_url: Optional[str] = None
    
    # Campaign settings
    bidding_strategy: Optional[str] = None
    ad_scheduling: Dict[str, Any] = Field(default={}, description="Ad scheduling settings")
    device_targeting: List[str] = Field(default=[], description="Device targeting")
    
    # Additional metadata
    tags: List[str] = Field(default=[], description="Campaign tags")
    custom_fields: Dict[str, Any] = Field(default={}, description="Custom fields")

    @validator('end_date')
    def end_date_after_start_date(cls, v, values):
        if v and 'start_date' in values and values['start_date']:
            if v <= values['start_date']:
                raise ValueError('End date must be after start date')
        return v

    @validator('campaign_type')
    def validate_campaign_type(cls, v):
        allowed_types = ['search', 'display', 'video', 'shopping', 'performance_max', 'app', 'smart', 'local']
        if v.lower() not in allowed_types:
            raise ValueError(f'Campaign type must be one of: {", ".join(allowed_types)}')
        return v.lower()

    @validator('platform')
    def validate_platform(cls, v):
        allowed_platforms = ['google_ads', 'facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'snapchat', 'pinterest']
        if v.lower() not in allowed_platforms:
            raise ValueError(f'Platform must be one of: {", ".join(allowed_platforms)}')
        return v.lower()


# Schema for creating a new campaign
class CampaignCreate(CampaignBase):
    status: str = Field(default="draft", description="Campaign status")

    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ['draft', 'active', 'paused', 'completed']
        if v.lower() not in allowed_statuses:
            raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v.lower()


# Schema for updating a campaign
class CampaignUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    campaign_type: Optional[str] = None
    platform: Optional[str] = None
    status: Optional[str] = None
    primary_objective: Optional[str] = None
    secondary_objectives: Optional[List[str]] = None
    target_kpis: Optional[Dict[str, Any]] = None
    total_budget: Optional[float] = Field(None, gt=0)
    daily_budget: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=3)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    target_demographics: Optional[Dict[str, Any]] = None
    target_locations: Optional[List[str]] = None
    target_interests: Optional[List[str]] = None
    target_behaviors: Optional[List[str]] = None
    audience_size_estimate: Optional[int] = Field(None, gt=0)
    creative_assets: Optional[Dict[str, Any]] = None
    messaging_themes: Optional[List[str]] = None
    call_to_action: Optional[str] = None
    landing_page_url: Optional[str] = None
    bidding_strategy: Optional[str] = None
    ad_scheduling: Optional[Dict[str, Any]] = None
    device_targeting: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    custom_fields: Optional[Dict[str, Any]] = None


# Schema for campaign response
class Campaign(CampaignBase):
    id: UUID
    org_id: UUID
    user_id: UUID
    status: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Campaign questionnaire schemas
class CampaignQuestionnaire(BaseModel):
    """Schema for the campaign analyzer questionnaire"""
    
    # Basic information
    campaign_name: str = Field(..., description="What would you like to name this campaign?")
    business_goals: List[str] = Field(..., description="What are your primary business goals?")
    target_action: str = Field(..., description="What action do you want users to take?")
    
    # Budget and timeline
    budget_range: str = Field(..., description="What's your budget range? (e.g., '$1K-5K', '$5K-10K', '$10K+')")
    campaign_duration: str = Field(..., description="How long will this campaign run?")
    seasonality: str = Field(..., description="Are there seasonal factors to consider?")
    
    # Target audience
    target_audience_description: str = Field(..., description="Describe your target audience")
    audience_demographics: Dict[str, Any] = Field(default={}, description="Demographic details")
    audience_interests: List[str] = Field(default=[], description="What are their interests?")
    audience_pain_points: List[str] = Field(default=[], description="What problems do they face?")
    
    # Competition and market
    main_competitors: List[str] = Field(default=[], description="Who are your main competitors?")
    competitive_advantage: str = Field(..., description="What sets you apart?")
    market_conditions: str = Field(..., description="How would you describe current market conditions?")
    
    # Product/service details
    product_category: str = Field(..., description="What category is your product/service?")
    price_point: str = Field(..., description="What's your price point compared to competitors?")
    unique_selling_proposition: str = Field(..., description="What's your unique selling proposition?")
    
    # Creative and messaging
    brand_tone: str = Field(..., description="How would you describe your brand tone?")
    key_messages: List[str] = Field(..., description="What are your key messages?")
    creative_preferences: List[str] = Field(default=[], description="Any creative preferences?")
    
    # Technical setup
    website_quality: str = Field(..., description="How would you rate your website/landing page?")
    tracking_setup: str = Field(..., description="Do you have proper tracking in place?")
    conversion_tracking: bool = Field(..., description="Is conversion tracking set up?")
    
    # Experience and expectations
    previous_campaigns: str = Field(..., description="Have you run similar campaigns before?")
    success_metrics: List[str] = Field(..., description="How will you measure success?")
    expected_timeline: str = Field(..., description="When do you expect to see results?")


# Analysis schemas
class CampaignAnalysisBase(BaseModel):
    analysis_type: str = Field(default="ga4_comparison")
    ga4_data: Dict[str, Any] = Field(default={})
    campaign_predictions: Dict[str, Any] = Field(default={})
    performance_gaps: Dict[str, Any] = Field(default={})
    recommendations: Dict[str, Any] = Field(default={})
    priority_actions: List[str] = Field(default=[])
    overall_score: Optional[float] = Field(None, ge=0, le=100)
    gap_scores: Dict[str, Any] = Field(default={})
    confidence_level: Optional[float] = Field(None, ge=0, le=1)
    audience_analysis: Dict[str, Any] = Field(default={})
    creative_analysis: Dict[str, Any] = Field(default={})
    budget_analysis: Dict[str, Any] = Field(default={})
    timing_analysis: Dict[str, Any] = Field(default={})
    technical_analysis: Dict[str, Any] = Field(default={})
    market_insights: Dict[str, Any] = Field(default={})
    competitor_analysis: Dict[str, Any] = Field(default={})
    seasonal_trends: Dict[str, Any] = Field(default={})


class CampaignAnalysisCreate(CampaignAnalysisBase):
    campaign_id: UUID


class CampaignAnalysisUpdate(BaseModel):
    status: Optional[str] = None
    ga4_data: Optional[Dict[str, Any]] = None
    campaign_predictions: Optional[Dict[str, Any]] = None
    performance_gaps: Optional[Dict[str, Any]] = None
    recommendations: Optional[Dict[str, Any]] = None
    priority_actions: Optional[List[str]] = None
    overall_score: Optional[float] = Field(None, ge=0, le=100)
    gap_scores: Optional[Dict[str, Any]] = None
    confidence_level: Optional[float] = Field(None, ge=0, le=1)
    audience_analysis: Optional[Dict[str, Any]] = None
    creative_analysis: Optional[Dict[str, Any]] = None
    budget_analysis: Optional[Dict[str, Any]] = None
    timing_analysis: Optional[Dict[str, Any]] = None
    technical_analysis: Optional[Dict[str, Any]] = None
    market_insights: Optional[Dict[str, Any]] = None
    competitor_analysis: Optional[Dict[str, Any]] = None
    seasonal_trends: Optional[Dict[str, Any]] = None
    processing_completed_at: Optional[datetime] = None
    error_message: Optional[str] = None


class CampaignAnalysis(CampaignAnalysisBase):
    id: UUID
    campaign_id: UUID
    org_id: UUID
    user_id: UUID
    status: str
    analysis_version: str
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Response schemas
class CampaignListResponse(BaseModel):
    campaigns: List[Campaign]
    total: int
    page: int
    per_page: int


class CampaignAnalysisResponse(BaseModel):
    analysis: CampaignAnalysis
    campaign: Campaign


# Campaign Designer schemas
class CampaignDesignerData(BaseModel):
    """Schema for Campaign Designer wizard data"""
    name: str = Field(..., description="Campaign name")
    objective: str = Field(..., description="Campaign objective: lead_gen, ecommerce_sales, app_installs, awareness")
    primaryKpi: str = Field(..., description="Primary KPI: CPL, CPA, ROAS, CTR, Reach")
    budget: Dict[str, Any] = Field(..., description="Budget information with total, daily, duration")
    channels: List[Dict[str, Any]] = Field(..., description="Channel allocation with percentages and amounts")
    targeting: Dict[str, Any] = Field(..., description="Targeting information including geo and audience")
    kpiTarget: float = Field(..., description="Target KPI value")
    designScore: int = Field(..., description="Campaign design score 0-100")
    selectedTemplate: Optional[str] = Field(None, description="Template ID if used")
    createdAt: str = Field(..., description="Creation timestamp")

class CampaignDesignerCreate(BaseModel):
    """Schema for creating a campaign from Campaign Designer"""
    designer_data: CampaignDesignerData

# Request schemas for analysis
class StartAnalysisRequest(BaseModel):
    questionnaire_data: CampaignQuestionnaire
    force_reanalysis: bool = Field(default=False, description="Force new analysis even if one exists")

