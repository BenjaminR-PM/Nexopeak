#!/usr/bin/env python3
"""
Initialize admin data for Nexopeak platform.
Creates default subscription plans, platform settings, and sample data.
"""

import sys
import os
from datetime import datetime, timedelta

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models import *  # Import all models
from app.services.auth_service import AuthService

def create_default_subscription_plans(db: Session):
    """Create default subscription plans."""
    print("Creating default subscription plans...")
    
    plans = [
        {
            "name": "Basic",
            "description": "Perfect for small businesses getting started with analytics",
            "price_monthly": 99.0,
            "price_yearly": 990.0,
            "max_users": 5,
            "max_ga4_properties": 3,
            "max_api_calls_per_month": 50000,
            "max_data_retention_days": 365,
            "features": [
                "GA4 Integration",
                "Basic Reporting",
                "Email Support",
                "Data Export",
                "5 Users"
            ]
        },
        {
            "name": "Professional", 
            "description": "Advanced analytics for growing businesses",
            "price_monthly": 299.0,
            "price_yearly": 2990.0,
            "max_users": 25,
            "max_ga4_properties": 10,
            "max_api_calls_per_month": 200000,
            "max_data_retention_days": 730,
            "features": [
                "Everything in Basic",
                "Advanced Reporting",
                "Custom Dashboards",
                "API Access",
                "Priority Support",
                "25 Users",
                "Advanced Integrations"
            ]
        },
        {
            "name": "Enterprise",
            "description": "Complete analytics solution for large organizations",
            "price_monthly": 999.0,
            "price_yearly": 9990.0,
            "max_users": None,  # Unlimited
            "max_ga4_properties": None,  # Unlimited
            "max_api_calls_per_month": None,  # Unlimited
            "max_data_retention_days": 1095,  # 3 years
            "features": [
                "Everything in Professional",
                "Unlimited Users",
                "Unlimited Properties",
                "White-label Options",
                "Dedicated Support",
                "SLA Guarantee",
                "Custom Integrations",
                "Advanced Security"
            ]
        }
    ]
    
    for plan_data in plans:
        existing_plan = db.query(SubscriptionPlan).filter(
            SubscriptionPlan.name == plan_data["name"]
        ).first()
        
        if not existing_plan:
            plan = SubscriptionPlan(**plan_data)
            db.add(plan)
            print(f"  Created plan: {plan_data['name']}")
        else:
            print(f"  Plan already exists: {plan_data['name']}")
    
    db.commit()


