const Referral = require('../models/Referral');
const ReferralCode = require('../models/ReferralCode');
const ReferralReward = require('../models/ReferralReward');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Notification = require('../models/Notification');

// @desc    Generate unique referral code for user
// @route   POST /api/referrals/generate-code
// @access  Private
const generateReferralCode = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Check if user already has a referral code
    let existingCode = await ReferralCode.findOne({ userId });
    
    if (existingCode) {
      return res.status(200).json({
        success: true,
        data: {
          referralCode: existingCode.code,
          message: 'Referral code already exists'
        }
      });
    }
    
    // Generate unique referral code
    const code = await ReferralCode.generateUniqueCode();
    
    // Create referral code record
    const referralCode = await ReferralCode.create({
      userId,
      code
    });
    
    // Update user with referral code
    await User.findByIdAndUpdate(userId, {
      referralCode: code
    });
    
    res.status(201).json({
      success: true,
      data: {
        referralCode: code,
        message: 'Referral code generated successfully'
      }
    });
  } catch (error) {
    console.error('Error generating referral code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate referral code',
      error: error.message
    });
  }
};

// @desc    Process referral during user registration
// @route   POST /api/referrals/process-registration
// @access  Public
const processReferralRegistration = async (req, res) => {
  try {
    const { referralCode, newUserId, source, platform, userAgent, ipAddress } = req.body;
    
    if (!referralCode || !newUserId) {
      return res.status(400).json({
        success: false,
        message: 'Referral code and new user ID are required'
      });
    }
    
    // Find the referral code
    const codeRecord = await ReferralCode.findOne({ 
      code: referralCode,
      isActive: true 
    });
    
    if (!codeRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive referral code'
      });
    }
    
    // Check if code can be used
    if (!codeRecord.canBeUsed()) {
      return res.status(400).json({
        success: false,
        message: 'Referral code cannot be used'
      });
    }
    
    // Get reward amount for registration
    const reward = await ReferralReward.getRewardByType('registration');
    if (!reward || !reward.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Registration reward not available'
      });
    }
    
    // Create referral record
    const referral = await Referral.create({
      referrerId: codeRecord.userId,
      referredUserId: newUserId,
      referralCode,
      rewardType: 'registration',
      rewardAmount: reward.amount,
      currency: reward.currency,
      metadata: {
        source: source || 'direct-link',
        platform: platform || 'unknown',
        userAgent,
        ipAddress
      }
    });
    
    // Update referral code usage
    await codeRecord.incrementUsage();
    
    // Update referrer stats
    await User.findByIdAndUpdate(codeRecord.userId, {
      $inc: { 'referralStats.totalReferrals': 1 },
      $set: { 'referralStats.lastReferralAt': new Date() }
    });
    
    // Update referred user
    await User.findByIdAndUpdate(newUserId, {
      referredBy: referralCode
    });
    
    // Credit referrer's wallet
    try {
      const referrerWallet = await Wallet.findOne({ userId: codeRecord.userId });
      if (referrerWallet) {
        referrerWallet.balance += reward.amount;
        referrerWallet.transactions.push({
          type: 'referral_reward',
          amount: reward.amount,
          currency: reward.currency,
          description: `Referral reward for new user registration`,
          referralId: referral._id,
          timestamp: new Date()
        });
        await referrerWallet.save();
      }
    } catch (walletError) {
      console.error('Error crediting wallet:', walletError);
      // Don't fail the referral process if wallet credit fails
    }

    // Create notification for referrer
    try {
      await Notification.createReferralRewardNotification(
        codeRecord.userId,
        'registration',
        reward.amount,
        reward.currency,
        referralCode
      );
    } catch (notificationError) {
      console.error('Failed to create referral reward notification:', notificationError);
      // Don't fail the referral process if notification fails
    }
    
    res.status(200).json({
      success: true,
      data: {
        referralId: referral._id,
        referrerId: codeRecord.userId,
        rewardAmount: reward.amount,
        message: 'Referral processed successfully'
      }
    });
  } catch (error) {
    console.error('Error processing referral registration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process referral',
      error: error.message
    });
  }
};

