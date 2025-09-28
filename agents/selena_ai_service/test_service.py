"""
Test script for LUDUS Selena AI Service
Tests all 4 Selena agents and performance requirements

Performance Targets:
- <200ms response time
- Error rate <1%
- All agents functional

Created: 2025-09-28 GMT+3 (Riyadh)
Version: 1.0.0
"""

import asyncio
import aiohttp
import time
import json
from typing import Dict, List


class SelenaServiceTester:
    """Test suite for Selena AI Service"""
    
    def __init__(self, base_url: str = "http://localhost:8081"):
        self.base_url = base_url
        self.test_results = []
        
    async def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🧪 Starting LUDUS Selena AI Service Tests")
        print("="*50)
        
        # Test 1: Health Check
        await self.test_health_endpoints()
        
        # Test 2: Agent Information
        await self.test_agent_info()
        
        # Test 3: Individual Agent Tests
        await self.test_onboard_agent()
        await self.test_discover_agent()
        await self.test_support_agent()
        await self.test_community_agent()
        
        # Test 4: Performance Tests
        await self.test_response_times()
        await self.test_concurrent_requests()
        
        # Test 5: Error Handling
        await self.test_error_handling()
        
        # Generate test report
        self.generate_test_report()
    
    async def test_health_endpoints(self):
        """Test health check endpoints"""
        print("\n🏥 Testing Health Endpoints...")
        
        try:
            async with aiohttp.ClientSession() as session:
                # Basic health check
                start_time = time.time()
                async with session.get(f"{self.base_url}/health") as response:
                    response_time = (time.time() - start_time) * 1000
                    
                    if response.status == 200:
                        data = await response.json()
                        print(f"✅ Health check passed ({response_time:.2f}ms)")
                        print(f"   Status: {data.get('status')}")
                        
                        self.test_results.append({
                            "test": "health_check",
                            "status": "pass", 
                            "response_time_ms": response_time,
                            "details": data
                        })
                    else:
                        print(f"❌ Health check failed (Status: {response.status})")
                        self.test_results.append({
                            "test": "health_check",
                            "status": "fail",
                            "response_time_ms": response_time,
                            "error": f"HTTP {response.status}"
                        })
                
                # Detailed health check
                async with session.get(f"{self.base_url}/health/detailed") as response:
                    if response.status == 200:
                        data = await response.json()
                        print(f"✅ Detailed health check passed")
                    else:
                        print(f"⚠️ Detailed health check returned {response.status}")
        
        except Exception as e:
            print(f"❌ Health check error: {e}")
            self.test_results.append({
                "test": "health_check",
                "status": "error",
                "error": str(e)
            })
    
    async def test_agent_info(self):
        """Test agent information endpoints"""
        print("\n🤖 Testing Agent Information...")
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/agents") as response:
                    if response.status == 200:
                        data = await response.json()
                        agents = list(data.keys())
                        expected_agents = ["onboard", "discover", "support", "community"]
                        
                        if all(agent in agents for agent in expected_agents):
                            print(f"✅ All 4 Selena agents available: {agents}")
                            self.test_results.append({
                                "test": "agents_info",
                                "status": "pass",
                                "agents": agents
                            })
                        else:
                            missing = [agent for agent in expected_agents if agent not in agents]
                            print(f"❌ Missing agents: {missing}")
                            self.test_results.append({
                                "test": "agents_info",
                                "status": "fail",
                                "missing_agents": missing
                            })
                    else:
                        print(f"❌ Agent info request failed (Status: {response.status})")
        
        except Exception as e:
            print(f"❌ Agent info error: {e}")
    
    async def test_onboard_agent(self):
        """Test Selena Onboard Agent"""
        print("\n🌟 Testing Selena Onboard Agent...")
        
        test_requests = [
            {
                "message": "مرحباً، أريد المساعدة في إعداد حسابي",
                "language": "ar",
                "agent_type": "onboard",
                "onboarding_stage": "initial"
            },
            {
                "message": "Hello, I need help setting up my account",
                "language": "en", 
                "agent_type": "onboard",
                "onboarding_stage": "registration"
            }
        ]
        
        await self._test_agent_requests("onboard", test_requests)
    
    async def test_discover_agent(self):
        """Test Selena Discover Agent"""
        print("\n🔍 Testing Selena Discover Agent...")
        
        test_requests = [
            {
                "message": "أريد اكتشاف أنشطة جديدة في الرياض",
                "language": "ar",
                "agent_type": "discover",
                "discovery_type": "nearby"
            },
            {
                "message": "Show me trending activities for families",
                "language": "en",
                "agent_type": "discover", 
                "discovery_type": "trending"
            }
        ]
        
        await self._test_agent_requests("discover", test_requests)
    
    async def test_support_agent(self):
        """Test Selena Support Agent"""
        print("\n🎧 Testing Selena Support Agent...")
        
        test_requests = [
            {
                "message": "لدي مشكلة في تسجيل الدخول",
                "language": "ar",
                "agent_type": "support",
                "issue_type": "account"
            },
            {
                "message": "I can't complete my payment",
                "language": "en",
                "agent_type": "support",
                "issue_type": "payment"
            }
        ]
        
        await self._test_agent_requests("support", test_requests)
    
    async def test_community_agent(self):
        """Test Selena Community Agent"""
        print("\n👥 Testing Selena Community Agent...")
        
        test_requests = [
            {
                "message": "أريد العثور على أصدقاء يحبون الأنشطة الخارجية",
                "language": "ar",
                "agent_type": "community",
                "community_action": "connect"
            },
            {
                "message": "Help me find groups for hiking and outdoor activities",
                "language": "en",
                "agent_type": "community",
                "community_action": "join"
            }
        ]
        
        await self._test_agent_requests("community", test_requests)
    
    async def _test_agent_requests(self, agent_name: str, test_requests: List[Dict]):
        """Test specific agent with multiple requests"""
        
        for i, test_request in enumerate(test_requests):
            try:
                async with aiohttp.ClientSession() as session:
                    start_time = time.time()
                    
                    async with session.post(
                        f"{self.base_url}/chat",
                        json=test_request
                    ) as response:
                        response_time = (time.time() - start_time) * 1000
                        
                        if response.status == 200:
                            data = await response.json()
                            
                            # Check response structure
                            required_fields = ["reply", "agent_type", "language", "processing_time_ms"]
                            if all(field in data for field in required_fields):
                                print(f"   ✅ Test {i+1}: {response_time:.2f}ms")
                                print(f"      Reply: {data['reply'][:50]}...")
                                
                                self.test_results.append({
                                    "test": f"{agent_name}_test_{i+1}",
                                    "status": "pass",
                                    "response_time_ms": response_time,
                                    "api_processing_time": data.get("processing_time_ms"),
                                    "confidence": data.get("confidence_score")
                                })
                            else:
                                missing_fields = [f for f in required_fields if f not in data]
                                print(f"   ❌ Test {i+1}: Missing fields {missing_fields}")
                                self.test_results.append({
                                    "test": f"{agent_name}_test_{i+1}",
                                    "status": "fail",
                                    "error": f"Missing fields: {missing_fields}"
                                })
                        else:
                            print(f"   ❌ Test {i+1}: HTTP {response.status}")
                            self.test_results.append({
                                "test": f"{agent_name}_test_{i+1}",
                                "status": "fail",
                                "error": f"HTTP {response.status}"
                            })
            
            except Exception as e:
                print(f"   ❌ Test {i+1}: {e}")
                self.test_results.append({
                    "test": f"{agent_name}_test_{i+1}",
                    "status": "error",
                    "error": str(e)
                })
    
    async def test_response_times(self):
        """Test response time requirements (<200ms)"""
        print("\n⚡ Testing Response Time Requirements...")
        
        test_request = {
            "message": "Hello",
            "language": "en",
            "agent_type": "support"
        }
        
        response_times = []
        
        try:
            async with aiohttp.ClientSession() as session:
                # Test multiple requests to get average
                for i in range(5):
                    start_time = time.time()
                    
                    async with session.post(
                        f"{self.base_url}/chat",
                        json=test_request
                    ) as response:
                        response_time = (time.time() - start_time) * 1000
                        response_times.append(response_time)
                        
                        if response.status == 200:
                            print(f"   Request {i+1}: {response_time:.2f}ms")
                        else:
                            print(f"   Request {i+1}: Failed (HTTP {response.status})")
            
            if response_times:
                avg_time = sum(response_times) / len(response_times)
                max_time = max(response_times)
                min_time = min(response_times)
                
                target_met = avg_time < 200
                
                print(f"📊 Response Time Results:")
                print(f"   Average: {avg_time:.2f}ms")
                print(f"   Min: {min_time:.2f}ms")
                print(f"   Max: {max_time:.2f}ms")
                print(f"   Target (<200ms): {'✅ MET' if target_met else '❌ NOT MET'}")
                
                self.test_results.append({
                    "test": "response_time",
                    "status": "pass" if target_met else "fail",
                    "avg_response_time_ms": avg_time,
                    "target_met": target_met
                })
        
        except Exception as e:
            print(f"❌ Response time test error: {e}")
    
    async def test_concurrent_requests(self):
        """Test concurrent request handling (simplified)"""
        print("\n🚀 Testing Concurrent Request Handling...")
        
        test_request = {
            "message": "Test concurrent request",
            "language": "en",
            "agent_type": "discover"
        }
        
        concurrent_count = 10  # Test with 10 concurrent requests
        
        try:
            async with aiohttp.ClientSession() as session:
                start_time = time.time()
                
                # Create concurrent requests
                tasks = []
                for i in range(concurrent_count):
                    task = session.post(
                        f"{self.base_url}/chat",
                        json={**test_request, "session_id": f"test_session_{i}"}
                    )
                    tasks.append(task)
                
                # Wait for all requests to complete
                responses = await asyncio.gather(*tasks, return_exceptions=True)
                
                total_time = (time.time() - start_time) * 1000
                successful_requests = 0
                failed_requests = 0
                
                for response in responses:
                    if isinstance(response, Exception):
                        failed_requests += 1
                    else:
                        if response.status == 200:
                            successful_requests += 1
                        else:
                            failed_requests += 1
                        response.close()
                
                success_rate = successful_requests / concurrent_count
                
                print(f"📊 Concurrent Request Results:")
                print(f"   Total requests: {concurrent_count}")
                print(f"   Successful: {successful_requests}")
                print(f"   Failed: {failed_requests}")
                print(f"   Success rate: {success_rate:.2%}")
                print(f"   Total time: {total_time:.2f}ms")
                print(f"   Avg per request: {total_time/concurrent_count:.2f}ms")
                
                self.test_results.append({
                    "test": "concurrent_requests",
                    "status": "pass" if success_rate > 0.95 else "fail",
                    "concurrent_count": concurrent_count,
                    "success_rate": success_rate,
                    "total_time_ms": total_time
                })
        
        except Exception as e:
            print(f"❌ Concurrent request test error: {e}")
    
    async def test_error_handling(self):
        """Test error handling and validation"""
        print("\n🛡️ Testing Error Handling...")
        
        error_test_cases = [
            {
                "name": "Invalid agent type",
                "request": {"message": "test", "agent_type": "invalid", "language": "ar"},
                "expected_status": 422
            },
            {
                "name": "Empty message",
                "request": {"message": "", "agent_type": "support", "language": "ar"},
                "expected_status": 422
            },
            {
                "name": "Invalid language",
                "request": {"message": "test", "agent_type": "onboard", "language": "fr"},
                "expected_status": 422
            }
        ]
        
        try:
            async with aiohttp.ClientSession() as session:
                for test_case in error_test_cases:
                    async with session.post(
                        f"{self.base_url}/chat",
                        json=test_case["request"]
                    ) as response:
                        
                        if response.status == test_case["expected_status"]:
                            print(f"   ✅ {test_case['name']}: Correct error handling")
                        else:
                            print(f"   ❌ {test_case['name']}: Expected {test_case['expected_status']}, got {response.status}")
        
        except Exception as e:
            print(f"❌ Error handling test error: {e}")
    
    def generate_test_report(self):
        """Generate comprehensive test report"""
        print("\n📊 TEST REPORT")
        print("="*50)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "pass"])
        failed_tests = len([r for r in self.test_results if r["status"] == "fail"])
        error_tests = len([r for r in self.test_results if r["status"] == "error"])
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Errors: {error_tests} 🔥")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%" if total_tests > 0 else "N/A")
        
        # Performance summary
        response_times = [r.get("response_time_ms") for r in self.test_results if r.get("response_time_ms")]
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            print(f"\nPerformance Summary:")
            print(f"Average Response Time: {avg_response_time:.2f}ms")
            print(f"Target (<200ms): {'✅ MET' if avg_response_time < 200 else '❌ NOT MET'}")
        
        # Detailed results
        print(f"\nDetailed Results:")
        for result in self.test_results:
            status_icon = {"pass": "✅", "fail": "❌", "error": "🔥"}.get(result["status"], "❓")
            print(f"  {status_icon} {result['test']}: {result['status']}")
            if result.get("response_time_ms"):
                print(f"     Response time: {result['response_time_ms']:.2f}ms")
            if result.get("error"):
                print(f"     Error: {result['error']}")


async def main():
    """Run test suite"""
    tester = SelenaServiceTester()
    await tester.run_all_tests()


if __name__ == "__main__":
    asyncio.run(main())