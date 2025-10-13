/**
 * @fileoverview Enhanced Analytics Routes for LUDUS Platform - LDS-017 Implementation
 * @module routes/analytics
 * 
 * This module defines all analytics-related API endpoints including:
 * - Dashboard analytics with comprehensive metrics
 * - User behavior analytics
 * - Revenue analytics and financial insights
 * - Vendor performance analytics
 * - Search analytics and discovery insights
 * - Performance metrics and system health
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validateObjectId,
  validateAnalyticsQuery,
  validateAnalyticsPeriod,
  validateAnalyticsGroupBy
} = require('../middleware/validation');
const {
  getDashboardAnalytics,
  getUserAnalytics,
  getRevenueAnalytics,
  getVendorAnalytics,
  getSearchAnalytics,
  getPerformanceMetrics
} = require('../controllers/analyticsController');

const router = express.Router();

// All analytics routes require authentication and admin privileges
router.use(authenticate);
router.use(authorize('admin'));

// @desc    Get comprehensive dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private (Admin only)
router.get('/dashboard', validateAnalyticsQuery, getDashboardAnalytics);

// @desc    Get user behavior analytics
// @route   GET /api/analytics/users
// @access  Private (Admin only)
router.get('/users', validateAnalyticsQuery, getUserAnalytics);

// @desc    Get revenue analytics and financial insights
// @route   GET /api/analytics/revenue
// @access  Private (Admin only)
router.get('/revenue', validateAnalyticsQuery, getRevenueAnalytics);

// @desc    Get vendor performance analytics
// @route   GET /api/analytics/vendors
// @access  Private (Admin only)
router.get('/vendors', validateAnalyticsQuery, getVendorAnalytics);

// @desc    Get search analytics and discovery insights
// @route   GET /api/analytics/search
// @access  Private (Admin only)
router.get('/search', validateAnalyticsQuery, getSearchAnalytics);

// @desc    Get performance metrics and system health
// @route   GET /api/analytics/performance
// @access  Private (Admin only)
router.get('/performance', validateAnalyticsQuery, getPerformanceMetrics);

module.exports = router;