// @desc    Process referral reward for first booking
// @route   POST /api/referrals/process-booking
// @access  Private
const processReferralBooking = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Find user and check if they were referred
    const user = await User.findById(userId);
    if (!user || !user.referredBy) {
      return res.status(400).json({
        success: false,
        message: 'User not found or not referred'
      });
    }
    
    // Check if first booking reward already given
    if (user.referralStats.firstBookingCompleted) {
      return res.status(400).json({
        success: false,
        message: 'First booking reward already given'
      });
    }
    
    // Find the referral record
    const referral = await Referral.findOne({
      referredUserId: userId,
      rewardType: 'registration'
    });
    
    if (!referral) {
      return res.status(400).json({
        success: false,
        message: 'Referral record not found'
      });
    }
    
    // Get reward amount for first booking
    const reward = await ReferralReward.getRewardByType('first-booking');
    if (!reward || !reward.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'First booking reward not available'
      });
    }
    
    // Create first booking referral record
    const bookingReferral = await Referral.create({
      referrerId: referral.referrerId,
      referredUserId: userId,
      referralCode: referral.referralCode,
      rewardType: 'first-booking',
      rewardAmount: reward.amount,
      currency: reward.currency,
      status: 'completed',
      completedAt: new Date(),
      paymentStatus: 'pending'
    });
    
    // Update referral code earnings
    const codeRecord = await ReferralCode.findOne({ code: referral.referralCode });
    if (codeRecord) {
      await codeRecord.addEarnings(reward.amount);
    }
    
    // Update referrer stats
    await User.findByIdAndUpdate(referral.referrerId, {
      $inc: { 
        'referralStats.totalReferrals': 1,
        'referralStats.totalEarnings': reward.amount
      },
      $set: { 'referralStats.lastReferralAt': new Date() }
    });
    
    // Update referred user
    await User.findByIdAndUpdate(userId, {
      'referralStats.firstBookingCompleted': true
    });
    
    // Credit referrer's wallet
    try {
      const referrerWallet = await Wallet.findOne({ userId: referral.referrerId });
      if (referrerWallet) {
        referrerWallet.balance += reward.amount;
        referrerWallet.transactions.push({
          type: 'referral_reward',
          amount: reward.amount,
          currency: reward.currency,
          description: `Referral reward for first booking`,
          referralId: bookingReferral._id,
          timestamp: new Date()
        });
        await referrerWallet.save();
      }
    } catch (walletError) {
      console.error('Error crediting wallet:', walletError);
      // Don't fail the referral process if wallet credit fails
    }

    // Create notification for referrer
    try {
      await Notification.createReferralRewardNotification(
        referral.referrerId,
        'first-booking',
        reward.amount,
        reward.currency,
        referral.referralCode
      );
    } catch (notificationError) {
      console.error('Failed to create referral reward notification:', notificationError);
      // Don't fail the referral process if notification fails
    }
    
    res.status(200).json({
      success: true,
      data: {
        referralId: bookingReferral._id,
        referrerId: referral.referrerId,
        rewardAmount: reward.amount,
        message: 'First booking referral reward processed successfully'
      }
    });
  } catch (error) {
    console.error('Error processing referral booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process referral booking',
      error: error.message
    });
  }
};

// @desc    Get referral statistics for user
// @route   GET /api/referrals/stats/:userId
// @access  Private
const getReferralStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's referral code
    const user = await User.findById(userId).select('referralCode referralStats');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get referral code details
    const referralCode = await ReferralCode.findOne({ userId });
    
    // Get referral history
    const referrals = await Referral.getUserReferrals(userId);
    
    // Get total earnings
    const earningsResult = await Referral.getUserEarnings(userId);
    const totalEarnings = earningsResult[0]?.totalEarnings || 0;
    
    res.status(200).json({
      success: true,
      data: {
        referralCode: user.referralCode,
        totalReferrals: user.referralStats.totalReferrals,
        totalEarnings: totalEarnings,
        referralHistory: referrals,
        codeDetails: referralCode ? {
          usageCount: referralCode.usageCount,
          totalEarnings: referralCode.totalEarnings,
          isActive: referralCode.isActive
        } : null
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

// @desc    Get referral history for user
// @route   GET /api/referrals/history/:userId
// @access  Private
const getReferralHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const referrals = await Referral.find({ referrerId: userId })
      .populate('referredUserId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Referral.countDocuments({ referrerId: userId });
    
    res.status(200).json({
      success: true,
      data: {
        referrals,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting referral history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral history',
      error: error.message
    });
  }
};

module.exports = {
  generateReferralCode,
  processReferralRegistration,
  processReferralBooking,
  getReferralStats,
  getReferralHistory
};
