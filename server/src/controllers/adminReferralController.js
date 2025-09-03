const Referral = require('../models/Referral');
const ReferralCode = require('../models/ReferralCode');
const ReferralReward = require('../models/ReferralReward');
const User = require('../models/User');

// @desc    Get comprehensive referral statistics for admin
// @route   GET /api/admin/referrals/stats
// @access  Private (Admin only)
const getReferralStats = async (req, res) => {
  try {
    // Get total referrals
    const totalReferrals = await Referral.countDocuments();
    
    // Get active referrers (users who have made at least one referral)
    const activeReferrers = await User.countDocuments({
      'referralStats.totalReferrals': { $gt: 0 }
    });
    
    // Get total rewards paid
    const totalRewardsResult = await Referral.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$rewardAmount' } } }
    ]);
    const totalRewardsPaid = totalRewardsResult[0]?.total || 0;
    
    // Get monthly referrals (current month)
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthlyReferrals = await Referral.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // Get average referrals per user
    const avgReferralsResult = await User.aggregate([
      { $match: { 'referralStats.totalReferrals': { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$referralStats.totalReferrals' } } }
    ]);
    const avgReferralsPerUser = avgReferralsResult[0]?.avg || 0;
    
    // Get active referral codes
    const activeReferralCodes = await ReferralCode.countDocuments({ isActive: true });
    
    // Calculate conversion rate (referrals that resulted in completed rewards)
    const completedReferrals = await Referral.countDocuments({ status: 'completed' });
    const conversionRate = totalReferrals > 0 ? (completedReferrals / totalReferrals) * 100 : 0;
    
    // Get referral trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrends = await Referral.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalRewards: { $sum: '$rewardAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalReferrals,
        activeReferrers,
        totalRewardsPaid,
        monthlyReferrals,
        avgReferralsPerUser: Math.round(avgReferralsPerUser * 100) / 100,
        activeReferralCodes,
        conversionRate: Math.round(conversionRate * 100) / 100,
        monthlyTrends
      }
    });
  } catch (error) {
    console.error('Error getting referral stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral statistics',
      error: error.message
    });
  }
};

// @desc    Get top inviters leaderboard
// @route   GET /api/admin/referrals/top-inviters
// @access  Private (Admin only)
const getTopInviters = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topInviters = await User.aggregate([
      { $match: { 'referralStats.totalReferrals': { $gt: 0 } } },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          totalReferrals: '$referralStats.totalReferrals',
          totalEarnings: '$referralStats.totalEarnings',
          lastReferralAt: '$referralStats.lastReferralAt'
        }
      },
      { $sort: { totalReferrals: -1, totalEarnings: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.status(200).json({
      success: true,
      data: topInviters
    });
  } catch (error) {
    console.error('Error getting top inviters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top inviters',
      error: error.message
    });
  }
};

// @desc    Get current referral rewards configuration
// @route   GET /api/admin/referrals/rewards
// @access  Private (Admin only)
const getReferralRewards = async (req, res) => {
  try {
    const rewards = await ReferralReward.find({ isActive: true });
    
    // Format rewards by type
    const formattedRewards = {};
    rewards.forEach(reward => {
      formattedRewards[reward.rewardType] = {
        id: reward._id,
        amount: reward.amount,
        currency: reward.currency,
        description: reward.description,
        conditions: reward.conditions,
        isActive: reward.isActive,
        version: reward.metadata.version
      };
    });
    
    res.status(200).json({
      success: true,
      data: formattedRewards
    });
  } catch (error) {
    console.error('Error getting referral rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral rewards',
      error: error.message
    });
  }
};

