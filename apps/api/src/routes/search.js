/**
 * @fileoverview Search Routes for LUDUS Platform - LDS-016 Implementation
 * @module routes/search
 * 
 * This module defines all search-related API endpoints including:
 * - Advanced activity search with filters
 * - Search suggestions and auto-complete
 * - Search analytics and reporting
 * - Search filters and options
 * - Search query logging
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  validateObjectId,
  validateSearchQuery,
  validateSearchFilters,
  validateSearchAnalytics
} = require('../middleware/validation');
const {
  searchActivities,
  getSearchSuggestions,
  getSearchAnalytics,
  saveSearchQuery,
  getSearchFilters
} = require('../controllers/searchController');

const router = express.Router();

// Public routes
// @desc    Search activities with advanced filters
// @route   GET /api/search/activities
// @access  Public
router.get('/activities', validateSearchQuery, searchActivities);

// @desc    Get search suggestions
// @route   GET /api/search/suggestions
// @access  Public
router.get('/suggestions', getSearchSuggestions);

// @desc    Get search filters and options
// @route   GET /api/search/filters
// @access  Public
router.get('/filters', getSearchFilters);

// Protected routes
router.use(optionalAuth);

// @desc    Save search query for analytics
// @route   POST /api/search/log
// @access  Private (Optional)
router.post('/log', saveSearchQuery);

// @desc    Get search analytics
// @route   GET /api/search/analytics
// @access  Private
router.get('/analytics', authenticate, validateSearchAnalytics, getSearchAnalytics);

module.exports = router;

