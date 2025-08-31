#!/usr/bin/env python3
"""
Check admin user in production database
"""
import requests
import json

# Production backend URL
BACKEND_URL = "https://nexopeak-backend-54c8631fe608.herokuapp.com"

def check_admin_login():
    """Test admin login"""
    print("🔍 Testing admin login...")
    
    login_data = {
        "email": "info@benjaminr.ca",
        "password": "123456789"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/v1/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            user = data.get('user', {})
            print(f"✅ Login successful!")
            print(f"User ID: {user.get('id')}")
            print(f"Email: {user.get('email')}")
            print(f"Name: {user.get('name')}")
            print(f"Role: {user.get('role')}")
            print(f"Org ID: {user.get('org_id')}")
            
            if user.get('role') == 'admin':
                print("✅ User has admin role!")
            else:
                print(f"❌ User role is '{user.get('role')}', not 'admin'")
        else:
            print(f"❌ Login failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def check_backend_health():
    """Check if backend is responding"""
    print("🔍 Checking backend health...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        print(f"Health check status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Backend is healthy")
        else:
            print(f"❌ Backend health check failed: {response.text}")
    except Exception as e:
        print(f"❌ Backend unreachable: {e}")

if __name__ == "__main__":
    print("🚀 Nexopeak Admin User Check\n")
    check_backend_health()
    print()
    check_admin_login()
