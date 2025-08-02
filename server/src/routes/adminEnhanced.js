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
  
  // Content Management
  getPages,
  createPage,
  updatePage,
  deletePage,
  
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

// Content Management Routes
router.get('/pages', getPages);
router.post('/pages', createPage);
router.put('/pages/:id', updatePage);
router.delete('/pages/:id', deletePage);

// System Settings Routes
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

module.exports = router;