// @desc    Update referral rewards
// @route   PUT /api/admin/referrals/rewards
// @access  Private (Admin only)
const updateReferralRewards = async (req, res) => {
  try {
    const { registration, firstBooking } = req.body;
    const adminUserId = req.user.userId;
    
    const updates = [];
    
    // Update registration reward
    if (registration && registration.amount !== undefined) {
      const registrationReward = await ReferralReward.findOne({ rewardType: 'registration' });
      if (registrationReward) {
        await registrationReward.updateAmount(registration.amount, adminUserId);
        updates.push('registration');
      }
    }
    
    // Update first booking reward
    if (firstBooking && firstBooking.amount !== undefined) {
      const firstBookingReward = await ReferralReward.findOne({ rewardType: 'first-booking' });
      if (firstBookingReward) {
        await firstBookingReward.updateAmount(firstBooking.amount, adminUserId);
        updates.push('first-booking');
      }
    }
    
    // Get updated rewards
    const updatedRewards = await ReferralReward.find({ isActive: true });
    const formattedRewards = {};
    updatedRewards.forEach(reward => {
      formattedRewards[reward.rewardType] = {
        id: reward._id,
        amount: reward.amount,
        currency: reward.currency,
        description: reward.description,
        conditions: reward.conditions,
        isActive: reward.isActive,
        version: reward.metadata.version
      };
    });
    
    res.status(200).json({
      success: true,
      message: `Successfully updated ${updates.join(', ')} rewards`,
      data: formattedRewards
    });
  } catch (error) {
    console.error('Error updating referral rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update referral rewards',
      error: error.message
    });
  }
};

// @desc    Get detailed referral analytics
// @route   GET /api/admin/referrals/analytics
// @access  Private (Admin only)
const getReferralAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
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
    
    // Get referrals by source/platform
    const referralsBySource = await Referral.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$metadata.source',
          count: { $sum: 1 },
          totalRewards: { $sum: '$rewardAmount' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get referrals by platform
    const referralsByPlatform = await Referral.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$metadata.platform',
          count: { $sum: 1 },
          totalRewards: { $sum: '$rewardAmount' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get daily referral trends
    const dailyTrends = await Referral.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 },
          totalRewards: { $sum: '$rewardAmount' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);
    
    // Get reward type distribution
    const rewardTypeDistribution = await Referral.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$rewardType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$rewardAmount' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate },
        referralsBySource,
        referralsByPlatform,
        dailyTrends,
        rewardTypeDistribution
      }
    });
  } catch (error) {
    console.error('Error getting referral analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral analytics',
      error: error.message
    });
  }
};

// @desc    Export referral data as CSV
// @route   GET /api/admin/referrals/export
// @access  Private (Admin only)
const exportReferralData = async (req, res) => {
  try {
    const { format = 'csv', period = 'all' } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (period !== 'all') {
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
      }
      
      dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };
    }
    
    // Get all referrals with populated user data
    const referrals = await Referral.find(dateFilter)
      .populate('referrerId', 'firstName lastName email')
      .populate('referredUserId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Referral ID',
        'Referrer Name',
        'Referrer Email',
        'Referred User Name',
        'Referred User Email',
        'Referral Code',
        'Reward Type',
        'Reward Amount',
        'Status',
        'Created Date',
        'Completed Date',
        'Source',
        'Platform'
      ];
      
      const csvRows = referrals.map(referral => [
        referral._id,
        `${referral.referrerId?.firstName || ''} ${referral.referrerId?.lastName || ''}`,
        referral.referrerId?.email || '',
        `${referral.referredUserId?.firstName || ''} ${referral.referredUserId?.lastName || ''}`,
        referral.referredUserId?.email || '',
        referral.referralCode,
        referral.rewardType,
        referral.rewardAmount,
        referral.status,
        referral.createdAt.toISOString(),
        referral.completedAt ? referral.completedAt.toISOString() : '',
        referral.metadata?.source || '',
        referral.metadata?.platform || ''
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=referral-data-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
    } else {
      // Return JSON
      res.status(200).json({
        success: true,
        data: referrals
      });
    }
  } catch (error) {
    console.error('Error exporting referral data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export referral data',
      error: error.message
    });
  }
};

module.exports = {
  getReferralStats,
  getTopInviters,
  getReferralRewards,
  updateReferralRewards,
  getReferralAnalytics,
  exportReferralData
};
