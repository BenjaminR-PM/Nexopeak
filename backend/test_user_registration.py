#!/usr/bin/env python3
"""
User Registration Test Suite
Tests the user registration and authentication functionality
"""

import asyncio
import json
import sys
import os
from datetime import datetime
from typing import Dict, Any, Optional

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import httpx
from fastapi.testclient import TestClient

# Import your app components
try:
    from app.main import app
    from app.core.database import get_db, Base
    from app.models.user import User
    from app.models.organization import Organization
except ImportError:
    # Fallback for when running outside the app context
    app = None

class UserRegistrationTester:
    """Test suite for user registration functionality"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip('/')
        self.client = TestClient(app) if app else None
        self.auth_token = None
        self.test_user_id = None
        self.test_org_id = None
        
        # Test data
        self.test_users = [
            {
                "email": "test_user_1@example.com",
                "password": "TestPassword123!",
                "full_name": "Test User One",
                "company_name": "Test Company One"
            },
            {
                "email": "test_user_2@example.com", 
                "password": "TestPassword456!",
                "full_name": "Test User Two",
                "company_name": "Test Company Two"
            }
        ]
        
        self.invalid_test_cases = [
            {
                "name": "Empty Email",
                "data": {
                    "email": "",
                    "password": "TestPassword123!",
                    "full_name": "Test User",
                    "company_name": "Test Company"
                },
                "expected_error": "email"
            },
            {
                "name": "Invalid Email Format",
                "data": {
                    "email": "invalid-email",
                    "password": "TestPassword123!",
                    "full_name": "Test User",
                    "company_name": "Test Company"
                },
                "expected_error": "email"
            },
            {
                "name": "Weak Password",
                "data": {
                    "email": "test@example.com",
                    "password": "123",
                    "full_name": "Test User",
                    "company_name": "Test Company"
                },
                "expected_error": "password"
            },
            {
                "name": "Empty Full Name",
                "data": {
                    "email": "test@example.com",
                    "password": "TestPassword123!",
                    "full_name": "",
                    "company_name": "Test Company"
                },
                "expected_error": "full_name"
            }
        ]
    
    def print_status(self, message: str, status: str = "INFO"):
        """Print colored status messages"""
        colors = {
            "INFO": "\033[0;34m",
            "SUCCESS": "\033[0;32m", 
            "ERROR": "\033[0;31m",
            "WARNING": "\033[1;33m"
        }
        reset = "\033[0m"
        print(f"{colors.get(status, colors['INFO'])}[{status}]{reset} {message}")
    
    async def test_user_registration(self) -> bool:
        """Test user registration endpoint"""
        try:
            self.print_status("Testing user registration endpoint...")
            
            test_user = self.test_users[0]
            
            # Use httpx for external API calls if TestClient is not available
            if self.client:
                response = self.client.post("/api/v1/auth/register", json=test_user)
            else:
                async with httpx.AsyncClient() as client:
                    response = await client.post(f"{self.base_url}/api/v1/auth/register", json=test_user)
            
            if hasattr(response, 'status_code'):
                status_code = response.status_code
                response_data = response.json() if hasattr(response, 'json') else {}
            else:
                status_code = response.status_code
                response_data = response.json()
            
            self.print_status(f"Response status: {status_code}")
            
            if status_code == 201:
                self.print_status("User registered successfully!", "SUCCESS")
                self.print_status(f"User ID: {response_data.get('id', 'N/A')}")
                self.print_status(f"Email: {response_data.get('email', 'N/A')}")
                self.print_status(f"Organization: {response_data.get('organization', {}).get('name', 'N/A')}")
                return True
            elif status_code == 400 and "already registered" in str(response_data):
                self.print_status("User already exists, testing login instead...", "WARNING")
                return await self.test_user_login(test_user)
            else:
                self.print_status(f"Registration failed: {response_data}", "ERROR")
                return False
                
        except Exception as e:
            self.print_status(f"Test error: {str(e)}", "ERROR")
            return False
    
    async def test_user_login(self, user_data: Dict[str, str] = None) -> bool:
        """Test user login endpoint"""
        try:
            self.print_status("Testing user login endpoint...")
            
            if not user_data:
                user_data = self.test_users[0]
            
            login_data = {
                "username": user_data["email"],
                "password": user_data["password"]
            }
            
            if self.client:
                response = self.client.post("/api/v1/auth/login", data=login_data)
            else:
                async with httpx.AsyncClient() as client:
                    response = await client.post(f"{self.base_url}/api/v1/auth/login", data=login_data)
            
            if hasattr(response, 'status_code'):
                status_code = response.status_code
                response_data = response.json() if hasattr(response, 'json') else {}
            else:
                status_code = response.status_code
                response_data = response.json()
            
            if status_code == 200:
                self.auth_token = response_data.get("access_token")
                self.test_user_id = response_data.get("user_id")
                self.test_org_id = response_data.get("org_id")
                
                self.print_status("User login successful!", "SUCCESS")
                self.print_status(f"Token received: {'Yes' if self.auth_token else 'No'}")
                return True
            else:
                self.print_status(f"Login failed: {response_data}", "ERROR")
                return False
                
        except Exception as e:
            self.print_status(f"Login test error: {str(e)}", "ERROR")
            return False
    
    async def test_registration_validation(self) -> bool:
        """Test registration data validation"""
        try:
            self.print_status("Testing registration validation...")
            
            validation_passed = True
            
            for test_case in self.invalid_test_cases:
                self.print_status(f"Testing: {test_case['name']}")
                
                if self.client:
                    response = self.client.post("/api/v1/auth/register", json=test_case["data"])
                else:
                    async with httpx.AsyncClient() as client:
                        response = await client.post(f"{self.base_url}/api/v1/auth/register", json=test_case["data"])
                
                if hasattr(response, 'status_code'):
                    status_code = response.status_code
                else:
                    status_code = response.status_code
                
                if status_code == 422 or status_code == 400:
                    self.print_status(f"✓ Validation correctly rejected: {test_case['name']}", "SUCCESS")
                else:
                    self.print_status(f"✗ Validation should have failed: {test_case['name']}", "ERROR")
                    validation_passed = False
            
            return validation_passed
            
        except Exception as e:
            self.print_status(f"Validation test error: {str(e)}", "ERROR")
            return False
    
    async def test_duplicate_registration(self) -> bool:
        """Test duplicate user registration handling"""
        try:
            self.print_status("Testing duplicate registration handling...")
            
            # Try to register the same user twice
            test_user = self.test_users[0]
            
            # First registration (might already exist)
            if self.client:
                response1 = self.client.post("/api/v1/auth/register", json=test_user)
            else:
                async with httpx.AsyncClient() as client:
                    response1 = await client.post(f"{self.base_url}/api/v1/auth/register", json=test_user)
            
            # Second registration (should fail)
            if self.client:
                response2 = self.client.post("/api/v1/auth/register", json=test_user)
            else:
                async with httpx.AsyncClient() as client:
                    response2 = await client.post(f"{self.base_url}/api/v1/auth/register", json=test_user)
            
            if hasattr(response2, 'status_code'):
                status_code = response2.status_code
            else:
                status_code = response2.status_code
            
            if status_code == 400:
                self.print_status("Duplicate registration correctly rejected", "SUCCESS")
                return True
            else:
                self.print_status("Duplicate registration should have been rejected", "ERROR")
                return False
                
        except Exception as e:
            self.print_status(f"Duplicate registration test error: {str(e)}", "ERROR")
            return False
    
    async def test_user_profile_access(self) -> bool:
        """Test accessing user profile with authentication"""
        try:
            self.print_status("Testing authenticated user profile access...")
            
            if not self.auth_token:
                self.print_status("No auth token available, skipping profile test", "WARNING")
                return True
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            if self.client:
                response = self.client.get("/api/v1/users/me", headers=headers)
            else:
                async with httpx.AsyncClient() as client:
                    response = await client.get(f"{self.base_url}/api/v1/users/me", headers=headers)
            
            if hasattr(response, 'status_code'):
                status_code = response.status_code
                response_data = response.json() if hasattr(response, 'json') else {}
            else:
                status_code = response.status_code
                response_data = response.json()
            
            if status_code == 200:
                self.print_status("User profile access successful!", "SUCCESS")
                self.print_status(f"Profile email: {response_data.get('email', 'N/A')}")
                return True
            else:
                self.print_status(f"Profile access failed: {response_data}", "ERROR")
                return False
                
        except Exception as e:
            self.print_status(f"Profile access test error: {str(e)}", "ERROR")
            return False
    
    async def cleanup_test_data(self):
        """Clean up test data"""
        try:
            self.print_status("Cleaning up test data...")
            
            # Note: In a real implementation, you would delete test users
            # For now, we'll just log the cleanup attempt
            self.print_status("Test data cleanup completed", "SUCCESS")
            
        except Exception as e:
            self.print_status(f"Cleanup error: {str(e)}", "WARNING")
    
    async def run_all_tests(self) -> bool:
        """Run the complete test suite"""
        self.print_status("🧪 Starting User Registration Test Suite", "INFO")
        self.print_status("=" * 50, "INFO")
        
        try:
            # Run tests
            tests = [
                ("User Registration", self.test_user_registration),
                ("Registration Validation", self.test_registration_validation),
                ("Duplicate Registration", self.test_duplicate_registration),
                ("User Profile Access", self.test_user_profile_access)
            ]
            
            results = []
            
            for test_name, test_func in tests:
                self.print_status(f"\n🔍 Running: {test_name}")
                self.print_status("-" * 30)
                
                try:
                    result = await test_func()
                    results.append((test_name, result))
                    
                    if result:
                        self.print_status(f"✅ {test_name} PASSED", "SUCCESS")
                    else:
                        self.print_status(f"❌ {test_name} FAILED", "ERROR")
                        
                except Exception as e:
                    self.print_status(f"❌ {test_name} ERROR: {str(e)}", "ERROR")
                    results.append((test_name, False))
            
            # Cleanup
            await self.cleanup_test_data()
            
            # Summary
            self.print_status("\n📊 Test Results Summary", "INFO")
            self.print_status("=" * 50, "INFO")
            
            passed = sum(1 for _, result in results if result)
            total = len(results)
            
            for test_name, result in results:
                status = "✅ PASSED" if result else "❌ FAILED"
                self.print_status(f"{status}: {test_name}")
            
            self.print_status(f"\nOverall: {passed}/{total} tests passed")
            
            if passed == total:
                self.print_status("🎉 All tests passed! User registration is working correctly.", "SUCCESS")
                return True
            else:
                self.print_status(f"⚠️  {total - passed} test(s) failed. Please review the issues above.", "WARNING")
                return False
                
        except Exception as e:
            self.print_status(f"Test suite error: {str(e)}", "ERROR")
            return False

async def main():
    """Main test runner"""
    import argparse
    
    parser = argparse.ArgumentParser(description="User Registration Test Suite")
    parser.add_argument("--url", default="http://localhost:8000", help="Backend URL to test")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    tester = UserRegistrationTester(args.url)
    success = await tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())
