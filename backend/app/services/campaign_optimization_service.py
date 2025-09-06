import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
import json
import statistics

from app.models.campaign import Campaign
from app.models.campaign_optimization import CampaignOptimization, OptimizationQuestionnaire
from app.models.user import User
from app.models.organization import Organization
from app.models.connection import Connection
from app.services.market_intelligence_service import MarketIntelligenceService

logger = logging.getLogger(__name__)

class CampaignOptimizationService:
    """AI-powered campaign optimization service with hybrid rule-based and ML approach"""
    
    def __init__(self, db: Session):
        self.db = db
        self.market_intelligence = MarketIntelligenceService(db)
        
        # Platform performance benchmarks (will be updated with real data over time)
        self.platform_benchmarks = {
            "google_ads": {
                "search": {"ctr": 0.035, "cpc": 2.50, "conversion_rate": 0.045},
                "display": {"ctr": 0.008, "cpc": 0.85, "conversion_rate": 0.012},
                "video": {"ctr": 0.025, "cpc": 0.30, "conversion_rate": 0.008}
            },
            "facebook": {
                "feed": {"ctr": 0.018, "cpc": 1.20, "conversion_rate": 0.025},
                "stories": {"ctr": 0.022, "cpc": 0.95, "conversion_rate": 0.018},
                "video": {"ctr": 0.031, "cpc": 0.40, "conversion_rate": 0.015}
            },
            "instagram": {
                "feed": {"ctr": 0.024, "cpc": 1.40, "conversion_rate": 0.028},
                "stories": {"ctr": 0.035, "cpc": 1.10, "conversion_rate": 0.022},
                "reels": {"ctr": 0.045, "cpc": 0.80, "conversion_rate": 0.020}
            },
            "linkedin": {
                "sponsored": {"ctr": 0.012, "cpc": 4.50, "conversion_rate": 0.065},
                "message": {"ctr": 0.008, "cpc": 6.20, "conversion_rate": 0.085}
            }
        }

    async def start_optimization(
        self, 
        campaign_id: str, 
        user_id: str, 
        optimization_type: str = "full"
    ) -> CampaignOptimization:
        """Start the campaign optimization process"""
        try:
            # Get campaign and validate access
            campaign = self.db.query(Campaign).filter(
                and_(Campaign.id == campaign_id, Campaign.user_id == user_id)
            ).first()
            
            if not campaign:
                raise ValueError("Campaign not found or access denied")
            
            # Check if optimization already exists
            existing_optimization = self.db.query(CampaignOptimization).filter(
                CampaignOptimization.campaign_id == campaign_id
            ).first()
            
            if existing_optimization and existing_optimization.status == "pending":
                return existing_optimization
            
            # Create new optimization record
            optimization = CampaignOptimization(
                campaign_id=campaign_id,
                org_id=campaign.org_id,
                user_id=user_id,
                optimization_type=optimization_type,
                status="pending"
            )
            
            self.db.add(optimization)
            self.db.commit()
            self.db.refresh(optimization)
            
            logger.info(f"Started optimization for campaign {campaign_id}")
            return optimization
            
        except Exception as e:
            logger.error(f"Failed to start optimization: {e}")
            raise

    async def process_questionnaire(
        self, 
        optimization_id: str, 
        responses: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process questionnaire responses and trigger analysis"""
        try:
            optimization = self.db.query(CampaignOptimization).filter(
                CampaignOptimization.id == optimization_id
            ).first()
            
            if not optimization:
                raise ValueError("Optimization not found")
            
            # Validate and store responses
            validated_responses = await self._validate_questionnaire_responses(responses)
            
            optimization.questionnaire_responses = validated_responses
            optimization.questionnaire_completed_at = datetime.utcnow()
            optimization.status = "analyzing"
            
            self.db.commit()
            
            # Trigger analysis in background
            analysis_result = await self._perform_comprehensive_analysis(optimization)
            
            logger.info(f"Questionnaire processed for optimization {optimization_id}")
            return analysis_result
            
        except Exception as e:
            logger.error(f"Failed to process questionnaire: {e}")
            raise

    async def _perform_comprehensive_analysis(self, optimization: CampaignOptimization) -> Dict[str, Any]:
        """Perform comprehensive campaign analysis using hybrid AI approach"""
        try:
            start_time = datetime.utcnow()
            
            # Get campaign and organization context
            campaign = optimization.campaign
            organization = campaign.organization
            
            # Gather market intelligence
            market_data = await self.market_intelligence.get_market_intelligence(
                industry=organization.industry or "general",
                geography="Canada"
            )
            
            # Analyze historical performance
            historical_analysis = await self._analyze_historical_performance(optimization)
            
            # Perform timing analysis
            timing_analysis = await self._analyze_optimal_timing(optimization, market_data)
            
            # Perform platform analysis
            platform_analysis = await self._analyze_optimal_platforms(optimization, market_data)
            
            # Generate budget recommendations
            budget_analysis = await self._analyze_budget_optimization(optimization, market_data)
            
            # Generate creative recommendations
            creative_analysis = await self._analyze_creative_optimization(optimization)
            
            # Generate audience recommendations
            audience_analysis = await self._analyze_audience_optimization(optimization, market_data)
            
            # Calculate confidence scores
            confidence_scores = self._calculate_confidence_scores(
                market_data, historical_analysis, timing_analysis, platform_analysis
            )
            
            # Update optimization record
            optimization.market_analysis = market_data
            optimization.historical_analysis = historical_analysis
            optimization.timing_recommendations = timing_analysis
            optimization.platform_recommendations = platform_analysis
            optimization.budget_recommendations = budget_analysis
            optimization.creative_recommendations = creative_analysis
            optimization.audience_recommendations = audience_analysis
            optimization.overall_confidence = confidence_scores["overall"]
            optimization.timing_confidence = confidence_scores["timing"]
            optimization.platform_confidence = confidence_scores["platform"]
            optimization.budget_confidence = confidence_scores["budget"]
            optimization.status = "completed"
            optimization.completed_at = datetime.utcnow()
            optimization.processing_time_seconds = (datetime.utcnow() - start_time).total_seconds()
            optimization.data_sources_used = ["market_intelligence", "historical_data", "benchmarks"]
            
            self.db.commit()
            
            result = {
                "optimization_id": optimization.id,
                "status": "completed",
                "recommendations": optimization.get_recommendation_summary(),
                "confidence_scores": confidence_scores,
                "processing_time": optimization.processing_time_seconds
            }
            
            logger.info(f"Comprehensive analysis completed for optimization {optimization.id}")
            return result
            
        except Exception as e:
            logger.error(f"Failed to perform comprehensive analysis: {e}")
            optimization.status = "failed"
            self.db.commit()
            raise

    async def _analyze_historical_performance(self, optimization: CampaignOptimization) -> Dict[str, Any]:
        """Analyze historical campaign performance for the organization"""
        try:
            # Get historical campaigns for the organization
            historical_campaigns = self.db.query(Campaign).filter(
                and_(
                    Campaign.org_id == optimization.org_id,
                    Campaign.status.in_(["completed", "active"]),
                    Campaign.created_at >= datetime.utcnow() - timedelta(days=365)
                )
            ).all()
            
            if not historical_campaigns:
                return self._get_default_historical_analysis()
            
            # Analyze performance patterns
            performance_data = []
            for campaign in historical_campaigns:
                # Extract performance metrics (would come from GA4 integration)
                perf_data = self._extract_campaign_performance(campaign)
                performance_data.append(perf_data)
            
            # Calculate insights
            insights = {
                "total_campaigns": len(historical_campaigns),
                "best_performing_type": self._find_best_performing_type(performance_data),
                "best_performing_platform": self._find_best_performing_platform(performance_data),
                "seasonal_patterns": self._analyze_seasonal_performance(performance_data),
                "budget_efficiency": self._analyze_budget_efficiency(performance_data),
                "audience_insights": self._analyze_audience_performance(performance_data),
                "success_factors": self._identify_success_factors(performance_data)
            }
            
            return insights
            
        except Exception as e:
            logger.error(f"Failed to analyze historical performance: {e}")
            return self._get_default_historical_analysis()

    async def _analyze_optimal_timing(
        self, 
        optimization: CampaignOptimization, 
        market_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze optimal campaign timing using market intelligence and historical data"""
        try:
            responses = optimization.questionnaire_responses
            campaign = optimization.campaign
            
            # Get seasonal patterns from market data
            seasonal_patterns = market_data.get("seasonal_patterns", {})
            
            # Get economic timing factors
            economic_indicators = market_data.get("economic_indicators", {})
            
            # Analyze campaign urgency and flexibility
            urgency = responses.get("campaign_urgency", "flexible")
            budget_flexibility = responses.get("budget_flexibility", "medium")
            
            # Calculate optimal timing windows
            timing_recommendations = {
                "immediate_launch": self._should_launch_immediately(
                    urgency, economic_indicators, seasonal_patterns
                ),
                "optimal_launch_date": self._calculate_optimal_launch_date(
                    seasonal_patterns, economic_indicators, campaign
                ),
                "alternative_dates": self._calculate_alternative_dates(
                    seasonal_patterns, economic_indicators
                ),
                "avoid_periods": seasonal_patterns.get("avoid_months", []),
                "seasonal_multiplier": self._calculate_seasonal_multiplier(
                    seasonal_patterns, campaign.start_date
                ),
                "economic_risk_factors": self._assess_economic_risks(economic_indicators),
                "confidence_level": self._calculate_timing_confidence(
                    seasonal_patterns, economic_indicators, urgency
                )
            }
            
            # Add reasoning for recommendations
            timing_recommendations["reasoning"] = self._generate_timing_reasoning(
                timing_recommendations, seasonal_patterns, economic_indicators
            )
            
            return timing_recommendations
            
        except Exception as e:
            logger.error(f"Failed to analyze optimal timing: {e}")
            return self._get_default_timing_recommendations()

    async def _analyze_optimal_platforms(
        self, 
        optimization: CampaignOptimization, 
        market_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze optimal platforms and channels for the campaign"""
        try:
            responses = optimization.questionnaire_responses
            campaign = optimization.campaign
            
            # Get target audience characteristics
            target_demographics = campaign.target_demographics
            target_interests = campaign.target_interests
            campaign_objective = campaign.primary_objective
            
            # Get consumer behavior data
            consumer_behavior = market_data.get("consumer_behavior", {})
            
            # Analyze platform suitability
            platform_scores = {}
            
            for platform, benchmarks in self.platform_benchmarks.items():
                score = self._calculate_platform_score(
                    platform, 
                    benchmarks, 
                    target_demographics, 
                    campaign_objective,
                    consumer_behavior,
                    responses
                )
                platform_scores[platform] = score
            
            # Rank platforms
            ranked_platforms = sorted(
                platform_scores.items(), 
                key=lambda x: x[1]["total_score"], 
                reverse=True
            )
            
            # Generate recommendations
            platform_recommendations = {
                "primary_platform": ranked_platforms[0][0] if ranked_platforms else "google_ads",
                "secondary_platforms": [p[0] for p in ranked_platforms[1:3]],
                "platform_scores": platform_scores,
                "channel_mix": self._recommend_channel_mix(ranked_platforms, campaign),
                "budget_allocation": self._recommend_budget_allocation(ranked_platforms, campaign),
                "creative_requirements": self._analyze_creative_requirements(ranked_platforms),
                "audience_targeting": self._recommend_audience_targeting(ranked_platforms, campaign)
            }
            
            # Add reasoning
            platform_recommendations["reasoning"] = self._generate_platform_reasoning(
                platform_recommendations, target_demographics, campaign_objective
            )
            
            return platform_recommendations
            
        except Exception as e:
            logger.error(f"Failed to analyze optimal platforms: {e}")
            return self._get_default_platform_recommendations()

    async def _analyze_budget_optimization(
        self, 
        optimization: CampaignOptimization, 
        market_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze budget optimization opportunities"""
        try:
            campaign = optimization.campaign
            responses = optimization.questionnaire_responses
            
            # Get current budget information
            total_budget = campaign.total_budget or 0
            daily_budget = campaign.daily_budget or 0
            
            # Get market conditions
            economic_indicators = market_data.get("economic_indicators", {})
            seasonal_patterns = market_data.get("seasonal_patterns", {})
            
            # Calculate budget recommendations
            budget_recommendations = {
                "recommended_total_budget": self._calculate_optimal_total_budget(
                    campaign, market_data, responses
                ),
                "recommended_daily_budget": self._calculate_optimal_daily_budget(
                    campaign, market_data, responses
                ),
                "budget_pacing": self._recommend_budget_pacing(
                    campaign, seasonal_patterns
                ),
                "platform_allocation": self._recommend_platform_budget_allocation(
                    campaign, market_data
                ),
                "seasonal_adjustments": self._recommend_seasonal_budget_adjustments(
                    seasonal_patterns
                ),
                "performance_thresholds": self._set_performance_thresholds(campaign),
                "optimization_triggers": self._define_optimization_triggers(campaign)
            }
            
            # Add budget efficiency insights
            budget_recommendations["efficiency_insights"] = self._analyze_budget_efficiency(
                campaign, market_data
            )
            
            return budget_recommendations
            
        except Exception as e:
            logger.error(f"Failed to analyze budget optimization: {e}")
            return self._get_default_budget_recommendations()

    async def _analyze_creative_optimization(self, optimization: CampaignOptimization) -> Dict[str, Any]:
        """Analyze creative optimization opportunities"""
        try:
            campaign = optimization.campaign
            responses = optimization.questionnaire_responses
            
            # Analyze current creative assets
            current_creative = campaign.creative_assets
            messaging_themes = campaign.messaging_themes
            
            creative_recommendations = {
                "messaging_optimization": self._optimize_messaging(
                    messaging_themes, responses, campaign
                ),
                "creative_formats": self._recommend_creative_formats(
                    campaign, responses
                ),
                "visual_guidelines": self._generate_visual_guidelines(
                    campaign, responses
                ),
                "copy_suggestions": self._generate_copy_suggestions(
                    campaign, responses
                ),
                "cta_optimization": self._optimize_call_to_action(
                    campaign, responses
                ),
                "testing_strategy": self._recommend_testing_strategy(campaign)
            }
            
            return creative_recommendations
            
        except Exception as e:
            logger.error(f"Failed to analyze creative optimization: {e}")
            return self._get_default_creative_recommendations()

    async def _analyze_audience_optimization(
        self, 
        optimization: CampaignOptimization, 
        market_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze audience targeting optimization"""
        try:
            campaign = optimization.campaign
            responses = optimization.questionnaire_responses
            
            # Get consumer behavior insights
            consumer_behavior = market_data.get("consumer_behavior", {})
            
            audience_recommendations = {
                "demographic_refinement": self._refine_demographic_targeting(
                    campaign, consumer_behavior, responses
                ),
                "interest_expansion": self._expand_interest_targeting(
                    campaign, consumer_behavior, responses
                ),
                "behavioral_targeting": self._recommend_behavioral_targeting(
                    campaign, consumer_behavior, responses
                ),
                "lookalike_audiences": self._recommend_lookalike_audiences(
                    campaign, responses
                ),
                "exclusion_targeting": self._recommend_exclusion_targeting(
                    campaign, responses
                ),
                "audience_testing": self._recommend_audience_testing_strategy(campaign)
            }
            
            return audience_recommendations
            
        except Exception as e:
            logger.error(f"Failed to analyze audience optimization: {e}")
            return self._get_default_audience_recommendations()

    # Helper methods for calculations and analysis
    def _calculate_platform_score(
        self, 
        platform: str, 
        benchmarks: Dict[str, Any], 
        demographics: Dict[str, Any], 
        objective: str,
        consumer_behavior: Dict[str, Any],
        responses: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate platform suitability score"""
        
        # Base score from benchmarks
        base_score = 50
        
        # Adjust for campaign objective
        objective_multipliers = {
            "awareness": {"google_ads": 0.8, "facebook": 1.2, "instagram": 1.3, "linkedin": 0.7},
            "traffic": {"google_ads": 1.3, "facebook": 1.0, "instagram": 0.9, "linkedin": 0.8},
            "leads": {"google_ads": 1.2, "facebook": 1.1, "instagram": 0.8, "linkedin": 1.4},
            "sales": {"google_ads": 1.4, "facebook": 1.0, "instagram": 0.9, "linkedin": 0.9}
        }
        
        objective_score = base_score * objective_multipliers.get(objective, {}).get(platform, 1.0)
        
        # Adjust for demographics
        demographic_score = self._calculate_demographic_fit_score(platform, demographics)
        
        # Adjust for budget efficiency
        efficiency_score = self._calculate_efficiency_score(platform, benchmarks)
        
        # Calculate total score
        total_score = (objective_score * 0.4 + demographic_score * 0.3 + efficiency_score * 0.3)
        
        return {
            "total_score": total_score,
            "objective_score": objective_score,
            "demographic_score": demographic_score,
            "efficiency_score": efficiency_score,
            "benchmarks": benchmarks
        }

    def _calculate_demographic_fit_score(self, platform: str, demographics: Dict[str, Any]) -> float:
        """Calculate how well platform fits target demographics"""
        # Platform demographic strengths (simplified)
        platform_demographics = {
            "google_ads": {"age_range": [25, 65], "strength": 0.9},
            "facebook": {"age_range": [30, 60], "strength": 0.8},
            "instagram": {"age_range": [18, 45], "strength": 0.9},
            "linkedin": {"age_range": [25, 55], "strength": 0.85}
        }
        
        platform_data = platform_demographics.get(platform, {"age_range": [18, 65], "strength": 0.7})
        
        # Simple scoring based on age range overlap
        target_age = demographics.get("age_range", [25, 45])
        platform_age = platform_data["age_range"]
        
        overlap = max(0, min(target_age[1], platform_age[1]) - max(target_age[0], platform_age[0]))
        max_range = max(target_age[1] - target_age[0], platform_age[1] - platform_age[0])
        
        overlap_score = (overlap / max_range) if max_range > 0 else 0.5
        
        return overlap_score * platform_data["strength"] * 100

    def _calculate_efficiency_score(self, platform: str, benchmarks: Dict[str, Any]) -> float:
        """Calculate platform efficiency score based on benchmarks"""
        # Simple efficiency calculation based on CPC and conversion rate
        avg_cpc = statistics.mean([ad_type["cpc"] for ad_type in benchmarks.values()])
        avg_conversion = statistics.mean([ad_type["conversion_rate"] for ad_type in benchmarks.values()])
        
        # Lower CPC and higher conversion rate = higher efficiency
        efficiency = (avg_conversion / avg_cpc) * 1000  # Scale for readability
        
        # Normalize to 0-100 scale
        return min(100, efficiency * 10)

    # Fallback methods
    def _get_default_historical_analysis(self) -> Dict[str, Any]:
        """Default historical analysis when no data is available"""
        return {
            "total_campaigns": 0,
            "best_performing_type": "search",
            "best_performing_platform": "google_ads",
            "seasonal_patterns": {"peak_months": [3, 4, 9], "low_months": [1, 7, 8]},
            "budget_efficiency": {"avg_cpc": 2.50, "avg_conversion_rate": 0.035},
            "audience_insights": {"primary_age_group": "25-44"},
            "success_factors": ["clear_messaging", "targeted_audience", "optimal_timing"]
        }

    def _get_default_timing_recommendations(self) -> Dict[str, Any]:
        """Default timing recommendations"""
        return {
            "immediate_launch": False,
            "optimal_launch_date": (datetime.utcnow() + timedelta(days=14)).isoformat(),
            "alternative_dates": [],
            "avoid_periods": [7, 8],
            "seasonal_multiplier": 1.0,
            "confidence_level": 0.6
        }

    def _get_default_platform_recommendations(self) -> Dict[str, Any]:
        """Default platform recommendations"""
        return {
            "primary_platform": "google_ads",
            "secondary_platforms": ["facebook", "instagram"],
            "platform_scores": {},
            "channel_mix": {"search": 0.6, "social": 0.4},
            "budget_allocation": {"google_ads": 0.6, "facebook": 0.25, "instagram": 0.15}
        }

    def _get_default_budget_recommendations(self) -> Dict[str, Any]:
        """Default budget recommendations"""
        return {
            "recommended_total_budget": 5000,
            "recommended_daily_budget": 167,
            "budget_pacing": "even",
            "platform_allocation": {"google_ads": 0.6, "facebook": 0.4}
        }

    def _get_default_creative_recommendations(self) -> Dict[str, Any]:
        """Default creative recommendations"""
        return {
            "messaging_optimization": {"focus": "value_proposition", "tone": "professional"},
            "creative_formats": ["image", "video"],
            "cta_optimization": {"primary": "Learn More", "secondary": "Get Started"}
        }

    def _get_default_audience_recommendations(self) -> Dict[str, Any]:
        """Default audience recommendations"""
        return {
            "demographic_refinement": {"age_range": [25, 54], "interests": ["business", "technology"]},
            "behavioral_targeting": ["website_visitors", "engaged_users"],
            "lookalike_audiences": ["customer_list", "website_visitors"]
        }

    def _calculate_confidence_scores(
        self, 
        market_data: Dict[str, Any], 
        historical_analysis: Dict[str, Any], 
        timing_analysis: Dict[str, Any], 
        platform_analysis: Dict[str, Any]
    ) -> Dict[str, float]:
        """Calculate confidence scores for recommendations"""
        
        # Base confidence on data quality and availability
        data_quality_score = 0.7  # Default
        
        if market_data.get("data_quality") == "high":
            data_quality_score = 0.9
        elif market_data.get("data_quality") == "fallback":
            data_quality_score = 0.5
        
        # Historical data confidence
        historical_confidence = min(0.9, historical_analysis.get("total_campaigns", 0) * 0.1 + 0.3)
        
        # Timing confidence
        timing_confidence = timing_analysis.get("confidence_level", 0.6)
        
        # Platform confidence based on benchmark data availability
        platform_confidence = 0.8 if platform_analysis.get("platform_scores") else 0.6
        
        # Budget confidence
        budget_confidence = 0.7
        
        # Overall confidence
        overall_confidence = (
            data_quality_score * 0.3 +
            historical_confidence * 0.2 +
            timing_confidence * 0.2 +
            platform_confidence * 0.2 +
            budget_confidence * 0.1
        )
        
        return {
            "overall": round(overall_confidence, 2),
            "timing": round(timing_confidence, 2),
            "platform": round(platform_confidence, 2),
            "budget": round(budget_confidence, 2),
            "data_quality": round(data_quality_score, 2)
        }

    async def _validate_questionnaire_responses(self, responses: Dict[str, Any]) -> Dict[str, Any]:
        """Validate questionnaire responses against schema"""
        # For now, return responses as-is
        # In production, validate against OptimizationQuestionnaire schema
        return responses

    # Additional helper methods would be implemented here for specific calculations
    # This is a comprehensive foundation that can be extended with more sophisticated ML models

    async def get_optimization_status(self, optimization_id: str) -> Dict[str, Any]:
        """Get the current status of an optimization"""
        try:
            optimization = self.db.query(CampaignOptimization).filter(
                CampaignOptimization.id == optimization_id
            ).first()
            
            if not optimization:
                raise ValueError("Optimization not found")
            
            return {
                "id": optimization.id,
                "status": optimization.status,
                "created_at": optimization.created_at.isoformat(),
                "completed_at": optimization.completed_at.isoformat() if optimization.completed_at else None,
                "processing_time": optimization.processing_time_seconds,
                "confidence_scores": {
                    "overall": optimization.overall_confidence,
                    "timing": optimization.timing_confidence,
                    "platform": optimization.platform_confidence,
                    "budget": optimization.budget_confidence
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get optimization status: {e}")
            raise

    async def get_recommendations(self, optimization_id: str) -> Dict[str, Any]:
        """Get optimization recommendations"""
        try:
            optimization = self.db.query(CampaignOptimization).filter(
                CampaignOptimization.id == optimization_id
            ).first()
            
            if not optimization:
                raise ValueError("Optimization not found")
            
            if optimization.status != "completed":
                return {"status": optimization.status, "message": "Analysis not yet completed"}
            
            return optimization.get_recommendation_summary()
            
        except Exception as e:
            logger.error(f"Failed to get recommendations: {e}")
            raise
