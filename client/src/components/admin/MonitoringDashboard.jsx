import React, { useState, useEffect } from 'react';
import { Card, Alert, Button, Badge, ProgressBar } from '../ui';
import analyticsService from '../../services/analyticsService';
import referralService from '../../services/referralService';

const MonitoringDashboard = () => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [referralMetrics, setReferralMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch system health and metrics
  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      
      // Fetch system health
      const healthResponse = await fetch('/health');
      const healthData = await healthResponse.json();
      setSystemHealth(healthData);
      
      // Fetch referral metrics
      const metricsData = await referralService.getReferralAnalytics('7d');
      setReferralMetrics(metricsData.data);
      
      // Check for potential issues
      checkForAlerts(healthData, metricsData.data);
      
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to fetch system status');
      console.error('Error fetching system status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check for system alerts
  const checkForAlerts = (health, metrics) => {
    const newAlerts = [];
    
    // Check system health
    if (health.status !== 'healthy') {
      newAlerts.push({
        type: 'error',
        message: 'System health check failed',
        timestamp: new Date()
      });
    }
    
    // Check referral system
    if (health.services?.referral !== 'active') {
      newAlerts.push({
        type: 'warning',
        message: 'Referral system is not responding',
        timestamp: new Date()
      });
    }
    
    // Check for unusual activity
    if (metrics) {
      const conversionRate = metrics.overview?.conversionRate || 0;
      if (conversionRate < 5) {
        newAlerts.push({
          type: 'warning',
          message: `Low conversion rate: ${conversionRate.toFixed(2)}%`,
          timestamp: new Date()
        });
      }
      
      const totalReferrals = metrics.overview?.totalReferrals || 0;
      if (totalReferrals === 0) {
        newAlerts.push({
          type: 'info',
          message: 'No referral activity in the last 7 days',
          timestamp: new Date()
        });
      }
    }
    
    setAlerts(newAlerts);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchSystemStatus();
    
    const interval = setInterval(fetchSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Manual refresh
  const handleRefresh = () => {
    fetchSystemStatus();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'active':
      case 'operational':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Get uptime in human readable format
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading && !systemHealth) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading system status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600">Real-time monitoring of the referral system</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            🔄 Refresh
          </Button>
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert
              key={index}
              type={alert.type}
              title={alert.message}
              description={`Detected at ${alert.timestamp.toLocaleTimeString()}`}
            />
          ))}
        </div>
      )}

      {/* System Health Overview */}
      {systemHealth && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {systemHealth.status === 'healthy' ? '🟢' : '🔴'}
                </div>
                <div className="text-sm text-gray-600">Overall Status</div>
                <Badge variant={getStatusColor(systemHealth.status)}>
                  {systemHealth.status}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatUptime(systemHealth.uptime)}
                </div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {systemHealth.environment}
                </div>
                <div className="text-sm text-gray-600">Environment</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  v{systemHealth.version}
                </div>
                <div className="text-sm text-gray-600">Version</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Service Status */}
      {systemHealth?.services && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Service Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(systemHealth.services).map(([service, status]) => (
                <div key={service} className="text-center">
                  <div className="text-lg mb-2">
                    {status === 'active' || status === 'connected' ? '🟢' : '🔴'}
                  </div>
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {service.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <Badge variant={getStatusColor(status)} size="sm">
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Referral System Status */}
      {systemHealth?.referral && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Referral System Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(systemHealth.referral).map(([component, status]) => (
                <div key={component} className="text-center">
                  <div className="text-lg mb-2">
                    {status === 'operational' || status === 'active' || status === 'enabled' ? '🟢' : '🟡'}
                  </div>
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {component.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <Badge variant={getStatusColor(status)} size="sm">
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Referral Metrics */}
      {referralMetrics && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Referral Metrics (Last 7 Days)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {referralMetrics.overview?.totalReferrals || 0}
                </div>
                <div className="text-sm text-gray-600">Total Referrals</div>
                <ProgressBar 
                  value={referralMetrics.overview?.totalReferrals || 0} 
                  max={100} 
                  className="mt-2"
                />
              </div>
              
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {referralMetrics.overview?.conversionRate?.toFixed(2) || 0}%
                </div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
                <ProgressBar 
                  value={referralMetrics.overview?.conversionRate || 0} 
                  max={100} 
                  className="mt-2"
                />
              </div>
              
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {referralMetrics.overview?.totalRevenue || 0} SAR
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
                <ProgressBar 
                  value={referralMetrics.overview?.totalRevenue || 0} 
                  max={1000} 
                  className="mt-2"
                />
              </div>
              
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {referralMetrics.overview?.activeReferrers || 0}
                </div>
                <div className="text-sm text-gray-600">Active Referrers</div>
                <ProgressBar 
                  value={referralMetrics.overview?.activeReferrers || 0} 
                  max={100} 
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Performance Metrics */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {systemHealth?.uptime ? Math.floor(systemHealth.uptime / 3600) : 0}h
              </div>
              <div className="text-sm text-gray-600">Server Uptime</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {alerts.filter(a => a.type === 'error').length}
              </div>
              <div className="text-sm text-gray-600">Active Errors</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {referralMetrics?.overview?.totalReferrals || 0}
              </div>
              <div className="text-sm text-gray-600">Today's Referrals</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert
          type="error"
          title="Error"
          description={error}
        />
      )}
    </div>
  );
};

export default MonitoringDashboard;