def create_default_platform_settings(db: Session):
    """Create default platform settings."""
    print("Creating default platform settings...")
    
    settings = [
        # API Configuration
        {
            "category": "api",
            "key": "ga4_api_rate_limit",
            "value": 2000,
            "description": "Maximum GA4 API requests per hour per client",
            "data_type": "integer",
            "min_value": 100,
            "max_value": 10000
        },
        {
            "category": "api",
            "key": "max_concurrent_connections",
            "value": 50,
            "description": "Maximum simultaneous GA4 connections",
            "data_type": "integer",
            "min_value": 10,
            "max_value": 500
        },
        {
            "category": "api",
            "key": "api_timeout_seconds",
            "value": 30,
            "description": "API request timeout in seconds",
            "data_type": "integer",
            "min_value": 10,
            "max_value": 120
        },
        {
            "category": "api",
            "key": "enable_api_caching",
            "value": True,
            "description": "Enable API response caching",
            "data_type": "boolean"
        },
        {
            "category": "api",
            "key": "cache_expiry_hours",
            "value": 24,
            "description": "API cache expiry time in hours",
            "data_type": "integer",
            "min_value": 1,
            "max_value": 168
        },
        
        # Security Settings
        {
            "category": "security",
            "key": "enable_two_factor_auth",
            "value": True,
            "description": "Require two-factor authentication for admin accounts",
            "data_type": "boolean"
        },
        {
            "category": "security",
            "key": "session_timeout_minutes",
            "value": 120,
            "description": "User session timeout in minutes",
            "data_type": "integer",
            "min_value": 15,
            "max_value": 1440
        },
        {
            "category": "security",
            "key": "max_login_attempts",
            "value": 5,
            "description": "Maximum failed login attempts before lockout",
            "data_type": "integer",
            "min_value": 3,
            "max_value": 10
        },
        {
            "category": "security",
            "key": "enable_ip_whitelisting",
            "value": False,
            "description": "Enable IP address whitelisting",
            "data_type": "boolean"
        },
        {
            "category": "security",
            "key": "enable_audit_logging",
            "value": True,
            "description": "Enable comprehensive audit logging",
            "data_type": "boolean"
        },
        
        # Platform Features
        {
            "category": "features",
            "key": "enable_trial_accounts",
            "value": True,
            "description": "Allow trial account creation",
            "data_type": "boolean"
        },
        {
            "category": "features",
            "key": "trial_duration_days",
            "value": 14,
            "description": "Trial account duration in days",
            "data_type": "integer",
            "min_value": 7,
            "max_value": 90
        },
        {
            "category": "features",
            "key": "enable_self_signup",
            "value": True,
            "description": "Enable self-service account registration",
            "data_type": "boolean"
        },
        {
            "category": "features",
            "key": "require_email_verification",
            "value": True,
            "description": "Require email verification for new accounts",
            "data_type": "boolean"
        },
        {
            "category": "features",
            "key": "enable_data_export",
            "value": True,
            "description": "Allow data export features",
            "data_type": "boolean"
        },
        {
            "category": "features",
            "key": "max_data_retention_days",
            "value": 365,
            "description": "Maximum data retention period in days",
            "data_type": "integer",
            "min_value": 30,
            "max_value": 2555  # 7 years
        },
        
        # Notifications
        {
            "category": "notifications",
            "key": "enable_system_alerts",
            "value": True,
            "description": "Enable system status alerts",
            "data_type": "boolean"
        },
        {
            "category": "notifications",
            "key": "enable_usage_alerts",
            "value": True,
            "description": "Enable usage threshold alerts",
            "data_type": "boolean"
        },
        {
            "category": "notifications",
            "key": "enable_security_alerts",
            "value": True,
            "description": "Enable security event alerts",
            "data_type": "boolean"
        },
        {
            "category": "notifications",
            "key": "alert_threshold_percent",
            "value": 80,
            "description": "Alert threshold percentage for resource usage",
            "data_type": "integer",
            "min_value": 50,
            "max_value": 95
        },
        
        # Performance
        {
            "category": "performance",
            "key": "enable_data_compression",
            "value": True,
            "description": "Enable data compression",
            "data_type": "boolean"
        },
        {
            "category": "performance",
            "key": "max_query_complexity",
            "value": 100,
            "description": "Maximum query complexity score",
            "data_type": "integer",
            "min_value": 10,
            "max_value": 1000
        },
        {
            "category": "performance",
            "key": "enable_query_optimization",
            "value": True,
            "description": "Enable automatic query optimization",
            "data_type": "boolean"
        },
        {
            "category": "performance",
            "key": "caching_strategy",
            "value": "balanced",
            "description": "Caching strategy for performance optimization",
            "data_type": "string",
            "allowed_values": ["conservative", "balanced", "aggressive"]
        }
    ]
    
    for setting_data in settings:
        existing_setting = db.query(PlatformSettings).filter(
            PlatformSettings.category == setting_data["category"],
            PlatformSettings.key == setting_data["key"]
        ).first()
        
        if not existing_setting:
            setting = PlatformSettings(**setting_data)
            db.add(setting)
            print(f"  Created setting: {setting_data['category']}.{setting_data['key']}")
        else:
            print(f"  Setting already exists: {setting_data['category']}.{setting_data['key']}")
    
    db.commit()


