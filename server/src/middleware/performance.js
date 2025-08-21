const compression = require('compression');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Performance monitoring and metrics
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      responses: 0,
      errors: 0,
      responseTimes: [],
      slowQueries: [],
      cacheHits: 0,
      cacheMisses: 0
    };
    
    this.startTime = Date.now();
    this.interval = setInterval(() => this.logMetrics(), 60000); // Log every minute
  }

  // Record request start
  recordRequest(req) {
    req.startTime = Date.now();
    this.metrics.requests++;
  }

  // Record response completion
  recordResponse(req, res, next) {
    const responseTime = Date.now() - req.startTime;
    this.metrics.responseTimes.push(responseTime);
    this.metrics.responses++;

    // Track slow responses (> 1000ms)
    if (responseTime > 1000) {
      this.metrics.slowQueries.push({
        path: req.path,
        method: req.method,
        responseTime,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      });
    }

    // Add performance headers
    res.set('X-Response-Time', `${responseTime}ms`);
    res.set('X-Request-ID', req.id || this.generateRequestId());

    next();
  }

  // Record error
  recordError(req, error) {
    this.metrics.errors++;
    
    // Log slow queries for analysis
    if (req.startTime) {
      const responseTime = Date.now() - req.startTime;
      if (responseTime > 2000) {
        this.metrics.slowQueries.push({
          path: req.path,
          method: req.method,
          responseTime,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Record cache hit/miss
  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }

  // Generate unique request ID
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Calculate performance metrics
  getMetrics() {
    const responseTimes = this.metrics.responseTimes;
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
    
    const p95ResponseTime = responseTimes.length > 0
      ? responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)]
      : 0;

    return {
      uptime: Date.now() - this.startTime,
      requests: this.metrics.requests,
      responses: this.metrics.responses,
      errors: this.metrics.errors,
      averageResponseTime: Math.round(avgResponseTime),
      p95ResponseTime: Math.round(p95ResponseTime),
      slowQueries: this.metrics.slowQueries.length,
      cacheHitRate: this.metrics.cacheHits + this.metrics.cacheMisses > 0
        ? Math.round((this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100)
        : 0,
      requestsPerMinute: Math.round(this.metrics.requests / ((Date.now() - this.startTime) / 60000))
    };
  }

  // Log metrics to console
  logMetrics() {
    const metrics = this.getMetrics();
    console.log('📊 Performance Metrics:', {
      uptime: `${Math.round(metrics.uptime / 60000)}m`,
      requests: metrics.requests,
      avgResponseTime: `${metrics.averageResponseTime}ms`,
      p95ResponseTime: `${metrics.p95ResponseTime}ms`,
      slowQueries: metrics.slowQueries,
      cacheHitRate: `${metrics.cacheHitRate}%`,
      requestsPerMinute: metrics.requestsPerMinute
    });
  }

  // Get slow query analysis
  getSlowQueryAnalysis() {
    const pathStats = {};
    
    this.metrics.slowQueries.forEach(query => {
      const key = `${query.method} ${query.path}`;
      if (!pathStats[key]) {
        pathStats[key] = { count: 0, totalTime: 0, avgTime: 0 };
      }
      pathStats[key].count++;
      pathStats[key].totalTime += query.responseTime;
      pathStats[key].avgTime = Math.round(pathStats[key].totalTime / pathStats[key].count);
    });

    return Object.entries(pathStats)
      .map(([path, stats]) => ({ path, ...stats }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10); // Top 10 slowest endpoints
  }

  // Reset metrics (useful for testing)
  resetMetrics() {
    this.metrics = {
      requests: 0,
      responses: 0,
      errors: 0,
      responseTimes: [],
      slowQueries: [],
      cacheHits: 0,
      cacheMisses: 0
    };
    this.startTime = Date.now();
  }

  // Cleanup
  destroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

// Initialize performance monitor
const performanceMonitor = new PerformanceMonitor();

// Compression middleware with optimization
const compressionMiddleware = compression({
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression for text-based responses
    return compression.filter(req, res);
  },
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses > 1KB
  windowBits: 15 // Standard gzip compression
});

// Enhanced rate limiting with performance considerations
const createRateLimiters = () => {
  // General API rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(15 * 60 / 1000) // Convert to seconds
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      performanceMonitor.recordError(req, new Error('Rate limit exceeded'));
      res.status(429).json({
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(15 * 60 / 1000)
      });
    }
  });

  // Stricter rate limiting for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: Math.ceil(15 * 60 / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      performanceMonitor.recordError(req, new Error('Auth rate limit exceeded'));
      res.status(429).json({
        success: false,
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: Math.ceil(15 * 60 / 1000)
      });
    }
  });

  // Slow down responses for repeated requests (anti-DDoS)
  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // Allow 50 requests per 15 minutes, then...
    delayMs: 500 // Begin adding 500ms delay per request above 50
  });

  return { apiLimiter, authLimiter, speedLimiter };
};

// Request ID middleware for tracking
const requestIdMiddleware = (req, res, next) => {
  req.id = req.headers['x-request-id'] || performanceMonitor.generateRequestId();
  res.set('X-Request-ID', req.id);
  next();
};

// Performance monitoring middleware
const performanceMonitoringMiddleware = (req, res, next) => {
  // Record request start
  performanceMonitor.recordRequest(req);
  
  // Record response completion
  res.on('finish', () => {
    performanceMonitor.recordResponse(req, res, () => {});
  });
  
  next();
};

// Database query performance monitoring
const queryPerformanceMiddleware = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Add database performance headers if available
    if (req.dbQueryTime) {
      res.set('X-DB-Query-Time', `${req.dbQueryTime}ms`);
    }
    
    if (req.dbQueries) {
      res.set('X-DB-Queries', req.dbQueries);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Cache control middleware
const cacheControlMiddleware = (req, res, next) => {
  // Set default cache headers
  res.set('Cache-Control', 'private, max-age=300'); // 5 minutes default
  
  // Override for specific routes
  if (req.path.startsWith('/api/activities') || req.path.startsWith('/api/vendors')) {
    res.set('Cache-Control', 'public, max-age=1800'); // 30 minutes for public data
  }
  
  if (req.path.startsWith('/api/pages')) {
    res.set('Cache-Control', 'public, max-age=3600'); // 1 hour for static content
  }
  
  if (req.path.startsWith('/api/admin')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate'); // No cache for admin
  }
  
  next();
};

// Response time optimization middleware
const responseTimeOptimization = (req, res, next) => {
  // Add performance headers
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  
  // Optimize for mobile if mobile user agent
  if (req.headers['user-agent'] && /mobile|android|iphone|ipad|phone/i.test(req.headers['user-agent'])) {
    res.set('X-Mobile-Optimized', 'true');
  }
  
  next();
};

// Export middleware and monitor
module.exports = {
  performanceMonitor,
  compressionMiddleware,
  createRateLimiters,
  requestIdMiddleware,
  performanceMonitoringMiddleware,
  queryPerformanceMiddleware,
  cacheControlMiddleware,
  responseTimeOptimization,
  
  // Utility functions
  getPerformanceMetrics: () => performanceMonitor.getMetrics(),
  getSlowQueryAnalysis: () => performanceMonitor.getSlowQueryAnalysis(),
  resetMetrics: () => performanceMonitor.resetMetrics()
};