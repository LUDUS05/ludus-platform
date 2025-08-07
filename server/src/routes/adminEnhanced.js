const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  // Translation Management
  getTranslations,
  updateTranslations,
  
  // Category Management
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  updateCategoryStatus,
  
  // System Settings
  getSystemSettings,
  updateSystemSettings
} = require('../controllers/adminEnhancedController');

// Apply authentication and admin role check to all routes
router.use(authenticate);
router.use(requireRole('admin'));

// Translation Management Routes
router.get('/translations/:language/:namespace', getTranslations);
router.put('/translations/:language/:namespace', updateTranslations);

// Category Management Routes
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
router.put('/categories/reorder', reorderCategories);
router.patch('/categories/:id/status', updateCategoryStatus);

// Content Management Routes - Removed from here, handled in admin.js

// System Settings Routes
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

module.exports = router;