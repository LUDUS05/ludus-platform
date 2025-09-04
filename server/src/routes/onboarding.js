const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');

// Public routes
router.get('/config', onboardingController.getOnboardingConfig);

// Protected routes (require authentication)
router.use(authenticate);

// User onboarding routes
router.post('/complete-step', [
  body('stepId').isIn(['welcome', 'auth', 'profile', 'referral', 'interests', 'preferences']),
  body('stepData').isObject()
], onboardingController.completeOnboardingStep);

router.post('/complete', [
  body('finalData').optional().isObject()
], onboardingController.completeOnboarding);

router.get('/progress', onboardingController.getOnboardingProgress);

// Admin routes (require admin role)
router.use(authorize('admin'));

router.get('/admin/config', onboardingController.getFullOnboardingConfig);

router.put('/admin/config', [
  body('isEnabled').optional().isBoolean(),
  body('steps').optional().isArray(),
  body('welcomeConfig').optional().isObject(),
  body('authConfig').optional().isObject(),
  body('profileConfig').optional().isObject(),
  body('referralConfig').optional().isObject(),
  body('interestsConfig').optional().isObject(),
  body('preferencesConfig').optional().isObject(),
  body('analytics').optional().isObject()
], onboardingController.updateOnboardingConfig);

router.post('/admin/toggle', onboardingController.toggleOnboarding);

router.post('/admin/reset-user/:userId', [
  param('userId').isMongoId()
], onboardingController.resetUserOnboarding);

module.exports = router;
