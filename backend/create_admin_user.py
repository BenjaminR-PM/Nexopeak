#!/usr/bin/env python3
"""
Script to create an admin user for the Nexopeak application.
Usage: python create_admin_user.py
"""

import sys
import os
from sqlalchemy.orm import sessionmaker

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.organization import Organization
from app.models.connection import Connection  # Import to ensure table creation
from app.models.campaign import Campaign  # Import to ensure table creation

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_admin_user():
    """Create the admin user with predefined credentials."""
    
    # Admin user details
    admin_email = "info@benjaminr.ca"
    admin_password = "123456789"
    admin_name = "Admin User"
    
    # Ensure all tables are created
    Base.metadata.create_all(bind=engine)
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        existing_user = db.query(User).filter(User.email == admin_email).first()
        if existing_user:
            print(f"Admin user with email {admin_email} already exists!")
            print(f"User ID: {existing_user.id}")
            print(f"Name: {existing_user.name}")
            print(f"Role: {existing_user.role}")
            return existing_user
        
        # Check if admin organization exists, create if not
        admin_org = db.query(Organization).filter(Organization.name == "Nexopeak Admin").first()
        if not admin_org:
            admin_org = Organization(
                name="Nexopeak Admin",
                domain="nexopeak.com"
            )
            db.add(admin_org)
            db.commit()
            db.refresh(admin_org)
            print(f"Created admin organization: {admin_org.name}")
        
        # Hash the password
        hashed_password = get_password_hash(admin_password)
        
        # Create admin user
        admin_user = User(
            email=admin_email,
            name=admin_name,
            hashed_password=hashed_password,
            role="admin",
            org_id=admin_org.id,
            is_active=True,
            is_verified=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Admin user created successfully!")
        print(f"Email: {admin_user.email}")
        print(f"Name: {admin_user.name}")
        print(f"Role: {admin_user.role}")
        print(f"User ID: {admin_user.id}")
        print(f"Organization: {admin_org.name}")
        print(f"Password: {admin_password}")
        
        return admin_user
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating admin user: {str(e)}")
        raise
    finally:
        db.close()

def main():
    """Main function to create admin user."""
    print("Creating Nexopeak Admin User...")
    print("=" * 50)
    
    try:
        admin_user = create_admin_user()
        print("=" * 50)
        print("Admin user setup complete!")
        
    except Exception as e:
        print(f"Failed to create admin user: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
