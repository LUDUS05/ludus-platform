const logger = require('../utils/logger');

class PerformanceMonitoringService {
  constructor() {
    this.metrics = {
      requests: new Map(),
      responseTimes: new Map(),
      memoryUsage: [],
      cpuUsage: [],
      databaseQueries: new Map(),
      referralSystemMetrics: new Map()
    };
    
    this.thresholds = {
      responseTime: 2000, // 2 seconds
      memoryUsage: 0.8, // 80% of available memory
      cpuUsage: 0.7, // 70% CPU usage
      errorRate: 0.05, // 5% error rate
      databaseQueryTime: 1000 // 1 second
    };
    
    this.maxHistorySize = 1000;
    this.startTime = Date.now();
    
    // Start monitoring
    this.startMonitoring();
  }

  // Start performance monitoring
  startMonitoring() {
    // Monitor memory usage every 30 seconds
    setInterval(() => {
      this.recordMemoryUsage();
    }, 30000);
    
    // Monitor CPU usage every 30 seconds
    setInterval(() => {
      this.recordCPUUsage();
    }, 30000);
    
    // Clean up old metrics every hour
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 3600000);
    
    logger.info('Performance monitoring started');
  }

  // Record request metrics
  recordRequest(endpoint, method, responseTime, statusCode, userId = null) {
    const key = `${method}:${endpoint}`;
    const timestamp = Date.now();
    
    // Update request count
    if (!this.metrics.requests.has(key)) {
      this.metrics.requests.set(key, {
        count: 0,
        totalResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        statusCodes: {},
        lastRequest: null,
        firstRequest: null
      });
    }
    
    const requestData = this.metrics.requests.get(key);
    requestData.count++;
    requestData.totalResponseTime += responseTime;
    requestData.minResponseTime = Math.min(requestData.minResponseTime, responseTime);
    requestData.maxResponseTime = Math.max(requestData.maxResponseTime, responseTime);
    requestData.lastRequest = timestamp;
    requestData.firstRequest = requestData.firstRequest || timestamp;
    
    // Track status codes
    requestData.statusCodes[statusCode] = (requestData.statusCodes[statusCode] || 0) + 1;
    
    // Record response time
    if (!this.metrics.responseTimes.has(key)) {
      this.metrics.responseTimes.set(key, []);
    }
    
    const responseTimes = this.metrics.responseTimes.get(key);
    responseTimes.push({ timestamp, responseTime, statusCode, userId });
    
    // Maintain history size
    if (responseTimes.length > this.maxHistorySize) {
      responseTimes.shift();
    }
    
    // Check for performance issues
    this.checkPerformanceIssues(key, responseTime, statusCode);
  }

  // Record memory usage
  recordMemoryUsage() {
    const usage = process.memoryUsage();
    const timestamp = Date.now();
    
    const memoryData = {
      timestamp,
      rss: usage.rss, // Resident Set Size
      heapTotal: usage.heapTotal, // Total heap size
      heapUsed: usage.heapUsed, // Used heap size
      external: usage.external, // External memory
      arrayBuffers: usage.arrayBuffers // Array buffers
    };
    
    this.metrics.memoryUsage.push(memoryData);
    
    // Maintain history size
    if (this.metrics.memoryUsage.length > this.maxHistorySize) {
      this.metrics.memoryUsage.shift();
    }
    
    // Check memory threshold
    const memoryUsageRatio = usage.heapUsed / usage.heapTotal;
    if (memoryUsageRatio > this.thresholds.memoryUsage) {
      this.sendPerformanceAlert('high_memory_usage', {
        current: memoryUsageRatio,
        threshold: this.thresholds.memoryUsage,
        usage: memoryData
      });
    }
  }

  // Record CPU usage (simplified - would need more sophisticated monitoring in production)
  recordCPUUsage() {
    const startUsage = process.cpuUsage();
    const timestamp = Date.now();
    
    // This is a simplified CPU monitoring
    // In production, you'd want to use a more sophisticated approach
    const cpuData = {
      timestamp,
      user: startUsage.user,
      system: startUsage.system,
      total: startUsage.user + startUsage.system
    };
    
    this.metrics.cpuUsage.push(cpuData);
    
    // Maintain history size
    if (this.metrics.cpuUsage.length > this.maxHistorySize) {
      this.metrics.cpuUsage.shift();
    }
  }

  // Record database query performance
  recordDatabaseQuery(operation, collection, queryTime, success, error = null) {
    const key = `${operation}:${collection}`;
    const timestamp = Date.now();
    
    if (!this.metrics.databaseQueries.has(key)) {
      this.metrics.databaseQueries.set(key, {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        successCount: 0,
        errorCount: 0,
        lastQuery: null,
        queries: []
      });
    }
    
    const queryData = this.metrics.databaseQueries.get(key);
    queryData.count++;
    queryData.totalTime += queryTime;
    queryData.minTime = Math.min(queryData.minTime, queryTime);
    queryData.maxTime = Math.max(queryData.maxTime, queryTime);
    queryData.lastQuery = timestamp;
    
    if (success) {
      queryData.successCount++;
    } else {
      queryData.errorCount++;
    }
    
    // Store query details
    queryData.queries.push({
      timestamp,
      queryTime,
      success,
      error: error?.message || null
    });
    
    // Maintain history size
    if (queryData.queries.length > this.maxHistorySize) {
      queryData.queries.shift();
    }
    
    // Check for slow queries
    if (queryTime > this.thresholds.databaseQueryTime) {
      this.sendPerformanceAlert('slow_database_query', {
        operation,
        collection,
        queryTime,
        threshold: this.thresholds.databaseQueryTime
      });
    }
  }

  // Record referral system specific metrics
  recordReferralMetric(metricType, value, context = {}) {
    const timestamp = Date.now();
    
    if (!this.metrics.referralSystemMetrics.has(metricType)) {
      this.metrics.referralSystemMetrics.set(metricType, []);
    }
    
    const metricData = this.metrics.referralSystemMetrics.get(metricType);
    metricData.push({
      timestamp,
      value,
      context
    });
    
    // Maintain history size
    if (metricData.length > this.maxHistorySize) {
      metricData.shift();
    }
    
    // Check for unusual patterns
    this.checkReferralSystemPatterns(metricType, value, context);
  }

  // Check for performance issues
  checkPerformanceIssues(endpoint, responseTime, statusCode) {
    // Check response time threshold
    if (responseTime > this.thresholds.responseTime) {
      this.sendPerformanceAlert('slow_response_time', {
        endpoint,
        responseTime,
        threshold: this.thresholds.responseTime
      });
    }
    
    // Check for high error rates
    if (statusCode >= 400) {
      this.checkErrorRate(endpoint);
    }
  }

  // Check error rate for an endpoint
  checkErrorRate(endpoint) {
    const responseTimes = this.metrics.responseTimes.get(endpoint) || [];
    const recentRequests = responseTimes.filter(r => 
      Date.now() - r.timestamp < 300000 // Last 5 minutes
    );
    
    if (recentRequests.length > 10) {
      const errorCount = recentRequests.filter(r => r.statusCode >= 400).length;
      const errorRate = errorCount / recentRequests.length;
      
      if (errorRate > this.thresholds.errorRate) {
        this.sendPerformanceAlert('high_error_rate', {
          endpoint,
          errorRate,
          threshold: this.thresholds.errorRate,
          totalRequests: recentRequests.length,
          errorCount
        });
      }
    }
  }

  // Check referral system patterns
  checkReferralSystemPatterns(metricType, value, context) {
    const metricData = this.metrics.referralSystemMetrics.get(metricType) || [];
    const recentMetrics = metricData.filter(m => 
      Date.now() - m.timestamp < 3600000 // Last hour
    );
    
    if (recentMetrics.length > 5) {
      const values = recentMetrics.map(m => m.value);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      // Check for unusual values (more than 2 standard deviations from mean)
      if (Math.abs(value - avg) > 2 * stdDev) {
        this.sendPerformanceAlert('unusual_referral_metric', {
          metricType,
          value,
          average: avg,
          standardDeviation: stdDev,
          context
        });
      }
    }
  }

  // Send performance alert
  sendPerformanceAlert(alertType, data) {
    const alert = {
      id: `perf_${alertType}_${Date.now()}`,
      type: alertType,
      timestamp: new Date(),
      data,
      acknowledged: false
    };
    
    logger.warn('Performance alert triggered', alert);
    
    // Send notification
    this.sendPerformanceNotification(alert);
    
    return alert;
  }

  // Send performance notification
  sendPerformanceNotification(alert) {
    try {
      // This would integrate with your notification system
      // Could send emails, Slack messages, etc.
      
      logger.info('Performance alert notification sent', { alertId: alert.id });
    } catch (error) {
      logger.error('Failed to send performance alert notification', { 
        error: error.message, 
        alertId: alert.id 
      });
    }
  }

  // Get performance statistics
  getPerformanceStats(timeRange = '24h') {
    const now = Date.now();
    const cutoff = now - this.getTimeRangeMs(timeRange);
    
    const stats = {
      timeRange,
      generatedAt: new Date(),
      uptime: now - this.startTime,
      requests: {},
      responseTimes: {},
      memoryUsage: {},
      databaseQueries: {},
      referralMetrics: {},
      alerts: []
    };
    
    // Aggregate request metrics
    for (const [endpoint, data] of this.metrics.requests) {
      const recentRequests = data.count;
      const avgResponseTime = data.totalResponseTime / data.count;
      
      stats.requests[endpoint] = {
        count: recentRequests,
        averageResponseTime: avgResponseTime,
        minResponseTime: data.minResponseTime,
        maxResponseTime: data.maxResponseTime,
        statusCodes: data.statusCodes
      };
    }
    
    // Aggregate response time metrics
    for (const [endpoint, times] of this.metrics.responseTimes) {
      const recentTimes = times.filter(t => t.timestamp >= cutoff);
      if (recentTimes.length > 0) {
        const responseTimes = recentTimes.map(t => t.responseTime);
        stats.responseTimes[endpoint] = {
          count: recentTimes.length,
          average: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
          min: Math.min(...responseTimes),
          max: Math.max(...responseTimes),
          p95: this.calculatePercentile(responseTimes, 95),
          p99: this.calculatePercentile(responseTimes, 99)
        };
      }
    }
    
    // Aggregate memory usage
    const recentMemory = this.metrics.memoryUsage.filter(m => m.timestamp >= cutoff);
    if (recentMemory.length > 0) {
      const heapUsed = recentMemory.map(m => m.heapUsed);
      stats.memoryUsage = {
        average: heapUsed.reduce((a, b) => a + b, 0) / heapUsed.length,
        min: Math.min(...heapUsed),
        max: Math.max(...heapUsed),
        current: recentMemory[recentMemory.length - 1]
      };
    }
    
    // Aggregate database queries
    for (const [query, data] of this.metrics.databaseQueries) {
      const recentQueries = data.queries.filter(q => q.timestamp >= cutoff);
      if (recentQueries.length > 0) {
        const queryTimes = recentQueries.map(q => q.queryTime);
        stats.databaseQueries[query] = {
          count: recentQueries.length,
          average: queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length,
          min: Math.min(...queryTimes),
          max: Math.max(...queryTimes),
          successRate: data.successCount / data.count
        };
      }
    }
    
    // Aggregate referral metrics
    for (const [metricType, metrics] of this.metrics.referralSystemMetrics) {
      const recentMetrics = metrics.filter(m => m.timestamp >= cutoff);
      if (recentMetrics.length > 0) {
        const values = recentMetrics.map(m => m.value);
        stats.referralMetrics[metricType] = {
          count: recentMetrics.length,
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          latest: values[values.length - 1]
        };
      }
    }
    
    return stats;
  }

  // Calculate percentile
  calculatePercentile(values, percentile) {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
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

  // Clean up old metrics
  cleanupOldMetrics() {
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    
    // Clean up response times
    for (const [endpoint, times] of this.metrics.responseTimes) {
      this.metrics.responseTimes.set(
        endpoint,
        times.filter(t => t.timestamp >= cutoff)
      );
    }
    
    // Clean up memory usage
    this.metrics.memoryUsage = this.metrics.memoryUsage.filter(m => m.timestamp >= cutoff);
    
    // Clean up CPU usage
    this.metrics.cpuUsage = this.metrics.cpuUsage.filter(c => c.timestamp >= cutoff);
    
    // Clean up database queries
    for (const [query, data] of this.metrics.databaseQueries) {
      data.queries = data.queries.filter(q => q.timestamp >= cutoff);
    }
    
    // Clean up referral metrics
    for (const [metricType, metrics] of this.metrics.referralSystemMetrics) {
      this.metrics.referralSystemMetrics.set(
        metricType,
        metrics.filter(m => m.timestamp >= cutoff)
      );
    }
    
    logger.info('Old performance metrics cleaned up');
  }

  // Export performance data
  exportPerformanceData(format = 'json', timeRange = '24h') {
    const data = this.getPerformanceStats(timeRange);
    
    if (format === 'csv') {
      return this.convertPerformanceToCSV(data);
    }
    
    return data;
  }

  // Convert performance data to CSV
  convertPerformanceToCSV(data) {
    const csvRows = [];
    
    // Add header
    csvRows.push('Metric,Value,Details');
    
    // Add basic stats
    csvRows.push(`Uptime,${data.uptime},milliseconds`);
    csvRows.push(`Generated At,${data.generatedAt},timestamp`);
    
    // Add request stats
    Object.entries(data.requests).forEach(([endpoint, stats]) => {
      csvRows.push(`${endpoint} - Count,${stats.count},requests`);
      csvRows.push(`${endpoint} - Avg Response Time,${stats.averageResponseTime},milliseconds`);
    });
    
    // Add memory stats
    if (data.memoryUsage.average) {
      csvRows.push(`Memory - Average,${data.memoryUsage.average},bytes`);
      csvRows.push(`Memory - Max,${data.memoryUsage.max},bytes`);
    }
    
    return csvRows.join('\n');
  }
}

module.exports = new PerformanceMonitoringService();
