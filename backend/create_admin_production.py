#!/usr/bin/env python3
"""
Create admin user directly in production via API
"""
import requests
import json

# Production backend URL
BACKEND_URL = "https://nexopeak-backend-54c8631fe608.herokuapp.com"

def create_admin_user():
    """Create admin user in production database"""
    
    # First create an organization for the admin
    print("Creating admin user in production...")
    
    # Admin user data
    admin_data = {
        "email": "info@benjaminr.ca",
        "password": "123456789",
        "name": "Admin User",
        "role": "admin"
    }
    
    # Create the admin user via API
    response = requests.post(
        f"{BACKEND_URL}/api/v1/auth/register",
        json=admin_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        user_data = response.json()
        print(f"✅ Admin user created successfully!")
        print(f"   ID: {user_data['id']}")
        print(f"   Email: {user_data['email']}")
        print(f"   Role: {user_data['role']}")
        print(f"   Organization ID: {user_data['org_id']}")
        
        # Test login
        print("\nTesting admin login...")
        login_response = requests.post(
            f"{BACKEND_URL}/api/v1/auth/login",
            json={"email": admin_data["email"], "password": admin_data["password"]},
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code == 200:
            print("✅ Admin login test successful!")
            token_data = login_response.json()
            print(f"   Access token received: {token_data['access_token'][:50]}...")
        else:
            print(f"❌ Admin login test failed: {login_response.status_code}")
            print(f"   Error: {login_response.text}")
            
    elif response.status_code == 400 and "already exists" in response.text:
        print("ℹ️  Admin user already exists, testing login...")
        
        # Test login if user exists
        login_response = requests.post(
            f"{BACKEND_URL}/api/v1/auth/login",
            json={"email": admin_data["email"], "password": admin_data["password"]},
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code == 200:
            print("✅ Admin login successful!")
            token_data = login_response.json()
            print(f"   Access token received: {token_data['access_token'][:50]}...")
        else:
            print(f"❌ Admin login failed: {login_response.status_code}")
            print(f"   Error: {login_response.text}")
    else:
        print(f"❌ Failed to create admin user: {response.status_code}")
        print(f"   Error: {response.text}")

if __name__ == "__main__":
    create_admin_user()
