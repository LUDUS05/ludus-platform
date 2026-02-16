// Site mode middleware - DISABLED
// This middleware is completely disabled and does nothing
const siteMode = async (req, res, next) => {
  // Completely disabled - just pass through
  next();
};

module.exports = siteMode;
