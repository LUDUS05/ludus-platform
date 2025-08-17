const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../utils/generateTokens');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = verifyToken(token);
    
    // Use user info from JWT payload to avoid DB lookup
    // Only include essential user information needed by most endpoints
    req.user = {
      id: decoded.userId,
      _id: decoded.userId, // For backward compatibility
      role: decoded.role || 'user'
    };
    
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Please log in.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = verifyToken(token);
      // Use user info from JWT payload to avoid DB lookup
      req.user = {
        id: decoded.userId,
        _id: decoded.userId, // For backward compatibility
        role: decoded.role || 'user'
      };
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Special middleware for endpoints that need full user object from database
const authenticateWithFullUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

// Alias for backward compatibility
const auth = authenticate;

const requireRole = (role) => {
  return [authenticate, authorize(role)];
};

module.exports = {
  authenticate,
  authenticateWithFullUser,
  auth,
  authorize,
  optionalAuth,
  requireRole
};