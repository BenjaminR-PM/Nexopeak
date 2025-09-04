#!/usr/bin/env python3
"""
Check user role directly in database
"""
import os
import sys
sys.path.append('backend')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.models.user import User
from backend.app.models.organization import Organization

# Get database URL from environment or use default
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://localhost/nexopeak')

# Handle Heroku postgres URL format
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

def check_user_role():
    """Check the admin user's role in the database"""
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Find the admin user
        admin_email = "info@benjaminr.ca"
        user = db.query(User).filter(User.email == admin_email).first()
        
        if user:
            print(f"✅ Found user: {user.email}")
            print(f"   ID: {user.id}")
            print(f"   Name: {user.name}")
            print(f"   Role: {user.role}")
            print(f"   Org ID: {user.org_id}")
            print(f"   Is Active: {user.is_active}")
            print(f"   Is Verified: {user.is_verified}")
            
            # Get organization info
            if user.org_id:
                org = db.query(Organization).filter(Organization.id == user.org_id).first()
                if org:
                    print(f"   Organization: {org.name}")
            
            if user.role == "admin":
                print("✅ User has admin role in database!")
            else:
                print(f"❌ User role is '{user.role}', not 'admin'")
                print("   Need to update user role to 'admin'")
                
                # Update user role to admin
                user.role = "admin"
                db.commit()
                print("✅ Updated user role to 'admin'")
        else:
            print(f"❌ User {admin_email} not found in database")
            
        db.close()
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        print(f"   DATABASE_URL: {DATABASE_URL}")

if __name__ == "__main__":
    check_user_role()
