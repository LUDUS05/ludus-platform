const OnboardingConfig = require('../models/OnboardingConfig');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get onboarding configuration (public)
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

// Get full onboarding configuration (admin only)
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

// Update onboarding configuration (admin only)
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

// Toggle onboarding system (admin only)
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

// Complete onboarding step
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

    await user.save();

    res.json({
      success: true,
      message: 'Onboarding step completed successfully'
    });
  } catch (error) {
    console.error('Complete onboarding step error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to complete onboarding step' 
    });
  }
};

// Complete entire onboarding
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

    await user.save();

    res.json({
      success: true,
      message: 'Onboarding completed successfully'
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to complete onboarding' 
    });
  }
};

// Get user onboarding progress
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
        onboardingCompletedAt: user.onboardingCompletedAt
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

// Reset user onboarding (admin only)
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
