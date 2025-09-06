from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import logging

from app.core.database import get_db
from app.models.user import User
from app.models.campaign import Campaign
from app.models.campaign_optimization import CampaignOptimization
from app.services.auth_service import AuthService
from app.core.security import verify_token
from app.services.campaign_optimization_service import CampaignOptimizationService
from app.services.questionnaire_service import QuestionnaireService
from app.services.logging_service import get_logging_service, LogModule

router = APIRouter()
security = HTTPBearer()
logging_service = get_logging_service()
logger = logging.getLogger(__name__)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get current authenticated user."""
    try:
        payload = verify_token(credentials.credentials)
        user = AuthService.get_user_by_email(db, payload.get("sub"))
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

@router.post("/campaigns/{campaign_id}/optimize")
async def start_campaign_optimization(
    campaign_id: str,
    optimization_type: str = "full",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start the campaign optimization process"""
    try:
        # Validate campaign access
        campaign = db.query(Campaign).filter(
            Campaign.id == campaign_id,
            Campaign.org_id == current_user.org_id
        ).first()
        
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        # Initialize optimization service
        optimization_service = CampaignOptimizationService(db)
        
        # Start optimization
        optimization = await optimization_service.start_optimization(
            campaign_id=campaign_id,
            user_id=current_user.id,
            optimization_type=optimization_type
        )
        
        logging_service.log_info(
            module=LogModule.CAMPAIGN_ANALYZER,
            message=f"Started campaign optimization for campaign {campaign_id}",
            user_id=current_user.id,
            metadata={"optimization_id": optimization.id, "type": optimization_type}
        )
        
        return {
            "optimization_id": optimization.id,
            "status": optimization.status,
            "message": "Campaign optimization started successfully",
            "next_step": "questionnaire"
        }
        
    except Exception as e:
        logging_service.log_error(
            module=LogModule.CAMPAIGN_ANALYZER,
            message=f"Failed to start campaign optimization for campaign {campaign_id}",
            error=str(e),
            user_id=current_user.id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start optimization: {str(e)}"
        )

