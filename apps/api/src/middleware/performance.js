
const compression = require('compression');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Performance optimization middleware
const performanceConfig = {
  compression: compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }),
  
  // Response time logging
  responseTime: (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 1000) {
        console.warn(`Slow response: ${req.method} ${req.path} - ${duration}ms`);
      }
    });
    next();
  },
  
  // Memory usage monitoring
  memoryMonitor: (req, res, next) => {
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };
    
    if (memUsageMB.heapUsed > 500) {
      console.warn('High memory usage:', memUsageMB);
    }
    
    res.locals.memoryUsage = memUsageMB;
    next();
  }
};

module.exports = performanceConfig;
