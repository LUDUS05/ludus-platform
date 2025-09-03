import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Button, Badge, ProgressBar, Spinner } from '../ui';
import referralService from '../../services/referralService';
import analyticsService from '../../services/analyticsService';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  DollarSign, 
  Eye, 
  FileText, 
  Heart, 
  TrendingUp, 
  Users, 
  Zap 
} from 'lucide-react';

const SystemMonitoringDashboard = () => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [referralMetrics, setReferralMetrics] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [errorMetrics, setErrorMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // ===== DATA FETCHING =====

  const fetchSystemStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/health');
      const healthData = await response.json();
      setSystemHealth(healthData);
      
      // Check for alerts
      checkForAlerts(healthData, referralMetrics, performanceMetrics);
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      setSystemHealth({ status: 'error', error: error.message });
    }
  }, [referralMetrics, performanceMetrics]);

  const fetchReferralMetrics = useCallback(async () => {
    try {
      const metrics = await referralService.getReferralAnalytics('24h');
      setReferralMetrics(metrics);
    } catch (error) {
      console.error('Failed to fetch referral metrics:', error);
    }
  }, []);

  const fetchPerformanceMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/monitoring/performance');
      const performanceData = await response.json();
      setPerformanceMetrics(performanceData);
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    }
  }, []);

  const fetchErrorMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/monitoring/errors');
      const errorData = await response.json();
      setErrorMetrics(errorData);
    } catch (error) {
      console.error('Failed to fetch error metrics:', error);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSystemStatus(),
        fetchReferralMetrics(),
        fetchPerformanceMetrics(),
        fetchErrorMetrics()
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchSystemStatus, fetchReferralMetrics, fetchPerformanceMetrics, fetchErrorMetrics]);

  // ===== ALERT SYSTEM =====

  const checkForAlerts = useCallback((health, referral, performance) => {
    const newAlerts = [];
    
    // System health alerts
    if (health?.status !== 'healthy') {
      newAlerts.push({
        id: 'system-health',
        type: 'critical',
        title: 'System Health Issue',
        message: `System status: ${health?.status || 'unknown'}`,
        timestamp: new Date()
      });
    }

    // Performance alerts
    if (performance) {
      if (performance.responseTime?.p95 > 3000) {
        newAlerts.push({
          id: 'high-response-time',
          type: 'warning',
          title: 'High Response Time',
          message: `P95 response time: ${performance.responseTime.p95}ms`,
          timestamp: new Date()
        });
      }

      if (performance.errorRate > 5) {
        newAlerts.push({
          id: 'high-error-rate',
          type: 'critical',
          title: 'High Error Rate',
          message: `Error rate: ${performance.errorRate}%`,
          timestamp: new Date()
        });
      }
    }

    // Referral system alerts
    if (referral) {
      if (referral.conversionRate < 5) {
        newAlerts.push({
          id: 'low-conversion',
          type: 'warning',
          title: 'Low Conversion Rate',
          message: `Conversion rate: ${referral.conversionRate}%`,
          timestamp: new Date()
        });
      }
    }

    setAlerts(prevAlerts => {
      const existingIds = new Set(prevAlerts.map(a => a.id));
      const newUniqueAlerts = newAlerts.filter(alert => !existingIds.has(alert.id));
      return [...prevAlerts, ...newUniqueAlerts];
    });
  }, []);

  const dismissAlert = (alertId) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
  };

  // ===== AUTO-REFRESH =====

  useEffect(() => {
    fetchAllData();

    if (autoRefresh) {
      const interval = setInterval(fetchAllData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAllData, autoRefresh, refreshInterval]);

  // ===== UTILITY FUNCTIONS =====

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'operational':
      case 'active':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
      case 'error':
      case 'unhealthy':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
      case 'operational':
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
      case 'error':
      case 'unhealthy':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ===== RENDER COMPONENTS =====

  if (loading && !systemHealth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading system monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring of the LUDUS Referral System</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="auto-refresh" className="text-sm text-gray-600">
              Auto-refresh
            </label>
          </div>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>1m</option>
            <option value={300000}>5m</option>
          </select>
          <Button onClick={fetchAllData} disabled={loading}>
            {loading ? <Spinner size="sm" /> : <Eye className="w-4 h-4" />}
            Refresh
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-sm text-gray-500 text-center">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              type={alert.type}
              title={alert.title}
              onClose={() => dismissAlert(alert.id)}
            >
              {alert.message}
              <div className="text-xs text-gray-500 mt-1">
                {alert.timestamp.toLocaleString()}
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemHealth?.status || 'Unknown'}
              </p>
            </div>
            {getStatusIcon(systemHealth?.status)}
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              Uptime: {systemHealth?.uptime ? formatUptime(systemHealth.uptime) : 'N/A'}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Environment</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemHealth?.environment || 'Unknown'}
              </p>
            </div>
            <Badge variant={systemHealth?.environment === 'production' ? 'success' : 'warning'}>
              {systemHealth?.environment || 'Unknown'}
            </Badge>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-500">
              <FileText className="w-4 h-4 mr-1" />
              Version: {systemHealth?.version || 'N/A'}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Database</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemHealth?.services?.database || 'Unknown'}
              </p>
            </div>
            <Database className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-500">
              <Heart className="w-4 h-4 mr-1" />
              Status: {systemHealth?.services?.database || 'Unknown'}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Referral System</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemHealth?.services?.referral || 'Unknown'}
              </p>
            </div>
            <Users className="w-5 h-5 text-green-500" />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-500">
              <Activity className="w-4 h-4 mr-1" />
              Status: {systemHealth?.referral?.system || 'Unknown'}
            </div>
          </div>
        </Card>
      </div>

      {/* Service Status Grid */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemHealth?.services && Object.entries(systemHealth.services).map(([service, status]) => (
            <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="capitalize font-medium text-gray-700">{service}</span>
              </div>
              <Badge variant={getStatusColor(status)}>
                {status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Performance Metrics */}
      {performanceMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Response Times</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>P50 (Median)</span>
                  <span>{performanceMetrics.responseTime?.p50 || 0}ms</span>
                </div>
                <ProgressBar 
                  value={Math.min((performanceMetrics.responseTime?.p50 || 0) / 1000 * 100, 100)} 
                  variant="success"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>P95</span>
                  <span>{performanceMetrics.responseTime?.p95 || 0}ms</span>
                </div>
                <ProgressBar 
                  value={Math.min((performanceMetrics.responseTime?.p95 || 0) / 2000 * 100, 100)} 
                  variant={performanceMetrics.responseTime?.p95 > 1000 ? "warning" : "success"}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>P99</span>
                  <span>{performanceMetrics.responseTime?.p99 || 0}ms</span>
                </div>
                <ProgressBar 
                  value={Math.min((performanceMetrics.responseTime?.p99 || 0) / 3000 * 100, 100)} 
                  variant={performanceMetrics.responseTime?.p99 > 2000 ? "danger" : "success"}
                />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Resources</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Memory Usage</span>
                  <span>{performanceMetrics.memory?.usage || 0}%</span>
                </div>
                <ProgressBar 
                  value={performanceMetrics.memory?.usage || 0} 
                  variant={performanceMetrics.memory?.usage > 80 ? "danger" : performanceMetrics.memory?.usage > 60 ? "warning" : "success"}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>CPU Usage</span>
                  <span>{performanceMetrics.cpu?.usage || 0}%</span>
                </div>
                <ProgressBar 
                  value={performanceMetrics.cpu?.usage || 0} 
                  variant={performanceMetrics.cpu?.usage > 80 ? "danger" : performanceMetrics.cpu?.usage > 60 ? "warning" : "success"}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Error Rate</span>
                  <span>{performanceMetrics.errorRate || 0}%</span>
                </div>
                <ProgressBar 
                  value={performanceMetrics.errorRate || 0} 
                  variant={performanceMetrics.errorRate > 5 ? "danger" : performanceMetrics.errorRate > 2 ? "warning" : "success"}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Referral System Metrics */}
      {referralMetrics && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Referral System Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{referralMetrics.totalReferrals || 0}</p>
              <p className="text-sm text-blue-600">Total Referrals</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{referralMetrics.conversionRate || 0}%</p>
              <p className="text-sm text-green-600">Conversion Rate</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-900">{referralMetrics.totalRewards || 0}</p>
              <p className="text-sm text-yellow-600">Total Rewards</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-900">{referralMetrics.activeUsers || 0}</p>
              <p className="text-sm text-purple-600">Active Users</p>
            </div>
          </div>
        </Card>
      )}

      {/* Error Tracking */}
      {errorMetrics && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Error Tracking</h2>
          <div className="space-y-4">
            {errorMetrics.categories && Object.entries(errorMetrics.categories).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="capitalize font-medium text-gray-700">{category.replace(/_/g, ' ')}</span>
                </div>
                <Badge variant="danger">{count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" onClick={() => window.open('/api/health', '_blank')}>
            <FileText className="w-4 h-4 mr-2" />
            View Health API
          </Button>
          <Button variant="outline" onClick={() => window.open('/api/monitoring/performance', '_blank')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance Data
          </Button>
          <Button variant="outline" onClick={() => window.open('/api/monitoring/errors', '_blank')}>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Error Logs
          </Button>
          <Button variant="outline" onClick={() => window.open('/api/analytics/referrals', '_blank')}>
            <Activity className="w-4 h-4 mr-2" />
            Referral Analytics
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SystemMonitoringDashboard;
