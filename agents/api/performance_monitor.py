"""
LUDUS Selena AI Service Performance Monitor
Created: 2025-09-28 GMT+3 (Riyadh)
Purpose: Advanced performance monitoring and metrics collection for Selena agents
"""

import time
import json
import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
from collections import defaultdict
import redis
from prometheus_client import Counter, Histogram, Gauge, start_http_server


@dataclass
class PerformanceMetrics:
    """Performance metrics data structure"""
    agent_type: str
    response_time_ms: float
    success: bool
    timestamp: datetime
    endpoint: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None


class SelenaPerformanceMonitor:
    """Advanced performance monitoring for Selena AI agents"""
    
    def __init__(self, redis_client=None, enable_prometheus: bool = True):
        self.redis_client = redis_client
        self.enable_prometheus = enable_prometheus
        self.logger = logging.getLogger(__name__)
        
        # Prometheus metrics
        if enable_prometheus:
            self.request_counter = Counter(
                'selena_requests_total',
                'Total requests processed by Selena agents',
                ['agent_type', 'endpoint', 'status']
            )
            
            self.response_time_histogram = Histogram(
                'selena_response_time_seconds',
                'Response time of Selena agents',
                ['agent_type', 'endpoint'],
                buckets=[0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0]
            )
            
            self.active_sessions = Gauge(
                'selena_active_sessions',
                'Number of active sessions per agent',
                ['agent_type']
            )
            
            self.error_rate = Gauge(
                'selena_error_rate',
                'Error rate percentage per agent',
                ['agent_type']
            )
    
    def record_request(self, metrics: PerformanceMetrics) -> None:
        """Record request metrics"""
        try:
            # Prometheus metrics
            if self.enable_prometheus:
                status_label = "success" if metrics.success else "error"
                self.request_counter.labels(
                    agent_type=metrics.agent_type,
                    endpoint=metrics.endpoint,
                    status=status_label
                ).inc()
                
                if metrics.success:
                    self.response_time_histogram.labels(
                        agent_type=metrics.agent_type,
                        endpoint=metrics.endpoint
                    ).observe(metrics.response_time_ms / 1000)
            
            # Redis storage for detailed analytics
            if self.redis_client:
                self._store_metrics_in_redis(metrics)
                
        except Exception as e:
            self.logger.error(f"Failed to record metrics: {e}")
    
    def _store_metrics_in_redis(self, metrics: PerformanceMetrics) -> None:
        """Store metrics in Redis for detailed analytics"""
        try:
            # Store individual request metrics
            key = f"selena:metrics:{metrics.agent_type}:{metrics.endpoint}"
            metric_data = {
                "response_time_ms": metrics.response_time_ms,
                "success": metrics.success,
                "timestamp": metrics.timestamp.isoformat(),
                "user_id": metrics.user_id,
                "session_id": metrics.session_id
            }
            
            # Store last 1000 requests per agent/endpoint
            self.redis_client.lpush(key, json.dumps(metric_data))
            self.redis_client.ltrim(key, 0, 999)
            self.redis_client.expire(key, 86400)  # 24 hours
            
            # Update aggregate statistics
            self._update_aggregate_stats(metrics)
            
        except Exception as e:
            self.logger.error(f"Failed to store metrics in Redis: {e}")
    
    def _update_aggregate_stats(self, metrics: PerformanceMetrics) -> None:
        """Update aggregate statistics"""
        try:
            stats_key = f"selena:stats:{metrics.agent_type}"
            current_stats = self.redis_client.hgetall(stats_key)
            
            # Initialize if empty
            if not current_stats:
                current_stats = {
                    "total_requests": "0",
                    "successful_requests": "0", 
                    "total_response_time": "0.0",
                    "min_response_time": str(metrics.response_time_ms),
                    "max_response_time": str(metrics.response_time_ms),
                    "last_updated": metrics.timestamp.isoformat()
                }
            
            # Update statistics
            total_requests = int(current_stats.get("total_requests", 0)) + 1
            successful_requests = int(current_stats.get("successful_requests", 0))
            if metrics.success:
                successful_requests += 1
            
            total_response_time = float(current_stats.get("total_response_time", 0)) + metrics.response_time_ms
            min_response_time = min(float(current_stats.get("min_response_time", metrics.response_time_ms)), metrics.response_time_ms)
            max_response_time = max(float(current_stats.get("max_response_time", metrics.response_time_ms)), metrics.response_time_ms)
            
            updated_stats = {
                "total_requests": str(total_requests),
                "successful_requests": str(successful_requests),
                "total_response_time": str(total_response_time),
                "avg_response_time": str(total_response_time / total_requests),
                "min_response_time": str(min_response_time),
                "max_response_time": str(max_response_time),
                "success_rate": str(successful_requests / total_requests),
                "last_updated": metrics.timestamp.isoformat()
            }
            
            self.redis_client.hset(stats_key, mapping=updated_stats)
            self.redis_client.expire(stats_key, 86400)  # 24 hours
            
        except Exception as e:
            self.logger.error(f"Failed to update aggregate stats: {e}")
    
    def get_agent_performance(self, agent_type: str, hours: int = 24) -> Dict[str, Any]:
        """Get performance summary for specific agent"""
        if not self.redis_client:
            return {"error": "Redis not configured"}
        
        try:
            stats_key = f"selena:stats:{agent_type}"
            stats = self.redis_client.hgetall(stats_key)
            
            if not stats:
                return {
                    "agent_type": agent_type,
                    "total_requests": 0,
                    "avg_response_time_ms": 0,
                    "success_rate": 0,
                    "status": "no_data"
                }
            
            return {
                "agent_type": agent_type,
                "total_requests": int(stats.get("total_requests", 0)),
                "successful_requests": int(stats.get("successful_requests", 0)),
                "avg_response_time_ms": float(stats.get("avg_response_time", 0)),
                "min_response_time_ms": float(stats.get("min_response_time", 0)),
                "max_response_time_ms": float(stats.get("max_response_time", 0)),
                "success_rate": float(stats.get("success_rate", 0)),
                "last_updated": stats.get("last_updated"),
                "performance_status": "excellent" if float(stats.get("avg_response_time", 0)) < 200 else "needs_optimization"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get agent performance: {e}")
            return {"error": str(e)}
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get overall system health and performance status"""
        health_data = {
            "timestamp": datetime.now().isoformat(),
            "service": "LUDUS Selena AI Service",
            "version": "2.0.0",
            "performance_targets": {
                "response_time_target_ms": 200,
                "concurrent_requests_target": 1000
            }
        }
        
        # Get performance for all agents
        agents_performance = {}
        for agent_type in ["onboard", "discover", "support", "community"]:
            agents_performance[agent_type] = self.get_agent_performance(agent_type)
        
        health_data["agents_performance"] = agents_performance
        
        # Calculate overall system performance
        all_response_times = []
        all_success_rates = []
        
        for agent_perf in agents_performance.values():
            if isinstance(agent_perf, dict) and "avg_response_time_ms" in agent_perf:
                all_response_times.append(agent_perf["avg_response_time_ms"])
                all_success_rates.append(agent_perf["success_rate"])
        
        if all_response_times:
            health_data["system_performance"] = {
                "avg_response_time_ms": sum(all_response_times) / len(all_response_times),
                "avg_success_rate": sum(all_success_rates) / len(all_success_rates),
                "meets_performance_targets": all(rt < 200 for rt in all_response_times)
            }
        
        return health_data
    
    def start_prometheus_server(self, port: int = 8090) -> None:
        """Start Prometheus metrics server"""
        if self.enable_prometheus:
            try:
                start_http_server(port)
                self.logger.info(f"Prometheus metrics server started on port {port}")
            except Exception as e:
                self.logger.error(f"Failed to start Prometheus server: {e}")


# Global performance monitor instance
performance_monitor = SelenaPerformanceMonitor()