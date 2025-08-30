#!/usr/bin/env python3
"""
Simple script to create admin user via API endpoint.
"""

import requests
import json

def create_admin_user():
    """Create admin user by calling the signup API directly."""
    
    api_url = "http://localhost:8000"  # Local development URL
    
    # Admin user data
    admin_data = {
        "firstName": "Admin",
        "lastName": "User", 
        "email": "info@benjaminr.ca",
        "password": "123456789",
        "organizationName": "Nexopeak Admin",
        "acceptTerms": True
    }
    
    try:
        # Call the signup endpoint
        response = requests.post(
            f"{api_url}/api/v1/auth/signup",
            json=admin_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            user_id = result["user"]["id"]
            
            print("✅ Admin user created successfully!")
            print(f"Email: {result['user']['email']}")
            print(f"Name: {result['user']['name']}")
            print(f"User ID: {user_id}")
            print(f"Role: {result['user']['role']} (will be changed to admin)")
            
            # Now we need to manually update the role to admin
            # This would require direct database access or an admin endpoint
            print("\n⚠️  Note: You need to manually update the user role to 'admin' in the database")
            print(f"SQL: UPDATE users SET role = 'admin' WHERE id = '{user_id}';")
            
            return result
            
        else:
            print(f"❌ Failed to create admin user: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API server.")
        print("Make sure the backend server is running on http://localhost:8000")
        return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def main():
    print("Creating Admin User via API...")
    print("=" * 50)
    
    result = create_admin_user()
    
    if result:
        print("=" * 50)
        print("✅ Admin user created! Don't forget to update the role to 'admin'")
    else:
        print("❌ Failed to create admin user")

if __name__ == "__main__":
    main()
