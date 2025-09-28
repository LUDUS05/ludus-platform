"""
Performance Monitor for LUDUS Selena AI Service
Tracks response times, throughput, and system performance

Performance Targets:
- <200ms response time
- 1000+ concurrent requests
- 99.9% uptime

Created: 2025-09-28 GMT+3 (Riyadh)
Version: 1.0.0
"""

import asyncio
import time
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from collections import deque, defaultdict
from dataclasses import dataclass, field
import psutil
import threading


@dataclass
class RequestMetric:
    """Individual request metric"""
    timestamp: datetime
    agent_type: str
    processing_time_ms: float
    success: bool
    error: Optional[str] = None
    endpoint: Optional[str] = None


@dataclass
class AgentPerformance:
    """Performance metrics for a specific agent"""
    agent_type: str
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    avg_response_time_ms: float = 0.0
    min_response_time_ms: float = float('inf')
    max_response_time_ms: float = 0.0
    last_hour_requests: int = 0
    error_rate: float = 0.0
    recent_response_times: deque = field(default_factory=lambda: deque(maxlen=100))


@dataclass
class SystemMetrics:
    """Overall system performance metrics"""
    uptime_seconds: float
    total_requests: int
    requests_per_second: float
    avg_response_time_ms: float
    error_rate: float
    active_sessions: int
    memory_usage_mb: float
    cpu_usage_percent: float
    target_compliance: bool  # Whether meeting <200ms target


