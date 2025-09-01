#!/usr/bin/env python3
"""
Nexopeak Authentication Flow Test Script

This script tests the complete authentication flow including:
1. Email/Password Registration
2. Email/Password Login
3. Token Validation
4. User Profile Access
5. Google SSO (manual verification)

Usage: python test_auth_flow.py
"""

import requests
import json
import time
import random
import string
from datetime import datetime

# Configuration
BASE_URL = "https://nexopeak-backend-54c8631fe608.herokuapp.com"
FRONTEND_URL = "https://nexopeak-frontend-d38117672e4d.herokuapp.com"

# Test data
def generate_test_user():
    """Generate random test user data"""
    random_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return {
        "name": f"Test User {random_id}",
        "email": f"test.{random_id}@example.com",
        "password": "testpassword123"
    }

class AuthTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_user = generate_test_user()
        self.access_token = None
        self.refresh_token = None
        self.user_data = None
        
    def log(self, message, status="INFO"):
        """Log test messages with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")
        
    def test_user_registration(self):
        """Test user registration with email/password"""
        self.log("Testing user registration...")
        
        url = f"{BASE_URL}/api/v1/auth/register"
        payload = {
            "name": self.test_user["name"],
            "email": self.test_user["email"],
            "password": self.test_user["password"],
            "remember_me": True
        }
        
        try:
            response = self.session.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get("access_token")
                self.refresh_token = data.get("refresh_token")
                self.user_data = data.get("user")
                
                self.log(f"✅ Registration successful for {self.test_user['email']}")
                self.log(f"   User ID: {self.user_data.get('id')}")
                self.log(f"   User Name: {self.user_data.get('name')}")
                self.log(f"   Access Token: {self.access_token[:20]}...")
                return True
            else:
                self.log(f"❌ Registration failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Registration error: {str(e)}", "ERROR")
            return False
    
    def test_user_login(self):
        """Test user login with email/password"""
        self.log("Testing user login...")
        
        url = f"{BASE_URL}/api/v1/auth/login"
        payload = {
            "email": self.test_user["email"],
            "password": self.test_user["password"],
            "remember_me": True
        }
        
        try:
            response = self.session.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get("access_token")
                self.refresh_token = data.get("refresh_token")
                self.user_data = data.get("user")
                
                self.log(f"✅ Login successful for {self.test_user['email']}")
                self.log(f"   New Access Token: {self.access_token[:20]}...")
                return True
            else:
                self.log(f"❌ Login failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Login error: {str(e)}", "ERROR")
            return False
    
    def test_token_validation(self):
        """Test access token validation"""
        self.log("Testing token validation...")
        
        if not self.access_token:
            self.log("❌ No access token available for validation", "ERROR")
            return False
            
        url = f"{BASE_URL}/api/v1/auth/me"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        try:
            response = self.session.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                self.log("✅ Token validation successful")
                self.log(f"   Validated User: {data.get('name')} ({data.get('email')})")
                self.log(f"   User Role: {data.get('role')}")
                self.log(f"   Organization: {data.get('organization', {}).get('name', 'N/A')}")
                return True
            else:
                self.log(f"❌ Token validation failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Token validation error: {str(e)}", "ERROR")
            return False
    
    def test_protected_endpoint(self):
        """Test access to a protected endpoint"""
        self.log("Testing protected endpoint access...")
        
        if not self.access_token:
            self.log("❌ No access token available for protected endpoint test", "ERROR")
            return False
            
        url = f"{BASE_URL}/api/v1/campaigns/"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        try:
            response = self.session.get(url, headers=headers, timeout=30)
            
            if response.status_code in [200, 404]:  # 404 is OK if no campaigns exist
                self.log("✅ Protected endpoint access successful")
                if response.status_code == 200:
                    campaigns = response.json()
                    self.log(f"   Found {len(campaigns)} campaigns")
                else:
                    self.log("   No campaigns found (expected for new user)")
                return True
            else:
                self.log(f"❌ Protected endpoint access failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Protected endpoint error: {str(e)}", "ERROR")
            return False
    
    def test_duplicate_registration(self):
        """Test that duplicate email registration is properly rejected"""
        self.log("Testing duplicate registration prevention...")
        
        url = f"{BASE_URL}/api/v1/auth/register"
        payload = {
            "name": "Duplicate User",
            "email": self.test_user["email"],  # Same email as before
            "password": "differentpassword123",
            "remember_me": False
        }
        
        try:
            response = self.session.post(url, json=payload, timeout=30)
            
            if response.status_code == 400:
                self.log("✅ Duplicate registration properly rejected")
                return True
            else:
                self.log(f"❌ Duplicate registration should have been rejected: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Duplicate registration test error: {str(e)}", "ERROR")
            return False
    
    def test_invalid_login(self):
        """Test login with invalid credentials"""
        self.log("Testing invalid login credentials...")
        
        url = f"{BASE_URL}/api/v1/auth/login"
        payload = {
            "email": self.test_user["email"],
            "password": "wrongpassword",
            "remember_me": False
        }
        
        try:
            response = self.session.post(url, json=payload, timeout=30)
            
            if response.status_code == 401:
                self.log("✅ Invalid login properly rejected")
                return True
            else:
                self.log(f"❌ Invalid login should have been rejected: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Invalid login test error: {str(e)}", "ERROR")
            return False
    
    def test_google_sso_endpoint(self):
        """Test Google SSO endpoint (without actual Google token)"""
        self.log("Testing Google SSO endpoint availability...")
        
        url = f"{BASE_URL}/api/v1/auth/google"
        payload = {
            "id_token": "invalid_token_for_testing",
            "remember_me": False
        }
        
        try:
            response = self.session.post(url, json=payload, timeout=30)
            
            # We expect this to fail with 400 (invalid token), not 404 or 500
            if response.status_code == 400:
                self.log("✅ Google SSO endpoint is available and properly validates tokens")
                return True
            else:
                self.log(f"❌ Google SSO endpoint unexpected response: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Google SSO endpoint test error: {str(e)}", "ERROR")
            return False
    
    def run_all_tests(self):
        """Run all authentication tests"""
        self.log("=" * 60)
        self.log("STARTING NEXOPEAK AUTHENTICATION FLOW TESTS")
        self.log("=" * 60)
        
        tests = [
            ("User Registration", self.test_user_registration),
            ("Duplicate Registration Prevention", self.test_duplicate_registration),
            ("User Login", self.test_user_login),
            ("Token Validation", self.test_token_validation),
            ("Protected Endpoint Access", self.test_protected_endpoint),
            ("Invalid Login Prevention", self.test_invalid_login),
            ("Google SSO Endpoint", self.test_google_sso_endpoint),
        ]
        
        results = []
        
        for test_name, test_func in tests:
            self.log(f"\n--- Running: {test_name} ---")
            try:
                result = test_func()
                results.append((test_name, result))
                time.sleep(1)  # Brief pause between tests
            except Exception as e:
                self.log(f"❌ Test '{test_name}' crashed: {str(e)}", "ERROR")
                results.append((test_name, False))
        
        # Summary
        self.log("\n" + "=" * 60)
        self.log("TEST RESULTS SUMMARY")
        self.log("=" * 60)
        
        passed = 0
        failed = 0
        
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{status}: {test_name}")
            if result:
                passed += 1
            else:
                failed += 1
        
        self.log(f"\nTotal Tests: {len(results)}")
        self.log(f"Passed: {passed}")
        self.log(f"Failed: {failed}")
        self.log(f"Success Rate: {(passed/len(results)*100):.1f}%")
        
        if failed == 0:
            self.log("\n🎉 ALL TESTS PASSED! Authentication system is working correctly.")
        else:
            self.log(f"\n⚠️  {failed} test(s) failed. Please check the errors above.")
        
        # Manual Google SSO test instructions
        self.log("\n" + "=" * 60)
        self.log("MANUAL GOOGLE SSO TEST")
        self.log("=" * 60)
        self.log("To test Google SSO manually:")
        self.log(f"1. Open: {FRONTEND_URL}/auth/login")
        self.log("2. Click 'Continue with Google' button")
        self.log("3. Complete Google authentication")
        self.log("4. Verify you're redirected to the dashboard")
        self.log("5. Check that your Google account info is displayed")
        
        return failed == 0

def main():
    """Main test function"""
    tester = AuthTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    exit(0 if success else 1)

if __name__ == "__main__":
    main()
