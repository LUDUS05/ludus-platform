/**
 * @fileoverview Controller for handling user onboarding.
 * @module controllers/onboardingController
 */

const OnboardingConfig = require('../models/OnboardingConfig');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Get the public onboarding configuration.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
exports.getOnboardingConfig = async (req, res) => {
  try {
    const config = await OnboardingConfig.getConfig();
    
    // Ensure steps array exists and is valid
    const steps = config.steps || [];
    
    // Only return enabled steps in order
    const enabledSteps = steps
      .filter(step => step && step.isEnabled)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json({
      success: true,
      config: {
        onboardingEnabled: config.isEnabled,
        isEnabled: config.isEnabled,
        steps: enabledSteps,
        welcomeConfig: config.welcomeConfig || {},
        socialProofConfig: config.socialProofConfig || {},
        authConfig: config.authConfig || {},
        profileConfig: config.profileConfig || {},
        referralConfig: config.referralConfig || {},
        interestsConfig: config.interestsConfig || {},
        preferencesConfig: config.preferencesConfig || {}
      }
    });
  } catch (error) {
    console.error('Get onboarding config error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get onboarding configuration',
      error: error.message 
    });
  }
};

/**
 * Get the onboarding leaderboard.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
exports.getOnboardingLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);
    const users = await User.find({ 'onboardingGamification.points': { $gt: 0 } })
      .select('firstName lastName onboardingGamification.points onboardingGamification.currentStreak onboardingGamification.longestStreak')
      .sort({ 'onboardingGamification.points': -1 })
      .limit(limit)
      .lean();

    const leaderboard = users.map(u => ({
      name: `${u.firstName} ${u.lastName}`.trim(),
      points: u.onboardingGamification?.points || 0,
      currentStreak: u.onboardingGamification?.currentStreak || 0,
      longestStreak: u.onboardingGamification?.longestStreak || 0
    }));

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Get onboarding leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to get leaderboard' });
  }
};

/**
 * Get the full onboarding configuration (admin only).
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
exports.getFullOnboardingConfig = async (req, res) => {
  try {
    console.log('Admin user info:', {
      id: req.user?.id,
      role: req.user?.role,
      adminRole: req.user?.adminRole
    });
    
    // RBAC middleware already validated admin role
    
    const config = await OnboardingConfig.getConfig();
    res.json({
      success: true,
      config: {
        ...config.toObject(),
        onboardingEnabled: config.isEnabled
      }
    });
  } catch (error) {
    console.error('Get full onboarding config error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get onboarding configuration',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Update the onboarding configuration (admin only).
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
exports.updateOnboardingConfig = async (req, res) => {
  try {
    console.log('Update config - Admin user info:', {
      id: req.user?.id,
      role: req.user?.role,
      adminRole: req.user?.adminRole
    });
    console.log('Update config - Request body:', req.body);
    
    // RBAC middleware already validated admin role
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error', 
        errors: errors.array() 
      });
    }

    const updates = req.body;
    const userId = req.user.id;

    console.log('Updating config with:', { updates, userId });

    const config = await OnboardingConfig.updateConfig(updates, userId);
    
    console.log('Config updated successfully:', config);
    
    res.json({ 
      success: true,
      message: 'Onboarding configuration updated successfully',
      config 
    });
  } catch (error) {
    console.error('Update onboarding config error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to update onboarding configuration',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Toggle the onboarding system on or off (admin only).
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
exports.toggleOnboarding = async (req, res) => {
  try {
    const config = await OnboardingConfig.getConfig();
    config.isEnabled = !config.isEnabled;
    config.lastUpdatedBy = req.user.id;
    config.version = config.version + 1;
    await config.save();

    res.json({ 
      success: true,
      message: `Onboarding system ${config.isEnabled ? 'enabled' : 'disabled'}`,
      isEnabled: config.isEnabled 
    });
  } catch (error) {
    console.error('Toggle onboarding error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to toggle onboarding system' 
    });
  }
};

/**
 * Complete a single step of the onboarding process for the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
exports.completeOnboardingStep = async (req, res) => {
  try {
    const { stepId, stepData } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user based on step
    switch (stepId) {
      case 'profile':
        if (stepData.firstName) user.firstName = stepData.firstName;
        if (stepData.lastName) user.lastName = stepData.lastName;
        if (stepData.phone) user.phone = stepData.phone;
        if (stepData.dateOfBirth) user.dateOfBirth = stepData.dateOfBirth;
        break;
      
      case 'interests':
        if (stepData.interests) {
          user.preferences = user.preferences || {};
          user.preferences.categories = stepData.interests;
        }
        break;
      
      case 'preferences':
        if (stepData.preferences) {
          user.preferences = user.preferences || {};
          Object.assign(user.preferences, stepData.preferences);
        }
        break;
      
      case 'referral':
        // Handle referral code if provided
        if (stepData.referralCode) {
          user.referredBy = stepData.referralCode;
        }
        break;
    }

    // Track onboarding progress
    user.onboardingProgress = user.onboardingProgress || {};
    user.onboardingProgress[stepId] = {
      completed: true,
      completedAt: new Date(),
      data: stepData
    };

    // Gamification: award points/badges/streaks for step completion
    user.onboardingGamification = user.onboardingGamification || { points: 0, badges: [] };
    const gamification = { awardedPoints: 0, newBadges: [], currentStreak: 0, longestStreak: 0 };

    // Basic per-step points
    const stepPoints = {
      welcome: 10,
      socialProof: 5,
      auth: 20,
      profile: 25,
      referral: 15,
      interests: 20,
      preferences: 15
    };
    const pointsToAdd = stepPoints[stepId] || 5;
    user.onboardingGamification.points += pointsToAdd;
    gamification.awardedPoints = pointsToAdd;

    // Badge unlocks
    const unlockBadge = (badge) => {
      if (!user.onboardingGamification.badges.includes(badge)) {
        user.onboardingGamification.badges.push(badge);
        gamification.newBadges.push(badge);
      }
    };

    if (stepId === 'auth') unlockBadge('first_login');
    if (stepId === 'profile') unlockBadge('profile_complete');
    if (stepId === 'interests') unlockBadge('interests_selected');
    if (stepId === 'referral' && stepData?.referralCode) unlockBadge('referral_connected');

    // Streak tracking (daily)
    const now = new Date();
    const lastActionAt = user.onboardingGamification.lastActionAt
      ? new Date(user.onboardingGamification.lastActionAt)
      : null;
    const isSameDay = (a, b) => a.toDateString() === b.toDateString();
    const isYesterday = (a, b) => {
      const diff = new Date(a.getFullYear(), a.getMonth(), a.getDate()) - new Date(b.getFullYear(), b.getMonth(), b.getDate());
      return diff === 24 * 60 * 60 * 1000;
    };
    if (!lastActionAt) {
      user.onboardingGamification.currentStreak = 1;
    } else if (isSameDay(now, lastActionAt)) {
      // no change to streak within same day
    } else if (isYesterday(now, lastActionAt)) {
      user.onboardingGamification.currentStreak = (user.onboardingGamification.currentStreak || 0) + 1;
    } else {
      user.onboardingGamification.currentStreak = 1;
    }
    user.onboardingGamification.longestStreak = Math.max(
      user.onboardingGamification.longestStreak || 0,
      user.onboardingGamification.currentStreak || 0
    );
    user.onboardingGamification.lastActionAt = now;
    gamification.currentStreak = user.onboardingGamification.currentStreak;
    gamification.longestStreak = user.onboardingGamification.longestStreak;

    await user.save();

    res.json({
      success: true,
      message: 'Onboarding step completed successfully',
      gamification: {
        totalPoints: user.onboardingGamification.points,
        awardedPoints: gamification.awardedPoints,
        newBadges: gamification.newBadges,
        currentStreak: gamification.currentStreak,
        longestStreak: gamification.longestStreak
      }
    });
  } catch (error) {
    console.error('Complete onboarding step error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to complete onboarding step' 
    });
  }
};

/**
 * Complete the entire onboarding process for the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
exports.completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    const { finalData } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Mark onboarding as completed
    user.onboardingCompleted = true;
    user.onboardingCompletedAt = new Date();
    
    // Apply final data if provided
    if (finalData) {
      if (finalData.preferences) {
        user.preferences = { ...user.preferences, ...finalData.preferences };
      }
      if (finalData.interests) {
        user.preferences = user.preferences || {};
        user.preferences.categories = finalData.interests;
      }
    }

    // Award completion bonus
    user.onboardingGamification = user.onboardingGamification || { points: 0, badges: [] };
    const completionBonus = 50;
    user.onboardingGamification.points += completionBonus;
    if (!user.onboardingGamification.badges.includes('onboarding_complete')) {
      user.onboardingGamification.badges.push('onboarding_complete');
    }

    await user.save();

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      gamification: {
        totalPoints: user.onboardingGamification.points,
        awardedPoints: completionBonus,
        newBadges: ['onboarding_complete'],
        currentStreak: user.onboardingGamification.currentStreak || 0,
        longestStreak: user.onboardingGamification.longestStreak || 0
      }
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to complete onboarding' 
    });
  }
};

/**
 * Get the onboarding progress for the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
exports.getOnboardingProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('onboardingProgress onboardingCompleted onboardingCompletedAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      progress: {
        onboardingProgress: user.onboardingProgress || {},
        onboardingCompleted: user.onboardingCompleted || false,
        onboardingCompletedAt: user.onboardingCompletedAt,
        gamification: {
          totalPoints: user.onboardingGamification?.points || 0,
          badges: user.onboardingGamification?.badges || [],
          currentStreak: user.onboardingGamification?.currentStreak || 0,
          longestStreak: user.onboardingGamification?.longestStreak || 0
        }
      }
    });
  } catch (error) {
    console.error('Get onboarding progress error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get onboarding progress' 
    });
  }
};

/**
 * Reset the onboarding progress for a user (admin only).
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
exports.resetUserOnboarding = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.onboardingCompleted = false;
    user.onboardingCompletedAt = null;
    user.onboardingProgress = {};
    
    await user.save();

    res.json({
      success: true,
      message: 'User onboarding reset successfully'
    });
  } catch (error) {
    console.error('Reset user onboarding error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to reset user onboarding' 
    });
  }
};
