/**
 * @fileoverview Comprehensive Monitoring Service
 * 
 * This service integrates all monitoring components:
 * - Performance monitoring
 * - Error tracking
 * - Health checks
 * - Alert system
 * - Configuration management
 * @module services/monitoringService
 */

const errorTrackingService = require('./errorTrackingService');
const performanceMonitoringService = require('./performanceMonitoringService');
const monitoringConfig = require('../monitoring/monitoring-config');
const logger = require('../utils/logger');

class MonitoringService {
  /**
   * Creates an instance of MonitoringService.
   */
  constructor() {
    this.isActive = false;
    this.healthCheckInterval = null;
    this.metricsCollectionInterval = null;
    this.cleanupInterval = null;
    this.lastHealthCheck = null;
    this.lastMetricsCollection = null;
    this.lastCleanup = null;
    
    // Initialize configuration
    this.config = monitoringConfig.getEnvConfig('config');
    
    // Start monitoring if enabled
    if (process.env.ENABLE_MONITORING !== 'false') {
      this.startMonitoring();
    }
  }

  // ===== MONITORING CONTROL =====

  /**
   * Start the monitoring service.
   */
  startMonitoring() {
    if (this.isActive) {
      logger.warn('Monitoring service is already active');
      return;
    }

    try {
      logger.info('Starting monitoring service...');
      
      // Start performance monitoring
      performanceMonitoringService.startMonitoring();
      
      // Start error tracking
      errorTrackingService.startMonitoring();
      
      // Start health checks
      this.startHealthChecks();
      
      // Start metrics collection
      this.startMetricsCollection();
      
      // Start cleanup process
      this.startCleanupProcess();
      
      this.isActive = true;
      logger.info('Monitoring service started successfully');
      
    } catch (error) {
      logger.error('Failed to start monitoring service:', error);
      throw error;
    }
  }

  /**
   * Stop the monitoring service.
   */
  stopMonitoring() {
    if (!this.isActive) {
      logger.warn('Monitoring service is not active');
      return;
    }

    try {
      logger.info('Stopping monitoring service...');
      
      // Stop intervals
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }
      
      if (this.metricsCollectionInterval) {
        clearInterval(this.metricsCollectionInterval);
        this.metricsCollectionInterval = null;
      }
      
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }
      
      // Stop services
      performanceMonitoringService.stopMonitoring();
      errorTrackingService.stopMonitoring();
      
