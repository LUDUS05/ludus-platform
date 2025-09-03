const logger = require('../utils/logger');

class ErrorTrackingService {
  constructor() {
    this.errorCounts = new Map();
    this.errorHistory = [];
    this.alertThresholds = {
      errorRate: 0.1, // 10% error rate
      consecutiveErrors: 5,
      criticalErrors: ['database_connection', 'payment_failed', 'referral_system_down']
    };
    this.maxHistorySize = 1000;
  }

  // Track an error
  trackError(error, context = {}) {
    const errorInfo = {
      timestamp: new Date(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      type: this.categorizeError(error),
      severity: this.calculateSeverity(error),
      context: {
        endpoint: context.endpoint || 'unknown',
        userId: context.userId || 'anonymous',
        userAgent: context.userAgent || 'unknown',
        ipAddress: context.ipAddress || 'unknown',
        ...context
      }
    };

    // Add to history
    this.errorHistory.push(errorInfo);
    
    // Maintain history size
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }

    // Update error counts
    const errorType = errorInfo.type;
    const currentCount = this.errorCounts.get(errorType) || 0;
    this.errorCounts.set(errorType, currentCount + 1);

    // Log error
    logger.error('Error tracked', errorInfo);

    // Check for alerts
    this.checkForAlerts(errorInfo);

    return errorInfo;
  }

  // Categorize error types
  categorizeError(error) {
    const message = error.message?.toLowerCase() || '';
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('database') || message.includes('mongodb') || message.includes('connection')) {
      return 'database_connection';
    }
    
    if (message.includes('payment') || message.includes('moyasar') || message.includes('transaction')) {
      return 'payment_failed';
    }
    
    if (message.includes('referral') || message.includes('code') || message.includes('reward')) {
      return 'referral_system';
    }
    
    if (message.includes('authentication') || message.includes('jwt') || message.includes('token')) {
      return 'authentication';
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return 'rate_limiting';
    }
    
    if (message.includes('file') || message.includes('upload') || message.includes('image')) {
      return 'file_upload';
    }
    
    if (message.includes('email') || message.includes('smtp') || message.includes('notification')) {
      return 'email_service';
    }
    
    if (message.includes('external') || message.includes('api') || message.includes('third-party')) {
      return 'external_service';
    }
    