class PerformanceMonitor:
    """Monitors and tracks performance metrics for the AI service"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.start_time = time.time()
        
        # Thread-safe metrics storage
        self._lock = threading.Lock()
        self.agent_metrics: Dict[str, AgentPerformance] = {
            "onboard": AgentPerformance("onboard"),
            "discover": AgentPerformance("discover"),
            "support": AgentPerformance("support"),
            "community": AgentPerformance("community")
        }
        
        # Recent requests for calculating rates
        self.recent_requests: deque = deque(maxlen=1000)
        self.hourly_requests: defaultdict = defaultdict(int)
        
        # Performance thresholds
        self.target_response_time_ms = 200
        self.target_error_rate = 0.01  # 1%
        self.target_requests_per_second = 100
        
        self.logger.info("📊 Performance Monitor initialized")
    
    async def log_request(
        self,
        agent_type: str,
        processing_time: float,
        success: bool,
        error: Optional[str] = None,
        endpoint: Optional[str] = None
    ):
        """Log a request for performance tracking"""
        
        now = datetime.utcnow()
        processing_time_ms = processing_time
        
        # Create request metric
        metric = RequestMetric(
            timestamp=now,
            agent_type=agent_type,
            processing_time_ms=processing_time_ms,
            success=success,
            error=error,
            endpoint=endpoint
        )
        
        with self._lock:
            # Update agent-specific metrics
            if agent_type in self.agent_metrics:
                agent_perf = self.agent_metrics[agent_type]
                
                agent_perf.total_requests += 1
                if success:
                    agent_perf.successful_requests += 1
                else:
                    agent_perf.failed_requests += 1
                
                # Update response time metrics
                agent_perf.recent_response_times.append(processing_time_ms)
                agent_perf.min_response_time_ms = min(agent_perf.min_response_time_ms, processing_time_ms)
                agent_perf.max_response_time_ms = max(agent_perf.max_response_time_ms, processing_time_ms)
                
                # Calculate average response time
                if agent_perf.recent_response_times:
                    agent_perf.avg_response_time_ms = sum(agent_perf.recent_response_times) / len(agent_perf.recent_response_times)
                
                # Calculate error rate
                if agent_perf.total_requests > 0:
                    agent_perf.error_rate = agent_perf.failed_requests / agent_perf.total_requests
            
            # Add to recent requests
            self.recent_requests.append(metric)
            
            # Update hourly counter
            hour_key = now.strftime("%Y-%m-%d-%H")
            self.hourly_requests[hour_key] += 1
        
        # Log performance issues
        if processing_time_ms > self.target_response_time_ms:
            self.logger.warning(
                f"⚠️ Slow response detected: {agent_type} took {processing_time_ms:.2f}ms "
                f"(target: {self.target_response_time_ms}ms)"
            )
        
        if not success:
            self.logger.error(f"❌ Request failed: {agent_type} - {error}")
    
    async def get_metrics(self) -> Dict[str, Any]:
        """Get comprehensive performance metrics"""
        with self._lock:
            now = datetime.utcnow()
            uptime = time.time() - self.start_time
            
            # Calculate overall metrics
            total_requests = sum(metric.total_requests for metric in self.agent_metrics.values())
            total_successful = sum(metric.successful_requests for metric in self.agent_metrics.values())
            total_failed = sum(metric.failed_requests for metric in self.agent_metrics.values())
            
            # Calculate requests per second (last hour)
            hour_ago = now - timedelta(hours=1)
            recent_requests_count = len([
                req for req in self.recent_requests 
                if req.timestamp > hour_ago
            ])
            requests_per_second = recent_requests_count / 3600 if recent_requests_count > 0 else 0
            
            # Calculate average response time
            all_recent_times = []
            for agent_perf in self.agent_metrics.values():
                all_recent_times.extend(list(agent_perf.recent_response_times))
            
            avg_response_time = sum(all_recent_times) / len(all_recent_times) if all_recent_times else 0
            
            # Calculate error rate
            error_rate = total_failed / total_requests if total_requests > 0 else 0
            
            # Get system metrics
            memory_usage = psutil.virtual_memory().used / (1024 * 1024)  # MB
            cpu_usage = psutil.cpu_percent(interval=None)
            
            # Check target compliance
            target_compliance = (
                avg_response_time < self.target_response_time_ms and
                error_rate < self.target_error_rate
            )
            
            return {
                "system_metrics": SystemMetrics(
                    uptime_seconds=uptime,
                    total_requests=total_requests,
                    requests_per_second=requests_per_second,
                    avg_response_time_ms=avg_response_time,
                    error_rate=error_rate,
                    active_sessions=0,  # Will be updated by session manager
                    memory_usage_mb=memory_usage,
                    cpu_usage_percent=cpu_usage,
                    target_compliance=target_compliance
                ).dict(),
                "agent_metrics": {
                    agent_type: {
                        "total_requests": perf.total_requests,
                        "successful_requests": perf.successful_requests,
                        "failed_requests": perf.failed_requests,
                        "avg_response_time_ms": perf.avg_response_time_ms,
                        "min_response_time_ms": perf.min_response_time_ms if perf.min_response_time_ms != float('inf') else 0,
                        "max_response_time_ms": perf.max_response_time_ms,
                        "error_rate": perf.error_rate,
                        "target_compliance": perf.avg_response_time_ms < self.target_response_time_ms
                    }
                    for agent_type, perf in self.agent_metrics.items()
                },
                "performance_summary": {
                    "status": "excellent" if target_compliance else "needs_improvement",
                    "target_response_time_ms": self.target_response_time_ms,
                    "current_avg_response_time_ms": avg_response_time,
                    "target_error_rate": self.target_error_rate,
                    "current_error_rate": error_rate,
                    "requests_last_hour": recent_requests_count
                }
            }
    
    async def get_agent_metrics(self, agent_type: str) -> Optional[Dict[str, Any]]:
        """Get metrics for a specific agent"""
        if agent_type not in self.agent_metrics:
            return None
        
        with self._lock:
            agent_perf = self.agent_metrics[agent_type]
            
            # Calculate recent performance (last hour)
            hour_ago = datetime.utcnow() - timedelta(hours=1)
            recent_requests = [
                req for req in self.recent_requests 
                if req.agent_type == agent_type and req.timestamp > hour_ago
            ]
            
            recent_successful = len([req for req in recent_requests if req.success])
            recent_failed = len([req for req in recent_requests if not req.success])
            recent_total = len(recent_requests)
            
            return {
                "agent_type": agent_type,
                "total_requests": agent_perf.total_requests,
                "successful_requests": agent_perf.successful_requests,
                "failed_requests": agent_perf.failed_requests,
                "avg_response_time_ms": agent_perf.avg_response_time_ms,
                "min_response_time_ms": agent_perf.min_response_time_ms if agent_perf.min_response_time_ms != float('inf') else 0,
                "max_response_time_ms": agent_perf.max_response_time_ms,
                "error_rate": agent_perf.error_rate,
                "target_compliance": agent_perf.avg_response_time_ms < self.target_response_time_ms,
                "recent_performance": {
                    "last_hour_requests": recent_total,
                    "last_hour_successful": recent_successful,
                    "last_hour_failed": recent_failed,
                    "last_hour_error_rate": recent_failed / recent_total if recent_total > 0 else 0
                }
            }
    
    async def get_summary(self) -> Dict[str, Any]:
        """Get performance summary for all agents"""
        metrics = await self.get_metrics()
        
        return {
            "overall_status": "healthy" if metrics["performance_summary"]["status"] == "excellent" else "degraded",
            "target_compliance": metrics["system_metrics"]["target_compliance"],
            "total_requests": metrics["system_metrics"]["total_requests"],
            "avg_response_time_ms": metrics["system_metrics"]["avg_response_time_ms"],
            "error_rate": metrics["system_metrics"]["error_rate"],
            "uptime_hours": metrics["system_metrics"]["uptime_seconds"] / 3600,
            "agents_performance": {
                agent_type: {
                    "status": "healthy" if data["target_compliance"] else "slow",
                    "avg_response_time_ms": data["avg_response_time_ms"],
                    "total_requests": data["total_requests"],
                    "error_rate": data["error_rate"]
                }
                for agent_type, data in metrics["agent_metrics"].items()
            }
        }
    
    def get_real_time_stats(self) -> Dict[str, Any]:
        """Get real-time statistics (synchronous for health checks)"""
        with self._lock:
            now = datetime.utcnow()
            minute_ago = now - timedelta(minutes=1)
            
            # Count requests in last minute
            recent_requests = [
                req for req in self.recent_requests 
                if req.timestamp > minute_ago
            ]
            
            requests_per_minute = len(recent_requests)
            successful_requests = len([req for req in recent_requests if req.success])
            failed_requests = len([req for req in recent_requests if not req.success])
            
            return {
                "requests_last_minute": requests_per_minute,
                "successful_last_minute": successful_requests,
                "failed_last_minute": failed_requests,
                "current_load": "high" if requests_per_minute > 60 else "normal",
                "memory_usage_mb": psutil.virtual_memory().used / (1024 * 1024),
                "cpu_usage_percent": psutil.cpu_percent(interval=None)
            }