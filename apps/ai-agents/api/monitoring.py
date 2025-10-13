"""
LUDUS Agent Monitoring and Analytics System
"""

import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from enum import Enum
import logging


class MetricType(str, Enum):
    """Types of metrics to track"""
    PERFORMANCE = "performance"
    USAGE = "usage"
    ERROR = "error"
    QUALITY = "quality"
    WORKFLOW = "workflow"


class Metric(BaseModel):
    """Individual metric record"""
    id: str
    agent_type: str
    metric_type: MetricType
    name: str
    value: float
    unit: str
    timestamp: datetime
    metadata: Dict[str, Any] = {}


class AgentPerformance(BaseModel):
    """Agent performance summary"""
    agent_type: str
    total_requests: int
    successful_requests: int
    failed_requests: int
    average_response_time: float
    success_rate: float
    last_activity: datetime
    metrics: Dict[str, float] = {}


class WorkflowAnalytics(BaseModel):
    """Workflow analytics summary"""
    total_workflows: int
    completed_workflows: int
    failed_workflows: int
    average_execution_time: float
    success_rate: float
    most_used_templates: List[Dict[str, Any]]
    performance_trends: Dict[str, List[float]]


class MonitoringSystem:
    """Comprehensive monitoring and analytics system for agents"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.logger = logging.getLogger(__name__)
        self.metrics_buffer = []
        self.buffer_size = 100
        
    def _get_metric_key(self, agent_type: str, metric_type: MetricType) -> str:
        """Get Redis key for metrics"""
        return f"monitoring:metrics:{agent_type}:{metric_type.value}"
    
    def _get_performance_key(self, agent_type: str) -> str:
        """Get Redis key for agent performance"""
        return f"monitoring:performance:{agent_type}"
    
    def _get_workflow_analytics_key(self) -> str:
        """Get Redis key for workflow analytics"""
        return "monitoring:workflow_analytics"
    
    def record_metric(self, agent_type: str, metric_type: MetricType, name: str, 
                     value: float, unit: str = "", metadata: Dict[str, Any] = None):
        """Record a metric for an agent"""
        metric = Metric(
            id=f"{agent_type}_{metric_type.value}_{name}_{int(time.time())}",
            agent_type=agent_type,
            metric_type=metric_type,
            name=name,
            value=value,
            unit=unit,
            timestamp=datetime.now(),
            metadata=metadata or {}
        )
        
        # Add to buffer
        self.metrics_buffer.append(metric)
        
        # Flush buffer if it's full
        if len(self.metrics_buffer) >= self.buffer_size:
            self._flush_metrics_buffer()
    
    def _flush_metrics_buffer(self):
        """Flush metrics buffer to Redis"""
        if not self.redis_client or not self.metrics_buffer:
            return
        
        try:
            for metric in self.metrics_buffer:
                key = self._get_metric_key(metric.agent_type, metric.metric_type)
                
                # Store metric data
                metric_data = {
                    "id": metric.id,
                    "name": metric.name,
                    "value": metric.value,
                    "unit": metric.unit,
                    "timestamp": metric.timestamp.isoformat(),
                    "metadata": metric.metadata
                }
                
                # Add to sorted set for time-based queries
                self.redis_client.zadd(
                    f"{key}:timeseries",
                    {json.dumps(metric_data): metric.timestamp.timestamp()}
                )
                
                # Update latest value
                self.redis_client.hset(f"{key}:latest", metric.name, metric.value)
                
                # Keep only last 1000 metrics per agent/type
                self.redis_client.zremrangebyrank(f"{key}:timeseries", 0, -1001)
            
            # Clear buffer
            self.metrics_buffer.clear()
            
        except Exception as e:
            self.logger.error(f"Error flushing metrics buffer: {str(e)}")
    
    def record_request(self, agent_type: str, success: bool, response_time: float, 
                      request_size: int = 0, response_size: int = 0):
        """Record a request metric"""
        # Record performance metrics
        self.record_metric(agent_type, MetricType.PERFORMANCE, "response_time", 
                          response_time, "ms")
        self.record_metric(agent_type, MetricType.PERFORMANCE, "request_size", 
                          request_size, "bytes")
        self.record_metric(agent_type, MetricType.PERFORMANCE, "response_size", 
                          response_size, "bytes")
        
        # Record usage metrics
        self.record_metric(agent_type, MetricType.USAGE, "total_requests", 1, "count")
        if success:
            self.record_metric(agent_type, MetricType.USAGE, "successful_requests", 1, "count")
        else:
            self.record_metric(agent_type, MetricType.USAGE, "failed_requests", 1, "count")
        
        # Update performance summary
        self._update_performance_summary(agent_type, success, response_time)
    
    def record_error(self, agent_type: str, error_type: str, error_message: str, 
                    severity: str = "medium"):
        """Record an error metric"""
        self.record_metric(agent_type, MetricType.ERROR, "error_count", 1, "count", {
            "error_type": error_type,
            "error_message": error_message,
            "severity": severity
        })
    
    def record_quality_metric(self, agent_type: str, metric_name: str, value: float, 
                             metadata: Dict[str, Any] = None):
        """Record a quality metric (e.g., accessibility score, code quality)"""
        self.record_metric(agent_type, MetricType.QUALITY, metric_name, value, 
                          "score", metadata)
    
    def record_workflow_metric(self, workflow_id: str, metric_name: str, value: float, 
                              metadata: Dict[str, Any] = None):
        """Record a workflow-specific metric"""
        self.record_metric("workflow", MetricType.WORKFLOW, metric_name, value, 
                          "count", {"workflow_id": workflow_id, **(metadata or {})})
    
    def _update_performance_summary(self, agent_type: str, success: bool, response_time: float):
        """Update agent performance summary"""
        if not self.redis_client:
            return
        
        try:
            key = self._get_performance_key(agent_type)
            
            # Get current performance data
            current_data = self.redis_client.hgetall(key)
            
            # Update counters
            total_requests = int(current_data.get("total_requests", 0)) + 1
            successful_requests = int(current_data.get("successful_requests", 0))
            failed_requests = int(current_data.get("failed_requests", 0))
            
            if success:
                successful_requests += 1
            else:
                failed_requests += 1
            
            # Calculate average response time
            total_response_time = float(current_data.get("total_response_time", 0)) + response_time
            average_response_time = total_response_time / total_requests
            
            # Calculate success rate
            success_rate = (successful_requests / total_requests) * 100
            
            # Update performance data
            performance_data = {
                "total_requests": total_requests,
                "successful_requests": successful_requests,
                "failed_requests": failed_requests,
                "total_response_time": total_response_time,
                "average_response_time": average_response_time,
                "success_rate": success_rate,
                "last_activity": datetime.now().isoformat()
            }
            
            self.redis_client.hset(key, mapping=performance_data)
            
        except Exception as e:
            self.logger.error(f"Error updating performance summary: {str(e)}")
    
    def get_agent_performance(self, agent_type: str) -> Optional[AgentPerformance]:
        """Get performance summary for an agent"""
        if not self.redis_client:
            return None
        
        try:
            key = self._get_performance_key(agent_type)
            data = self.redis_client.hgetall(key)
            
            if not data:
                return None
            
            return AgentPerformance(
                agent_type=agent_type,
                total_requests=int(data.get("total_requests", 0)),
                successful_requests=int(data.get("successful_requests", 0)),
                failed_requests=int(data.get("failed_requests", 0)),
                average_response_time=float(data.get("average_response_time", 0)),
                success_rate=float(data.get("success_rate", 0)),
                last_activity=datetime.fromisoformat(data.get("last_activity", datetime.now().isoformat())),
                metrics=self._get_agent_metrics(agent_type)
            )
            
        except Exception as e:
            self.logger.error(f"Error getting agent performance: {str(e)}")
            return None
    
    def _get_agent_metrics(self, agent_type: str) -> Dict[str, float]:
        """Get latest metrics for an agent"""
        if not self.redis_client:
            return {}
        
        metrics = {}
        
        for metric_type in MetricType:
            key = f"{self._get_metric_key(agent_type, metric_type)}:latest"
            latest_metrics = self.redis_client.hgetall(key)
            
            for name, value in latest_metrics.items():
                try:
                    metrics[f"{metric_type.value}_{name}"] = float(value)
                except (ValueError, TypeError):
                    continue
        
        return metrics
    
    def get_metrics_timeseries(self, agent_type: str, metric_type: MetricType, 
                              name: str, hours: int = 24) -> List[Dict[str, Any]]:
        """Get time series data for a specific metric"""
        if not self.redis_client:
            return []
        
        try:
            key = f"{self._get_metric_key(agent_type, metric_type)}:timeseries"
            
            # Get metrics from the last N hours
            start_time = (datetime.now() - timedelta(hours=hours)).timestamp()
            end_time = datetime.now().timestamp()
            
            # Get metrics in time range
            metrics_data = self.redis_client.zrangebyscore(
                key, start_time, end_time, withscores=True
            )
            
            # Filter by metric name and parse
            timeseries = []
            for metric_json, timestamp in metrics_data:
                try:
                    metric_data = json.loads(metric_json)
                    if metric_data.get("name") == name:
                        timeseries.append({
                            "timestamp": datetime.fromtimestamp(timestamp).isoformat(),
                            "value": metric_data.get("value"),
                            "metadata": metric_data.get("metadata", {})
                        })
                except (json.JSONDecodeError, KeyError):
                    continue
            
            return sorted(timeseries, key=lambda x: x["timestamp"])
            
        except Exception as e:
            self.logger.error(f"Error getting metrics timeseries: {str(e)}")
            return []
    
    def get_all_agents_performance(self) -> List[AgentPerformance]:
        """Get performance summary for all agents"""
        if not self.redis_client:
            return []
        
        try:
            # Get all performance keys
            keys = self.redis_client.keys("monitoring:performance:*")
            performances = []
            
            for key in keys:
                agent_type = key.split(":")[-1]
                performance = self.get_agent_performance(agent_type)
                if performance:
                    performances.append(performance)
            
            return sorted(performances, key=lambda p: p.total_requests, reverse=True)
            
        except Exception as e:
            self.logger.error(f"Error getting all agents performance: {str(e)}")
            return []
    
    def get_workflow_analytics(self) -> Optional[WorkflowAnalytics]:
        """Get workflow analytics summary"""
        if not self.redis_client:
            return None
        
        try:
            # Get workflow metrics
            workflow_metrics = self.redis_client.hgetall(self._get_workflow_analytics_key())
            
            if not workflow_metrics:
                return WorkflowAnalytics(
                    total_workflows=0,
                    completed_workflows=0,
                    failed_workflows=0,
                    average_execution_time=0.0,
                    success_rate=0.0,
                    most_used_templates=[],
                    performance_trends={}
                )
            
            total_workflows = int(workflow_metrics.get("total_workflows", 0))
            completed_workflows = int(workflow_metrics.get("completed_workflows", 0))
            failed_workflows = int(workflow_metrics.get("failed_workflows", 0))
            
            success_rate = (completed_workflows / total_workflows * 100) if total_workflows > 0 else 0
            average_execution_time = float(workflow_metrics.get("average_execution_time", 0))
            
            return WorkflowAnalytics(
                total_workflows=total_workflows,
                completed_workflows=completed_workflows,
                failed_workflows=failed_workflows,
                average_execution_time=average_execution_time,
                success_rate=success_rate,
                most_used_templates=self._get_most_used_templates(),
                performance_trends=self._get_performance_trends()
            )
            
        except Exception as e:
            self.logger.error(f"Error getting workflow analytics: {str(e)}")
            return None
    
    def _get_most_used_templates(self) -> List[Dict[str, Any]]:
        """Get most used workflow templates"""
        if not self.redis_client:
            return []
        
        try:
            # This would be implemented based on actual workflow data
            # For now, return mock data
            return [
                {"template": "feature_development", "count": 45, "success_rate": 92.0},
                {"template": "bug_fix", "count": 23, "success_rate": 87.0},
                {"template": "performance_optimization", "count": 12, "success_rate": 95.0},
                {"template": "security_audit", "count": 8, "success_rate": 100.0}
            ]
        except Exception as e:
            self.logger.error(f"Error getting most used templates: {str(e)}")
            return []
    
    def _get_performance_trends(self) -> Dict[str, List[float]]:
        """Get performance trends over time"""
        if not self.redis_client:
            return {}
        
        try:
            # Get performance trends for the last 7 days
            trends = {}
            
            for agent_type in ["ui_ux", "fullstack", "debugging"]:
                response_times = self.get_metrics_timeseries(
                    agent_type, MetricType.PERFORMANCE, "response_time", hours=24*7
                )
                trends[f"{agent_type}_response_time"] = [m["value"] for m in response_times]
            
            return trends
            
        except Exception as e:
            self.logger.error(f"Error getting performance trends: {str(e)}")
            return {}
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get overall system health status"""
        try:
            agents_performance = self.get_all_agents_performance()
            workflow_analytics = self.get_workflow_analytics()
            
            # Calculate overall health score
            health_score = 0
            total_agents = len(agents_performance)
            
            if total_agents > 0:
                avg_success_rate = sum(p.success_rate for p in agents_performance) / total_agents
                avg_response_time = sum(p.average_response_time for p in agents_performance) / total_agents
                
                # Health score based on success rate and response time
                health_score = avg_success_rate
                if avg_response_time > 1000:  # More than 1 second
                    health_score *= 0.8
                elif avg_response_time > 500:  # More than 500ms
                    health_score *= 0.9
            
            # Determine health status
            if health_score >= 95:
                status = "excellent"
            elif health_score >= 85:
                status = "good"
            elif health_score >= 70:
                status = "fair"
            else:
                status = "poor"
            
            return {
                "status": status,
                "health_score": health_score,
                "total_agents": total_agents,
                "active_agents": len([p for p in agents_performance if p.total_requests > 0]),
                "total_requests": sum(p.total_requests for p in agents_performance),
                "average_success_rate": sum(p.success_rate for p in agents_performance) / total_agents if total_agents > 0 else 0,
                "average_response_time": sum(p.average_response_time for p in agents_performance) / total_agents if total_agents > 0 else 0,
                "workflow_analytics": workflow_analytics.dict() if workflow_analytics else None,
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error getting health status: {str(e)}")
            return {
                "status": "error",
                "health_score": 0,
                "error": str(e),
                "last_updated": datetime.now().isoformat()
            }
    
    def generate_report(self, hours: int = 24) -> Dict[str, Any]:
        """Generate a comprehensive monitoring report"""
        try:
            agents_performance = self.get_all_agents_performance()
            workflow_analytics = self.get_workflow_analytics()
            health_status = self.get_health_status()
            
            # Get top performing agents
            top_agents = sorted(agents_performance, key=lambda p: p.success_rate, reverse=True)[:3]
            
            # Get agents with most requests
            most_active_agents = sorted(agents_performance, key=lambda p: p.total_requests, reverse=True)[:3]
            
            # Get performance trends
            trends = self._get_performance_trends()
            
            return {
                "report_period": f"Last {hours} hours",
                "generated_at": datetime.now().isoformat(),
                "health_status": health_status,
                "summary": {
                    "total_agents": len(agents_performance),
                    "total_requests": sum(p.total_requests for p in agents_performance),
                    "average_success_rate": sum(p.success_rate for p in agents_performance) / len(agents_performance) if agents_performance else 0,
                    "average_response_time": sum(p.average_response_time for p in agents_performance) / len(agents_performance) if agents_performance else 0
                },
                "top_performing_agents": [p.dict() for p in top_agents],
                "most_active_agents": [p.dict() for p in most_active_agents],
                "workflow_analytics": workflow_analytics.dict() if workflow_analytics else None,
                "performance_trends": trends,
                "recommendations": self._generate_recommendations(agents_performance, workflow_analytics)
            }
            
        except Exception as e:
            self.logger.error(f"Error generating report: {str(e)}")
            return {
                "error": str(e),
                "generated_at": datetime.now().isoformat()
            }
    
    def _generate_recommendations(self, agents_performance: List[AgentPerformance], 
                                 workflow_analytics: Optional[WorkflowAnalytics]) -> List[str]:
        """Generate recommendations based on performance data"""
        recommendations = []
        
        # Check for low success rates
        for agent in agents_performance:
            if agent.success_rate < 80:
                recommendations.append(f"Agent {agent.agent_type} has low success rate ({agent.success_rate:.1f}%). Consider investigating error patterns.")
            
            if agent.average_response_time > 1000:
                recommendations.append(f"Agent {agent.agent_type} has slow response time ({agent.average_response_time:.0f}ms). Consider performance optimization.")
        
        # Check workflow analytics
        if workflow_analytics:
            if workflow_analytics.success_rate < 85:
                recommendations.append(f"Workflow success rate is low ({workflow_analytics.success_rate:.1f}%). Review failed workflows for patterns.")
            
            if workflow_analytics.average_execution_time > 300:  # 5 minutes
                recommendations.append(f"Average workflow execution time is high ({workflow_analytics.average_execution_time:.0f}s). Consider optimizing workflow steps.")
        
        # General recommendations
        if not recommendations:
            recommendations.append("All systems are performing well. Continue monitoring for any changes.")
        
        return recommendations
    
    def cleanup_old_metrics(self, days: int = 30):
        """Clean up metrics older than specified days"""
        if not self.redis_client:
            return
        
        try:
            cutoff_time = (datetime.now() - timedelta(days=days)).timestamp()
            
            # Get all metric keys
            metric_keys = self.redis_client.keys("monitoring:metrics:*:timeseries")
            
            for key in metric_keys:
                # Remove old metrics
                removed_count = self.redis_client.zremrangebyscore(key, 0, cutoff_time)
                if removed_count > 0:
                    self.logger.info(f"Cleaned up {removed_count} old metrics from {key}")
            
        except Exception as e:
            self.logger.error(f"Error cleaning up old metrics: {str(e)}")
    
    def flush_metrics(self):
        """Manually flush metrics buffer"""
        self._flush_metrics_buffer()
