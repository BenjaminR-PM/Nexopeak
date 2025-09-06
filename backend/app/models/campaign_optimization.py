from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey, Integer, Float, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime

class CampaignOptimization(Base):
    __tablename__ = "campaign_optimizations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = Column(String(36), ForeignKey("campaigns.id"), nullable=False)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Optimization status
    status = Column(String(20), default="pending", nullable=False)  # pending, analyzing, completed, failed
    optimization_type = Column(String(50), default="full", nullable=False)  # full, timing_only, platform_only
    
    # Questionnaire data
    questionnaire_responses = Column(JSON, default={}, nullable=False)
    questionnaire_completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Market analysis results
    market_analysis = Column(JSON, default={}, nullable=False)
    historical_analysis = Column(JSON, default={}, nullable=False)
    competitive_analysis = Column(JSON, default={}, nullable=False)
    seasonal_analysis = Column(JSON, default={}, nullable=False)
    
    # Recommendations
    timing_recommendations = Column(JSON, default={}, nullable=False)
    platform_recommendations = Column(JSON, default={}, nullable=False)
    budget_recommendations = Column(JSON, default={}, nullable=False)
    creative_recommendations = Column(JSON, default={}, nullable=False)
    audience_recommendations = Column(JSON, default={}, nullable=False)
    
    # Confidence scores (0-1)
    overall_confidence = Column(Float, nullable=True)
    timing_confidence = Column(Float, nullable=True)
    platform_confidence = Column(Float, nullable=True)
    budget_confidence = Column(Float, nullable=True)
    
    # Implementation tracking
    recommendations_applied = Column(JSON, default=[], nullable=False)
    applied_at = Column(DateTime(timezone=True), nullable=True)
    performance_tracking = Column(JSON, default={}, nullable=False)
    
    # Metadata
    analysis_version = Column(String(20), default="1.0", nullable=False)
    data_sources_used = Column(JSON, default=[], nullable=False)
    processing_time_seconds = Column(Float, nullable=True)
    
    # Tracking
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    campaign = relationship("Campaign", back_populates="optimizations")
    organization = relationship("Organization")
    user = relationship("User")

    def __repr__(self):
        return f"<CampaignOptimization(id={self.id}, campaign_id='{self.campaign_id}', status='{self.status}')>"

    @property
    def is_completed(self) -> bool:
        return self.status == "completed"

    @property
    def is_pending(self) -> bool:
        return self.status == "pending"

    def get_recommendation_summary(self) -> Dict[str, Any]:
        """Get a summary of all recommendations"""
        return {
            "timing": self.timing_recommendations,
            "platforms": self.platform_recommendations,
            "budget": self.budget_recommendations,
            "creative": self.creative_recommendations,
            "audience": self.audience_recommendations,
            "confidence_scores": {
                "overall": self.overall_confidence,
                "timing": self.timing_confidence,
                "platform": self.platform_confidence,
                "budget": self.budget_confidence
            }
        }

class MarketIntelligence(Base):
    __tablename__ = "market_intelligence"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Market context
    industry = Column(String(100), nullable=False)
    geography = Column(String(100), nullable=False)  # Country, province, city
    market_segment = Column(String(100), nullable=True)
    
    # Data source information
    data_source = Column(String(100), nullable=False)  # statcan, bank_of_canada, google_trends, etc.
    data_type = Column(String(50), nullable=False)  # economic_indicator, consumer_behavior, trend_data
    
    # Market data
    market_data = Column(JSON, default={}, nullable=False)
    indicators = Column(JSON, default={}, nullable=False)
    trends = Column(JSON, default={}, nullable=False)
    seasonal_patterns = Column(JSON, default={}, nullable=False)
    
    # Metadata
    data_period_start = Column(DateTime(timezone=True), nullable=False)
    data_period_end = Column(DateTime(timezone=True), nullable=False)
    confidence_score = Column(Float, nullable=True)
    
    # Tracking
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<MarketIntelligence(id={self.id}, industry='{self.industry}', geography='{self.geography}')>"

    @property
    def is_expired(self) -> bool:
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at

class OptimizationQuestionnaire(Base):
    __tablename__ = "optimization_questionnaires"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Question metadata
    question_key = Column(String(100), nullable=False, unique=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False)  # multiple_choice, scale, text, date, boolean
    category = Column(String(50), nullable=False)  # business_context, market_context, campaign_history
    
    # Question configuration
    options = Column(JSON, default=[], nullable=False)  # For multiple choice questions
    validation_rules = Column(JSON, default={}, nullable=False)
    conditional_logic = Column(JSON, default={}, nullable=False)  # Show question based on previous answers
    
    # Metadata
    is_required = Column(Boolean, default=True, nullable=False)
    order_index = Column(Integer, nullable=False)
    industry_specific = Column(JSON, default=[], nullable=False)  # Show only for specific industries
    
    # Tracking
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    def __repr__(self):
        return f"<OptimizationQuestionnaire(id={self.id}, key='{self.question_key}', category='{self.category}')>"
