const jwt = require('jsonwebtoken');

const generateTokens = (userId, userRole = 'user') => {
  // Include user role in payload to avoid DB lookups in middleware
  const payload = { userId, role: userRole };
  
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' } // Shorter access token lifetime
  );
  
  const refreshToken = jwt.sign(
    { userId }, // Refresh token only needs userId
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
  
  return {
    accessToken,
    refreshToken
  };
};

const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

const generateEmailVerificationToken = (userId, email) => {
  return jwt.sign(
    { userId, email, type: 'email_verification' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const generatePasswordResetToken = (userId, email) => {
  return jwt.sign(
    { userId, email, type: 'password_reset' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

module.exports = {
  generateTokens,
  verifyToken,
  generateEmailVerificationToken,
  generatePasswordResetToken
};