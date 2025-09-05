#!/usr/bin/env python3
"""
Campaign Registration Test Suite
Tests the complete campaign registration flow from the Campaign Designer
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
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import your app components
from app.main import app
from app.core.database import get_db, Base
from app.models.user import User
from app.models.organization import Organization
from app.models.campaign import Campaign
from app.schemas.campaign import CampaignDesignerCreate

class CampaignRegistrationTester:
    """Test suite for campaign registration functionality"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip('/')
        self.client = TestClient(app)
        self.auth_token = None
        self.test_user_id = None
        self.test_org_id = None
        
        # Test data
        self.test_user_data = {
            "email": "test_campaign_user@example.com",
            "password": "TestPassword123!",
            "full_name": "Campaign Test User",
            "company_name": "Test Campaign Company"
        }
        
        self.sample_campaign_data = {
            "name": "Test Marketing Campaign",
            "objective": "lead_gen",
            "primaryKpi": "leads",
            "budget": {
                "total": 5000,
                "daily": 167,
                "duration": 30
            },
            "channels": [
                {
                    "channel": "Search",
                    "percentage": 40,
                    "amount": 2000
                },
                {
                    "channel": "Meta",
                    "percentage": 35,
                    "amount": 1750
                },
                {
                    "channel": "LinkedIn",
                    "percentage": 25,
                    "amount": 1250
                }
            ],
            "targeting": {
                "geo": ["United States", "Canada"],
                "audience": "Age: 25-45 | Gender: All | Income: $50k-$100k | Interests: Technology, Marketing | Job Titles: Marketing Manager, Digital Marketer | Industries: Technology, SaaS | Additional: B2B decision makers"
            },
            "kpiTarget": 150,
            "designScore": 85,
            "createdAt": datetime.now().isoformat()
        }
    
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
    
    async def setup_test_user(self) -> bool:
        """Create a test user for campaign registration"""
        try:
            self.print_status("Setting up test user...")
            
            # Register test user
            response = self.client.post("/api/v1/auth/register", json=self.test_user_data)
            
            if response.status_code == 201:
                self.print_status("Test user created successfully", "SUCCESS")
                
                # Login to get auth token
                login_data = {
                    "username": self.test_user_data["email"],
                    "password": self.test_user_data["password"]
                }
                
                login_response = self.client.post("/api/v1/auth/login", data=login_data)
                
                if login_response.status_code == 200:
                    token_data = login_response.json()
                    self.auth_token = token_data["access_token"]
                    self.test_user_id = token_data.get("user_id")
                    self.test_org_id = token_data.get("org_id")
                    self.print_status("User authentication successful", "SUCCESS")
                    return True
                else:
                    self.print_status(f"Login failed: {login_response.text}", "ERROR")
                    return False
                    
            elif response.status_code == 400 and "already registered" in response.text:
                self.print_status("User already exists, attempting login...", "WARNING")
                
                # Try to login with existing user
                login_data = {
                    "username": self.test_user_data["email"],
                    "password": self.test_user_data["password"]
                }
                
                login_response = self.client.post("/api/v1/auth/login", data=login_data)
                
                if login_response.status_code == 200:
                    token_data = login_response.json()
                    self.auth_token = token_data["access_token"]
                    self.test_user_id = token_data.get("user_id")
                    self.test_org_id = token_data.get("org_id")
                    self.print_status("Existing user authentication successful", "SUCCESS")
                    return True
                else:
                    self.print_status(f"Login with existing user failed: {login_response.text}", "ERROR")
                    return False
            else:
                self.print_status(f"User registration failed: {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.print_status(f"Setup error: {str(e)}", "ERROR")
            return False
    
    def get_auth_headers(self) -> Dict[str, str]:
        """Get authentication headers"""
        if not self.auth_token:
            return {}
        return {"Authorization": f"Bearer {self.auth_token}"}
    
    async def test_campaign_registration_endpoint(self) -> bool:
        """Test the campaign registration API endpoint"""
        try:
            self.print_status("Testing campaign registration endpoint...")
            
            # Prepare request data
            request_data = {
                "designer_data": self.sample_campaign_data
            }
            
            # Make request to campaign registration endpoint
            response = self.client.post(
                "/api/v1/campaigns/from-designer",
                json=request_data,
                headers=self.get_auth_headers()
            )
            
            self.print_status(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                campaign_data = response.json()
                self.print_status("Campaign registered successfully!", "SUCCESS")
                self.print_status(f"Campaign ID: {campaign_data.get('id')}")
                self.print_status(f"Campaign Name: {campaign_data.get('name')}")
                self.print_status(f"Campaign Status: {campaign_data.get('status')}")
                
                # Validate response structure
                required_fields = ['id', 'name', 'objective', 'status', 'budget_total', 'created_at']
                missing_fields = [field for field in required_fields if field not in campaign_data]
                
                if missing_fields:
                    self.print_status(f"Missing required fields: {missing_fields}", "WARNING")
                else:
                    self.print_status("All required fields present in response", "SUCCESS")
                
                return True
            else:
                self.print_status(f"Campaign registration failed: {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.print_status(f"Test error: {str(e)}", "ERROR")
            return False
    
    async def test_campaign_data_validation(self) -> bool:
        """Test campaign data validation"""
        try:
            self.print_status("Testing campaign data validation...")
            
            # Test with invalid data
            invalid_data_tests = [
                {
                    "name": "Missing campaign name",
                    "data": {**self.sample_campaign_data, "name": ""}
                },
                {
                    "name": "Invalid budget",
                    "data": {**self.sample_campaign_data, "budget": {"total": -100, "daily": -10, "duration": 30}}
                },
                {
                    "name": "Empty channels",
                    "data": {**self.sample_campaign_data, "channels": []}
                },
                {
                    "name": "Invalid objective",
                    "data": {**self.sample_campaign_data, "objective": "invalid_objective"}
                }
            ]
            
            validation_passed = True
            
            for test_case in invalid_data_tests:
                self.print_status(f"Testing: {test_case['name']}")
                
                request_data = {"designer_data": test_case["data"]}
                
                response = self.client.post(
                    "/api/v1/campaigns/from-designer",
                    json=request_data,
                    headers=self.get_auth_headers()
                )
                
                if response.status_code == 422 or response.status_code == 400:
                    self.print_status(f"✓ Validation correctly rejected: {test_case['name']}", "SUCCESS")
                else:
                    self.print_status(f"✗ Validation should have failed: {test_case['name']}", "ERROR")
                    validation_passed = False
            
            return validation_passed
            
        except Exception as e:
            self.print_status(f"Validation test error: {str(e)}", "ERROR")
            return False
    
    async def test_campaign_retrieval(self) -> bool:
        """Test retrieving registered campaigns"""
        try:
            self.print_status("Testing campaign retrieval...")
            
            # Get user's campaigns
            response = self.client.get(
                "/api/v1/campaigns/",
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                campaigns = response.json()
                self.print_status(f"Retrieved {len(campaigns)} campaigns", "SUCCESS")
                
                # Check if our test campaign is in the list
                test_campaign = next(
                    (c for c in campaigns if c.get('name') == self.sample_campaign_data['name']), 
                    None
                )
                
                if test_campaign:
                    self.print_status("Test campaign found in user's campaigns", "SUCCESS")
                    return True
                else:
                    self.print_status("Test campaign not found in user's campaigns", "WARNING")
                    return False
            else:
                self.print_status(f"Failed to retrieve campaigns: {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.print_status(f"Retrieval test error: {str(e)}", "ERROR")
            return False
    
    async def test_campaign_budget_calculations(self) -> bool:
        """Test budget allocation calculations"""
        try:
            self.print_status("Testing budget calculations...")
            
            # Test different budget scenarios
            budget_tests = [
                {
                    "name": "Standard budget allocation",
                    "total": 10000,
                    "duration": 30,
                    "expected_daily": 333
                },
                {
                    "name": "High budget short duration", 
                    "total": 50000,
                    "duration": 7,
                    "expected_daily": 7143
                },
                {
                    "name": "Low budget long duration",
                    "total": 1000,
                    "duration": 60,
                    "expected_daily": 17
                }
            ]
            
            calculations_passed = True
            
            for test_case in budget_tests:
                test_data = {
                    **self.sample_campaign_data,
                    "budget": {
                        "total": test_case["total"],
                        "daily": test_case["expected_daily"],
                        "duration": test_case["duration"]
                    }
                }
                
                request_data = {"designer_data": test_data}
                
                response = self.client.post(
                    "/api/v1/campaigns/from-designer",
                    json=request_data,
                    headers=self.get_auth_headers()
                )
                
                if response.status_code == 200:
                    campaign = response.json()
                    actual_budget = campaign.get('budget_total', 0)
                    
                    if actual_budget == test_case["total"]:
                        self.print_status(f"✓ Budget calculation correct: {test_case['name']}", "SUCCESS")
                    else:
                        self.print_status(f"✗ Budget calculation incorrect: {test_case['name']} (expected: {test_case['total']}, got: {actual_budget})", "ERROR")
                        calculations_passed = False
                else:
                    self.print_status(f"✗ Budget test failed: {test_case['name']}", "ERROR")
                    calculations_passed = False
            
            return calculations_passed
            
        except Exception as e:
            self.print_status(f"Budget calculation test error: {str(e)}", "ERROR")
            return False
    
    async def cleanup_test_data(self):
        """Clean up test data"""
        try:
            self.print_status("Cleaning up test data...")
            
            # Delete test campaigns (if endpoint exists)
            if self.auth_token:
                response = self.client.get("/api/v1/campaigns/", headers=self.get_auth_headers())
                if response.status_code == 200:
                    campaigns = response.json()
                    test_campaigns = [c for c in campaigns if c.get('name', '').startswith('Test')]
                    
                    for campaign in test_campaigns:
                        delete_response = self.client.delete(
                            f"/api/v1/campaigns/{campaign['id']}",
                            headers=self.get_auth_headers()
                        )
                        if delete_response.status_code in [200, 204]:
                            self.print_status(f"Deleted test campaign: {campaign['name']}", "SUCCESS")
            
            self.print_status("Cleanup completed", "SUCCESS")
            
        except Exception as e:
            self.print_status(f"Cleanup error: {str(e)}", "WARNING")
    
    async def run_all_tests(self) -> bool:
        """Run the complete test suite"""
        self.print_status("🧪 Starting Campaign Registration Test Suite", "INFO")
        self.print_status("=" * 50, "INFO")
        
        try:
            # Setup
            if not await self.setup_test_user():
                self.print_status("Test setup failed", "ERROR")
                return False
            
            # Run tests
            tests = [
                ("Campaign Registration Endpoint", self.test_campaign_registration_endpoint),
                ("Campaign Data Validation", self.test_campaign_data_validation),
                ("Campaign Retrieval", self.test_campaign_retrieval),
                ("Budget Calculations", self.test_campaign_budget_calculations)
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
                self.print_status("🎉 All tests passed! Campaign registration is working correctly.", "SUCCESS")
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
    
    parser = argparse.ArgumentParser(description="Campaign Registration Test Suite")
    parser.add_argument("--url", default="http://localhost:8000", help="Backend URL to test")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    tester = CampaignRegistrationTester(args.url)
    success = await tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())
