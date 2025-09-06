import logging
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from app.models.campaign_optimization import OptimizationQuestionnaire
from app.models.campaign import Campaign
from app.models.organization import Organization

logger = logging.getLogger(__name__)

class QuestionnaireService:
    """Service for managing dynamic optimization questionnaires"""
    
    def __init__(self, db: Session):
        self.db = db
        self.default_questions = self._get_default_questions()

    def get_questionnaire_for_campaign(self, campaign_id: str) -> Dict[str, Any]:
        """Generate dynamic questionnaire based on campaign and organization context"""
        try:
            # Get campaign and organization
            campaign = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
            if not campaign:
                raise ValueError("Campaign not found")
            
            organization = campaign.organization
            
            # Get base questions
            questions = self._get_base_questions()
            
            # Add industry-specific questions
            industry_questions = self._get_industry_specific_questions(organization.industry)
            questions.extend(industry_questions)
            
            # Add campaign-type specific questions
            campaign_questions = self._get_campaign_type_questions(campaign.campaign_type)
            questions.extend(campaign_questions)
            
            # Add conditional questions based on existing campaign data
            conditional_questions = self._get_conditional_questions(campaign)
            questions.extend(conditional_questions)
            
            # Sort questions by category and order
            questions.sort(key=lambda x: (x["category"], x["order_index"]))
            
            return {
                "campaign_id": campaign_id,
                "total_questions": len(questions),
                "categories": self._group_questions_by_category(questions),
                "questions": questions,
                "estimated_time_minutes": len(questions) * 0.5  # 30 seconds per question
            }
            
        except Exception as e:
            logger.error(f"Failed to generate questionnaire: {e}")
            raise

    def _get_base_questions(self) -> List[Dict[str, Any]]:
        """Get base questions that apply to all campaigns"""
        return [
            {
                "key": "campaign_urgency",
                "text": "How urgent is the launch of this campaign?",
                "type": "multiple_choice",
                "category": "business_context",
                "order_index": 1,
                "required": True,
                "options": [
                    {"value": "immediate", "label": "Immediate (launch within 1 week)", "description": "Time-sensitive campaign that must launch ASAP"},
                    {"value": "soon", "label": "Soon (launch within 2-4 weeks)", "description": "Some flexibility but prefer to launch quickly"},
                    {"value": "flexible", "label": "Flexible (can wait for optimal timing)", "description": "Willing to wait for the best market conditions"},
                    {"value": "strategic", "label": "Strategic (part of larger campaign plan)", "description": "This campaign is part of a broader marketing strategy"}
                ]
            },
            {
                "key": "budget_flexibility",
                "text": "How flexible is your campaign budget?",
                "type": "multiple_choice",
                "category": "business_context",
                "order_index": 2,
                "required": True,
                "options": [
                    {"value": "fixed", "label": "Fixed - Cannot change the budget", "description": "Budget is set and cannot be adjusted"},
                    {"value": "limited", "label": "Limited flexibility (+/- 10%)", "description": "Small adjustments possible"},
                    {"value": "moderate", "label": "Moderate flexibility (+/- 25%)", "description": "Can adjust budget within reasonable limits"},
                    {"value": "high", "label": "High flexibility (can adjust significantly)", "description": "Budget can be increased if ROI justifies it"}
                ]
            },
            {
                "key": "primary_success_metric",
                "text": "What is your primary success metric for this campaign?",
                "type": "multiple_choice",
                "category": "business_context",
                "order_index": 3,
                "required": True,
                "options": [
                    {"value": "brand_awareness", "label": "Brand Awareness", "description": "Increase brand recognition and recall"},
                    {"value": "website_traffic", "label": "Website Traffic", "description": "Drive more visitors to your website"},
                    {"value": "lead_generation", "label": "Lead Generation", "description": "Generate qualified leads for sales team"},
                    {"value": "sales_revenue", "label": "Sales Revenue", "description": "Direct sales and revenue generation"},
                    {"value": "customer_acquisition", "label": "Customer Acquisition", "description": "Acquire new customers"},
                    {"value": "engagement", "label": "Engagement", "description": "Increase social media engagement and interaction"}
                ]
            },
            {
                "key": "target_market_maturity",
                "text": "How mature is your target market's awareness of your product/service category?",
                "type": "multiple_choice",
                "category": "market_context",
                "order_index": 4,
                "required": True,
                "options": [
                    {"value": "emerging", "label": "Emerging - New category, education needed", "description": "Market is just learning about this type of solution"},
                    {"value": "growing", "label": "Growing - Some awareness, competition increasing", "description": "Market understands the need, evaluating options"},
                    {"value": "mature", "label": "Mature - Well-established category", "description": "Market is saturated with established players"},
                    {"value": "declining", "label": "Declining - Category losing relevance", "description": "Traditional solutions being replaced"}
                ]
            },
            {
                "key": "competitive_intensity",
                "text": "How would you describe the competitive intensity in your market?",
                "type": "scale",
                "category": "market_context",
                "order_index": 5,
                "required": True,
                "scale_min": 1,
                "scale_max": 5,
                "scale_labels": {
                    "1": "Low competition - Few players",
                    "2": "Light competition - Some players",
                    "3": "Moderate competition - Several players",
                    "4": "High competition - Many players",
                    "5": "Intense competition - Saturated market"
                }
            },
            {
                "key": "previous_campaign_performance",
                "text": "How would you rate the performance of your previous digital marketing campaigns?",
                "type": "multiple_choice",
                "category": "campaign_history",
                "order_index": 6,
                "required": False,
                "options": [
                    {"value": "excellent", "label": "Excellent - Consistently exceeded goals", "description": "Campaigns regularly outperform expectations"},
                    {"value": "good", "label": "Good - Usually met goals", "description": "Most campaigns achieve their objectives"},
                    {"value": "mixed", "label": "Mixed - Some successes, some failures", "description": "Inconsistent results across campaigns"},
                    {"value": "poor", "label": "Poor - Rarely met goals", "description": "Campaigns typically underperform"},
                    {"value": "no_previous", "label": "No previous digital campaigns", "description": "This is our first digital marketing campaign"}
                ]
            },
            {
                "key": "seasonal_business_patterns",
                "text": "Does your business have strong seasonal patterns?",
                "type": "multiple_choice",
                "category": "business_context",
                "order_index": 7,
                "required": True,
                "options": [
                    {"value": "strong_seasonal", "label": "Yes - Strong seasonal patterns", "description": "Business varies significantly by season"},
                    {"value": "moderate_seasonal", "label": "Moderate seasonal patterns", "description": "Some seasonal variation but not extreme"},
                    {"value": "minimal_seasonal", "label": "Minimal seasonal impact", "description": "Business is relatively stable year-round"},
                    {"value": "counter_seasonal", "label": "Counter-seasonal patterns", "description": "Busy during typically slow periods"}
                ]
            }
        ]

    def _get_industry_specific_questions(self, industry: Optional[str]) -> List[Dict[str, Any]]:
        """Get questions specific to the organization's industry"""
        if not industry:
            return []
        
        industry_questions = {
            "retail": [
                {
                    "key": "retail_peak_season",
                    "text": "What are your peak sales seasons?",
                    "type": "multiple_choice",
                    "category": "industry_context",
                    "order_index": 20,
                    "required": True,
                    "multiple_select": True,
                    "options": [
                        {"value": "holiday_season", "label": "Holiday Season (Nov-Dec)"},
                        {"value": "back_to_school", "label": "Back to School (Aug-Sep)"},
                        {"value": "spring_summer", "label": "Spring/Summer (Mar-Jun)"},
                        {"value": "winter", "label": "Winter (Jan-Feb)"},
                        {"value": "year_round", "label": "Consistent year-round"}
                    ]
                },
                {
                    "key": "retail_customer_journey",
                    "text": "What is your typical customer purchase journey length?",
                    "type": "multiple_choice",
                    "category": "industry_context",
                    "order_index": 21,
                    "required": True,
                    "options": [
                        {"value": "impulse", "label": "Impulse purchase (same day)"},
                        {"value": "short", "label": "Short consideration (1-7 days)"},
                        {"value": "medium", "label": "Medium consideration (1-4 weeks)"},
                        {"value": "long", "label": "Long consideration (1+ months)"}
                    ]
                }
            ],
            "technology": [
                {
                    "key": "tech_product_complexity",
                    "text": "How complex is your technology product/service?",
                    "type": "multiple_choice",
                    "category": "industry_context",
                    "order_index": 20,
                    "required": True,
                    "options": [
                        {"value": "simple", "label": "Simple - Easy to understand and use"},
                        {"value": "moderate", "label": "Moderate - Requires some explanation"},
                        {"value": "complex", "label": "Complex - Significant education needed"},
                        {"value": "enterprise", "label": "Enterprise - Long sales cycles"}
                    ]
                },
                {
                    "key": "tech_target_segment",
                    "text": "What is your primary target segment?",
                    "type": "multiple_choice",
                    "category": "industry_context",
                    "order_index": 21,
                    "required": True,
                    "options": [
                        {"value": "consumer", "label": "Consumer (B2C)"},
                        {"value": "smb", "label": "Small/Medium Business (SMB)"},
                        {"value": "enterprise", "label": "Enterprise (Large Business)"},
                        {"value": "developer", "label": "Developers/Technical Users"}
                    ]
                }
            ],
            "healthcare": [
                {
                    "key": "healthcare_regulation_impact",
                    "text": "How much do healthcare regulations impact your marketing?",
                    "type": "scale",
                    "category": "industry_context",
                    "order_index": 20,
                    "required": True,
                    "scale_min": 1,
                    "scale_max": 5,
                    "scale_labels": {
                        "1": "Minimal impact",
                        "3": "Moderate impact",
                        "5": "Significant regulatory constraints"
                    }
                }
            ],
            "finance": [
                {
                    "key": "finance_trust_factors",
                    "text": "What are the most important trust factors for your customers?",
                    "type": "multiple_choice",
                    "category": "industry_context",
                    "order_index": 20,
                    "required": True,
                    "multiple_select": True,
                    "options": [
                        {"value": "security", "label": "Security and data protection"},
                        {"value": "reputation", "label": "Company reputation and history"},
                        {"value": "certifications", "label": "Industry certifications"},
                        {"value": "testimonials", "label": "Customer testimonials"},
                        {"value": "transparency", "label": "Transparent pricing and terms"}
                    ]
                }
            ]
        }
        
        return industry_questions.get(industry.lower(), [])

    def _get_campaign_type_questions(self, campaign_type: str) -> List[Dict[str, Any]]:
        """Get questions specific to the campaign type"""
        campaign_questions = {
            "search": [
                {
                    "key": "search_intent_focus",
                    "text": "What type of search intent do you want to target primarily?",
                    "type": "multiple_choice",
                    "category": "campaign_specifics",
                    "order_index": 30,
                    "required": True,
                    "options": [
                        {"value": "informational", "label": "Informational - People learning about the topic"},
                        {"value": "navigational", "label": "Navigational - People looking for your brand"},
                        {"value": "commercial", "label": "Commercial - People comparing options"},
                        {"value": "transactional", "label": "Transactional - People ready to buy"}
                    ]
                }
            ],
            "display": [
                {
                    "key": "display_targeting_approach",
                    "text": "What is your preferred display targeting approach?",
                    "type": "multiple_choice",
                    "category": "campaign_specifics",
                    "order_index": 30,
                    "required": True,
                    "options": [
                        {"value": "contextual", "label": "Contextual - Target relevant content"},
                        {"value": "behavioral", "label": "Behavioral - Target user behavior"},
                        {"value": "demographic", "label": "Demographic - Target specific demographics"},
                        {"value": "remarketing", "label": "Remarketing - Target previous visitors"}
                    ]
                }
            ],
            "video": [
                {
                    "key": "video_content_style",
                    "text": "What style of video content performs best for your audience?",
                    "type": "multiple_choice",
                    "category": "campaign_specifics",
                    "order_index": 30,
                    "required": False,
                    "options": [
                        {"value": "educational", "label": "Educational/Tutorial"},
                        {"value": "testimonial", "label": "Customer Testimonials"},
                        {"value": "product_demo", "label": "Product Demonstrations"},
                        {"value": "brand_story", "label": "Brand Storytelling"},
                        {"value": "entertainment", "label": "Entertainment/Humor"}
                    ]
                }
            ]
        }
        
        return campaign_questions.get(campaign_type.lower(), [])

    def _get_conditional_questions(self, campaign: Campaign) -> List[Dict[str, Any]]:
        """Get questions based on existing campaign data"""
        conditional_questions = []
        
        # If campaign has a large budget, ask about budget allocation preferences
        if campaign.total_budget and campaign.total_budget > 10000:
            conditional_questions.append({
                "key": "large_budget_allocation",
                "text": "With your substantial budget, how would you prefer to allocate spending?",
                "type": "multiple_choice",
                "category": "budget_strategy",
                "order_index": 40,
                "required": True,
                "options": [
                    {"value": "aggressive_start", "label": "Aggressive start - Front-load spending"},
                    {"value": "steady_pace", "label": "Steady pace - Even distribution"},
                    {"value": "test_and_scale", "label": "Test and scale - Start small, increase winners"},
                    {"value": "seasonal_focus", "label": "Seasonal focus - Concentrate on peak periods"}
                ]
            })
        
        # If campaign targets multiple locations, ask about geographic priorities
        if campaign.target_locations and len(campaign.target_locations) > 1:
            conditional_questions.append({
                "key": "geographic_priorities",
                "text": "Do you have geographic priorities for this campaign?",
                "type": "multiple_choice",
                "category": "targeting_strategy",
                "order_index": 41,
                "required": True,
                "options": [
                    {"value": "equal_priority", "label": "Equal priority across all locations"},
                    {"value": "major_markets", "label": "Focus on major markets first"},
                    {"value": "test_markets", "label": "Test in smaller markets first"},
                    {"value": "regional_rollout", "label": "Regional rollout strategy"}
                ]
            })
        
        # If campaign has specific audience interests, ask about expansion
        if campaign.target_interests and len(campaign.target_interests) > 0:
            conditional_questions.append({
                "key": "audience_expansion",
                "text": "Are you open to expanding your target audience beyond current interests?",
                "type": "multiple_choice",
                "category": "targeting_strategy",
                "order_index": 42,
                "required": True,
                "options": [
                    {"value": "strict_targeting", "label": "Stick to current targeting"},
                    {"value": "similar_interests", "label": "Expand to similar interests"},
                    {"value": "lookalike_audiences", "label": "Test lookalike audiences"},
                    {"value": "broad_targeting", "label": "Test broader targeting"}
                ]
            })
        
        return conditional_questions

    def _group_questions_by_category(self, questions: List[Dict[str, Any]]) -> Dict[str, List[str]]:
        """Group questions by category for better UX"""
        categories = {}
        for question in questions:
            category = question["category"]
            if category not in categories:
                categories[category] = []
            categories[category].append(question["key"])
        
        return categories

    def validate_responses(self, responses: Dict[str, Any], campaign_id: str) -> Dict[str, Any]:
        """Validate questionnaire responses"""
        try:
            questionnaire = self.get_questionnaire_for_campaign(campaign_id)
            questions = questionnaire["questions"]
            
            validation_results = {
                "valid": True,
                "errors": [],
                "warnings": []
            }
            
            # Check required questions
            for question in questions:
                if question["required"] and question["key"] not in responses:
                    validation_results["valid"] = False
                    validation_results["errors"].append(
                        f"Required question '{question['key']}' is missing"
                    )
            
            # Validate response formats
            for key, value in responses.items():
                question = next((q for q in questions if q["key"] == key), None)
                if question:
                    validation_error = self._validate_response_format(question, value)
                    if validation_error:
                        validation_results["valid"] = False
                        validation_results["errors"].append(validation_error)
            
            return validation_results
            
        except Exception as e:
            logger.error(f"Failed to validate responses: {e}")
            return {
                "valid": False,
                "errors": [f"Validation failed: {str(e)}"],
                "warnings": []
            }

    def _validate_response_format(self, question: Dict[str, Any], value: Any) -> Optional[str]:
        """Validate individual response format"""
        question_type = question["type"]
        
        if question_type == "multiple_choice":
            valid_values = [opt["value"] for opt in question["options"]]
            if question.get("multiple_select"):
                if not isinstance(value, list):
                    return f"Question '{question['key']}' expects a list of values"
                for v in value:
                    if v not in valid_values:
                        return f"Invalid option '{v}' for question '{question['key']}'"
            else:
                if value not in valid_values:
                    return f"Invalid option '{value}' for question '{question['key']}'"
        
        elif question_type == "scale":
            scale_min = question.get("scale_min", 1)
            scale_max = question.get("scale_max", 5)
            if not isinstance(value, (int, float)) or value < scale_min or value > scale_max:
                return f"Question '{question['key']}' expects a number between {scale_min} and {scale_max}"
        
        elif question_type == "text":
            if not isinstance(value, str):
                return f"Question '{question['key']}' expects a text response"
        
        elif question_type == "boolean":
            if not isinstance(value, bool):
                return f"Question '{question['key']}' expects a true/false response"
        
        return None

    def _get_default_questions(self) -> List[Dict[str, Any]]:
        """Get default questions for fallback"""
        return [
            {
                "key": "campaign_urgency",
                "text": "How urgent is this campaign launch?",
                "type": "multiple_choice",
                "category": "business_context",
                "order_index": 1,
                "required": True,
                "options": [
                    {"value": "immediate", "label": "Immediate"},
                    {"value": "flexible", "label": "Flexible"}
                ]
            }
        ]

    def get_question_analytics(self) -> Dict[str, Any]:
        """Get analytics on questionnaire usage and responses"""
        try:
            # This would analyze response patterns to improve questions over time
            return {
                "total_questionnaires_completed": 0,
                "average_completion_time": 0,
                "most_common_responses": {},
                "question_effectiveness_scores": {}
            }
        except Exception as e:
            logger.error(f"Failed to get question analytics: {e}")
            return {}
