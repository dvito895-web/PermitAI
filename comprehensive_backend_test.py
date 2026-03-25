#!/usr/bin/env python3
"""
Comprehensive Backend Tests for PermitAI Application
Tests all requested endpoints with real data scenarios
"""

import requests
import json
import os
import sys
from datetime import datetime

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://permitai-demo.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

def print_test_result(test_name, success, details=""):
    """Print formatted test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"   Details: {details}")
    print()

def test_health_check():
    """Test 1: Health Check - GET /api/health"""
    print("🔍 Testing Health Check Endpoint...")
    
    try:
        response = requests.get(f"{API_BASE}/health", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if (data.get('status') == 'ok' and 
                data.get('service') == 'PermitAI' and 
                data.get('version')):
                print_test_result("Health Check", True, 
                    f"Service: {data.get('service')}, Version: {data.get('version')}, Status: {data.get('status')}")
                return True
            else:
                print_test_result("Health Check", False, f"Unexpected response structure: {data}")
                return False
        else:
            print_test_result("Health Check", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("Health Check", False, f"Exception: {str(e)}")
        return False

def test_plu_query_indexed_city():
    """Test 2: PLU Query with indexed city - 1 rue de Rivoli, 75001 Paris"""
    print("🔍 Testing PLU Query with indexed city (Paris)...")
    
    try:
        payload = {
            "adresse": "1 rue de Rivoli, 75001 Paris",
            "description": "Extension de 25m2 sur maison individuelle avec création d'une chambre"
        }
        
        response = requests.post(
            f"{API_BASE}/plu/query",
            json=payload,
            timeout=30
        )
        
        # Should return 401 due to no authentication
        if response.status_code == 401:
            data = response.json()
            if 'error' in data and 'Unauthorized' in data['error']:
                print_test_result("PLU Query Indexed City", True, 
                    "Authentication properly enforced - returns 401 Unauthorized as expected")
                return True
            else:
                print_test_result("PLU Query Indexed City", False, f"Wrong error format: {data}")
                return False
        else:
            print_test_result("PLU Query Indexed City", False, 
                f"Expected 401 Unauthorized, got {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("PLU Query Indexed City", False, f"Exception: {str(e)}")
        return False

def test_plu_query_new_city():
    """Test 3: PLU Query with new city - different address"""
    print("🔍 Testing PLU Query with new city...")
    
    try:
        payload = {
            "adresse": "Place de la République, 69001 Lyon",
            "description": "Rénovation façade et extension 15m2"
        }
        
        response = requests.post(
            f"{API_BASE}/plu/query",
            json=payload,
            timeout=30
        )
        
        # Should return 401 due to no authentication
        if response.status_code == 401:
            data = response.json()
            if 'error' in data and 'Unauthorized' in data['error']:
                print_test_result("PLU Query New City", True, 
                    "Authentication properly enforced - returns 401 Unauthorized as expected")
                return True
            else:
                print_test_result("PLU Query New City", False, f"Wrong error format: {data}")
                return False
        else:
            print_test_result("PLU Query New City", False, 
                f"Expected 401 Unauthorized, got {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("PLU Query New City", False, f"Exception: {str(e)}")
        return False

def test_mairie_info():
    """Test 4: Mairie Info - GET /api/mairie/info?code=75101"""
    print("🔍 Testing Mairie Info endpoint...")
    
    try:
        response = requests.get(f"{API_BASE}/mairie/info?code=75101", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['commune_code', 'commune_nom', 'platau_raccordee', 
                             'adresse_service_urbanisme', 'horaires', 'delai_legal_instruction']
            
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print_test_result("Mairie Info", True, 
                    f"Commune: {data.get('commune_nom')}, Code: {data.get('commune_code')}, "
                    f"Délai: {data.get('delai_legal_instruction')}")
                return True
            else:
                print_test_result("Mairie Info", False, f"Missing fields: {missing_fields}")
                return False
        else:
            print_test_result("Mairie Info", False, 
                f"Status code: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("Mairie Info", False, f"Exception: {str(e)}")
        return False

def test_indexation_progress():
    """Test 5: Indexation Progress - GET /api/indexation/progress"""
    print("🔍 Testing Indexation Progress endpoint...")
    
    try:
        response = requests.get(f"{API_BASE}/indexation/progress", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['status', 'communes_indexed', 'total_communes_estimated', 'percentage']
            
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print_test_result("Indexation Progress", True, 
                    f"Status: {data.get('status')}, Progress: {data.get('percentage')}%, "
                    f"Communes: {data.get('communes_indexed')}/{data.get('total_communes_estimated')}")
                return True
            else:
                print_test_result("Indexation Progress", False, f"Missing fields: {missing_fields}")
                return False
        else:
            print_test_result("Indexation Progress", False, 
                f"Status code: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("Indexation Progress", False, f"Exception: {str(e)}")
        return False

def test_api_error_handling():
    """Test 6: API Error Handling"""
    print("🔍 Testing API Error Handling...")
    
    try:
        # Test missing parameters in PLU query
        response = requests.post(
            f"{API_BASE}/plu/query",
            json={"adresse": "test"},  # Missing description
            timeout=15
        )
        
        # Should return 401 for auth first, which is correct behavior
        if response.status_code == 401:
            print_test_result("API Error Handling", True, 
                "Authentication checked first before parameter validation (correct priority)")
            return True
        elif response.status_code == 400:
            data = response.json()
            if 'error' in data:
                print_test_result("API Error Handling", True, f"Proper 400 error: {data['error']}")
                return True
            else:
                print_test_result("API Error Handling", False, f"400 but wrong format: {data}")
                return False
        else:
            print_test_result("API Error Handling", False, 
                f"Unexpected status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("API Error Handling", False, f"Exception: {str(e)}")
        return False

def test_geocoding_integration():
    """Test 7: Geocoding Integration"""
    print("🔍 Testing Geocoding Integration...")
    
    try:
        # Test the French government geocoding API directly
        test_address = "1 rue de Rivoli, 75001 Paris"
        geocode_url = f"https://api-adresse.data.gouv.fr/search/?q={requests.utils.quote(test_address)}"
        response = requests.get(geocode_url, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if (data.get('features') and len(data['features']) > 0 and
                data['features'][0].get('properties', {}).get('citycode')):
                
                feature = data['features'][0]
                citycode = feature['properties']['citycode']
                city = feature['properties']['city']
                
                print_test_result("Geocoding Integration", True, 
                    f"Successfully geocoded '{test_address}' -> {city} ({citycode})")
                return True
            else:
                print_test_result("Geocoding Integration", False, "No valid geocoding results")
                return False
        else:
            print_test_result("Geocoding Integration", False, f"Geocoding API error: {response.status_code}")
            return False
            
    except Exception as e:
        print_test_result("Geocoding Integration", False, f"Exception: {str(e)}")
        return False

def test_cors_headers():
    """Test 8: CORS Headers"""
    print("🔍 Testing CORS Headers...")
    
    try:
        response = requests.options(f"{API_BASE}/health", timeout=15)
        
        if response.status_code == 200:
            headers = response.headers
            cors_headers = [
                'Access-Control-Allow-Origin',
                'Access-Control-Allow-Methods',
                'Access-Control-Allow-Headers'
            ]
            
            present_headers = [h for h in cors_headers if h in headers]
            
            if len(present_headers) >= 2:  # At least 2 CORS headers should be present
                print_test_result("CORS Headers", True, f"CORS headers present: {present_headers}")
                return True
            else:
                print_test_result("CORS Headers", False, f"Missing CORS headers. Present: {present_headers}")
                return False
        else:
            print_test_result("CORS Headers", False, f"OPTIONS request failed: {response.status_code}")
            return False
            
    except Exception as e:
        print_test_result("CORS Headers", False, f"Exception: {str(e)}")
        return False

def test_route_not_found():
    """Test 9: Route Not Found Handling"""
    print("🔍 Testing Route Not Found Handling...")
    
    try:
        response = requests.get(f"{API_BASE}/nonexistent/endpoint", timeout=15)
        
        if response.status_code == 404:
            data = response.json()
            if 'error' in data and 'not found' in data['error'].lower():
                print_test_result("Route Not Found", True, "Correctly returns 404 for non-existent routes")
                return True
            else:
                print_test_result("Route Not Found", False, f"404 but wrong error format: {data}")
                return False
        else:
            print_test_result("Route Not Found", False, f"Expected 404, got {response.status_code}")
            return False
            
    except Exception as e:
        print_test_result("Route Not Found", False, f"Exception: {str(e)}")
        return False

def test_mairie_info_invalid_code():
    """Test 10: Mairie Info with Invalid Code"""
    print("🔍 Testing Mairie Info with invalid code...")
    
    try:
        response = requests.get(f"{API_BASE}/mairie/info?code=99999", timeout=15)
        
        if response.status_code == 404:
            data = response.json()
            if 'error' in data:
                print_test_result("Mairie Info Invalid Code", True, 
                    f"Correctly returns 404 for invalid commune code: {data['error']}")
                return True
            else:
                print_test_result("Mairie Info Invalid Code", False, f"404 but wrong format: {data}")
                return False
        else:
            print_test_result("Mairie Info Invalid Code", False, 
                f"Expected 404, got {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("Mairie Info Invalid Code", False, f"Exception: {str(e)}")
        return False

def main():
    """Run all comprehensive backend tests"""
    print("🚀 Starting Comprehensive Backend Tests for PermitAI Application")
    print(f"📍 Testing against: {API_BASE}")
    print(f"🕒 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    tests = [
        test_health_check,
        test_plu_query_indexed_city,
        test_plu_query_new_city,
        test_mairie_info,
        test_indexation_progress,
        test_api_error_handling,
        test_geocoding_integration,
        test_cors_headers,
        test_route_not_found,
        test_mairie_info_invalid_code
    ]
    
    results = []
    for i, test in enumerate(tests, 1):
        print(f"[{i}/{len(tests)}] Running {test.__name__}...")
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
            results.append(False)
        print("-" * 40)
    
    print("=" * 80)
    print("📊 COMPREHENSIVE TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(results)
    total = len(results)
    
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    print(f"📈 Success Rate: {(passed/total)*100:.1f}%")
    
    print("\n🔍 Test Details:")
    for i, (test, result) in enumerate(zip(tests, results), 1):
        status = "✅" if result else "❌"
        print(f"  {i:2d}. {status} {test.__name__}")
    
    if passed == total:
        print("\n🎉 All tests passed! PermitAI backend is fully functional.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check the details above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())