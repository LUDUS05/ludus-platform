const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  socialLogin
} = require('../controllers/authController');
const { authenticate, authenticateWithFullUser } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin
} = require('../middleware/validation');

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/social-login', socialLogin);
router.post('/refresh', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticateWithFullUser, getMe); // Needs full user object
router.put('/change-password', authenticateWithFullUser, changePassword); // Needs full user object

module.exports = router;