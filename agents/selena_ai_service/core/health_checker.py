"""
Health Checker for LUDUS Selena AI Service
Monitors system health, dependencies, and service availability

Created: 2025-09-28 GMT+3 (Riyadh)
Version: 1.0.0
"""

import asyncio
import aiohttp
import redis
import logging
from typing import Dict, Optional, Any
from datetime import datetime
import time


class HealthChecker:
    """Comprehensive health monitoring for all service components"""
    
    def __init__(self, redis_client: Optional[redis.Redis] = None, ollama_host: str = "http://localhost:11434"):
        self.logger = logging.getLogger(__name__)
        self.redis_client = redis_client
        self.ollama_host = ollama_host
        
        # Health check configuration
        self.timeout_seconds = 5
        self.critical_services = ["redis", "ollama"]
        self.optional_services = ["mongodb"]
        
        self.logger.info("🏥 Health Checker initialized")
    
    async def check_all_services(self) -> Dict[str, str]:
        """Check health of all services"""
        health_status = {
            "overall": "ok",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Check Redis
        redis_status = await self._check_redis()
        health_status["redis"] = redis_status
        
        # Check Ollama
        ollama_status = await self._check_ollama()
        health_status["ollama"] = ollama_status
        
        # Check system resources
        system_status = await self._check_system_resources()
        health_status["system"] = system_status
        
        # Determine overall health
        critical_failures = [
            service for service in self.critical_services
            if health_status.get(service) == "down"
        ]
        
        if critical_failures:
            health_status["overall"] = "critical"
            self.logger.error(f"❌ Critical services down: {critical_failures}")
        elif any(status == "degraded" for status in health_status.values()):
            health_status["overall"] = "degraded"
            self.logger.warning("⚠️ Some services degraded")
        else:
            health_status["overall"] = "ok"
        
        return health_status
    
    async def _check_redis(self) -> str:
        """Check Redis connection health"""
        if not self.redis_client:
            return "not_configured"
        
        try:
            start_time = time.time()
            pong = self.redis_client.ping()
            response_time = (time.time() - start_time) * 1000
            
            if pong and response_time < 100:  # < 100ms is good
                return "ok"
            elif pong and response_time < 500:  # < 500ms is acceptable
                return "degraded"
            else:
                return "slow"
                
        except redis.ConnectionError:
            self.logger.error("❌ Redis connection failed")
            return "down"
        except redis.TimeoutError:
            self.logger.error("❌ Redis timeout")
            return "timeout"
        except Exception as e:
            self.logger.error(f"❌ Redis health check error: {e}")
            return "error"
    
    async def _check_ollama(self) -> str:
        """Check Ollama service health"""
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.timeout_seconds)) as session:
                start_time = time.time()
                
                # Check if Ollama is running
                async with session.get(f"{self.ollama_host}/api/tags") as response:
                    response_time = (time.time() - start_time) * 1000
                    
                    if response.status == 200:
                        data = await response.json()
                        models = data.get("models", [])
                        
                        if response_time < 1000:  # < 1s is good
                            return "ok"
                        elif response_time < 3000:  # < 3s is acceptable
                            return "degraded"
                        else:
                            return "slow"
                    else:
                        return "error"
                        
        except asyncio.TimeoutError:
            self.logger.error("❌ Ollama health check timeout")
            return "timeout"
        except aiohttp.ClientConnectorError:
            self.logger.error("❌ Cannot connect to Ollama")
            return "down"
        except Exception as e:
            self.logger.error(f"❌ Ollama health check error: {e}")
            return "error"
    
    async def _check_system_resources(self) -> str:
        """Check system resource utilization"""
        try:
            import psutil
            
            # Check memory usage (Render has memory limits)
            memory = psutil.virtual_memory()
            memory_usage_percent = memory.percent
            
            # Check CPU usage
            cpu_usage = psutil.cpu_percent(interval=1)
            
            # Check disk usage
            disk = psutil.disk_usage('/')
            disk_usage_percent = disk.percent
            
            # Determine status based on thresholds
            if memory_usage_percent > 90 or cpu_usage > 90 or disk_usage_percent > 90:
                return "critical"
            elif memory_usage_percent > 80 or cpu_usage > 80 or disk_usage_percent > 80:
                return "degraded"
            else:
                return "ok"
                
        except Exception as e:
            self.logger.error(f"❌ System resources check error: {e}")
            return "error"
    
    async def detailed_check(self) -> Dict[str, Any]:
        """Perform detailed health check with metrics"""
        
        start_time = time.time()
        
        # Basic health check
        basic_health = await self.check_all_services()
        
        # Additional detailed metrics
        detailed_metrics = {
            "basic_health": basic_health,
            "detailed_metrics": {},
            "performance_indicators": {},
            "service_details": {},
            "recommendations": []
        }
        
        # Redis detailed check
        if self.redis_client:
            try:
                redis_info = self.redis_client.info()
                detailed_metrics["service_details"]["redis"] = {
                    "version": redis_info.get("redis_version"),
                    "connected_clients": redis_info.get("connected_clients"),
                    "used_memory": redis_info.get("used_memory_human"),
                    "total_commands_processed": redis_info.get("total_commands_processed"),
                    "uptime_seconds": redis_info.get("uptime_in_seconds")
                }
            except Exception as e:
                detailed_metrics["service_details"]["redis"] = {"error": str(e)}
        
        # Ollama detailed check
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                async with session.get(f"{self.ollama_host}/api/tags") as response:
                    if response.status == 200:
                        data = await response.json()
                        detailed_metrics["service_details"]["ollama"] = {
                            "models": [model.get("name") for model in data.get("models", [])],
                            "model_count": len(data.get("models", [])),
                            "status": "available"
                        }
                    else:
                        detailed_metrics["service_details"]["ollama"] = {
                            "status": "error",
                            "status_code": response.status
                        }
        except Exception as e:
            detailed_metrics["service_details"]["ollama"] = {"error": str(e)}
        
        # System detailed metrics
        try:
            import psutil
            
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            detailed_metrics["detailed_metrics"]["system"] = {
                "memory": {
                    "total_gb": round(memory.total / (1024**3), 2),
                    "available_gb": round(memory.available / (1024**3), 2),
                    "used_percent": memory.percent,
                    "status": "ok" if memory.percent < 80 else "warning"
                },
                "cpu": {
                    "usage_percent": psutil.cpu_percent(interval=1),
                    "count": psutil.cpu_count(),
                    "status": "ok" if psutil.cpu_percent(interval=None) < 80 else "warning"
                },
                "disk": {
                    "total_gb": round(disk.total / (1024**3), 2),
                    "free_gb": round(disk.free / (1024**3), 2),
                    "used_percent": disk.percent,
                    "status": "ok" if disk.percent < 85 else "warning"
                }
            }
            
            # Performance indicators
            detailed_metrics["performance_indicators"] = {
                "health_check_time_ms": round((time.time() - start_time) * 1000, 2),
                "memory_available": memory.available > 1024**3,  # > 1GB
                "cpu_available": psutil.cpu_percent(interval=None) < 70,
                "ready_for_load": (
                    memory.percent < 70 and 
                    psutil.cpu_percent(interval=None) < 60 and
                    basic_health["overall"] == "ok"
                )
            }
            
            # Generate recommendations
            recommendations = []
            if memory.percent > 80:
                recommendations.append("High memory usage detected - consider optimizing memory usage")
            if psutil.cpu_percent(interval=None) > 80:
                recommendations.append("High CPU usage detected - consider scaling or optimization")
            if basic_health["redis"] != "ok":
                recommendations.append("Redis connection issues - check Redis service status")
            if basic_health["ollama"] != "ok":
                recommendations.append("Ollama service issues - verify Ollama installation and model availability")
            
            detailed_metrics["recommendations"] = recommendations
            
        except Exception as e:
            self.logger.error(f"❌ Detailed system check error: {e}")
            detailed_metrics["detailed_metrics"]["system"] = {"error": str(e)}
        
        return detailed_metrics
    
    async def check_agent_health(self, agent_type: str) -> Dict[str, Any]:
        """Check health of a specific agent"""
        
        # This would be implemented by each agent
        # For now, return basic status
        
        return {
            "agent_type": agent_type,
            "status": "ok",
            "last_check": datetime.utcnow().isoformat(),
            "capabilities": "available"
        }