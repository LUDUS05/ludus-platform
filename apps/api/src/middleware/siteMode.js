// Site mode middleware - redirects removed
// This middleware now only passes through without any redirects
const siteMode = async (req, res, next) => {
  try {
    // Skip for API routes and admin routes
    if (req.path.startsWith('/api') || req.path.startsWith('/admin')) {
      return next();
    }

    // No redirects - just pass through
    next();
  } catch (error) {
    console.error('Site mode middleware error:', error);
    next();
  }
};

module.exports = siteMode;