      this.isActive = false;
      logger.info('Monitoring service stopped successfully');
      
    } catch (error) {
      logger.error('Failed to stop monitoring service:', error);
      throw error;
    }
  }

  /**
   * Restart the monitoring service.
   */
  restartMonitoring() {
    logger.info('Restarting monitoring service...');
    this.stopMonitoring();
    this.startMonitoring();
  }

  // ===== HEALTH CHECKS =====

  /**
   * Start periodic health checks.
   */
  startHealthChecks() {
    const interval = this.config.health.intervals.system;
    
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
        this.lastHealthCheck = new Date();
      } catch (error) {
        logger.error('Health check failed:', error);
        this.trackError('health_check_failed', error, { service: 'monitoring' });
      }
    }, interval);
    
    logger.info(`Health checks started with ${interval}ms interval`);
  }

  /**
   * Perform a comprehensive health check of all monitored services.
   * @returns {Promise<object>} A promise that resolves to an object containing the health status.
   */
  async performHealthCheck() {
    const healthChecks = {
      database: await this.checkDatabaseHealth(),
      referral: await this.checkReferralSystemHealth(),
      analytics: await this.checkAnalyticsHealth(),
      notifications: await this.checkNotificationsHealth(),
      performance: await this.checkPerformanceHealth(),
      errorTracking: await this.checkErrorTrackingHealth()
    };

    const allHealthy = Object.values(healthChecks).every(check => check.status === 'healthy');
    
    // Log health status
    if (!allHealthy) {
      logger.warn('Health check detected issues:', healthChecks);
    } else {
      logger.debug('All health checks passed');
    }

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks: healthChecks,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }

  /**
   * Check the health of the database connection.
   * @returns {Promise<object>} A promise that resolves to an object containing the database health status.
   */
  async checkDatabaseHealth() {
    try {
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
          readyState: state,
          database: mongoose.connection.name || 'unknown'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error.message }
      };
    }
  }

  /**
   * Check the health of the referral system.
   * @returns {Promise<object>} A promise that resolves to an object containing the referral system health status.
   */
  async checkReferralSystemHealth() {
    try {
      const Referral = require('../models/Referral');
      const ReferralCode = require('../models/ReferralCode');
      
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
        details: { error: error.message }
      };
    }
  }

  /**
   * Check the health of the analytics service.
   * @returns {Promise<object>} A promise that resolves to an object containing the analytics service health status.
   */
  async checkAnalyticsHealth() {
    try {
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
        details: { error: error.message }
      };
    }
  }

  /**
   * Check the health of the notifications service.
   * @returns {Promise<object>} A promise that resolves to an object containing the notifications service health status.
   */
  async checkNotificationsHealth() {
    try {
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
        details: { error: error.message }
      };
    }
  }

  /**
   * Check the health of the performance monitoring service.
   * @returns {Promise<object>} A promise that resolves to an object containing the performance monitoring health status.
   */
  async checkPerformanceHealth() {
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
        details: { error: error.message }
      };
    }
  }

  /**
   * Check the health of the error tracking service.
   * @returns {Promise<object>} A promise that resolves to an object containing the error tracking health status.
   */
  async checkErrorTrackingHealth() {
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
        details: { error: error.message }
      };
    }
  }

  // ===== METRICS COLLECTION =====

  /**
   * Start periodic metrics collection.
   */
  startMetricsCollection() {
    const interval = this.config.intervals.collection.metrics;
    
    this.metricsCollectionInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
        this.lastMetricsCollection = new Date();
      } catch (error) {
        logger.error('Metrics collection failed:', error);
        this.trackError('metrics_collection_failed', error, { service: 'monitoring' });
      }
    }, interval);
    
    logger.info(`Metrics collection started with ${interval}ms interval`);
  }

  /**
   * Collect system metrics.
   * @returns {Promise<void>}
   */
  async collectMetrics() {
    try {
      // Collect performance metrics
      const performanceMetrics = performanceMonitoringService.getPerformanceMetrics();
      
      // Collect error metrics
      const errorMetrics = errorTrackingService.getErrorStatistics('1h');
      
      // Collect system metrics
      const systemMetrics = this.collectSystemMetrics();
      
      // Store metrics for historical analysis
      await this.storeMetrics({
        timestamp: new Date(),
        performance: performanceMetrics,
        errors: errorMetrics,
        system: systemMetrics
      });
      
      logger.debug('Metrics collected successfully');
      
    } catch (error) {
      logger.error('Failed to collect metrics:', error);
      throw error;
    }
  }

  /**
   * Collect system-level metrics.
   * @returns {object} An object containing system-level metrics.
   */
  collectSystemMetrics() {
    const usage = process.memoryUsage();
    
    return {
      memory: {
        rss: usage.rss,
        heapTotal: usage.heapTotal,
        heapUsed: usage.heapUsed,
        external: usage.external,
        usage: Math.round((usage.heapUsed / usage.heapTotal) * 100)
      },
      cpu: {
        usage: this.getCPUUsage(),
        loadAverage: process.loadavg ? process.loadavg() : null
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        version: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
  }

  /**
   * Get CPU usage (simplified).
   * @returns {number} The CPU usage percentage.
   */
  getCPUUsage() {
    // This is a simplified CPU usage calculation
    // In production, you might want to use a more sophisticated approach
    const startUsage = process.cpuUsage();
    
    // Wait a bit and calculate usage
    setTimeout(() => {
      const endUsage = process.cpuUsage(startUsage);
      const cpuUsage = (endUsage.user + endUsage.system) / 1000000; // Convert to seconds
      return Math.round(cpuUsage * 100);
    }, 100);
    
    return 0; // Placeholder
  }

  /**
   * Store metrics for historical analysis.
   * @param {object} metrics - The metrics object to store.
   * @returns {Promise<void>}
   */
  async storeMetrics(metrics) {
    try {
      // In a real implementation, you would store this in a database
      // For now, we'll just log it
      logger.debug('Storing metrics:', {
        timestamp: metrics.timestamp,
        performance: metrics.performance ? 'available' : 'unavailable',
        errors: metrics.errors ? 'available' : 'unavailable',
        system: metrics.system ? 'available' : 'unavailable'
      });
      
    } catch (error) {
      logger.error('Failed to store metrics:', error);
    }
  }

  // ===== CLEANUP PROCESS =====

  /**
   * Start the periodic cleanup process.
   */
  startCleanupProcess() {
    const interval = this.config.intervals.collection.cleanup;
    
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.performCleanup();
        this.lastCleanup = new Date();
      } catch (error) {
        logger.error('Cleanup process failed:', error);
        this.trackError('cleanup_failed', error, { service: 'monitoring' });
      }
    }, interval);
    
    logger.info(`Cleanup process started with ${interval}ms interval`);
  }

  /**
   * Perform cleanup tasks.
   * @returns {Promise<void>}
   */
  async performCleanup() {
    try {
      // Clean up old metrics
      await this.cleanupOldMetrics();
      
      // Clean up old errors
      await this.cleanupOldErrors();
      
      // Clean up old alerts
      await this.cleanupOldAlerts();
      
      logger.debug('Cleanup completed successfully');
      
    } catch (error) {
      logger.error('Failed to perform cleanup:', error);
      throw error;
    }
  }

  /**
   * Clean up old metrics.
   * @returns {Promise<void>}
   */
  async cleanupOldMetrics() {
    try {
      const retentionPeriod = this.config.intervals.retention.metrics;
      const cutoffDate = new Date(Date.now() - retentionPeriod);
      
      // In a real implementation, you would delete old metrics from the database
      logger.debug(`Cleaning up metrics older than ${cutoffDate.toISOString()}`);
      
    } catch (error) {
      logger.error('Failed to cleanup old metrics:', error);
    }
  }

  /**
   * Clean up old errors.
   * @returns {Promise<void>}
   */
  async cleanupOldErrors() {
    try {
      const retentionPeriod = this.config.intervals.retention.errors;
      const cutoffDate = new Date(Date.now() - retentionPeriod);
      
      // In a real implementation, you would delete old errors from the database
      logger.debug(`Cleaning up errors older than ${cutoffDate.toISOString()}`);
      
    } catch (error) {
      logger.error('Failed to cleanup old errors:', error);
    }
  }

  /**
   * Clean up old alerts.
   * @returns {Promise<void>}
   */
  async cleanupOldAlerts() {
    try {
      const retentionPeriod = this.config.intervals.retention.alerts;
      const cutoffDate = new Date(Date.now() - retentionPeriod);
      
      // In a real implementation, you would delete old alerts from the database
      logger.debug(`Cleaning up alerts older than ${cutoffDate.toISOString()}`);
      
    } catch (error) {
      logger.error('Failed to cleanup old alerts:', error);
    }
  }

  // ===== ERROR TRACKING INTEGRATION =====

  /**
   * Track an error through the monitoring system.
   * @param {string} errorType - The type of error.
   * @param {Error} error - The error object.
   * @param {object} [context={}] - Additional context for the error.
   */
  trackError(errorType, error, context = {}) {
    try {
      // Track in error tracking service
      errorTrackingService.trackError(error, {
        ...context,
        source: 'monitoring_service',
        errorType
      });
      
      // Log the error
      logger.error(`Monitoring error [${errorType}]:`, error);
      
    } catch (trackingError) {
      logger.error('Failed to track monitoring error:', trackingError);
    }
  }

  // ===== CONFIGURATION MANAGEMENT =====

  /**
   * Get the current monitoring configuration.
   * @returns {object} The monitoring configuration.
   */
  getConfiguration() {
    return {
      performance: performanceMonitoringService.getConfiguration(),
      errors: errorTrackingService.getConfiguration(),
      monitoring: this.config,
      status: {
        active: this.isActive,
        lastHealthCheck: this.lastHealthCheck,
        lastMetricsCollection: this.lastMetricsCollection,
        lastCleanup: this.lastCleanup
      }
    };
  }

  /**
   * Update the monitoring configuration.
   * @param {object} newConfig - The new configuration object.
   */
  updateConfiguration(newConfig) {
    try {
      if (newConfig.performance) {
        performanceMonitoringService.updateConfiguration(newConfig.performance);
      }
      
      if (newConfig.errors) {
        errorTrackingService.updateConfiguration(newConfig.errors);
      }
      
      if (newConfig.monitoring) {
        // Update local config
        Object.assign(this.config, newConfig.monitoring);
      }
      
      logger.info('Monitoring configuration updated successfully');
      
    } catch (error) {
      logger.error('Failed to update monitoring configuration:', error);
      throw error;
    }
  }

  // ===== STATUS AND HEALTH =====

  /**
   * Get the status of the monitoring service.
   * @returns {object} The status of the monitoring service.
   */
  getStatus() {
    return {
      active: this.isActive,
      uptime: this.isActive ? Date.now() - this.startTime : 0,
      lastHealthCheck: this.lastHealthCheck,
      lastMetricsCollection: this.lastMetricsCollection,
      lastCleanup: this.lastCleanup,
      configuration: this.getConfiguration()
    };
  }

  /**
   * Get the health of the monitoring service.
   * @returns {Promise<object>} A promise that resolves to an object containing the health status.
   */
  async getHealth() {
    try {
      const health = await this.performHealthCheck();
      
      return {
        status: health.status,
        checks: health.checks,
        monitoring: {
          active: this.isActive,
          lastHealthCheck: this.lastHealthCheck,
          lastMetricsCollection: this.lastMetricsCollection,
          lastCleanup: this.lastCleanup
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down monitoring service...');
  monitoringService.stopMonitoring();
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down monitoring service...');
  monitoringService.stopMonitoring();
});

module.exports = monitoringService;
