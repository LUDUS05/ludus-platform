const express = require('express');
const router = express.Router();
const {
  getAllForms,
  getForm,
  createForm,
  updateForm,
  deleteForm,
  getFormResponses,
  getFormStats,
  updateResponseStatus,
  exportFormResponses,
  submitFormResponse,
  getPublishedForm
} = require('../controllers/formController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');

// Validation middleware
const validateForm = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('slug').optional().trim().matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('fields').isArray().withMessage('Fields must be an array'),
  body('fields.*.id').notEmpty().withMessage('Field ID is required'),
  body('fields.*.type').isIn(['text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file', 'url', 'phone']).withMessage('Invalid field type'),
  body('fields.*.label').trim().notEmpty().withMessage('Field label is required'),
  body('fields.*.order').isInt().withMessage('Field order must be a number'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  body('menuPlacement.location').optional().isIn(['header', 'footer', 'sidebar', 'none']).withMessage('Invalid menu location')
];

const validateResponseStatus = [
  body('status').isIn(['submitted', 'reviewed', 'archived']).withMessage('Invalid status'),
  body('reviewNotes').optional().trim()
];

// Public routes
router.get('/:slug', getPublishedForm);
router.post('/:slug/submit', submitFormResponse);

// Admin routes (protected) - these will be accessible via /api/admin/forms
// Create a separate router for admin routes
const adminRouter = express.Router();
adminRouter.use(authenticate);
adminRouter.use(authorize('admin'));

// Form management routes
adminRouter.get('/', getAllForms);
adminRouter.get('/:id', [
  param('id').isMongoId().withMessage('Invalid form ID')
], getForm);
adminRouter.post('/', validateForm, createForm);
adminRouter.put('/:id', [
  param('id').isMongoId().withMessage('Invalid form ID'),
  ...validateForm
], updateForm);
adminRouter.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid form ID')
], deleteForm);

// Response management routes
adminRouter.get('/:id/responses', [
  param('id').isMongoId().withMessage('Invalid form ID')
], getFormResponses);
adminRouter.get('/:id/stats', [
  param('id').isMongoId().withMessage('Invalid form ID')
], getFormStats);
adminRouter.get('/:id/export', [
  param('id').isMongoId().withMessage('Invalid form ID')
], exportFormResponses);

// Response status update
adminRouter.put('/responses/:id', [
  param('id').isMongoId().withMessage('Invalid response ID'),
  ...validateResponseStatus
], updateResponseStatus);

// Export the admin router
module.exports = { publicRouter: router, adminRouter };
