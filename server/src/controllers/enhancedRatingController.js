/**
 * @fileoverview Controller for the enhanced rating system.
 * @module controllers/enhancedRatingController
 */

const ratingSystemService = require('../services/ratingSystemService');
const RatingSystemConfig = require('../models/RatingSystemConfig');
const UserRatingProfile = require('../models/UserRatingProfile');
const RatingAssignment = require('../models/RatingAssignment');
const RatingRecord = require('../models/RatingRecord');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');

/**
 * Get the current configuration of the rating system.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getRatingSystemConfig = async (req, res) => {
  try {
    const config = await RatingSystemConfig.getConfig();
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get rating system config error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get rating system configuration'
    });
  }
};

/**
 * Update the configuration of the rating system.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const updateRatingSystemConfig = async (req, res) => {
  try {
    const { ratingCriteria, tierThresholds, creditRewards, activityBonus, systemSettings } = req.body;
    const userId = req.user.id;

    const config = await RatingSystemConfig.getConfig();
    
    const updates = {};
    if (ratingCriteria) updates.ratingCriteria = ratingCriteria;
    if (tierThresholds) updates.tierThresholds = tierThresholds;
    if (creditRewards) updates.creditRewards = creditRewards;
    if (activityBonus) updates.activityBonus = activityBonus;
    if (systemSettings) updates.systemSettings = systemSettings;

    await config.updateConfig(updates, userId, 'Configuration updated via admin panel');

    res.json({
      success: true,
      message: 'Rating system configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Update rating system config error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update rating system configuration'
    });
  }
};

/**
 * Get the rating profile for a specific user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getUserRatingProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;

    // Users can only view their own profile unless they're admin
    if (userId !== requestingUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const profile = await ratingSystemService.getUserRatingProfile(userId);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get user rating profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user rating profile'
    });
  }
};

/**
 * Create rating assignments for a specific event.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const createRatingAssignments = async (req, res) => {
  try {
    const { eventId } = req.params;

    const assignment = await ratingSystemService.createRatingAssignments(eventId);
    
    if (!assignment) {
      return res.status(400).json({
        success: false,
        message: 'Not enough participants to create rating assignments'
      });
    }

    res.json({
      success: true,
      message: 'Rating assignments created successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Create rating assignments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create rating assignments'
    });
  }
};

/**
 * Get all rating assignments for the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getUserRatingAssignments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const assignments = await ratingSystemService.getUserRatingAssignments(userId, status);
    
    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Get user rating assignments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get rating assignments'
    });
  }
};

/**
 * Get a specific rating assignment by its ID.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getRatingAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.id;

    const assignment = await RatingAssignment.findById(assignmentId)
      .populate('eventId', 'title description date')
      .populate('vendorId', 'name')
      .populate('participants.id', 'firstName lastName profileImage');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Rating assignment not found'
      });
    }

    // Check if user is part of this assignment
    const userAssignment = assignment.assignments.find(a => 
      a.raterId.toString() === userId.toString()
    );

    if (!userAssignment && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Get rating assignment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get rating assignment'
    });
  }
};

/**
 * Submit a new rating.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const submitRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      eventId,
      targetUserId,
      criteria,
      overallScore,
      generalComment,
      wouldParticipateAgain,
      reportFlags
    } = req.body;

    // Add request metadata
    const ratingData = {
      eventId,
      raterId: userId,
      targetUserId,
      criteria,
      overallScore,
      generalComment,
      wouldParticipateAgain,
      reportFlags,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      deviceInfo: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
    };

    const ratingRecord = await ratingSystemService.submitRating(ratingData);
    
    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: ratingRecord
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit rating'
    });
  }
};

/**
 * Get all ratings for a specific user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;
    const { status, targetType, limit = 50 } = req.query;

    // Users can only view their own ratings unless they're admin
    if (userId !== requestingUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const options = { status, targetType, limit: parseInt(limit) };
    const ratings = await RatingRecord.getRatingsForUser(userId, options);
    
    res.json({
      success: true,
      data: ratings
    });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user ratings'
    });
  }
};

/**
 * Get all ratings submitted by a specific user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getRatingsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;
    const { status, targetType, limit = 50 } = req.query;

    // Users can only view their own ratings unless they're admin
    if (userId !== requestingUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const options = { status, targetType, limit: parseInt(limit) };
    const ratings = await RatingRecord.getRatingsByUser(userId, options);
    
    res.json({
      success: true,
      message: 'Ratings retrieved successfully',
      data: ratings
    });
  } catch (error) {
    console.error('Get ratings by user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get ratings by user'
    });
  }
};

/**
 * Get statistics for the rating system.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getRatingStatistics = async (req, res) => {
  try {
    const { dateRange, status } = req.query;
    
    const options = {};
    if (dateRange) {
      const [start, end] = dateRange.split(',');
      options.dateRange = {
        start: new Date(start),
        end: new Date(end)
      };
    }
    if (status) options.status = status;

    const statistics = await ratingSystemService.getRatingStatistics(options);
    
    res.json({
      success: true,
      data: statistics[0] || {
        totalRatings: 0,
        averageRating: 0,
        averageWeightedRating: 0,
        flaggedRatings: 0,
        verifiedRatings: 0,
        flagRate: 0
      }
    });
  } catch (error) {
    console.error('Get rating statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get rating statistics'
    });
  }
};

/**
 * Get the top-rated users.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getTopRatedUsers = async (req, res) => {
  try {
    const { limit = 10, tier } = req.query;
    
    const topUsers = await ratingSystemService.getTopRatedUsers(
      parseInt(limit),
      tier
    );
    
    res.json({
      success: true,
      data: topUsers
    });
  } catch (error) {
    console.error('Get top rated users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get top rated users'
    });
  }
};

/**
 * Flag a rating for review.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const flagRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { reason, details } = req.body;
    const userId = req.user.id;

    const rating = await RatingRecord.findById(ratingId);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    rating.flagRating(userId, reason, details);
    await rating.save();

    res.json({
      success: true,
      message: 'Rating flagged successfully'
    });
  } catch (error) {
    console.error('Flag rating error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to flag rating'
    });
  }
};

/**
 * Review a flagged rating (approve or reject).
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const reviewRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { approved, notes } = req.body;
    const userId = req.user.id;

    const rating = await RatingRecord.findById(ratingId);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    rating.reviewRating(userId, approved, notes);
    await rating.save();

    res.json({
      success: true,
      message: `Rating ${approved ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Review rating error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to review rating'
    });
  }
};

/**
 * Get all flagged ratings.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getFlaggedRatings = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const ratings = await RatingRecord.find({ status: 'flagged' })
      .populate('raterId', 'firstName lastName')
      .populate('targetUserId', 'firstName lastName')
      .populate('eventId', 'title')
      .sort({ flaggedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await RatingRecord.countDocuments({ status: 'flagged' });

    res.json({
      success: true,
      data: ratings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get flagged ratings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get flagged ratings'
    });
  }
};

/**
 * Process monthly bonuses for all users.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const processMonthlyBonuses = async (req, res) => {
  try {
    const processedCount = await ratingSystemService.processMonthlyBonuses();
    
    res.json({
      success: true,
      message: `Processed monthly bonuses for ${processedCount} users`,
      data: { processedCount }
    });
  } catch (error) {
    console.error('Process monthly bonuses error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process monthly bonuses'
    });
  }
};

/**
 * Get the health status of the rating system.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getRatingSystemHealth = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProfiles,
      totalRatings,
      totalAssignments,
      activeAssignments,
      flaggedRatings
    ] = await Promise.all([
      User.countDocuments(),
      UserRatingProfile.countDocuments(),
      RatingRecord.countDocuments(),
      RatingAssignment.countDocuments(),
      RatingAssignment.countDocuments({ status: 'active' }),
      RatingRecord.countDocuments({ status: 'flagged' })
    ]);

    const health = {
      totalUsers,
      totalProfiles,
      profileCoverage: totalUsers > 0 ? (totalProfiles / totalUsers) * 100 : 0,
      totalRatings,
      totalAssignments,
      activeAssignments,
      flaggedRatings,
      flagRate: totalRatings > 0 ? (flaggedRatings / totalRatings) * 100 : 0,
      systemStatus: 'healthy'
    };

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Get rating system health error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get rating system health'
    });
  }
};

/**
 * Generate advanced rating assignments using a specific algorithm strategy.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const generateAdvancedRatingAssignments = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { strategy, options } = req.body;
    
    const result = await ratingSystemService.generateAdvancedRatingAssignments(eventId, {
      strategy,
      ...options
    });
    
    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient participants for rating assignments'
      });
    }
    
    res.json({
      success: true,
      message: 'Advanced rating assignments generated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error generating advanced rating assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate advanced rating assignments',
      error: error.message
    });
  }
};

/**
 * Recalculate a user's rating with an advanced engine.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const recalculateWithAdvancedEngine = async (req, res) => {
  try {
    const { userId } = req.params;
    const { calculationType, options } = req.body;
    
    const result = await ratingSystemService.recalculateWithAdvancedEngine(userId, {
      calculationType,
      ...options
    });
    
    res.json({
      success: true,
      message: 'User rating recalculated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error recalculating with advanced engine:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recalculate user rating',
      error: error.message
    });
  }
};

/**
 * Recalculate ratings for a batch of users.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const batchRecalculateUsers = async (req, res) => {
  try {
    const { userIds, options } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }
    
    const result = await ratingSystemService.batchRecalculateUsers(userIds, options);
    
    res.json({
      success: true,
      message: 'Batch recalculation completed',
      data: result
    });
  } catch (error) {
    console.error('Error batch recalculating users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to batch recalculate users',
      error: error.message
    });
  }
};

/**
 * Get statistics about rating calculations.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getCalculationStatistics = async (req, res) => {
  try {
    const { options } = req.query;
    const parsedOptions = options ? JSON.parse(options) : {};
    
    const statistics = await ratingSystemService.getCalculationStatistics(parsedOptions);
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error getting calculation statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get calculation statistics',
      error: error.message
    });
  }
};

/**
 * Select the optimal algorithm strategy for a given set of participants.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const selectOptimalStrategy = async (req, res) => {
  try {
    const { participants, options } = req.body;
    
    if (!participants || !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        message: 'Participants array is required'
      });
    }
    
    const strategy = await ratingSystemService.selectOptimalStrategy(participants, options);
    
    res.json({
      success: true,
      data: {
        recommendedStrategy: strategy,
        participants: participants.length,
        analysis: {
          participantCount: participants.length,
          tierDistribution: participants.reduce((acc, p) => {
            acc[p.tier] = (acc[p.tier] || 0) + 1;
            return acc;
          }, {})
        }
      }
    });
  } catch (error) {
    console.error('Error selecting optimal strategy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to select optimal strategy',
      error: error.message
    });
  }
};

module.exports = {
  getRatingSystemConfig,
  updateRatingSystemConfig,
  getUserRatingProfile,
  createRatingAssignments,
  getUserRatingAssignments,
  getRatingAssignment,
  submitRating,
  getUserRatings,
  getRatingsByUser,
  getRatingStatistics,
  getTopRatedUsers,
  flagRating,
  reviewRating,
  getFlaggedRatings,
  processMonthlyBonuses,
  getRatingSystemHealth,
  generateAdvancedRatingAssignments,
  recalculateWithAdvancedEngine,
  batchRecalculateUsers,
  getCalculationStatistics,
  selectOptimalStrategy
};