@router.get("/campaigns/{campaign_id}/optimize/questionnaire")
async def get_optimization_questionnaire(
    campaign_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the dynamic questionnaire for campaign optimization"""
    try:
        # Validate campaign access
        campaign = db.query(Campaign).filter(
            Campaign.id == campaign_id,
            Campaign.org_id == current_user.org_id
        ).first()
        
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        # Generate questionnaire
        questionnaire_service = QuestionnaireService(db)
        questionnaire = questionnaire_service.get_questionnaire_for_campaign(campaign_id)
        
        return questionnaire
        
    except Exception as e:
        logging_service.log_error(
            module=LogModule.CAMPAIGN_ANALYZER,
            message=f"Failed to get questionnaire for campaign {campaign_id}",
            error=str(e),
            user_id=current_user.id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get questionnaire: {str(e)}"
        )

@router.post("/campaigns/{campaign_id}/optimize/questionnaire")
async def submit_optimization_questionnaire(
    campaign_id: str,
    responses: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit questionnaire responses and trigger analysis"""
    try:
        # Validate campaign access
        campaign = db.query(Campaign).filter(
            Campaign.id == campaign_id,
            Campaign.org_id == current_user.org_id
        ).first()
        
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        # Get optimization record
        optimization = db.query(CampaignOptimization).filter(
            CampaignOptimization.campaign_id == campaign_id,
            CampaignOptimization.user_id == current_user.id
        ).order_by(CampaignOptimization.created_at.desc()).first()
        
        if not optimization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Optimization not found. Please start optimization first."
            )
        
        # Validate responses
        questionnaire_service = QuestionnaireService(db)
        validation_result = questionnaire_service.validate_responses(responses, campaign_id)
        
        if not validation_result["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Invalid questionnaire responses",
                    "errors": validation_result["errors"]
                }
            )
        
        # Process questionnaire
        optimization_service = CampaignOptimizationService(db)
        
        # Process in background for better UX
        background_tasks.add_task(
            optimization_service.process_questionnaire,
            optimization.id,
            responses
        )
        
        logging_service.log_info(
            module=LogModule.CAMPAIGN_ANALYZER,
            message=f"Questionnaire submitted for campaign {campaign_id}",
            user_id=current_user.id,
            metadata={"optimization_id": optimization.id, "response_count": len(responses)}
        )
        
        return {
            "optimization_id": optimization.id,
            "status": "processing",
            "message": "Questionnaire submitted successfully. Analysis in progress.",
            "estimated_completion_minutes": 2
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging_service.log_error(
            module=LogModule.CAMPAIGN_ANALYZER,
            message=f"Failed to submit questionnaire for campaign {campaign_id}",
            error=str(e),
            user_id=current_user.id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit questionnaire: {str(e)}"
        )

@router.get("/optimizations/{optimization_id}/status")
async def get_optimization_status(
    optimization_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current status of an optimization"""
    try:
        # Validate optimization access
        optimization = db.query(CampaignOptimization).filter(
            CampaignOptimization.id == optimization_id,
            CampaignOptimization.user_id == current_user.id
        ).first()
        
        if not optimization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Optimization not found"
            )
        
        optimization_service = CampaignOptimizationService(db)
        status_info = await optimization_service.get_optimization_status(optimization_id)
        
        return status_info
        
    except HTTPException:
        raise
    except Exception as e:
        logging_service.log_error(
            module=LogModule.CAMPAIGN_ANALYZER,
            message=f"Failed to get optimization status {optimization_id}",
            error=str(e),
            user_id=current_user.id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get status: {str(e)}"
        )

@router.get("/optimizations/{optimization_id}/recommendations")
async def get_optimization_recommendations(
    optimization_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get optimization recommendations"""
    try:
        # Validate optimization access
        optimization = db.query(CampaignOptimization).filter(
            CampaignOptimization.id == optimization_id,
            CampaignOptimization.user_id == current_user.id
        ).first()
        
        if not optimization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Optimization not found"
            )
        
        optimization_service = CampaignOptimizationService(db)
        recommendations = await optimization_service.get_recommendations(optimization_id)
        
        return recommendations
        
    except HTTPException:
        raise
    except Exception as e:
        logging_service.log_error(
            module=LogModule.CAMPAIGN_ANALYZER,
            message=f"Failed to get recommendations for optimization {optimization_id}",
            error=str(e),
            user_id=current_user.id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recommendations: {str(e)}"
        )

@router.post("/optimizations/{optimization_id}/apply")
async def apply_optimization_recommendations(
    optimization_id: str,
    selected_recommendations: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Apply selected optimization recommendations to the campaign"""
    try:
        # Validate optimization access
        optimization = db.query(CampaignOptimization).filter(
            CampaignOptimization.id == optimization_id,
            CampaignOptimization.user_id == current_user.id
        ).first()
        
        if not optimization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Optimization not found"
            )
        
        if optimization.status != "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Optimization not completed yet"
            )
        
        # Get the campaign
        campaign = optimization.campaign
        
        # Apply recommendations to campaign
        applied_changes = []
        
        # Apply timing recommendations
        if "timing" in selected_recommendations:
            timing_rec = selected_recommendations["timing"]
            if "optimal_launch_date" in timing_rec:
                from datetime import datetime
                campaign.start_date = datetime.fromisoformat(timing_rec["optimal_launch_date"])
                applied_changes.append("launch_date")
        
        # Apply platform recommendations
        if "platforms" in selected_recommendations:
            platform_rec = selected_recommendations["platforms"]
            if "primary_platform" in platform_rec:
                campaign.platform = platform_rec["primary_platform"]
                applied_changes.append("primary_platform")
        
        # Apply budget recommendations
        if "budget" in selected_recommendations:
            budget_rec = selected_recommendations["budget"]
            if "recommended_total_budget" in budget_rec:
                campaign.total_budget = budget_rec["recommended_total_budget"]
                applied_changes.append("total_budget")
            if "recommended_daily_budget" in budget_rec:
                campaign.daily_budget = budget_rec["recommended_daily_budget"]
                applied_changes.append("daily_budget")
        
        # Apply audience recommendations
        if "audience" in selected_recommendations:
            audience_rec = selected_recommendations["audience"]
            if "demographic_refinement" in audience_rec:
                campaign.target_demographics.update(audience_rec["demographic_refinement"])
                applied_changes.append("demographics")
            if "interest_expansion" in audience_rec:
                campaign.target_interests.extend(audience_rec["interest_expansion"])
                applied_changes.append("interests")
        
        # Update optimization record
        optimization.recommendations_applied = selected_recommendations
        optimization.applied_at = datetime.utcnow()
        
        db.commit()
        
        logging_service.log_info(
            module=LogModule.CAMPAIGN_ANALYZER,
            message=f"Applied optimization recommendations for campaign {campaign.id}",
            user_id=current_user.id,
            metadata={
                "optimization_id": optimization_id,
                "applied_changes": applied_changes
            }
        )
        
        return {
            "message": "Recommendations applied successfully",
            "applied_changes": applied_changes,
            "campaign_id": campaign.id,
            "optimization_id": optimization_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging_service.log_error(
            module=LogModule.CAMPAIGN_ANALYZER,
            message=f"Failed to apply recommendations for optimization {optimization_id}",
            error=str(e),
            user_id=current_user.id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to apply recommendations: {str(e)}"
        )

@router.get("/campaigns/{campaign_id}/optimize/history")
async def get_optimization_history(
    campaign_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get optimization history for a campaign"""
    try:
        # Validate campaign access
        campaign = db.query(Campaign).filter(
            Campaign.id == campaign_id,
            Campaign.org_id == current_user.org_id
        ).first()
        
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        # Get optimization history
        optimizations = db.query(CampaignOptimization).filter(
            CampaignOptimization.campaign_id == campaign_id
        ).order_by(CampaignOptimization.created_at.desc()).all()
        
        history = []
        for opt in optimizations:
            history.append({
                "id": opt.id,
                "status": opt.status,
                "optimization_type": opt.optimization_type,
                "created_at": opt.created_at.isoformat(),
                "completed_at": opt.completed_at.isoformat() if opt.completed_at else None,
                "confidence_scores": {
                    "overall": opt.overall_confidence,
                    "timing": opt.timing_confidence,
                    "platform": opt.platform_confidence,
                    "budget": opt.budget_confidence
                },
                "recommendations_applied": bool(opt.recommendations_applied)
            })
        
        return {
            "campaign_id": campaign_id,
            "optimization_history": history,
            "total_optimizations": len(history)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging_service.log_error(
            module=LogModule.CAMPAIGN_ANALYZER,
            message=f"Failed to get optimization history for campaign {campaign_id}",
            error=str(e),
            user_id=current_user.id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get optimization history: {str(e)}"
        )

@router.get("/market-intelligence")
async def get_market_intelligence_summary(
    industry: Optional[str] = None,
    geography: str = "Canada",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get market intelligence summary for planning purposes"""
    try:
        from app.services.market_intelligence_service import MarketIntelligenceService
        
        # Use organization industry if not specified
        if not industry:
            user_org = db.query(User).filter(User.id == current_user.id).first().organization
            industry = user_org.industry if user_org else "general"
        
        market_service = MarketIntelligenceService(db)
        intelligence = await market_service.get_market_intelligence(
            industry=industry,
            geography=geography
        )
        
        # Return summary for planning
        summary = {
            "industry": industry,
            "geography": geography,
            "economic_outlook": intelligence.get("economic_indicators", {}),
            "seasonal_patterns": intelligence.get("seasonal_patterns", {}),
            "consumer_behavior": intelligence.get("consumer_behavior", {}),
            "timing_insights": intelligence.get("timing_insights", {}),
            "last_updated": intelligence.get("last_updated")
        }
        
        return summary
        
    except Exception as e:
        logging_service.log_error(
            module=LogModule.CAMPAIGN_ANALYZER,
            message=f"Failed to get market intelligence summary",
            error=str(e),
            user_id=current_user.id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get market intelligence: {str(e)}"
        )
