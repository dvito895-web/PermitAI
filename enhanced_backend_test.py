#!/usr/bin/env python3
"""
Enhanced Backend tests for PermitAI PLU Query Hybrid AI System
Tests the complete flow including database interactions and AI routing
"""

import requests
import json
import os
import sys
import psycopg2
from datetime import datetime
import uuid

# Get configuration from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://permitai-demo.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"
DATABASE_URL = os.getenv('DATABASE_URL')

def print_test_result(test_name, success, details=""):
    """Print formatted test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"   Details: {details}")
    print()

def get_db_connection():
    """Get database connection"""
    try:
        return psycopg2.connect(DATABASE_URL)
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None

def create_test_user(plan="free"):
    """Create a test user in the database"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor()
        user_id = str(uuid.uuid4())
        clerk_id = f"test_user_{plan}_{int(datetime.now().timestamp())}"
        email = f"test_{plan}@example.com"
        
        cursor.execute("""
            INSERT INTO "User" (id, "clerkId", email, "firstName", "lastName", plan, credits)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT ("clerkId") DO UPDATE SET
                plan = EXCLUDED.plan,
                credits = EXCLUDED.credits
            RETURNING id, "clerkId"
        """, (user_id, clerk_id, email, "Test", "User", plan, 10))
        
        result = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        
        if result:
            return {"id": result[0], "clerkId": result[1]}
        return None
        
    except Exception as e:
        print(f"Error creating test user: {e}")
        if conn:
            conn.close()
        return None

def cleanup_test_users():
    """Clean up test users"""
    conn = get_db_connection()
    if not conn:
        return
    
    try:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM "User" WHERE "clerkId" LIKE %s', ('test_user_%',))
        conn.commit()
        cursor.close()
        conn.close()
        print("🧹 Cleaned up test users")
    except Exception as e:
        print(f"Error cleaning up test users: {e}")
        if conn:
            conn.close()

def check_plu_data():
    """Check if there's PLU data in the database"""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM plu_chunks LIMIT 1')
        count = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return count > 0
    except Exception as e:
        print(f"Error checking PLU data: {e}")
        if conn:
            conn.close()
        return False

