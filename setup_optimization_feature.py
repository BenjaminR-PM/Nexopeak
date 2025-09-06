#!/usr/bin/env python3
"""
Setup script for the Campaign Optimization feature
This script initializes the database tables and default questionnaire data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.core.database import Base
from backend.app.models.campaign_optimization import OptimizationQuestionnaire
from backend.app.core.config import settings

def create_default_questionnaire_data(db_session):
    """Create default questionnaire questions"""
    
    default_questions = [
        {
            "question_key": "campaign_urgency",
            "question_text": "How urgent is the launch of this campaign?",
            "question_type": "multiple_choice",
            "category": "business_context",
            "order_index": 1,
            "is_required": True,
            "options": [
                {"value": "immediate", "label": "Immediate (launch within 1 week)"},
                {"value": "soon", "label": "Soon (launch within 2-4 weeks)"},
                {"value": "flexible", "label": "Flexible (can wait for optimal timing)"},
                {"value": "strategic", "label": "Strategic (part of larger campaign plan)"}
            ]
        },
        {
            "question_key": "budget_flexibility",
            "question_text": "How flexible is your campaign budget?",
            "question_type": "multiple_choice",
            "category": "business_context",
            "order_index": 2,
            "is_required": True,
            "options": [
                {"value": "fixed", "label": "Fixed - Cannot change the budget"},
                {"value": "limited", "label": "Limited flexibility (+/- 10%)"},
                {"value": "moderate", "label": "Moderate flexibility (+/- 25%)"},
                {"value": "high", "label": "High flexibility (can adjust significantly)"}
            ]
        },
        {
            "question_key": "primary_success_metric",
            "question_text": "What is your primary success metric for this campaign?",
            "question_type": "multiple_choice",
            "category": "business_context",
            "order_index": 3,
            "is_required": True,
            "options": [
                {"value": "brand_awareness", "label": "Brand Awareness"},
                {"value": "website_traffic", "label": "Website Traffic"},
                {"value": "lead_generation", "label": "Lead Generation"},
                {"value": "sales_revenue", "label": "Sales Revenue"},
                {"value": "customer_acquisition", "label": "Customer Acquisition"}
            ]
        },
        {
            "question_key": "competitive_intensity",
            "question_text": "How would you describe the competitive intensity in your market?",
            "question_type": "scale",
            "category": "market_context",
            "order_index": 4,
            "is_required": True,
            "scale_min": 1,
            "scale_max": 5,
            "scale_labels": {
                "1": "Low competition",
                "3": "Moderate competition",
                "5": "Intense competition"
            }
        },
        {
            "question_key": "seasonal_business_patterns",
            "question_text": "Does your business have strong seasonal patterns?",
            "question_type": "multiple_choice",
            "category": "business_context",
            "order_index": 5,
            "is_required": True,
            "options": [
                {"value": "strong_seasonal", "label": "Yes - Strong seasonal patterns"},
                {"value": "moderate_seasonal", "label": "Moderate seasonal patterns"},
                {"value": "minimal_seasonal", "label": "Minimal seasonal impact"},
                {"value": "counter_seasonal", "label": "Counter-seasonal patterns"}
            ]
        }
    ]
    
    # Check if questions already exist
    existing_count = db_session.query(OptimizationQuestionnaire).count()
    if existing_count > 0:
        print(f"Found {existing_count} existing questionnaire questions. Skipping creation.")
        return
    
    # Create questions
    for question_data in default_questions:
        question = OptimizationQuestionnaire(**question_data)
        db_session.add(question)
    
    db_session.commit()
    print(f"Created {len(default_questions)} default questionnaire questions.")

def setup_database():
    """Setup database tables for optimization feature"""
    
    try:
        # Create database engine
        engine = create_engine(settings.DATABASE_URL)
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
        
        # Create session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        try:
            # Create default questionnaire data
            create_default_questionnaire_data(db)
            print("✅ Default questionnaire data created")
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
        return False
    
    return True

def main():
    """Main setup function"""
    print("🚀 Setting up Campaign Optimization Feature...")
    print("=" * 50)
    
    # Setup database
    if not setup_database():
        print("❌ Setup failed!")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("✅ Campaign Optimization Feature Setup Complete!")
    print("\nNext steps:")
    print("1. Start your backend server: cd backend && uvicorn main:app --reload")
    print("2. Start your frontend server: cd frontend && npm run dev")
    print("3. Navigate to a campaign and click 'Optimize Campaign'")
    print("\nFeatures available:")
    print("• Dynamic questionnaire system")
    print("• AI-powered recommendations")
    print("• Market intelligence integration")
    print("• Optimal timing analysis")
    print("• Platform and budget optimization")

if __name__ == "__main__":
    main()
