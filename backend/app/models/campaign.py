from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey, Integer, Float, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Basic campaign information
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    campaign_type = Column(String(50), nullable=False)  # search, display, video, shopping, etc.
    platform = Column(String(50), nullable=False)  # google_ads, facebook, instagram, etc.
    status = Column(String(20), default="draft", nullable=False)  # draft, active, paused, completed
    
    # Campaign objectives and goals
    primary_objective = Column(String(100), nullable=False)  # awareness, traffic, leads, sales, etc.
    secondary_objectives = Column(JSON, default=[], nullable=False)  # Stored as JSON array for SQLite compatibility
    target_kpis = Column(JSON, default={}, nullable=False)  # Target metrics like CTR, CPC, ROAS, etc.
    
    # Budget and timeline
    total_budget = Column(Float, nullable=True)
    daily_budget = Column(Float, nullable=True)
    currency = Column(String(3), default="USD", nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    # Target audience
    target_demographics = Column(JSON, default={}, nullable=False)  # age, gender, income, etc.
    target_locations = Column(JSON, default=[], nullable=False)  # Stored as JSON array for SQLite compatibility
    target_interests = Column(JSON, default=[], nullable=False)  # Stored as JSON array for SQLite compatibility
    target_behaviors = Column(JSON, default=[], nullable=False)  # Stored as JSON array for SQLite compatibility
    audience_size_estimate = Column(Integer, nullable=True)
    
    # Creative and messaging
    creative_assets = Column(JSON, default={}, nullable=False)  # images, videos, copy, etc.
    messaging_themes = Column(JSON, default=[], nullable=False)  # Stored as JSON array for SQLite compatibility
    call_to_action = Column(String(100), nullable=True)
    landing_page_url = Column(String(500), nullable=True)
    
    # Campaign settings
    bidding_strategy = Column(String(50), nullable=True)
    ad_scheduling = Column(JSON, default={}, nullable=False)  # days, hours, timezone
    device_targeting = Column(JSON, default=[], nullable=False)  # Stored as JSON array for SQLite compatibility
    
    # Additional data
    tags = Column(JSON, default=[], nullable=False)  # Stored as JSON array for SQLite compatibility
    custom_fields = Column(JSON, default={}, nullable=False)
    
    # Tracking
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="campaigns")
    user = relationship("User", back_populates="campaigns")
    analyses = relationship("CampaignAnalysis", back_populates="campaign", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Campaign(id={self.id}, name='{self.name}', type='{self.campaign_type}', status='{self.status}')>"

    @property
    def is_draft(self) -> bool:
        return self.status == "draft"

    @property
    def is_running(self) -> bool:
        return self.status == "active"

    @property
    def is_completed(self) -> bool:
        return self.status == "completed"

    def get_target_kpi(self, kpi_name: str, default=None):
        """Get target KPI value."""
        return self.target_kpis.get(kpi_name, default)

    def set_target_kpi(self, kpi_name: str, value):
        """Set target KPI value."""
        if not self.target_kpis:
            self.target_kpis = {}
        self.target_kpis[kpi_name] = value

    def get_custom_field(self, field_name: str, default=None):
        """Get custom field value."""
        return self.custom_fields.get(field_name, default)

    def set_custom_field(self, field_name: str, value):
        """Set custom field value."""
        if not self.custom_fields:
            self.custom_fields = {}
        self.custom_fields[field_name] = value


class CampaignAnalysis(Base):
    __tablename__ = "campaign_analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = Column(String(36), ForeignKey("campaigns.id"), nullable=False)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Analysis information
    analysis_type = Column(String(50), default="ga4_comparison", nullable=False)
    analysis_version = Column(String(20), default="1.0", nullable=False)
    status = Column(String(20), default="pending", nullable=False)  # pending, processing, completed, failed
    
    # G4A data and comparison
    ga4_data = Column(JSON, default={}, nullable=False)  # Retrieved G4A metrics
    campaign_predictions = Column(JSON, default={}, nullable=False)  # Predicted campaign performance
    
    # Gap analysis results
    performance_gaps = Column(JSON, default={}, nullable=False)  # Identified gaps between expected and G4A
    recommendations = Column(JSON, default={}, nullable=False)  # AI-generated recommendations
    priority_actions = Column(JSON, default=[], nullable=False)  # Top priority recommendations stored as JSON array
    
    # Scoring and metrics
    overall_score = Column(Float, nullable=True)  # Overall campaign readiness score (0-100)
    gap_scores = Column(JSON, default={}, nullable=False)  # Individual gap scores by category
    confidence_level = Column(Float, nullable=True)  # Analysis confidence (0-1)
    
    # Detailed analysis sections
    audience_analysis = Column(JSON, default={}, nullable=False)
    creative_analysis = Column(JSON, default={}, nullable=False)
    budget_analysis = Column(JSON, default={}, nullable=False)
    timing_analysis = Column(JSON, default={}, nullable=False)
    technical_analysis = Column(JSON, default={}, nullable=False)
    
    # Additional insights
    market_insights = Column(JSON, default={}, nullable=False)
    competitor_analysis = Column(JSON, default={}, nullable=False)
    seasonal_trends = Column(JSON, default={}, nullable=False)
    
    # Processing information
    processing_started_at = Column(DateTime(timezone=True), nullable=True)
    processing_completed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Tracking
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    campaign = relationship("Campaign", back_populates="analyses")
    organization = relationship("Organization")
    user = relationship("User")

    def __repr__(self):
        return f"<CampaignAnalysis(id={self.id}, campaign_id={self.campaign_id}, status='{self.status}', score={self.overall_score})>"

    @property
    def is_pending(self) -> bool:
        return self.status == "pending"

    @property
    def is_processing(self) -> bool:
        return self.status == "processing"

    @property
    def is_completed(self) -> bool:
        return self.status == "completed"

    @property
    def has_failed(self) -> bool:
        return self.status == "failed"

    def get_gap_score(self, category: str, default=0.0):
        """Get gap score for a specific category."""
        return self.gap_scores.get(category, default)

    def set_gap_score(self, category: str, score: float):
        """Set gap score for a specific category."""
        if not self.gap_scores:
            self.gap_scores = {}
        self.gap_scores[category] = score

    def get_recommendation(self, category: str, default=None):
        """Get recommendations for a specific category."""
        return self.recommendations.get(category, default)

    def add_recommendation(self, category: str, recommendation: str):
        """Add a recommendation for a specific category."""
        if not self.recommendations:
            self.recommendations = {}
        if category not in self.recommendations:
            self.recommendations[category] = []
        self.recommendations[category].append(recommendation)
