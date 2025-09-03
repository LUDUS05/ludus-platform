/**
 * Performance Monitoring Integration Service
 * 
 * This service integrates all performance monitoring components:
 * - Performance monitoring service
 * - Error tracking service
 * - Rate limiting service
 * - Caching service
 * - Database optimization service
 * - QR code optimization service
 * 
 * Provides unified monitoring, alerts, and performance insights
 */

const performanceMonitoringService = require('./performanceMonitoringService');
const errorTrackingService = require('./errorTrackingService');
const rateLimitingService = require('./rateLimitingService');
const cachingService = require('./cachingService');
const databaseOptimizationService = require('./databaseOptimizationService');
const qrCodeOptimizationService = require('./qrCodeOptimizationService');
const logger = require('../utils/logger');

class PerformanceMonitoringIntegrationService {
  constructor() {
    this.services = {
      performance: performanceMonitoringService,
      errors: errorTrackingService,
      rateLimiting: rateLimitingService,
      caching: cachingService,
      database: databaseOptimizationService,
      qrCode: qrCodeOptimizationService
    };
    
    this.integrationStats = {
      lastIntegrationCheck: null,
      integrationStatus: 'initializing',
      serviceHealth: {},
      overallHealth: 'unknown',
      alerts: [],
      performanceMetrics: {}
    };
    
    // Initialize integration
    this.initializeIntegration();
  }

  // ===== INITIALIZATION =====

  /**
   * Initialize performance monitoring integration
   */
  async initializeIntegration() {
    try {
      logger.info('Initializing performance monitoring integration...');
      
      // Start monitoring all services
      await this.startAllMonitoring();
      
      // Perform initial health check
      await this.performIntegrationHealthCheck();
      
      // Start periodic integration checks
      this.startPeriodicChecks();
      
      logger.info('Performance monitoring integration initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize performance monitoring integration:', error);
      this.integrationStats.integrationStatus = 'error';
    }
  }

  /**
   * Start monitoring for all services
   */
  async startAllMonitoring() {
    try {
      // Start performance monitoring
      if (this.services.performance.startMonitoring) {
        this.services.performance.startMonitoring();
      }
      
      // Start error tracking
      if (this.services.errors.startMonitoring) {
        this.services.errors.startMonitoring();
      }
      
      // Start rate limiting monitoring
      if (this.services.rateLimiting.startMonitoring) {
        this.services.rateLimiting.startMonitoring();
      }
      
      // Start caching monitoring
      if (this.services.caching.startMonitoring) {
        this.services.caching.startMonitoring();
      }
      
      // Start database optimization monitoring
      if (this.services.database.startMonitoring) {
        this.services.database.startMonitoring();
      }
      
      // Start QR code optimization monitoring
      if (this.services.qrCode.startMonitoring) {
        this.services.qrCode.startMonitoring();
      }
      
      logger.info('All monitoring services started');
      
    } catch (error) {
      logger.error('Failed to start all monitoring services:', error);
      throw error;
    }
  }

  /**
   * Start periodic integration checks
   */
  startPeriodicChecks() {
    // Health check every 5 minutes
    setInterval(async () => {
      await this.performIntegrationHealthCheck();
    }, 5 * 60 * 1000);
    
    // Performance metrics collection every minute
    setInterval(async () => {
      await this.collectPerformanceMetrics();
    }, 60 * 1000);
    
    // Alert check every 30 seconds
    setInterval(async () => {
      await this.checkForAlerts();
    }, 30 * 1000);
    
    logger.info('Periodic integration checks started');
  }

  // ===== INTEGRATION HEALTH CHECKS =====