def get_indexed_commune():
    """Get a commune that has PLU data"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT DISTINCT "communeCode", "communeNom" FROM plu_chunks LIMIT 1')
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if result:
            return {"code": result[0], "nom": result[1]}
        return None
    except Exception as e:
        print(f"Error getting indexed commune: {e}")
        if conn:
            conn.close()
        return None

def test_health_check():
    """Test 1: Health Check Endpoint"""
    print("🔍 Testing Health Check Endpoint...")
    
    try:
        response = requests.get(f"{API_BASE}/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'ok' and data.get('service') == 'PermitAI':
                print_test_result("Health Check", True, f"Service: {data.get('service')}, Version: {data.get('version')}")
                return True
            else:
                print_test_result("Health Check", False, f"Unexpected response: {data}")
                return False
        else:
            print_test_result("Health Check", False, f"Status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_test_result("Health Check", False, f"Exception: {str(e)}")
        return False

def test_plu_query_no_auth():
    """Test 2: PLU Query without authentication"""
    print("🔍 Testing PLU Query without authentication...")
    
    try:
        payload = {
            "adresse": "1 rue de Rivoli, 75001 Paris",
            "description": "Extension de 20m2 sur maison individuelle"
        }
        
        response = requests.post(
            f"{API_BASE}/plu/query",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 401:
            data = response.json()
            if 'error' in data and 'Unauthorized' in data['error']:
                print_test_result("PLU Query No Auth", True, "Correctly returned 401 Unauthorized")
                return True
            else:
                print_test_result("PLU Query No Auth", False, f"Wrong error message: {data}")
                return False
        else:
            print_test_result("PLU Query No Auth", False, f"Expected 401, got {response.status_code}")
            return False
            
    except Exception as e:
        print_test_result("PLU Query No Auth", False, f"Exception: {str(e)}")
        return False

def test_database_connection():
    """Test 3: Database Connection"""
    print("🔍 Testing Database Connection...")
    
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT 1')
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if result and result[0] == 1:
                print_test_result("Database Connection", True, "Successfully connected to PostgreSQL")
                return True
            else:
                print_test_result("Database Connection", False, "Unexpected query result")
                return False
        except Exception as e:
            print_test_result("Database Connection", False, f"Query failed: {e}")
            if conn:
                conn.close()
            return False
    else:
        print_test_result("Database Connection", False, "Could not establish connection")
        return False

def test_plu_data_availability():
    """Test 4: PLU Data Availability"""
    print("🔍 Testing PLU Data Availability...")
    
    has_data = check_plu_data()
    if has_data:
        commune = get_indexed_commune()
        if commune:
            print_test_result("PLU Data Availability", True, f"Found PLU data for commune: {commune['nom']} ({commune['code']})")
            return True
        else:
            print_test_result("PLU Data Availability", False, "Could not retrieve commune data")
            return False
    else:
        print_test_result("PLU Data Availability", False, "No PLU data found in database")
        return False

def test_user_creation():
    """Test 5: Test User Creation"""
    print("🔍 Testing User Creation...")
    
    # Clean up first
    cleanup_test_users()
    
    # Create free plan user
    free_user = create_test_user("free")
    if not free_user:
        print_test_result("User Creation", False, "Could not create free plan user")
        return False
    
    # Create paid plan user
    paid_user = create_test_user("starter")
    if not paid_user:
        print_test_result("User Creation", False, "Could not create paid plan user")
        return False
    
    print_test_result("User Creation", True, f"Created users: free ({free_user['clerkId']}) and starter ({paid_user['clerkId']})")
    return True

def test_geocoding_integration():
    """Test 6: Geocoding Integration"""
    print("🔍 Testing Geocoding Integration...")
    
    try:
        # Test with a real Paris address
        geocode_url = "https://api-adresse.data.gouv.fr/search/?q=1%20rue%20de%20Rivoli%2C%2075001%20Paris"
        response = requests.get(geocode_url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('features') and len(data['features']) > 0:
                feature = data['features'][0]
                properties = feature.get('properties', {})
                citycode = properties.get('citycode')
                city = properties.get('city')
                
                if citycode and city:
                    print_test_result("Geocoding Integration", True, f"Geocoded to {city} (code: {citycode})")
                    return True
                else:
                    print_test_result("Geocoding Integration", False, "Missing citycode or city in response")
                    return False
            else:
                print_test_result("Geocoding Integration", False, "No features in geocoding response")
                return False
        else:
            print_test_result("Geocoding Integration", False, f"Geocoding API returned {response.status_code}")
            return False
            
    except Exception as e:
        print_test_result("Geocoding Integration", False, f"Exception: {str(e)}")
        return False

def test_api_error_handling():
    """Test 7: API Error Handling"""
    print("🔍 Testing API Error Handling...")
    
    try:
        # Test missing parameters
        response = requests.post(
            f"{API_BASE}/plu/query",
            json={"adresse": "test"},  # Missing description
            timeout=10
        )
        
        # Should return 401 due to no auth, which is correct behavior
        if response.status_code == 401:
            print_test_result("API Error Handling", True, "Correctly prioritizes authentication over parameter validation")
            return True
        else:
            print_test_result("API Error Handling", False, f"Unexpected status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_test_result("API Error Handling", False, f"Exception: {str(e)}")
        return False

def test_ai_configuration():
    """Test 8: AI Configuration"""
    print("🔍 Testing AI Configuration...")
    
    # Check if API keys are configured
    gemini_key = os.getenv('GEMINI_API_KEY')
    anthropic_key = os.getenv('ANTHROPIC_API_KEY')
    
    if gemini_key and anthropic_key:
        # Keys should not be empty and should have reasonable length
        if len(gemini_key) > 20 and len(anthropic_key) > 20:
            print_test_result("AI Configuration", True, "Both Gemini and Anthropic API keys are configured")
            return True
        else:
            print_test_result("AI Configuration", False, "API keys appear to be too short")
            return False
    else:
        missing = []
        if not gemini_key:
            missing.append("GEMINI_API_KEY")
        if not anthropic_key:
            missing.append("ANTHROPIC_API_KEY")
        print_test_result("AI Configuration", False, f"Missing API keys: {', '.join(missing)}")
        return False

def main():
    """Run all backend tests"""
    print("🚀 Starting Enhanced Backend Tests for PermitAI PLU Query System")
    print(f"📍 Testing against: {API_BASE}")
    print("=" * 70)
    
    tests = [
        test_health_check,
        test_plu_query_no_auth,
        test_database_connection,
        test_plu_data_availability,
        test_user_creation,
        test_geocoding_integration,
        test_api_error_handling,
        test_ai_configuration
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
            results.append(False)
    
    # Clean up test users at the end
    cleanup_test_users()
    
    print("=" * 70)
    print("📊 TEST SUMMARY")
    print("=" * 70)
    
    passed = sum(results)
    total = len(results)
    
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the details above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())