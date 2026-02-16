/**
 * @fileoverview Controller for handling invitations.
 * @module controllers/invitationController
 */

const Invitation = require('../models/Invitation');
const Referral = require('../models/Referral');
const User = require('../models/User');
const Activity = require('../models/Activity');

/**
 * Create a new invitation.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const createInvitation = async (req, res) => {
  try {
    const {
      invitationType,
      activityId,
      platform,
      source = 'activity-details',
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    } = req.body;

    const userId = req.user.id || req.user._id;

    // Validate activity if provided
    if (activityId) {
      const activity = await Activity.findById(activityId);
      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }
    }

    // Create invitation
    const invitation = new Invitation({
      referrerId: userId,
      invitationType,
      activityId,
      platform,
      metadata: {
        source,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        referrer: req.headers.referer,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent
      }
    });

    await invitation.save();

    res.status(201).json({
      success: true,
      data: invitation
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invitation',
      error: error.message
    });
  }
};

/**
 * Track a click on an invitation.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const trackInvitationClick = async (req, res) => {
  try {
    const { id } = req.params;
    const { ipAddress, userAgent } = req.body;

    const invitation = await Invitation.findById(id);
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    if (invitation.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Invitation is not active'
      });
    }

    // Increment clicks and update tracking
    await invitation.incrementClicks(ipAddress, userAgent);
    await invitation.updatePerformance();

    res.status(200).json({
      success: true,
      message: 'Click tracked successfully',
      data: {
        invitationId: invitation._id,
        clicks: invitation.tracking.clicks,
        conversionRate: invitation.tracking.conversionRate
      }
    });
  } catch (error) {
    console.error('Error tracking invitation click:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track invitation click',
      error: error.message
    });
  }
};

/**
 * Record a conversion for an invitation.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const recordInvitationConversion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const invitation = await Invitation.findById(id);
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Record conversion
    await invitation.recordConversion();

    res.status(200).json({
      success: true,
      message: 'Conversion recorded successfully',
      data: {
        invitationId: invitation._id,
        conversions: invitation.tracking.conversions,
        conversionRate: invitation.tracking.conversionRate
      }
    });
  } catch (error) {
    console.error('Error recording invitation conversion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record invitation conversion',
      error: error.message
    });
  }
};

/**
 * Get invitation statistics for the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getInvitationStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const userId = req.user.id || req.user._id;

    const stats = await Invitation.getInvitationStats(userId, period);
    const topPerforming = await Invitation.getTopPerformingInvitations(userId, 5);
    const platformPerformance = await Invitation.getPlatformPerformance(userId);

    res.status(200).json({
      success: true,
      data: {
        overview: stats,
        topPerforming,
        platformPerformance
      }
    });
  } catch (error) {
    console.error('Error getting invitation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get invitation statistics',
      error: error.message
    });
  }
};

/**
 * Get the invitation history for the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getInvitationHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, platform, invitationType } = req.query;
    const userId = req.user.id || req.user._id;

    const query = { referrerId: userId };
    
    if (status) query.status = status;
    if (platform) query.platform = platform;
    if (invitationType) query.invitationType = invitationType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [invitations, total] = await Promise.all([
      Invitation.find(query)
        .populate('activityId', 'title category image_url')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Invitation.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        invitations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error getting invitation history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get invitation history',
      error: error.message
    });
  }
};

/**
 * Update the status of an invitation.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const updateInvitationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id || req.user._id;

    const invitation = await Invitation.findOne({ _id: id, referrerId: userId });
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    invitation.status = status;
    await invitation.save();

    res.status(200).json({
      success: true,
      message: 'Invitation status updated successfully',
      data: invitation
    });
  } catch (error) {
    console.error('Error updating invitation status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update invitation status',
      error: error.message
    });
  }
};

/**
 * Delete an invitation (soft delete).
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const deleteInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const invitation = await Invitation.findOne({ _id: id, referrerId: userId });
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Soft delete by setting status to deleted
    invitation.status = 'deleted';
    await invitation.save();

    res.status(200).json({
      success: true,
      message: 'Invitation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete invitation',
      error: error.message
    });
  }
};

/**
 * Get analytics for invitations.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getInvitationAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const userId = req.user.id || req.user._id;

    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get daily invitation trends
    const dailyTrends = await Invitation.aggregate([
      {
        $match: {
          referrerId: userId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          invitations: { $sum: 1 },
          clicks: { $sum: '$tracking.clicks' },
          conversions: { $sum: '$tracking.conversions' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Get invitation type distribution
    const typeDistribution = await Invitation.aggregate([
      {
        $match: {
          referrerId: userId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$invitationType',
          count: { $sum: 1 },
          totalClicks: { $sum: '$tracking.clicks' },
          totalConversions: { $sum: '$tracking.conversions' }
        }
      }
    ]);

    // Get best performing times
    const timePerformance = await Invitation.aggregate([
      {
        $match: {
          referrerId: userId,
          createdAt: { $gte: startDate, $lte: endDate },
          'performance.bestPerformingTime': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$performance.bestPerformingTime',
          invitations: { $sum: 1 },
          avgConversionRate: { $avg: '$tracking.conversionRate' }
        }
      },
      { $sort: { avgConversionRate: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate },
        dailyTrends,
        typeDistribution,
        timePerformance
      }
    });
  } catch (error) {
    console.error('Error getting invitation analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get invitation analytics',
      error: error.message
    });
  }
};

module.exports = {
  createInvitation,
  trackInvitationClick,
  recordInvitationConversion,
  getInvitationStats,
  getInvitationHistory,
  updateInvitationStatus,
  deleteInvitation,
  getInvitationAnalytics
};