  /**
   * Perform comprehensive integration health check
   */
  async performIntegrationHealthCheck() {
    try {
      logger.debug('Performing integration health check...');
      
      const healthChecks = await Promise.allSettled([
        this.checkPerformanceServiceHealth(),
        this.checkErrorTrackingHealth(),
        this.checkRateLimitingHealth(),
        this.checkCachingHealth(),
        this.checkDatabaseHealth(),
        this.checkQRCodeServiceHealth()
      ]);
      
      // Process health check results
      const serviceHealth = {};
      let overallStatus = 'healthy';
      let errorCount = 0;
      
      const serviceNames = Object.keys(this.services);
      healthChecks.forEach((result, index) => {
        const serviceName = serviceNames[index];
        
        if (result.status === 'fulfilled') {
          serviceHealth[serviceName] = result.value;
          if (result.value.status === 'unhealthy') {
            overallStatus = 'degraded';
            errorCount++;
          }
        } else {
          serviceHealth[serviceName] = {
            status: 'error',
            error: result.reason.message,
            timestamp: new Date().toISOString()
          };
          overallStatus = 'unhealthy';
          errorCount++;
        }
      });
      
      // Update integration stats
      this.integrationStats.serviceHealth = serviceHealth;
      this.integrationStats.overallHealth = overallStatus;
      this.integrationStats.lastIntegrationCheck = new Date();
      this.integrationStats.integrationStatus = 'active';
      
      logger.info(`Integration health check completed. Overall status: ${overallStatus}, Errors: ${errorCount}`);
      
      return {
        overallStatus,
        serviceHealth,
        errorCount,
        timestamp: this.integrationStats.lastIntegrationCheck
      };
      
    } catch (error) {
      logger.error('Integration health check failed:', error);
      this.integrationStats.integrationStatus = 'error';
      this.integrationStats.overallHealth = 'unhealthy';
      
      return {
        overallStatus: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check performance service health
   */
  async checkPerformanceServiceHealth() {
    try {
      if (this.services.performance.getHealth) {
        return await this.services.performance.getHealth();
      }
      return { status: 'unknown', message: 'Health check method not available' };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Check error tracking health
   */
  async checkErrorTrackingHealth() {
    try {
      if (this.services.errors.getHealth) {
        return await this.services.errors.getHealth();
      }
      return { status: 'unknown', message: 'Health check method not available' };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Check rate limiting health
   */
  async checkRateLimitingHealth() {
    try {
      if (this.services.rateLimiting.getHealth) {
        return await this.services.rateLimiting.getHealth();
      }
      return { status: 'unknown', message: 'Health check method not available' };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Check caching health
   */
  async checkCachingHealth() {
    try {
      if (this.services.caching.getHealth) {
        return await this.services.caching.getHealth();
      }
      return { status: 'unknown', message: 'Health check method not available' };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth() {
    try {
      if (this.services.database.getConnectionStatus) {
        return await this.services.database.getConnectionStatus();
      }
      return { status: 'unknown', message: 'Health check method not available' };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Check QR code service health
   */
  async checkQRCodeServiceHealth() {
    try {
      if (this.services.qrCode.getHealth) {
        return await this.services.qrCode.getHealth();
      }
      return { status: 'unknown', message: 'Health check method not available' };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  // ===== PERFORMANCE METRICS COLLECTION =====

  /**
   * Collect performance metrics from all services
   */
  async collectPerformanceMetrics() {
    try {
      const metrics = {
        timestamp: new Date(),
        performance: {},
        errors: {},
        rateLimiting: {},
        caching: {},
        database: {},
        qrCode: {}
      };
      
      // Collect performance metrics
      if (this.services.performance.getPerformanceStats) {
        metrics.performance = await this.services.performance.getPerformanceStats();
      }
      
      // Collect error statistics
      if (this.services.errors.getErrorStats) {
        metrics.errors = await this.services.errors.getErrorStats();
      }
      
      // Collect rate limiting statistics
      if (this.services.rateLimiting.getRateLimitStats) {
        metrics.rateLimiting = await this.services.rateLimiting.getRateLimitStats();
      }
      
      // Collect caching statistics
      if (this.services.caching.getCacheStats) {
        metrics.caching = await this.services.caching.getCacheStats();
      }
      
      // Collect database performance metrics
      if (this.services.database.getQueryPerformanceStats) {
        metrics.database = await this.services.database.getQueryPerformanceStats();
      }
      
      // Collect QR code statistics
      if (this.services.qrCode.getQRCodeStats) {
        metrics.qrCode = await this.services.qrCode.getQRCodeStats();
      }
      
      // Store metrics
      this.integrationStats.performanceMetrics = metrics;
      
      // Check for performance issues
      await this.analyzePerformanceMetrics(metrics);
      
      logger.debug('Performance metrics collected successfully');
      
    } catch (error) {
      logger.error('Failed to collect performance metrics:', error);
    }
  }

  /**
   * Analyze performance metrics for issues
   */
  async analyzePerformanceMetrics(metrics) {
    try {
      const alerts = [];
      
      // Check response time thresholds
      if (metrics.performance.averageResponseTime > 1000) { // 1 second
        alerts.push({
          type: 'performance',
          severity: 'warning',
          message: 'High average response time detected',
          value: metrics.performance.averageResponseTime,
          threshold: 1000,
          timestamp: new Date()
        });
      }
      
      // Check error rate thresholds
      if (metrics.errors.errorRate > 5) { // 5%
        alerts.push({
          type: 'errors',
          severity: 'critical',
          message: 'High error rate detected',
          value: metrics.errors.errorRate,
          threshold: 5,
          timestamp: new Date()
        });
      }
      
      // Check rate limiting violations
      if (metrics.rateLimiting.rateLimited > 100) { // 100 rate limited requests
        alerts.push({
          type: 'rate_limiting',
          severity: 'warning',
          message: 'High rate limiting violations detected',
          value: metrics.rateLimiting.rateLimited,
          threshold: 100,
          timestamp: new Date()
        });
      }
      
      // Check cache hit rate
      if (metrics.caching.hitRate < 80) { // 80% cache hit rate
        alerts.push({
          type: 'caching',
          severity: 'warning',
          message: 'Low cache hit rate detected',
          value: metrics.caching.hitRate,
          threshold: 80,
          timestamp: new Date()
        });
      }
      
      // Add new alerts
      if (alerts.length > 0) {
        this.integrationStats.alerts.push(...alerts);
        logger.warn(`Generated ${alerts.length} performance alerts`);
      }
      
      // Keep only recent alerts (last 100)
      if (this.integrationStats.alerts.length > 100) {
        this.integrationStats.alerts = this.integrationStats.alerts.slice(-100);
      }
      
    } catch (error) {
      logger.error('Failed to analyze performance metrics:', error);
    }
  }

  // ===== ALERT MANAGEMENT =====

  /**
   * Check for alerts across all services
   */
  async checkForAlerts() {
    try {
      const alerts = [];
      
      // Check performance alerts
      if (this.services.performance.checkForAlerts) {
        const perfAlerts = await this.services.performance.checkForAlerts();
        if (perfAlerts && perfAlerts.length > 0) {
          alerts.push(...perfAlerts.map(alert => ({ ...alert, source: 'performance' })));
        }
      }
      
      // Check error alerts
      if (this.services.errors.checkForAlerts) {
        const errorAlerts = await this.services.errors.checkForAlerts();
        if (errorAlerts && errorAlerts.length > 0) {
          alerts.push(...errorAlerts.map(alert => ({ ...alert, source: 'errors' })));
        }
      }
      
      // Check rate limiting alerts
      if (this.services.rateLimiting.checkForAlerts) {
        const rateAlerts = await this.services.rateLimiting.checkForAlerts();
        if (rateAlerts && rateAlerts.length > 0) {
          alerts.push(...rateAlerts.map(alert => ({ ...alert, source: 'rate_limiting' })));
        }
      }
      
      // Process alerts
      if (alerts.length > 0) {
        await this.processAlerts(alerts);
      }
      
    } catch (error) {
      logger.error('Failed to check for alerts:', error);
    }
  }

  /**
   * Process alerts from all services
   */
  async processAlerts(alerts) {
    try {
      for (const alert of alerts) {
        // Log alert
        logger.warn(`Alert from ${alert.source}: ${alert.message}`, alert);
        
        // Add to integration alerts
        this.integrationStats.alerts.push({
          ...alert,
          timestamp: new Date(),
          processed: true
        });
        
        // Send notifications (placeholder for future implementation)
        await this.sendAlertNotification(alert);
      }
      
      logger.info(`Processed ${alerts.length} alerts`);
      
    } catch (error) {
      logger.error('Failed to process alerts:', error);
    }
  }

  /**
   * Send alert notification (placeholder)
   */
  async sendAlertNotification(alert) {
    try {
      // TODO: Implement notification sending (email, Slack, etc.)
      logger.debug(`Alert notification sent: ${alert.message}`);
    } catch (error) {
      logger.error('Failed to send alert notification:', error);
    }
  }

  // ===== UNIFIED MONITORING API =====

  /**
   * Get comprehensive system status
   */
  async getSystemStatus() {
    try {
      const health = await this.performIntegrationHealthCheck();
      const metrics = this.integrationStats.performanceMetrics;
      const alerts = this.integrationStats.alerts.filter(alert => 
        alert.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      );
      
      return {
        status: health.overallStatus,
        timestamp: new Date(),
        services: health.serviceHealth,
        metrics: metrics,
        alerts: alerts,
        integration: {
          status: this.integrationStats.integrationStatus,
          lastCheck: this.integrationStats.lastIntegrationCheck,
          uptime: process.uptime()
        }
      };
      
    } catch (error) {
      logger.error('Failed to get system status:', error);
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get performance summary
   */
  async getPerformanceSummary() {
    try {
      const metrics = this.integrationStats.performanceMetrics;
      
      return {
        timestamp: new Date(),
        summary: {
          responseTime: metrics.performance?.averageResponseTime || 0,
          errorRate: metrics.errors?.errorRate || 0,
          cacheHitRate: metrics.caching?.hitRate || 0,
          rateLimitViolations: metrics.rateLimiting?.rateLimited || 0,
          databaseQueries: metrics.database?.totalQueries || 0,
          qrCodeGenerations: metrics.qrCode?.generated || 0
        },
        trends: await this.calculateTrends(),
        recommendations: await this.generateRecommendations()
      };
      
    } catch (error) {
      logger.error('Failed to get performance summary:', error);
      return null;
    }
  }

  /**
   * Calculate performance trends
   */
  async calculateTrends() {
    try {
      // TODO: Implement trend calculation based on historical data
      return {
        responseTime: 'stable',
        errorRate: 'stable',
        cacheHitRate: 'stable',
        rateLimitViolations: 'stable'
      };
    } catch (error) {
      logger.error('Failed to calculate trends:', error);
      return {};
    }
  }

  /**
   * Generate performance recommendations
   */
  async generateRecommendations() {
    try {
      const recommendations = [];
      const metrics = this.integrationStats.performanceMetrics;
      
      // Response time recommendations
      if (metrics.performance?.averageResponseTime > 1000) {
        recommendations.push({
          type: 'performance',
          priority: 'high',
          message: 'Consider implementing response time optimization strategies',
          action: 'Review slow queries and implement caching where appropriate'
        });
      }
      
      // Cache recommendations
      if (metrics.caching?.hitRate < 80) {
        recommendations.push({
          type: 'caching',
          priority: 'medium',
          message: 'Cache hit rate is below optimal threshold',
          action: 'Review cache invalidation strategies and add more cacheable data'
        });
      }
      
      // Error rate recommendations
      if (metrics.errors?.errorRate > 5) {
        recommendations.push({
          type: 'errors',
          priority: 'critical',
          message: 'Error rate is above acceptable threshold',
          action: 'Investigate error patterns and implement error handling improvements'
        });
      }
      
      return recommendations;
      
    } catch (error) {
      logger.error('Failed to generate recommendations:', error);
      return [];
    }
  }

  // ===== SERVICE CONTROL =====

  /**
   * Start monitoring for specific service
   */
  async startServiceMonitoring(serviceName) {
    try {
      if (this.services[serviceName] && this.services[serviceName].startMonitoring) {
        await this.services[serviceName].startMonitoring();
        logger.info(`Started monitoring for ${serviceName}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Failed to start monitoring for ${serviceName}:`, error);
      return false;
    }
  }

  /**
   * Stop monitoring for specific service
   */
  async stopServiceMonitoring(serviceName) {
    try {
      if (this.services[serviceName] && this.services[serviceName].stopMonitoring) {
        await this.services[serviceName].stopMonitoring();
        logger.info(`Stopped monitoring for ${serviceName}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Failed to stop monitoring for ${serviceName}:`, error);
      return false;
    }
  }

  /**
   * Restart monitoring for specific service
   */
  async restartServiceMonitoring(serviceName) {
    try {
      await this.stopServiceMonitoring(serviceName);
      await this.delay(1000); // Wait 1 second
      await this.startServiceMonitoring(serviceName);
      logger.info(`Restarted monitoring for ${serviceName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to restart monitoring for ${serviceName}:`, error);
      return false;
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get integration statistics
   */
  getIntegrationStats() {
    return {
      ...this.integrationStats,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }

  /**
   * Reset integration statistics
   */
  resetIntegrationStats() {
    this.integrationStats = {
      lastIntegrationCheck: null,
      integrationStatus: 'active',
      serviceHealth: {},
      overallHealth: 'unknown',
      alerts: [],
      performanceMetrics: {}
    };
    
    logger.info('Integration statistics reset');
  }
}

// Create singleton instance
const performanceMonitoringIntegrationService = new PerformanceMonitoringIntegrationService();

module.exports = performanceMonitoringIntegrationService;