def create_sample_data(db: Session):
    """Create sample organizations, users, and connections for testing."""
    print("Creating sample data...")
    
    # Get subscription plans
    basic_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == "Basic").first()
    pro_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == "Professional").first()
    enterprise_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == "Enterprise").first()
    
    # Sample organizations
    sample_orgs = [
        {
            "name": "Acme Corporation",
            "industry": "Technology",
            "website": "https://acme.com",
            "plan": enterprise_plan,
            "users": [
                {"email": "john.doe@acme.com", "name": "John Doe", "role": "admin"},
                {"email": "jane.smith@acme.com", "name": "Jane Smith", "role": "analyst"},
                {"email": "bob.wilson@acme.com", "name": "Bob Wilson", "role": "viewer"}
            ]
        },
        {
            "name": "TechStart Inc",
            "industry": "Startup",
            "website": "https://techstart.io",
            "plan": pro_plan,
            "users": [
                {"email": "sarah@techstart.io", "name": "Sarah Johnson", "role": "admin"},
                {"email": "mike@techstart.io", "name": "Mike Chen", "role": "analyst"}
            ]
        },
        {
            "name": "Global Retail Solutions",
            "industry": "E-commerce",
            "website": "https://globalretail.com",
            "plan": enterprise_plan,
            "users": [
                {"email": "mike@globalretail.com", "name": "Mike Rodriguez", "role": "admin"},
                {"email": "lisa@globalretail.com", "name": "Lisa Wang", "role": "analyst"},
                {"email": "david@globalretail.com", "name": "David Brown", "role": "analyst"},
                {"email": "emma@globalretail.com", "name": "Emma Davis", "role": "viewer"}
            ]
        },
        {
            "name": "Digital Marketing Agency",
            "industry": "Marketing",
            "website": "https://digitalagency.com",
            "plan": pro_plan,
            "users": [
                {"email": "lisa@agency.com", "name": "Lisa Thompson", "role": "admin"},
                {"email": "alex@agency.com", "name": "Alex Martinez", "role": "analyst"}
            ]
        },
        {
            "name": "Local Business Hub",
            "industry": "Services",
            "website": "https://localbiz.com",
            "plan": basic_plan,
            "users": [
                {"email": "owner@localbiz.com", "name": "Business Owner", "role": "admin"}
            ]
        }
    ]
    
    for org_data in sample_orgs:
        # Check if organization already exists
        existing_org = db.query(Organization).filter(
            Organization.name == org_data["name"]
        ).first()
        
        if existing_org:
            print(f"  Organization already exists: {org_data['name']}")
            continue
        
        # Create organization
        org = Organization(
            name=org_data["name"],
            industry=org_data["industry"],
            website=org_data["website"]
        )
        db.add(org)
        db.flush()  # Get the ID
        
        # Create subscription
        if org_data["plan"]:
            subscription = Subscription(
                org_id=org.id,
                plan_id=org_data["plan"].id,
                status="active",
                start_date=datetime.utcnow() - timedelta(days=30),
                next_billing_date=datetime.utcnow() + timedelta(days=30)
            )
            db.add(subscription)
        
        # Create users
        for user_data in org_data["users"]:
            try:
                # Create user directly since AuthService uses static methods
                from app.core.security import get_password_hash
                
                hashed_password = get_password_hash("Demo123!")
                user = User(
                    email=user_data["email"],
                    name=user_data["name"],
                    hashed_password=hashed_password,
                    role=user_data["role"],
                    org_id=org.id,
                    is_active=True,
                    is_verified=True
                )
                db.add(user)
                db.flush()  # Get the ID
                
                # Create some sample GA4 connections
                if user_data["role"] in ["admin", "analyst"]:
                    connection = Connection(
                        org_id=org.id,
                        user_id=user.id,
                        provider="ga4",
                        external_id=f"G-{org.id[:8].upper()}",
                        name=f"{org.name} Website",
                        status="connected",
                        last_sync_at=datetime.utcnow() - timedelta(minutes=30),
                        last_sync_status="success"
                    )
                    db.add(connection)
                
            except Exception as e:
                print(f"    Error creating user {user_data['email']}: {e}")
        
        print(f"  Created organization: {org_data['name']}")
    
    db.commit()


def main():
    """Initialize all admin data."""
    print("Initializing Nexopeak admin data...")
    
    # Create all tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Create default data
        create_default_subscription_plans(db)
        create_default_platform_settings(db)
        create_sample_data(db)
        
        print("\n✅ Admin data initialization completed successfully!")
        print("\nSample login credentials:")
        print("  john.doe@acme.com / Demo123!")
        print("  sarah@techstart.io / Demo123!")
        print("  mike@globalretail.com / Demo123!")
        print("  lisa@agency.com / Demo123!")
        print("  owner@localbiz.com / Demo123!")
        print("\nAdmin user:")
        print("  info@benjaminr.ca / 123456789")
        
    except Exception as e:
        print(f"❌ Error initializing admin data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
