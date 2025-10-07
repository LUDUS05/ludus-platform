const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getSettings,
  updateSettings,
  toggleComingSoon,
  toggleMaintenance
} = require('../controllers/siteSettingsController');

const router = express.Router();

// Validation middleware
const settingsValidation = [
  body('comingSoonTitle').optional().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('comingSoonMessage').optional().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters'),
  body('maintenanceTitle').optional().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('maintenanceMessage').optional().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters'),
  body('estimatedReturnTime').optional().isISO8601().withMessage('Invalid date format'),
  body('comingSoonMode').optional().isBoolean().withMessage('Coming soon mode must be boolean'),
  body('maintenanceMode').optional().isBoolean().withMessage('Maintenance mode must be boolean')
];

// Get site settings (public)
router.get('/', getSettings);

// Update site settings (Admin only)
router.put('/', authenticate, authorize('admin'), settingsValidation, updateSettings);

// Toggle coming soon mode (Admin only)
router.post('/toggle-coming-soon', authenticate, authorize('admin'), toggleComingSoon);

// Toggle maintenance mode (Admin only)
router.post('/toggle-maintenance', authenticate, authorize('admin'), toggleMaintenance);

module.exports = router;