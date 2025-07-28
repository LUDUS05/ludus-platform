const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log the request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  
  // Log additional info for important endpoints
  if (req.originalUrl.includes('/api/payments') || req.originalUrl.includes('/api/bookings')) {
    console.log(`  Body: ${JSON.stringify(req.body, null, 2)}`);
  }
  
  // Override res.end to log response time and status
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    
    // Log errors
    if (res.statusCode >= 400) {
      console.error(`  Error Response: ${res.statusCode} - ${req.originalUrl}`);
    }
    
    originalEnd.apply(this, args);
  };
  
  next();
};

module.exports = logger;