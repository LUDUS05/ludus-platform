const SiteSettings = require('../models/SiteSettings');

// Middleware to check site mode and redirect if needed
const siteMode = async (req, res, next) => {
  try {
    // Skip for API routes and admin routes
    if (req.path.startsWith('/api') || req.path.startsWith('/admin')) {
      return next();
    }

    const settings = await SiteSettings.getSettings();
    
    // Check maintenance mode first (higher priority)
    if (settings.maintenanceMode) {
      // Allow access to allowed paths
      if (settings.allowedPaths.some(path => req.path.startsWith(path))) {
        return next();
      }
      
      // Redirect to maintenance page
      if (req.path !== '/maintenance') {
        return res.redirect('/maintenance');
      }
      return next();
    }
    
    // Check coming soon mode
    if (settings.comingSoonMode) {
      // Allow access to registration and admin paths
      const allowedPaths = ['/coming-soon', '/register', '/partner-registration', '/login', '/admin'];
      if (allowedPaths.some(path => req.path.startsWith(path))) {
        return next();
      }
      
      // Redirect to coming soon page
      if (req.path !== '/coming-soon') {
        return res.redirect('/coming-soon');
      }
      return next();
    }
    
    next();
  } catch (error) {
    console.error('Site mode middleware error:', error);
    next();
  }
};

module.exports = siteMode;