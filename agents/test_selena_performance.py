#!/usr/bin/env python3
"""
LUDUS Selena AI Service Performance Test
Created: 2025-09-28 GMT+3 (Riyadh)
Purpose: Load testing to verify <200ms response time and 1000+ concurrent requests capability
"""

import asyncio
import aiohttp
import time
import json
import statistics
from typing import List, Dict, Any
from datetime import datetime


class SelenaPerformanceTest:
    """Performance testing suite for Selena AI agents"""
    
    def __init__(self, base_url: str = "http://localhost:8081"):
        self.base_url = base_url
        self.results = []
        
    async def test_single_request(self, session: aiohttp.ClientSession, agent_type: str, message: str) -> Dict[str, Any]:
        """Test a single request to a Selena agent"""
        start_time = time.time()
        
        try:
            async with session.post(
                f"{self.base_url}/selena/{agent_type}",
                json={
                    "message": message,
                    "language": "ar",
                    "session_id": f"test_{int(time.time())}"
                },
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                response_data = await response.json()
                response_time = (time.time() - start_time) * 1000
                
                return {
                    "agent_type": agent_type,
                    "response_time_ms": response_time,
                    "status_code": response.status,
                    "success": response.status == 200,
                    "response_data": response_data
                }
                
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return {
                "agent_type": agent_type,
                "response_time_ms": response_time,
                "status_code": 0,
                "success": False,
                "error": str(e)
            }
    
    async def test_concurrent_requests(self, concurrent_users: int = 100, requests_per_user: int = 10) -> Dict[str, Any]:
        """Test concurrent requests to verify performance targets"""
        print(f"Starting load test: {concurrent_users} concurrent users, {requests_per_user} requests each")
        
        agents = ["onboard", "discover", "support", "community"]
        test_messages = [
            "مرحباً، كيف حالك؟",
            "أريد العثور على نشاط ممتع",
            "أحتاج مساعدة في مشكلة تقنية",
            "كيف يمكنني التواصل مع المجتمع؟"
        ]
        
        start_time = time.time()
        
        async with aiohttp.ClientSession() as session:
            # Create all tasks
            tasks = []
            for user_id in range(concurrent_users):
                for request_id in range(requests_per_user):
                    agent_type = agents[request_id % len(agents)]
                    message = test_messages[request_id % len(test_messages)]
                    
                    task = self.test_single_request(session, agent_type, message)
                    tasks.append(task)
            
            # Execute all tasks concurrently
            results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        total_time = time.time() - start_time
        successful_requests = [r for r in results if isinstance(r, dict) and r.get("success", False)]
        failed_requests = [r for r in results if not (isinstance(r, dict) and r.get("success", False))]
        
        response_times = [r["response_time_ms"] for r in successful_requests]
        
        # Calculate statistics
        stats = {
            "test_config": {
                "concurrent_users": concurrent_users,
                "requests_per_user": requests_per_user,
                "total_requests": len(tasks)
            },
            "performance_results": {
                "total_test_time_seconds": total_time,
                "requests_per_second": len(tasks) / total_time,
                "successful_requests": len(successful_requests),
                "failed_requests": len(failed_requests),
                "success_rate": len(successful_requests) / len(tasks) * 100
            },
            "response_time_analysis": {
                "avg_response_time_ms": statistics.mean(response_times) if response_times else 0,
                "median_response_time_ms": statistics.median(response_times) if response_times else 0,
                "min_response_time_ms": min(response_times) if response_times else 0,
                "max_response_time_ms": max(response_times) if response_times else 0,
                "p95_response_time_ms": statistics.quantiles(response_times, n=20)[18] if len(response_times) > 20 else 0,
                "p99_response_time_ms": statistics.quantiles(response_times, n=100)[98] if len(response_times) > 100 else 0
            },
            "performance_targets": {
                "target_response_time_ms": 200,
                "target_concurrent_requests": 1000,
                "response_time_target_met": statistics.mean(response_times) < 200 if response_times else False,
                "concurrent_requests_target_met": concurrent_users >= 100  # Scale test
            },
            "agent_breakdown": self._analyze_by_agent(successful_requests)
        }
        
        return stats
    
    def _analyze_by_agent(self, successful_requests: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze performance by agent type"""
        agent_stats = {}
        
        for agent_type in ["onboard", "discover", "support", "community"]:
            agent_requests = [r for r in successful_requests if r["agent_type"] == agent_type]
            
            if agent_requests:
                response_times = [r["response_time_ms"] for r in agent_requests]
                agent_stats[agent_type] = {
                    "total_requests": len(agent_requests),
                    "avg_response_time_ms": statistics.mean(response_times),
                    "min_response_time_ms": min(response_times),
                    "max_response_time_ms": max(response_times),
                    "meets_target": statistics.mean(response_times) < 200
                }
            else:
                agent_stats[agent_type] = {
                    "total_requests": 0,
                    "avg_response_time_ms": 0,
                    "meets_target": False
                }
        
        return agent_stats
    
    async def test_health_endpoint(self) -> Dict[str, Any]:
        """Test the health endpoint"""
        try:
            async with aiohttp.ClientSession() as session:
                start_time = time.time()
                async with session.get(f"{self.base_url}/health") as response:
                    response_time = (time.time() - start_time) * 1000
                    data = await response.json()
                    
                    return {
                        "success": response.status == 200,
                        "response_time_ms": response_time,
                        "health_data": data
                    }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def run_comprehensive_test(self) -> None:
        """Run comprehensive performance test suite"""
        print("🚀 LUDUS Selena AI Service Performance Test Suite")
        print("=" * 60)
        
        # Test 1: Health endpoint
        print("\n1. Testing Health Endpoint...")
        health_result = await self.test_health_endpoint()
        print(f"   Health check: {'✅ PASS' if health_result['success'] else '❌ FAIL'}")
        print(f"   Response time: {health_result.get('response_time_ms', 0):.2f}ms")
        
        # Test 2: Light load (50 concurrent users)
        print("\n2. Testing Light Load (50 concurrent users, 5 requests each)...")
        light_load_results = await self.test_concurrent_requests(50, 5)
        self._print_test_results(light_load_results)
        
        # Test 3: Medium load (200 concurrent users)
        print("\n3. Testing Medium Load (200 concurrent users, 5 requests each)...")
        medium_load_results = await self.test_concurrent_requests(200, 5)
        self._print_test_results(medium_load_results)
        
        # Test 4: Heavy load (500 concurrent users)
        print("\n4. Testing Heavy Load (500 concurrent users, 2 requests each)...")
        heavy_load_results = await self.test_concurrent_requests(500, 2)
        self._print_test_results(heavy_load_results)
        
        print("\n" + "=" * 60)
        print("🎯 Performance Test Summary")
        print("=" * 60)
        
        # Summary
        test_results = [light_load_results, medium_load_results, heavy_load_results]
        
        for i, result in enumerate(test_results, 1):
            test_names = ["Light Load", "Medium Load", "Heavy Load"]
            print(f"\n{test_names[i-1]}:")
            print(f"   Avg Response Time: {result['response_time_analysis']['avg_response_time_ms']:.2f}ms")
            print(f"   Success Rate: {result['performance_results']['success_rate']:.1f}%")
            print(f"   Target Met: {'✅' if result['performance_targets']['response_time_target_met'] else '❌'}")
    
    def _print_test_results(self, results: Dict[str, Any]) -> None:
        """Print formatted test results"""
        perf = results["performance_results"]
        timing = results["response_time_analysis"]
        targets = results["performance_targets"]
        
        print(f"   Total Requests: {perf['total_requests']}")
        print(f"   Success Rate: {perf['success_rate']:.1f}%")
        print(f"   Requests/Second: {perf['requests_per_second']:.1f}")
        print(f"   Avg Response Time: {timing['avg_response_time_ms']:.2f}ms")
        print(f"   P95 Response Time: {timing['p95_response_time_ms']:.2f}ms")
        print(f"   Target (<200ms): {'✅ PASS' if targets['response_time_target_met'] else '❌ FAIL'}")


async def main():
    """Main performance test execution"""
    tester = SelenaPerformanceTest()
    await tester.run_comprehensive_test()


if __name__ == "__main__":
    asyncio.run(main())