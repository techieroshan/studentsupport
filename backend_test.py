#!/usr/bin/env python3
"""
Comprehensive API Testing for Student Support Platform
Tests all backend endpoints using the public URL
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class StudentSupportAPITester:
    def __init__(self, base_url: str = "http://localhost:8001/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        
        # Test tracking
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.auth_token = None
        self.test_user_id = None
        
        # Test data
        self.test_timestamp = datetime.now().strftime('%H%M%S')
        self.test_email = f"test_{self.test_timestamp}@university.edu"
        self.test_password = "TestPass123!"

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")
        
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({"name": name, "details": details})

    def make_request(self, method: str, endpoint: str, data: Dict = None, 
                    expected_status: int = 200, auth_required: bool = False) -> tuple:
        """Make HTTP request and return success status and response"""
        # Handle root API endpoints correctly
        if endpoint.startswith('/api'):
            url = f"{self.base_url.replace('/api', '')}{endpoint}"
        else:
            url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = {}
        
        if auth_required and self.auth_token:
            headers['Authorization'] = f'Bearer {self.auth_token}'
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, headers=headers)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, headers=headers)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, headers=headers)
            else:
                return False, f"Unsupported method: {method}"

            success = response.status_code == expected_status
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                return False, error_msg
                
        except Exception as e:
            return False, f"Request failed: {str(e)}"

    def test_health_endpoints(self):
        """Test basic health and info endpoints"""
        print("\n🔍 Testing Health & Info Endpoints...")
        
        # Test root API endpoint
        success, response = self.make_request('GET', '/api')
        self.log_test("Root API endpoint", success, 
                     f"Response: {response}" if success else response)
        
        # Test health check
        success, response = self.make_request('GET', '/api/health')
        self.log_test("Health check endpoint", success,
                     f"Status: {response.get('status', 'unknown')}" if success else response)

    def test_seo_endpoints(self):
        """Test SEO endpoints"""
        print("\n🔍 Testing SEO Endpoints...")
        
        # Test sitemap.xml
        try:
            response = requests.get(f"{self.base_url.replace('/api', '')}/sitemap.xml")
            success = response.status_code == 200 and 'xml' in response.headers.get('content-type', '')
            self.log_test("Sitemap.xml endpoint", success,
                         f"Content-Type: {response.headers.get('content-type', 'unknown')}")
        except Exception as e:
            self.log_test("Sitemap.xml endpoint", False, str(e))
        
        # Test robots.txt
        try:
            response = requests.get(f"{self.base_url.replace('/api', '')}/robots.txt")
            success = response.status_code == 200
            self.log_test("Robots.txt endpoint", success,
                         f"Content length: {len(response.text)} chars")
        except Exception as e:
            self.log_test("Robots.txt endpoint", False, str(e))
        
        # Test llms.txt
        try:
            response = requests.get(f"{self.base_url.replace('/api', '')}/llms.txt")
            success = response.status_code == 200
            self.log_test("LLMs.txt endpoint", success,
                         f"Content length: {len(response.text)} chars")
        except Exception as e:
            self.log_test("LLMs.txt endpoint", False, str(e))

    def test_auth_flow(self):
        """Test complete authentication flow"""
        print("\n🔍 Testing Authentication Flow...")
        
        # Test user registration
        registration_data = {
            "email": self.test_email,
            "password": self.test_password,
            "display_name": "Test Student",
            "role": "SEEKER",
            "city": "San Francisco",
            "state": "CA",
            "zip_code": "94102",
            "country": "USA",
            "phone": "+1234567890"
        }
        
        success, response = self.make_request('POST', '/auth/register', 
                                            registration_data, 201)
        self.log_test("User registration", success,
                     f"User ID: {response.get('id', 'unknown')}" if success else response)
        
        if success:
            self.test_user_id = response.get('id')
        
        # Test login
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        success, response = self.make_request('POST', '/auth/login', login_data)
        self.log_test("User login", success,
                     f"Token received: {'Yes' if response.get('access_token') else 'No'}" if success else response)
        
        if success and response.get('access_token'):
            self.auth_token = response['access_token']
        
        # Test resend OTP
        otp_data = {
            "email": self.test_email,
            "code_type": "email"
        }
        
        success, response = self.make_request('POST', '/auth/resend-otp', otp_data)
        self.log_test("Resend OTP", success,
                     "OTP sent successfully" if success else response)

    def test_user_endpoints(self):
        """Test user management endpoints"""
        print("\n🔍 Testing User Endpoints...")
        
        if not self.auth_token:
            self.log_test("User endpoints", False, "No auth token available")
            return
        
        # Test get profile
        success, response = self.make_request('GET', '/users/profile', 
                                            auth_required=True)
        self.log_test("Get user profile", success,
                     f"User: {response.get('display_name', 'unknown')}" if success else response)
        
        # Test update profile
        update_data = {
            "display_name": "Updated Test Student",
            "preferences": ["Vegetarian", "Gluten Free"],
            "languages": ["English", "Spanish"]
        }
        
        success, response = self.make_request('PUT', '/users/profile', 
                                            update_data, auth_required=True)
        self.log_test("Update user profile", success,
                     f"Updated: {response.get('display_name', 'unknown')}" if success else response)
        
        # Test get user stats
        success, response = self.make_request('GET', '/users/stats', 
                                            auth_required=True)
        self.log_test("Get user stats", success,
                     f"Stats available: {'Yes' if isinstance(response, dict) else 'No'}" if success else response)

    def test_request_endpoints(self):
        """Test meal request endpoints"""
        print("\n🔍 Testing Meal Request Endpoints...")
        
        if not self.auth_token:
            self.log_test("Request endpoints", False, "No auth token available")
            return
        
        # Test get all requests
        success, response = self.make_request('GET', '/requests')
        self.log_test("Get all requests", success,
                     f"Requests found: {len(response) if isinstance(response, list) else 'unknown'}" if success else response)
        
        # Test create request
        request_data = {
            "description": "Need a healthy vegetarian meal for finals week",
            "dietary_needs": ["Vegetarian"],
            "medical_needs": [],
            "logistics": ["PICKUP"],
            "frequency": "ONCE",
            "availability": "Evenings after 6pm",
            "urgency": "NORMAL"
        }
        
        success, response = self.make_request('POST', '/requests', 
                                            request_data, 201, auth_required=True)
        self.log_test("Create meal request", success,
                     f"Request ID: {response.get('id', 'unknown')}" if success else response)
        
        # Test get my requests
        success, response = self.make_request('GET', '/requests/my-requests', 
                                            auth_required=True)
        self.log_test("Get my requests", success,
                     f"My requests: {len(response) if isinstance(response, list) else 'unknown'}" if success else response)

    def test_offer_endpoints(self):
        """Test meal offer endpoints"""
        print("\n🔍 Testing Meal Offer Endpoints...")
        
        # Test get all offers
        success, response = self.make_request('GET', '/offers')
        self.log_test("Get all offers", success,
                     f"Offers found: {len(response) if isinstance(response, list) else 'unknown'}" if success else response)
        
        if not self.auth_token:
            self.log_test("Offer creation", False, "No auth token available")
            return
        
        # Test create offer (requires donor role, might fail)
        offer_data = {
            "description": "Fresh homemade pasta with vegetables",
            "dietary_tags": ["Vegetarian"],
            "medical_tags": [],
            "logistics": ["PICKUP"],
            "frequency": "ONCE",
            "availability": "Available tonight",
            "is_anonymous": False
        }
        
        success, response = self.make_request('POST', '/offers', 
                                            offer_data, 201, auth_required=True)
        self.log_test("Create meal offer", success,
                     f"Offer ID: {response.get('id', 'unknown')}" if success else response)
        
        # Test get my offers
        success, response = self.make_request('GET', '/offers/my-offers', 
                                            auth_required=True)
        self.log_test("Get my offers", success,
                     f"My offers: {len(response) if isinstance(response, list) else 'unknown'}" if success else response)

    def test_donor_endpoints(self):
        """Test donor endpoints"""
        print("\n🔍 Testing Donor Endpoints...")
        
        # Test get all donors
        success, response = self.make_request('GET', '/donors')
        self.log_test("Get all donors", success,
                     f"Donors found: {len(response) if isinstance(response, list) else 'unknown'}" if success else response)
        
        # Test get donors by category
        success, response = self.make_request('GET', '/donors?category=NON_PROFIT')
        self.log_test("Get donors by category", success,
                     f"Non-profit donors: {len(response) if isinstance(response, list) else 'unknown'}" if success else response)

    def test_error_handling(self):
        """Test error handling"""
        print("\n🔍 Testing Error Handling...")
        
        # Test 404 endpoint
        success, response = self.make_request('GET', '/nonexistent', expected_status=404)
        self.log_test("404 error handling", success,
                     "Proper 404 response" if success else response)
        
        # Test invalid login
        invalid_login = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        success, response = self.make_request('POST', '/auth/login', 
                                            invalid_login, expected_status=401)
        self.log_test("Invalid login handling", success,
                     "Proper 401 response" if success else response)
        
        # Test unauthorized access
        success, response = self.make_request('GET', '/users/profile', 
                                            expected_status=401)
        self.log_test("Unauthorized access handling", success,
                     "Proper 401 response" if success else response)

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Student Support API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Run test suites
        self.test_health_endpoints()
        self.test_seo_endpoints()
        self.test_auth_flow()
        self.test_user_endpoints()
        self.test_request_endpoints()
        self.test_offer_endpoints()
        self.test_donor_endpoints()
        self.test_error_handling()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  • {test['name']}: {test['details']}")
        
        return self.tests_passed, self.tests_run, self.failed_tests

def main():
    """Main test runner"""
    # Use the public backend URL from frontend env
    backend_url = "http://localhost:8001/api"
    
    print("Student Support Platform - Backend API Testing")
    print(f"Backend URL: {backend_url}")
    
    tester = StudentSupportAPITester(backend_url)
    passed, total, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    exit_code = 0 if passed == total else 1
    sys.exit(exit_code)

if __name__ == "__main__":
    main()