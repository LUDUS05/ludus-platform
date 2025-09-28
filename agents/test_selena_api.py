#!/usr/bin/env python3
"""
LUDUS Selena AI Service API Test
Created: 2025-09-28 GMT+3 (Riyadh)
Purpose: Quick functionality test for Selena AI agents
"""

import requests
import json
import time


def test_selena_agent(base_url: str, agent_type: str, message: str, language: str = "ar"):
    """Test a specific Selena agent endpoint"""
    endpoint = f"{base_url}/selena/{agent_type}"
    
    payload = {
        "message": message,
        "language": language,
        "session_id": f"test_{int(time.time())}"
    }
    
    try:
        start_time = time.time()
        response = requests.post(endpoint, json=payload, timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {agent_type.title()} Agent Test PASSED")
            print(f"   Response Time: {response_time:.2f}ms")
            print(f"   Agent Response: {data['response'][:100]}...")
            print(f"   Confidence: {data.get('confidence', 'N/A')}")
            return True
        else:
            print(f"❌ {agent_type.title()} Agent Test FAILED")
            print(f"   Status Code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ {agent_type.title()} Agent Test ERROR: {str(e)}")
        return False


def test_health_endpoint(base_url: str):
    """Test the health endpoint"""
    try:
        start_time = time.time()
        response = requests.get(f"{base_url}/health", timeout=5)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check PASSED")
            print(f"   Response Time: {response_time:.2f}ms")
            print(f"   Service: {data.get('service', 'Unknown')}")
            print(f"   Version: {data.get('version', 'Unknown')}")
            return True
        else:
            print(f"❌ Health Check FAILED: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Health Check ERROR: {str(e)}")
        return False


def test_agents_info_endpoint(base_url: str):
    """Test the agents information endpoint"""
    try:
        start_time = time.time()
        response = requests.get(f"{base_url}/selena/agents?language=ar", timeout=5)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            agents = data.get("agents", {})
            print(f"✅ Agents Info Test PASSED")
            print(f"   Response Time: {response_time:.2f}ms")
            print(f"   Available Agents: {list(agents.keys())}")
            return True
        else:
            print(f"❌ Agents Info Test FAILED: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Agents Info Test ERROR: {str(e)}")
        return False


def run_api_tests(base_url: str = "http://localhost:8081"):
    """Run comprehensive API tests"""
    print("🧪 LUDUS Selena AI Service API Tests")
    print("=" * 50)
    
    # Test messages for each agent
    test_cases = [
        ("onboard", "مرحباً، أحتاج مساعدة في البداية", "ar"),
        ("discover", "أريد العثور على نشاط ممتع", "ar"),
        ("support", "أواجه مشكلة في التطبيق", "ar"),
        ("community", "كيف يمكنني التواصل مع المجتمع؟", "ar"),
        ("onboard", "Hello, I need help getting started", "en"),
        ("discover", "I want to find fun activities", "en"),
        ("support", "I'm having an issue with the app", "en"),
        ("community", "How can I connect with the community?", "en")
    ]
    
    results = []
    
    # Test health endpoint
    print("\n1. Health Check Test")
    health_result = test_health_endpoint(base_url)
    results.append(health_result)
    
    # Test agents info endpoint
    print("\n2. Agents Info Test")
    info_result = test_agents_info_endpoint(base_url)
    results.append(info_result)
    
    # Test each Selena agent
    print("\n3. Selena Agents Tests")
    for i, (agent_type, message, language) in enumerate(test_cases, 1):
        print(f"\n3.{i}. Testing {agent_type.title()} Agent ({language.upper()})")
        agent_result = test_selena_agent(base_url, agent_type, message, language)
        results.append(agent_result)
    
    # Summary
    passed_tests = sum(results)
    total_tests = len(results)
    
    print("\n" + "=" * 50)
    print("🎯 Test Summary")
    print("=" * 50)
    print(f"Tests Passed: {passed_tests}/{total_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if passed_tests == total_tests:
        print("🎉 ALL TESTS PASSED! Selena AI Service is ready for production.")
    else:
        print("⚠️  Some tests failed. Please check the logs and fix issues.")
    
    return passed_tests == total_tests


if __name__ == "__main__":
    import sys
    
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8081"
    success = run_api_tests(base_url)
    
    sys.exit(0 if success else 1)