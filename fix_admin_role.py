#!/usr/bin/env python3
"""
Fix admin user role via API
"""
import requests
import json

# Production backend URL
BACKEND_URL = "https://nexopeak-backend-54c8631fe608.herokuapp.com"

def fix_admin_role():
    """Fix admin user role by creating a new admin user if needed"""
    
    print("🔧 Fixing admin user role...")
    
    # First, try to create admin user via register endpoint
    admin_data = {
        "email": "info@benjaminr.ca",
        "password": "123456789",
        "name": "Admin User"
    }
    
    print("Attempting to register admin user...")
    response = requests.post(
        f"{BACKEND_URL}/api/v1/auth/register",
        json=admin_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Register response: {response.status_code}")
    if response.status_code == 200:
        print("✅ Admin user created successfully!")
        data = response.json()
        print(f"User data: {json.dumps(data.get('user', {}), indent=2)}")
    elif response.status_code == 400:
        print("ℹ️  User already exists, that's fine")
    else:
        print(f"❌ Register failed: {response.text}")
    
    # Now test login
    print("\n🔍 Testing admin login...")
    login_response = requests.post(
        f"{BACKEND_URL}/api/v1/auth/login",
        json={"email": admin_data["email"], "password": admin_data["password"]},
        headers={"Content-Type": "application/json"}
    )
    
    if login_response.status_code == 200:
        data = login_response.json()
        user = data.get('user', {})
        print("✅ Login successful!")
        print(f"User data: {json.dumps(user, indent=2)}")
        
        # Check if role field exists and what it is
        if 'role' in user:
            print(f"✅ Role field exists: {user['role']}")
            if user['role'] == 'admin':
                print("✅ User has admin role!")
            else:
                print(f"❌ User role is '{user['role']}', not 'admin'")
        else:
            print("❌ Role field missing from response")
            print("   This means the backend code needs to be updated and deployed")
    else:
        print(f"❌ Login failed: {login_response.status_code} - {login_response.text}")

if __name__ == "__main__":
    fix_admin_role()
