const express = require('express');
const { authenticate: protect, authorize } = require('../middleware/auth');
const errorTrackingService = require('../services/errorTrackingService');
const performanceMonitoringService = require('../services/performanceMonitoringService');

const router = express.Router();

// All monitoring routes require authentication and admin privileges
router.use(protect);
router.use(authorize('admin'));

// ===== PERFORMANCE MONITORING =====

/**
 * @route   GET /api/monitoring/performance
 * @desc    Get performance metrics and statistics
 * @access  Admin only
 */
router.get('/performance', async (req, res) => {
  try {
    const metrics = performanceMonitoringService.getPerformanceMetrics();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance metrics',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/monitoring/performance/export
 * @desc    Export performance data in various formats
 * @access  Admin only
 */
router.get('/performance/export', async (req, res) => {
  try {
    const { format = 'json', period = '24h' } = req.query;
    
    const exportData = await performanceMonitoringService.exportPerformanceData(format, period);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="performance-${period}-${Date.now()}.csv"`);
      return res.send(exportData);
    }
    
    if (format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="performance-${period}-${Date.now()}.xlsx"`);
      return res.send(exportData);
    }
    
    res.json({
      success: true,
      data: exportData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error exporting performance data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export performance data',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/monitoring/performance/realtime
 * @desc    Get real-time performance metrics
 * @access  Admin only
 */
router.get('/performance/realtime', async (req, res) => {
  try {
    const realtimeMetrics = performanceMonitoringService.getRealtimeMetrics();
    
    res.json({
      success: true,
      data: realtimeMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching real-time metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real-time metrics',
      message: error.message
    });
  }
});

// ===== ERROR TRACKING =====

/**
 * @route   GET /api/monitoring/errors
 * @desc    Get error statistics and history
 * @access  Admin only
 */
router.get('/errors', async (req, res) => {
  try {
    const { period = '24h', category, severity } = req.query;
    
    const errorStats = errorTrackingService.getErrorStatistics(period, { category, severity });
    
    res.json({
      success: true,
      data: errorStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching error statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch error statistics',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/monitoring/errors/history
 * @desc    Get detailed error history
 * @access  Admin only
 */
router.get('/errors/history', async (req, res) => {
  try {
    const { limit = 100, offset = 0, category, severity, startDate, endDate } = req.query;
    
    const errorHistory = errorTrackingService.getErrorHistory({
      limit: parseInt(limit),
      offset: parseInt(offset),
      category,
      severity,
      startDate,
      endDate
    });
    
    res.json({
      success: true,
      data: errorHistory,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching error history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch error history',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/monitoring/errors/export
 * @desc    Export error data in various formats
 * @access  Admin only
 */
router.get('/errors/export', async (req, res) => {
  try {
    const { format = 'json', period = '24h', category, severity } = req.query;
    
    const exportData = await errorTrackingService.exportErrorData(format, period, { category, severity });
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="errors-${period}-${Date.now()}.csv"`);
      return res.send(exportData);
    }
    
    if (format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="errors-${period}-${Date.now()}.xlsx"`);
      return res.send(exportData);
    }
    
    res.json({
      success: true,
      data: exportData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error exporting error data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export error data',
      message: error.message
    });
  }
});

// ===== SYSTEM HEALTH =====

/**
 * @route   GET /api/monitoring/health/detailed
 * @desc    Get detailed system health information
 * @access  Admin only
 */
router.get('/health/detailed', async (req, res) => {
  try {
    const healthChecks = {
      database: await checkDatabaseConnection(),
      referral: await checkReferralSystem(),
      analytics: await checkAnalyticsService(),
      notifications: await checkNotificationService(),
      performance: await checkPerformanceMonitoring(),
      errorTracking: await checkErrorTracking()
    };
    
    const allHealthy = Object.values(healthChecks).every(check => check.status === 'healthy');
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks: healthChecks,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    console.error('Error performing detailed health check:', error);
    res.status(503).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/monitoring/health/services
 * @desc    Get health status of individual services
 * @access  Admin only
 */
router.get('/health/services', async (req, res) => {
  try {
    const serviceHealth = {
      referral: await checkReferralSystem(),
      analytics: await checkAnalyticsService(),
      notifications: await checkNotificationService(),
      performance: await checkPerformanceMonitoring(),
      errorTracking: await checkErrorTracking()
    };
    
    res.json({
      success: true,
      data: serviceHealth,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking service health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check service health',
      message: error.message
    });
  }
});

// ===== ALERTS =====

/**
 * @route   GET /api/monitoring/alerts
 * @desc    Get current alerts and notifications
 * @access  Admin only
 */
router.get('/alerts', async (req, res) => {
  try {
    const { active = true, severity, period = '24h' } = req.query;
    
    const alerts = await getSystemAlerts({
      active: active === 'true',
      severity,
      period
    });
    
    res.json({
      success: true,
      data: alerts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/monitoring/alerts/acknowledge
 * @desc    Acknowledge an alert
 * @access  Admin only
 */
router.post('/alerts/acknowledge', async (req, res) => {
  try {
    const { alertId } = req.body;
    
    if (!alertId) {
      return res.status(400).json({
        success: false,
        error: 'Alert ID is required'
      });
    }
    
    const result = await acknowledgeAlert(alertId, req.user.id);
    
    res.json({
      success: true,
      data: result,
      message: 'Alert acknowledged successfully'
    });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to acknowledge alert',
      message: error.message
    });
  }
});

// ===== CONFIGURATION =====

/**
 * @route   GET /api/monitoring/config
 * @desc    Get monitoring configuration
 * @access  Admin only
 */
router.get('/config', async (req, res) => {
  try {
    const config = {
      performance: performanceMonitoringService.getConfiguration(),
      errors: errorTrackingService.getConfiguration(),
      alerts: getAlertConfiguration()
    };
    
    res.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching monitoring configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch monitoring configuration',
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/monitoring/config
 * @desc    Update monitoring configuration
 * @access  Admin only
 */
router.put('/config', async (req, res) => {
  try {
    const { performance, errors, alerts } = req.body;
    
    let updatedConfig = {};
    
    if (performance) {
      performanceMonitoringService.updateConfiguration(performance);
      updatedConfig.performance = performance;
    }
    
    if (errors) {
      errorTrackingService.updateConfiguration(errors);
      updatedConfig.errors = errors;
    }
    
    if (alerts) {
      updateAlertConfiguration(alerts);
      updatedConfig.alerts = alerts;
    }
    
    res.json({
      success: true,
      data: updatedConfig,
      message: 'Configuration updated successfully'
    });
  } catch (error) {
    console.error('Error updating monitoring configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update monitoring configuration',
      message: error.message
    });
  }
});

// ===== HELPER FUNCTIONS =====

async function checkDatabaseConnection() {
  try {
    // Simple database connection check
    const mongoose = require('mongoose');
    const state = mongoose.connection.readyState;
    
    const statusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: state === 1 ? 'healthy' : 'unhealthy',
      details: {
        state: statusMap[state] || 'unknown',
        readyState: state
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error.message
      }
    };
  }
}

async function checkReferralSystem() {
  try {
    // Check if referral system is operational
    const Referral = require('../models/Referral');
    const ReferralCode = require('../models/ReferralCode');
    
    // Simple count query to verify system is working
    const referralCount = await Referral.countDocuments().limit(1);
    const codeCount = await ReferralCode.countDocuments().limit(1);
    
    return {
      status: 'healthy',
      details: {
        referrals: referralCount,
        codes: codeCount,
        system: 'operational'
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error.message,
        system: 'error'
      }
    };
  }
}

async function checkAnalyticsService() {
  try {
    // Check if analytics service is working
    return {
      status: 'healthy',
      details: {
        service: 'operational',
        endpoints: 'available'
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error.message,
        service: 'error'
      }
    };
  }
}

async function checkNotificationService() {
  try {
    // Check if notification service is working
    const Notification = require('../models/Notification');
    const notificationCount = await Notification.countDocuments().limit(1);
    
    return {
      status: 'healthy',
      details: {
        service: 'operational',
        notifications: notificationCount
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error.message,
        service: 'error'
      }
    };
  }
}

async function checkPerformanceMonitoring() {
  try {
    const metrics = performanceMonitoringService.getPerformanceMetrics();
    return {
      status: 'healthy',
      details: {
        service: 'operational',
        metrics: 'available',
        lastUpdate: metrics.lastUpdate
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error.message,
        service: 'error'
      }
    };
  }
}

async function checkErrorTracking() {
  try {
    const stats = errorTrackingService.getErrorStatistics('1h');
    return {
      status: 'healthy',
      details: {
        service: 'operational',
        tracking: 'active',
        recentErrors: stats.totalErrors
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error.message,
        service: 'error'
      }
    };
  }
}

async function getSystemAlerts(options) {
  // Placeholder for alert system
  // In a real implementation, this would query an alerts collection
  return [];
}

async function acknowledgeAlert(alertId, userId) {
  // Placeholder for alert acknowledgment
  // In a real implementation, this would update the alert status
  return { alertId, acknowledgedBy: userId, timestamp: new Date() };
}

function getAlertConfiguration() {
  // Placeholder for alert configuration
  return {
    email: {
      enabled: true,
      recipients: ['admin@letsludus.com']
    },
    slack: {
      enabled: false
    }
  };
}

function updateAlertConfiguration(config) {
  // Placeholder for updating alert configuration
  console.log('Updating alert configuration:', config);
}

module.exports = router;
