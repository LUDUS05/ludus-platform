/**
 * @fileoverview Review Routes for LUDUS Platform - LDS-015 Implementation
 * @module routes/reviews
 * 
 * This module defines all review-related API endpoints including:
 * - Review CRUD operations
 * - Review moderation and approval
 * - Partner response management
 * - Review analytics and reporting
 * - Helpful votes and social features
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validateObjectId,
  validateReviewCreation,
  validateReviewUpdate,
  validatePartnerResponse,
  validateReviewModeration
} = require('../middleware/validation');
const {
  createReview,
  getActivityReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  addHelpfulVote,
  removeHelpfulVote,
  addPartnerResponse,
  getReviewAnalytics,
  moderateReview,
  getPendingReviews
} = require('../controllers/reviewController');

const router = express.Router();

// Public routes
// @desc    Get reviews for an activity
// @route   GET /api/reviews/activity/:activityId
// @access  Public
router.get('/activity/:activityId', validateObjectId('activityId'), getActivityReviews);

// Protected routes
router.use(authenticate);

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
router.post('/', validateReviewCreation, createReview);

// @desc    Get user's reviews
// @route   GET /api/reviews/user
// @access  Private
router.get('/user', getUserReviews);

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
router.put('/:reviewId', validateObjectId('reviewId'), validateReviewUpdate, updateReview);

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
router.delete('/:reviewId', validateObjectId('reviewId'), deleteReview);

// @desc    Add helpful vote to a review
// @route   POST /api/reviews/:reviewId/helpful
// @access  Private
router.post('/:reviewId/helpful', validateObjectId('reviewId'), addHelpfulVote);

// @desc    Remove helpful vote from a review
// @route   DELETE /api/reviews/:reviewId/helpful
// @access  Private
router.delete('/:reviewId/helpful', validateObjectId('reviewId'), removeHelpfulVote);

// @desc    Add partner response to a review
// @route   POST /api/reviews/:reviewId/response
// @access  Private (Partner)
router.post('/:reviewId/response', validateObjectId('reviewId'), validatePartnerResponse, addPartnerResponse);

// @desc    Get review analytics
// @route   GET /api/reviews/analytics
// @access  Private
router.get('/analytics', getReviewAnalytics);

// Admin routes
router.use(authorize('admin'));

// @desc    Get pending reviews for moderation
// @route   GET /api/reviews/pending
// @access  Private (Admin)
router.get('/pending', getPendingReviews);

// @desc    Moderate a review
// @route   PUT /api/reviews/:reviewId/moderate
// @access  Private (Admin)
router.put('/:reviewId/moderate', validateObjectId('reviewId'), validateReviewModeration, moderateReview);

module.exports = router;