    return 'general';
  }

  // Calculate error severity
  calculateSeverity(error) {
    const message = error.message?.toLowerCase() || '';
    const type = this.categorizeError(error);
    
    // Critical errors
    if (this.alertThresholds.criticalErrors.includes(type)) {
      return 'critical';
    }
    
    // High severity
    if (type === 'database_connection' || type === 'payment_failed') {
      return 'high';
    }
    
    // Medium severity
    if (type === 'authentication' || type === 'referral_system') {
      return 'medium';
    }
    
    // Low severity
    if (type === 'validation' || type === 'rate_limiting') {
      return 'low';
    }
    
    return 'medium';
  }

  // Check for alerts
  checkForAlerts(errorInfo) {
    const { type, severity } = errorInfo;
    
    // Check consecutive errors
    const recentErrors = this.errorHistory
      .filter(e => e.type === type)
      .slice(-this.alertThresholds.consecutiveErrors);
    
    if (recentErrors.length >= this.alertThresholds.consecutiveErrors) {
      this.sendAlert('consecutive_errors', {
        type,
        count: recentErrors.length,
        threshold: this.alertThresholds.consecutiveErrors,
        errors: recentErrors
      });
    }
    
    // Check error rate
    const totalRequests = this.getTotalRequests(); // This would need to be implemented
    const errorRate = this.errorCounts.get(type) / totalRequests;
    
    if (errorRate > this.alertThresholds.errorRate) {
      this.sendAlert('high_error_rate', {
        type,
        errorRate,
        threshold: this.alertThresholds.errorRate,
        totalErrors: this.errorCounts.get(type)
      });
    }
    
    // Critical error alerts
    if (severity === 'critical') {
      this.sendAlert('critical_error', {
        type,
        message: errorInfo.message,
        context: errorInfo.context
      });
    }
  }

  // Send alert
  sendAlert(alertType, data) {
    const alert = {
      id: `${alertType}_${Date.now()}`,
      type: alertType,
      timestamp: new Date(),
      data,
      acknowledged: false
    };
    
    // Log alert
    logger.warn('Alert triggered', alert);
    
    // Send to notification service
    this.sendNotification(alert);
    
    // Store alert (could be saved to database)
    this.storeAlert(alert);
    
    return alert;
  }

  // Send notification
  sendNotification(alert) {
    // This would integrate with your notification system
    // Could send emails, Slack messages, etc.
    
    try {
      // Example: Send to admin users
      // await NotificationService.createSystemNotification({
      //   type: 'system_alert',
      //   title: `System Alert: ${alert.type}`,
      //   content: JSON.stringify(alert.data, null, 2),
      //   priority: 'high'
      // });
      
      logger.info('Alert notification sent', { alertId: alert.id });
    } catch (error) {
      logger.error('Failed to send alert notification', { error: error.message, alertId: alert.id });
    }
  }

  // Store alert
  storeAlert(alert) {
    // This could save to database for persistence
    // For now, just log it
    logger.info('Alert stored', { alertId: alert.id });
  }

  // Get error statistics
  getErrorStats(timeRange = '24h') {
    const now = new Date();
    const cutoff = new Date(now.getTime() - this.getTimeRangeMs(timeRange));
    
    const recentErrors = this.errorHistory.filter(error => error.timestamp >= cutoff);
    
    const stats = {
      totalErrors: recentErrors.length,
      errorTypes: {},
      severityDistribution: {},
      errorRate: 0,
      timeRange,
      generatedAt: now
    };
    
    // Count by type
    recentErrors.forEach(error => {
      stats.errorTypes[error.type] = (stats.errorTypes[error.type] || 0) + 1;
      stats.severityDistribution[error.severity] = (stats.severityDistribution[error.severity] || 0) + 1;
    });
    
    // Calculate error rate (this is a simplified version)
    const totalRequests = this.getTotalRequests();
    stats.errorRate = totalRequests > 0 ? recentErrors.length / totalRequests : 0;
    
    return stats;
  }

  // Get error history
  getErrorHistory(filters = {}) {
    let filtered = [...this.errorHistory];
    
    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(error => error.type === filters.type);
    }
    
    // Filter by severity
    if (filters.severity) {
      filtered = filtered.filter(error => error.severity === filters.severity);
    }
    
    // Filter by time range
    if (filters.timeRange) {
      const cutoff = new Date(Date.now() - this.getTimeRangeMs(filters.timeRange));
      filtered = filtered.filter(error => error.timestamp >= cutoff);
    }
    
    // Filter by user
    if (filters.userId) {
      filtered = filtered.filter(error => error.context.userId === filters.userId);
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);
    
    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      errors: filtered.slice(start, end),
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit)
      }
    };
  }

  // Acknowledge alert
  acknowledgeAlert(alertId) {
    // Find and mark alert as acknowledged
    // This would typically update a database record
    
    logger.info('Alert acknowledged', { alertId });
    return { success: true, alertId };
  }

  // Get time range in milliseconds
  getTimeRangeMs(timeRange) {
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    return timeRanges[timeRange] || timeRanges['24h'];
  }

  // Get total requests (placeholder - would need to be implemented)
  getTotalRequests() {
    // This would typically come from your request tracking/metrics
    // For now, return a placeholder value
    return 1000;
  }

  // Clear old errors
  clearOldErrors(days = 30) {
    const cutoff = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    const initialCount = this.errorHistory.length;
    
    this.errorHistory = this.errorHistory.filter(error => error.timestamp >= cutoff);
    
    const clearedCount = initialCount - this.errorHistory.length;
    logger.info('Cleared old errors', { clearedCount, days });
    
    return { clearedCount, remainingCount: this.errorHistory.length };
  }

  // Export error data
  exportErrorData(format = 'json') {
    const data = {
      exportDate: new Date(),
      totalErrors: this.errorHistory.length,
      errorTypes: Object.fromEntries(this.errorCounts),
      errors: this.errorHistory
    };
    
    if (format === 'csv') {
      return this.convertToCSV(data.errors);
    }
    
    return data;
  }

  // Convert to CSV
  convertToCSV(errors) {
    if (errors.length === 0) return '';
    
    const headers = ['timestamp', 'type', 'severity', 'message', 'endpoint', 'userId'];
    const csvRows = [headers.join(',')];
    
    errors.forEach(error => {
      const row = [
        error.timestamp.toISOString(),
        error.type,
        error.severity,
        `"${error.message.replace(/"/g, '""')}"`,
        error.context.endpoint,
        error.context.userId
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }
}

module.exports = new ErrorTrackingService();
