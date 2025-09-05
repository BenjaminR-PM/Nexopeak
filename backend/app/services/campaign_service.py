from typing import Dict, List, Any, Optional, Tuple
from uuid import UUID
from datetime import datetime, timedelta
import json
import logging
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from app.models.campaign import Campaign, CampaignAnalysis
from app.models.user import User
from app.models.organization import Organization
from app.models.connection import Connection
from app.schemas.campaign import (
    CampaignCreate, CampaignUpdate, CampaignQuestionnaire,
    CampaignAnalysisCreate, CampaignAnalysisUpdate
)

logger = logging.getLogger(__name__)

class CampaignAnalyzerService:
    """Service for campaign analysis and G4A comparison"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_campaign(self, campaign_data: CampaignCreate, user_id: UUID, org_id: UUID) -> Campaign:
        """Create a new campaign"""
        campaign = Campaign(
            **campaign_data.dict(),
            user_id=user_id,
            org_id=org_id
        )
        self.db.add(campaign)
        self.db.commit()
        self.db.refresh(campaign)
        return campaign
    
    def get_campaign(self, campaign_id: UUID, org_id: UUID) -> Optional[Campaign]:
        """Get a campaign by ID"""
        return self.db.query(Campaign).filter(
            and_(Campaign.id == campaign_id, Campaign.org_id == org_id)
        ).first()
    
    def get_campaigns(
        self, 
        org_id: UUID, 
        user_id: Optional[UUID] = None,
        status: Optional[str] = None,
        campaign_type: Optional[str] = None,
        page: int = 1,
        per_page: int = 20
    ) -> Tuple[List[Campaign], int]:
        """Get campaigns with filtering and pagination"""
        query = self.db.query(Campaign).filter(Campaign.org_id == org_id)
        
        if user_id:
            query = query.filter(Campaign.user_id == user_id)
        if status:
            query = query.filter(Campaign.status == status)
        if campaign_type:
            query = query.filter(Campaign.campaign_type == campaign_type)
        
        total = query.count()
        campaigns = query.order_by(desc(Campaign.updated_at)).offset(
            (page - 1) * per_page
        ).limit(per_page).all()
        
        return campaigns, total
    
    def update_campaign(
        self, 
        campaign_id: UUID, 
        campaign_data: CampaignUpdate, 
        org_id: UUID
    ) -> Optional[Campaign]:
        """Update a campaign"""
        campaign = self.get_campaign(campaign_id, org_id)
        if not campaign:
            return None
        
        update_data = campaign_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(campaign, field, value)
        
        self.db.commit()
        self.db.refresh(campaign)
        return campaign
    
    def delete_campaign(self, campaign_id: UUID, org_id: UUID) -> bool:
        """Delete a campaign"""
        campaign = self.get_campaign(campaign_id, org_id)
        if not campaign:
            return False
        
        self.db.delete(campaign)
        self.db.commit()
        return True
    
    def create_campaign_from_questionnaire(
        self,
        questionnaire: CampaignQuestionnaire,
        user_id: UUID,
        org_id: UUID
    ) -> Campaign:
        """Create a campaign from questionnaire data"""
        
        # Extract campaign type from business goals or default to search
        campaign_type = self._determine_campaign_type(questionnaire.business_goals)
        
        # Parse budget range
        budget_info = self._parse_budget_range(questionnaire.budget_range)
        
        # Create campaign data
        campaign_data = CampaignCreate(
            name=questionnaire.campaign_name,
            description="Campaign created from analyzer questionnaire",
            campaign_type=campaign_type,
            platform="google_ads",  # Default platform
            primary_objective=questionnaire.business_goals[0] if questionnaire.business_goals else "traffic",
            secondary_objectives=questionnaire.business_goals[1:] if len(questionnaire.business_goals) > 1 else [],
            target_kpis=self._extract_target_kpis(questionnaire),
            total_budget=budget_info.get("max_budget"),
            daily_budget=budget_info.get("daily_budget"),
            target_demographics=questionnaire.audience_demographics,
            target_interests=questionnaire.audience_interests,
            messaging_themes=questionnaire.key_messages,
            custom_fields={
                "questionnaire_data": questionnaire.dict(),
                "competitive_advantage": questionnaire.competitive_advantage,
                "market_conditions": questionnaire.market_conditions,
                "brand_tone": questionnaire.brand_tone,
                "website_quality": questionnaire.website_quality,
                "tracking_setup": questionnaire.tracking_setup,
                "conversion_tracking": questionnaire.conversion_tracking,
                "previous_campaigns": questionnaire.previous_campaigns,
                "expected_timeline": questionnaire.expected_timeline
            }
        )
        
        return self.create_campaign(campaign_data, user_id, org_id)
    
    def create_campaign_from_designer(
        self,
        designer_data,  # CampaignDesignerData type
        user_id: UUID,
        org_id: UUID
    ) -> Campaign:
        """Create a campaign from Campaign Designer wizard data"""
        
        # Map Campaign Designer objective to campaign type and platform
        objective_mapping = {
            "lead_gen": {"type": "search", "platform": "google_ads"},
            "ecommerce_sales": {"type": "shopping", "platform": "google_ads"},
            "app_installs": {"type": "app", "platform": "google_ads"},
            "awareness": {"type": "video", "platform": "google_ads"}
        }
        
        mapping = objective_mapping.get(designer_data.objective, {"type": "search", "platform": "google_ads"})
        
        # Extract channel information
        channel_names = [ch["channel"] for ch in designer_data.channels]
        
        # Create target KPIs
        target_kpis = {
            designer_data.primaryKpi: designer_data.kpiTarget
        }
        
        # Parse geo targeting
        geo_list = []
        if isinstance(designer_data.targeting.get("geo"), list):
            geo_list = designer_data.targeting["geo"]
        elif isinstance(designer_data.targeting.get("geo"), str):
            geo_list = [g.strip() for g in designer_data.targeting["geo"].split(",")]
        
        # Create campaign data
        campaign_data = CampaignCreate(
            name=designer_data.name,
            description=f"Campaign created from Designer wizard - {designer_data.objective} campaign",
            campaign_type=mapping["type"],
            platform=mapping["platform"],
            primary_objective=designer_data.objective,
            target_kpis=target_kpis,
            total_budget=float(designer_data.budget["total"]),
            daily_budget=float(designer_data.budget["daily"]),
            target_locations=geo_list,
            target_demographics={"audience_description": designer_data.targeting.get("audience", "")},
            custom_fields={
                "designer_data": designer_data.dict(),
                "channels": designer_data.channels,
                "design_score": designer_data.designScore,
                "selected_template": designer_data.selectedTemplate,
                "channel_allocation": {ch["channel"]: {"percentage": ch["percentage"], "amount": ch["amount"]} for ch in designer_data.channels}
            },
            tags=["campaign-designer", designer_data.objective] + channel_names
        )
        
        return self.create_campaign(campaign_data, user_id, org_id)
    
    def start_campaign_analysis(
        self,
        campaign_id: UUID,
        user_id: UUID,
        org_id: UUID,
        force_reanalysis: bool = False
    ) -> CampaignAnalysis:
        """Start campaign analysis process"""
        
        # Check if analysis already exists
        existing_analysis = self.db.query(CampaignAnalysis).filter(
            and_(
                CampaignAnalysis.campaign_id == campaign_id,
                CampaignAnalysis.org_id == org_id
            )
        ).order_by(desc(CampaignAnalysis.created_at)).first()
        
        if existing_analysis and not force_reanalysis:
            if existing_analysis.status in ["completed", "processing"]:
                return existing_analysis
        
        # Create new analysis
        analysis_data = CampaignAnalysisCreate(
            campaign_id=campaign_id,
            analysis_type="ga4_comparison",
            status="processing",
            processing_started_at=datetime.now()
        )
        
        analysis = CampaignAnalysis(
            **analysis_data.dict(),
            user_id=user_id,
            org_id=org_id
        )
        
        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)
        
        # Start async analysis process
        self._perform_analysis(analysis.id)
        
        return analysis
    
    def get_campaign_analysis(
        self,
        campaign_id: UUID,
        org_id: UUID
    ) -> Optional[CampaignAnalysis]:
        """Get the latest analysis for a campaign"""
        return self.db.query(CampaignAnalysis).filter(
            and_(
                CampaignAnalysis.campaign_id == campaign_id,
                CampaignAnalysis.org_id == org_id
            )
        ).order_by(desc(CampaignAnalysis.created_at)).first()
    
    def _determine_campaign_type(self, business_goals: List[str]) -> str:
        """Determine campaign type based on business goals"""
        goal_mapping = {
            "awareness": "display",
            "brand": "display", 
            "traffic": "search",
            "leads": "search",
            "sales": "shopping",
            "conversions": "search",
            "engagement": "video",
            "app": "app"
        }
        
        for goal in business_goals:
            goal_lower = goal.lower()
            for key, campaign_type in goal_mapping.items():
                if key in goal_lower:
                    return campaign_type
        
        return "search"  # Default
    
    def _parse_budget_range(self, budget_range: str) -> Dict[str, Optional[float]]:
        """Parse budget range string into numbers"""
        budget_range = budget_range.lower().replace("$", "").replace(",", "")
        
        try:
            if "-" in budget_range:
                parts = budget_range.split("-")
                min_budget = float(parts[0].replace("k", "000"))
                max_budget = float(parts[1].replace("k", "000").replace("+", ""))
                daily_budget = max_budget / 30  # Estimate daily budget
                
                return {
                    "min_budget": min_budget,
                    "max_budget": max_budget,
                    "daily_budget": round(daily_budget, 2)
                }
            elif "+" in budget_range:
                base_budget = float(budget_range.replace("+", "").replace("k", "000"))
                return {
                    "min_budget": base_budget,
                    "max_budget": base_budget * 2,  # Estimate
                    "daily_budget": round(base_budget / 30, 2)
                }
        except:
            logger.warning(f"Could not parse budget range: {budget_range}")
        
        return {"min_budget": None, "max_budget": None, "daily_budget": None}
    
    def _extract_target_kpis(self, questionnaire: CampaignQuestionnaire) -> Dict[str, Any]:
        """Extract target KPIs from questionnaire"""
        kpis = {}
        
        # Map success metrics to KPIs
        for metric in questionnaire.success_metrics:
            metric_lower = metric.lower()
            if "click" in metric_lower or "ctr" in metric_lower:
                kpis["target_ctr"] = 0.02  # 2% default
            elif "conversion" in metric_lower or "cpa" in metric_lower:
                kpis["target_conversion_rate"] = 0.05  # 5% default
            elif "roas" in metric_lower or "return" in metric_lower:
                kpis["target_roas"] = 4.0  # 4:1 default
            elif "impression" in metric_lower or "reach" in metric_lower:
                kpis["target_impressions"] = 10000  # Default
        
        return kpis
    
    def _perform_analysis(self, analysis_id: UUID):
        """Perform the actual campaign analysis"""
        try:
            analysis = self.db.query(CampaignAnalysis).get(analysis_id)
            if not analysis:
                return
            
            campaign = analysis.campaign
            if not campaign:
                return
            
            # Get GA4 data for comparison
            ga4_data = self._fetch_ga4_data(campaign.org_id)
            
            # Analyze campaign components
            audience_analysis = self._analyze_audience(campaign, ga4_data)
            creative_analysis = self._analyze_creative(campaign, ga4_data)
            budget_analysis = self._analyze_budget(campaign, ga4_data)
            timing_analysis = self._analyze_timing(campaign, ga4_data)
            technical_analysis = self._analyze_technical_setup(campaign)
            
            # Generate predictions and gap analysis
            predictions = self._generate_predictions(campaign, ga4_data)
            performance_gaps = self._identify_performance_gaps(campaign, ga4_data, predictions)
            recommendations = self._generate_recommendations(performance_gaps, campaign)
            
            # Calculate scores
            overall_score = self._calculate_overall_score(
                audience_analysis, creative_analysis, budget_analysis, 
                timing_analysis, technical_analysis
            )
            
            gap_scores = {
                "audience": audience_analysis.get("score", 0),
                "creative": creative_analysis.get("score", 0),
                "budget": budget_analysis.get("score", 0),
                "timing": timing_analysis.get("score", 0),
                "technical": technical_analysis.get("score", 0)
            }
            
            # Update analysis with results
            update_data = CampaignAnalysisUpdate(
                status="completed",
                ga4_data=ga4_data,
                campaign_predictions=predictions,
                performance_gaps=performance_gaps,
                recommendations=recommendations,
                priority_actions=self._extract_priority_actions(recommendations),
                overall_score=overall_score,
                gap_scores=gap_scores,
                confidence_level=0.85,  # Default confidence
                audience_analysis=audience_analysis,
                creative_analysis=creative_analysis,
                budget_analysis=budget_analysis,
                timing_analysis=timing_analysis,
                technical_analysis=technical_analysis,
                market_insights=self._generate_market_insights(campaign),
                competitor_analysis=self._analyze_competitors(campaign),
                seasonal_trends=self._analyze_seasonal_trends(campaign),
                processing_completed_at=datetime.now()
            )
            
            for field, value in update_data.dict(exclude_unset=True).items():
                setattr(analysis, field, value)
            
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Analysis failed for campaign {analysis_id}: {str(e)}")
            analysis.status = "failed"
            analysis.error_message = str(e)
            self.db.commit()
    
    def _fetch_ga4_data(self, org_id: UUID) -> Dict[str, Any]:
        """Fetch GA4 data for comparison"""
        # Get GA4 connection for the organization
        ga4_connection = self.db.query(Connection).filter(
            and_(
                Connection.org_id == org_id,
                Connection.provider == "ga4",
                Connection.status == "connected"
            )
        ).first()
        
        if not ga4_connection:
            logger.warning(f"No GA4 connection found for org {org_id}")
            return self._get_mock_ga4_data()
        
        # TODO: Implement actual GA4 API calls
        # For now, return mock data
        return self._get_mock_ga4_data()
    
    def _get_mock_ga4_data(self) -> Dict[str, Any]:
        """Generate mock GA4 data for development"""
        return {
            "sessions": 15420,
            "users": 12350,
            "page_views": 45680,
            "bounce_rate": 0.42,
            "avg_session_duration": 185,
            "conversion_rate": 0.034,
            "revenue": 89450.00,
            "transactions": 234,
            "avg_order_value": 382.26,
            "traffic_sources": {
                "organic": 0.45,
                "paid": 0.28,
                "direct": 0.18,
                "social": 0.09
            },
            "device_breakdown": {
                "desktop": 0.52,
                "mobile": 0.43,
                "tablet": 0.05
            },
            "top_pages": [
                {"page": "/", "sessions": 5230},
                {"page": "/products", "sessions": 3210},
                {"page": "/about", "sessions": 1890}
            ],
            "demographics": {
                "age_groups": {
                    "18-24": 0.15,
                    "25-34": 0.32,
                    "35-44": 0.28,
                    "45-54": 0.18,
                    "55+": 0.07
                },
                "gender": {
                    "male": 0.52,
                    "female": 0.48
                }
            }
        }
    
    def _analyze_audience(self, campaign: Campaign, ga4_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze audience targeting"""
        score = 75  # Base score
        gaps = []
        recommendations = []
        
        # Check audience size
        if campaign.audience_size_estimate:
            if campaign.audience_size_estimate < 1000:
                score -= 15
                gaps.append("Audience size may be too small")
                recommendations.append("Consider broadening targeting criteria")
            elif campaign.audience_size_estimate > 10000000:
                score -= 10
                gaps.append("Audience size may be too broad")
                recommendations.append("Consider narrowing targeting for better relevance")
        
        # Check demographic alignment
        if campaign.target_demographics:
            # Compare with GA4 demographics
            ga4_demographics = ga4_data.get("demographics", {})
            if ga4_demographics:
                # Basic demographic analysis (can be expanded)
                score += 5  # Bonus for having demographic data
        
        return {
            "score": max(0, min(100, score)),
            "gaps": gaps,
            "recommendations": recommendations,
            "alignment_with_ga4": self._calculate_audience_alignment(campaign, ga4_data),
            "suggested_improvements": self._suggest_audience_improvements(campaign, ga4_data)
        }
    
    def _analyze_creative(self, campaign: Campaign, ga4_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze creative elements"""
        score = 70  # Base score
        gaps = []
        recommendations = []
        
        # Check if creative assets are defined
        if not campaign.creative_assets or not campaign.creative_assets:
            score -= 20
            gaps.append("No creative assets defined")
            recommendations.append("Upload and define creative assets")
        
        # Check messaging themes
        if not campaign.messaging_themes:
            score -= 15
            gaps.append("No messaging themes defined")
            recommendations.append("Define clear messaging themes")
        
        # Check call to action
        if not campaign.call_to_action:
            score -= 10
            gaps.append("No call-to-action defined")
            recommendations.append("Define a clear call-to-action")
        
        return {
            "score": max(0, min(100, score)),
            "gaps": gaps,
            "recommendations": recommendations,
            "creative_quality_assessment": self._assess_creative_quality(campaign),
            "messaging_effectiveness": self._assess_messaging_effectiveness(campaign)
        }
    
    def _analyze_budget(self, campaign: Campaign, ga4_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze budget allocation"""
        score = 80  # Base score
        gaps = []
        recommendations = []
        
        # Check if budget is defined
        if not campaign.total_budget and not campaign.daily_budget:
            score -= 25
            gaps.append("No budget defined")
            recommendations.append("Set campaign budget")
        
        # Compare with industry benchmarks (mock data)
        avg_cpc = 2.50  # Industry average
        if campaign.daily_budget:
            estimated_clicks = campaign.daily_budget / avg_cpc
            if estimated_clicks < 10:
                score -= 15
                gaps.append("Daily budget may be too low for meaningful traffic")
                recommendations.append("Consider increasing daily budget")
        
        return {
            "score": max(0, min(100, score)),
            "gaps": gaps,
            "recommendations": recommendations,
            "budget_efficiency_forecast": self._forecast_budget_efficiency(campaign, ga4_data),
            "recommended_budget_allocation": self._recommend_budget_allocation(campaign)
        }
    
    def _analyze_timing(self, campaign: Campaign, ga4_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze campaign timing"""
        score = 85  # Base score
        gaps = []
        recommendations = []
        
        # Check if dates are set
        if not campaign.start_date:
            score -= 15
            gaps.append("No start date set")
            recommendations.append("Set campaign start date")
        
        if not campaign.end_date:
            score -= 10
            gaps.append("No end date set")
            recommendations.append("Set campaign end date for better planning")
        
        # Check campaign duration
        if campaign.start_date and campaign.end_date:
            duration = (campaign.end_date - campaign.start_date).days
            if duration < 7:
                score -= 10
                gaps.append("Campaign duration may be too short")
                recommendations.append("Consider extending campaign duration")
        
        return {
            "score": max(0, min(100, score)),
            "gaps": gaps,
            "recommendations": recommendations,
            "optimal_timing_suggestions": self._suggest_optimal_timing(campaign, ga4_data),
            "seasonal_considerations": self._analyze_seasonal_impact(campaign)
        }
    
    def _analyze_technical_setup(self, campaign: Campaign) -> Dict[str, Any]:
        """Analyze technical setup"""
        score = 60  # Base score
        gaps = []
        recommendations = []
        
        # Check tracking setup from questionnaire data
        custom_fields = campaign.custom_fields or {}
        questionnaire_data = custom_fields.get("questionnaire_data", {})
        
        tracking_setup = questionnaire_data.get("tracking_setup", "").lower()
        conversion_tracking = questionnaire_data.get("conversion_tracking", False)
        website_quality = questionnaire_data.get("website_quality", "").lower()
        
        if "poor" in tracking_setup or "no" in tracking_setup:
            score -= 20
            gaps.append("Poor tracking setup")
            recommendations.append("Improve tracking implementation")
        
        if not conversion_tracking:
            score -= 15
            gaps.append("Conversion tracking not set up")
            recommendations.append("Implement conversion tracking")
        
        if "poor" in website_quality or "bad" in website_quality:
            score -= 25
            gaps.append("Website quality issues")
            recommendations.append("Improve website quality and user experience")
        
        return {
            "score": max(0, min(100, score)),
            "gaps": gaps,
            "recommendations": recommendations,
            "tracking_assessment": self._assess_tracking_setup(campaign),
            "website_optimization_suggestions": self._suggest_website_optimizations(campaign)
        }
    
    def _generate_predictions(self, campaign: Campaign, ga4_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate campaign performance predictions"""
        # This is a simplified prediction model
        # In production, this would use machine learning models
        
        base_ctr = 0.02  # 2%
        base_conversion_rate = 0.03  # 3%
        base_cpc = 2.50
        
        # Adjust based on campaign type
        if campaign.campaign_type == "search":
            base_ctr *= 1.2
            base_conversion_rate *= 1.5
        elif campaign.campaign_type == "display":
            base_ctr *= 0.5
            base_conversion_rate *= 0.7
        
        daily_budget = campaign.daily_budget or 100
        estimated_clicks = daily_budget / base_cpc
        estimated_impressions = estimated_clicks / base_ctr
        estimated_conversions = estimated_clicks * base_conversion_rate
        
        return {
            "estimated_impressions": round(estimated_impressions),
            "estimated_clicks": round(estimated_clicks),
            "estimated_conversions": round(estimated_conversions, 1),
            "predicted_ctr": round(base_ctr * 100, 2),
            "predicted_conversion_rate": round(base_conversion_rate * 100, 2),
            "predicted_cpc": round(base_cpc, 2),
            "predicted_cpa": round(base_cpc / base_conversion_rate, 2),
            "confidence_interval": "±15%"
        }
    
    def _identify_performance_gaps(
        self,
        campaign: Campaign,
        ga4_data: Dict[str, Any],
        predictions: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Identify gaps between campaign setup and GA4 performance"""
        gaps = {}
        
        # Traffic gap analysis
        current_sessions = ga4_data.get("sessions", 0)
        predicted_sessions = predictions.get("estimated_clicks", 0)
        
        if predicted_sessions > current_sessions * 1.5:
            gaps["traffic"] = {
                "type": "opportunity",
                "description": "Campaign could significantly increase traffic",
                "impact": "high",
                "current_value": current_sessions,
                "predicted_value": predicted_sessions,
                "gap_percentage": round(((predicted_sessions - current_sessions) / current_sessions) * 100, 1)
            }
        
        # Conversion gap analysis
        current_conversion_rate = ga4_data.get("conversion_rate", 0)
        predicted_conversion_rate = predictions.get("predicted_conversion_rate", 0) / 100
        
        if abs(predicted_conversion_rate - current_conversion_rate) > 0.01:
            gaps["conversions"] = {
                "type": "optimization" if predicted_conversion_rate > current_conversion_rate else "risk",
                "description": "Conversion rate gap identified",
                "impact": "medium",
                "current_value": round(current_conversion_rate * 100, 2),
                "predicted_value": round(predicted_conversion_rate * 100, 2),
                "gap_percentage": round(((predicted_conversion_rate - current_conversion_rate) / current_conversion_rate) * 100, 1)
            }
        
        return gaps
    
    def _generate_recommendations(self, performance_gaps: Dict[str, Any], campaign: Campaign) -> Dict[str, Any]:
        """Generate actionable recommendations"""
        recommendations = {
            "high_priority": [],
            "medium_priority": [],
            "low_priority": [],
            "quick_wins": [],
            "long_term": []
        }
        
        # Analyze gaps and generate recommendations
        for gap_type, gap_data in performance_gaps.items():
            if gap_data.get("impact") == "high":
                if gap_type == "traffic":
                    recommendations["high_priority"].append({
                        "category": "Traffic Optimization",
                        "action": "Increase daily budget to capture traffic opportunity",
                        "expected_impact": "25-40% traffic increase",
                        "effort": "low",
                        "timeline": "immediate"
                    })
            
            if gap_data.get("impact") == "medium":
                if gap_type == "conversions":
                    recommendations["medium_priority"].append({
                        "category": "Conversion Optimization",
                        "action": "Optimize landing page for better conversion rates",
                        "expected_impact": "10-20% conversion improvement",
                        "effort": "medium",
                        "timeline": "1-2 weeks"
                    })
        
        # Add general recommendations based on campaign setup
        if not campaign.landing_page_url:
            recommendations["quick_wins"].append({
                "category": "Technical Setup",
                "action": "Add dedicated landing page URL",
                "expected_impact": "Better tracking and optimization",
                "effort": "low",
                "timeline": "1 day"
            })
        
        return recommendations
    
    def _calculate_overall_score(self, *analysis_results) -> float:
        """Calculate overall campaign readiness score"""
        scores = [result.get("score", 0) for result in analysis_results]
        return round(sum(scores) / len(scores), 1)
    
    def _extract_priority_actions(self, recommendations: Dict[str, Any]) -> List[str]:
        """Extract top priority actions"""
        priority_actions = []
        
        # Get high priority recommendations
        for rec in recommendations.get("high_priority", []):
            priority_actions.append(rec.get("action", ""))
        
        # Add quick wins
        for rec in recommendations.get("quick_wins", []):
            priority_actions.append(rec.get("action", ""))
        
        return priority_actions[:5]  # Limit to top 5
    
    # Helper methods for detailed analysis (simplified implementations)
    def _calculate_audience_alignment(self, campaign: Campaign, ga4_data: Dict[str, Any]) -> float:
        return 0.75  # Mock alignment score
    
    def _suggest_audience_improvements(self, campaign: Campaign, ga4_data: Dict[str, Any]) -> List[str]:
        return ["Consider lookalike audiences", "Add interest-based targeting"]
    
    def _assess_creative_quality(self, campaign: Campaign) -> Dict[str, Any]:
        return {"quality_score": 7.5, "areas_for_improvement": ["Image quality", "Message clarity"]}
    
    def _assess_messaging_effectiveness(self, campaign: Campaign) -> Dict[str, Any]:
        return {"effectiveness_score": 8.0, "suggestions": ["Stronger call-to-action", "Value proposition clarity"]}
    
    def _forecast_budget_efficiency(self, campaign: Campaign, ga4_data: Dict[str, Any]) -> Dict[str, Any]:
        return {"efficiency_score": 7.2, "recommended_adjustments": ["Increase mobile bid adjustments"]}
    
    def _recommend_budget_allocation(self, campaign: Campaign) -> Dict[str, Any]:
        return {"device_split": {"mobile": 0.6, "desktop": 0.4}, "time_split": {"peak": 0.7, "off_peak": 0.3}}
    
    def _suggest_optimal_timing(self, campaign: Campaign, ga4_data: Dict[str, Any]) -> Dict[str, Any]:
        return {"best_days": ["Tuesday", "Wednesday", "Thursday"], "best_hours": ["9-11 AM", "2-4 PM"]}
    
    def _analyze_seasonal_impact(self, campaign: Campaign) -> Dict[str, Any]:
        return {"seasonal_modifier": 1.1, "peak_months": ["November", "December"]}
    
    def _assess_tracking_setup(self, campaign: Campaign) -> Dict[str, Any]:
        return {"tracking_score": 6.5, "missing_elements": ["Enhanced ecommerce", "Custom events"]}
    
    def _suggest_website_optimizations(self, campaign: Campaign) -> List[str]:
        return ["Improve page load speed", "Optimize for mobile", "Simplify checkout process"]
    
    def _generate_market_insights(self, campaign: Campaign) -> Dict[str, Any]:
        return {
            "market_size": "Growing 15% YoY",
            "competition_level": "Medium",
            "trends": ["Increased mobile usage", "Voice search growth"]
        }
    
    def _analyze_competitors(self, campaign: Campaign) -> Dict[str, Any]:
        return {
            "competitive_intensity": "Medium-High",
            "average_cpc": "$2.75",
            "top_competitors": ["Competitor A", "Competitor B"],
            "opportunities": ["Long-tail keywords", "Video content"]
        }
    
    def _analyze_seasonal_trends(self, campaign: Campaign) -> Dict[str, Any]:
        return {
            "seasonal_pattern": "Q4 peak performance",
            "monthly_modifiers": {"November": 1.3, "December": 1.5, "January": 0.8},
            "recommendations": ["Increase budget in Q4", "Adjust messaging for holidays"]
        }
