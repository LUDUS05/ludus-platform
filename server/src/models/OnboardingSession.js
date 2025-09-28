/**
 * @fileoverview OnboardingSession model for tracking Selena-Onboard AI agent sessions.
 * 
 * Purpose: Tracks user onboarding progress through the Selena-Onboard AI agent,
 * storing session data, progress tracking, cultural context, and completion analytics
 * for the LUDUS platform's onboarding system.
 * 
 * Business Context: This model enables the Selena-Onboard agent to provide
 * personalized, culturally-aware onboarding assistance for Saudi Arabian users,
 * tracking their progress through registration, profile setup, and platform orientation.
 * 
 * @version 1.0.0
 * @since 2025-09-28
 * @author LUDUS Development Team - Selena-Onboard Implementation
 */

const mongoose = require('mongoose');

const onboardingSessionSchema = new mongoose.Schema({
  // Session identification
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // User association
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for anonymous sessions
    index: true
  },
  
  // Session configuration
  language: {
    type: String,
    enum: ['ar', 'en'],
    default: 'ar',
    required: true
  },
  
  culturalContext: {
    type: String,
    enum: ['saudi', 'international'],
    default: 'saudi',
    required: true
  },
  
  // Progress tracking
  currentStep: {
    type: String,
    enum: [
      'welcome',
      'registration',
      'email_verification', 
      'profile_setup',
      'interests_selection',
      'preferences_setup',
      'cultural_orientation',
      'feature_tour',
      'completion',
      'error_resolution'
    ],
    default: 'welcome',
    required: true
  },
  
  completedSteps: [{
    type: String,
    enum: [
      'welcome',
      'registration',
      'email_verification',
      'profile_setup', 
      'interests_selection',
      'preferences_setup',
      'cultural_orientation',
      'feature_tour'
    ]
  }],
  
  // Step-specific data storage
  stepData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Session preferences collected during onboarding
  preferences: {
    categories: [{
      type: String,
      enum: ['fitness', 'arts', 'food', 'outdoor', 'unique', 'wellness', 'gaming', 'esports', 'board_games']
    }],
    
    activityTypes: [{
      type: String,
      enum: ['indoor', 'outdoor', 'physical', 'mental', 'social', 'solo', 'group']
    }],
    
    timePreferences: [{
      type: String,
      enum: ['weekday-morning', 'weekday-afternoon', 'weekday-evening', 'weekend-morning', 'weekend-afternoon', 'weekend-evening']
    }],
    
    socialPreferences: {
      genderMix: {
        type: String,
        enum: ['mixed', 'same-gender', 'no-preference'],
        default: 'no-preference'
      },
      groupSize: {
        type: String,
        enum: ['small', 'medium', 'large', 'any'],
        default: 'any'
      },
      socialInteraction: {
        type: String,
        enum: ['minimal', 'moderate', 'high'],
        default: 'moderate'
      }
    },
    
    culturalPreferences: {
      prayerTimeConsideration: {
        type: Boolean,
        default: true
      },
      familyFriendly: {
        type: Boolean,
        default: true
      },
      halalOnly: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Interaction tracking
  totalInteractions: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lastInteractionAt: {
    type: Date,
    default: Date.now
  },
  
  averageResponseTime: {
    type: Number, // In seconds
    default: 0
  },
  
  // Completion tracking
  isCompleted: {
    type: Boolean,
    default: false
  },
  
  completedAt: {
    type: Date,
    default: null
  },
  
  completionDuration: {
    type: Number, // In minutes
    default: null
  },
  
  // Analytics and insights
  analytics: {
    helpTopicsRequested: [{
      topic: String,
      requestedAt: Date,
      language: String
    }],
    
    languageSwitches: [{
      fromLanguage: String,
      toLanguage: String,
      switchedAt: Date
    }],
    
    errorEncounters: [{
      errorType: String,
      errorMessage: String,
      step: String,
      resolvedAt: Date
    }],
    
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    
    feedbackText: {
      type: String,
      maxlength: 1000
    }
  },
  
  // Final onboarding data
  finalData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Session metadata
  userAgent: String,
  ipAddress: String,
  referralSource: String,
  
  // Integration status
  mongodbSyncStatus: {
    type: String,
    enum: ['pending', 'synced', 'failed'],
    default: 'pending'
  },
  
  mongodbSyncAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
onboardingSessionSchema.index({ userId: 1, createdAt: -1 });
onboardingSessionSchema.index({ sessionId: 1 });
onboardingSessionSchema.index({ currentStep: 1, isCompleted: 1 });
onboardingSessionSchema.index({ language: 1, culturalContext: 1 });
onboardingSessionSchema.index({ completedAt: -1 });

// Static methods for analytics
onboardingSessionSchema.statics.getCompletionRate = async function() {
  const total = await this.countDocuments();
  const completed = await this.countDocuments({ isCompleted: true });
  return total > 0 ? (completed / total) * 100 : 0;
};

onboardingSessionSchema.statics.getAverageCompletionTime = async function() {
  const sessions = await this.find({ 
    isCompleted: true, 
    completionDuration: { $exists: true, $ne: null } 
  }).select('completionDuration');
  
  if (sessions.length === 0) return 0;
  
  const totalDuration = sessions.reduce((sum, session) => sum + session.completionDuration, 0);
  return totalDuration / sessions.length;
};

onboardingSessionSchema.statics.getLanguageDistribution = async function() {
  const distribution = await this.aggregate([
    { $group: { _id: '$language', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  return distribution.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
};

onboardingSessionSchema.statics.getStepDropoffAnalysis = async function() {
  const stepAnalysis = await this.aggregate([
    { $group: { 
      _id: '$currentStep', 
      count: { $sum: 1 },
      completed: { $sum: { $cond: ['$isCompleted', 1, 0] } }
    }},
    { $addFields: { 
      dropoffRate: { 
        $multiply: [
          { $divide: [{ $subtract: ['$count', '$completed'] }, '$count'] },
          100
        ]
      }
    }},
    { $sort: { dropoffRate: -1 } }
  ]);
  
  return stepAnalysis;
};

// Instance methods
onboardingSessionSchema.methods.updateProgress = function(stepId, stepData = {}) {
  this.currentStep = stepId;
  this.lastInteractionAt = new Date();
  this.totalInteractions += 1;
  
  // Add to completed steps if not already there
  if (!this.completedSteps.includes(stepId) && stepId !== 'completion') {
    this.completedSteps.push(stepId);
  }
  
  // Store step-specific data
  if (stepData && Object.keys(stepData).length > 0) {
    this.stepData.set(stepId, stepData);
  }
  
  return this.save();
};

onboardingSessionSchema.methods.markCompleted = function(finalData = {}) {
  this.isCompleted = true;
  this.completedAt = new Date();
  this.currentStep = 'completion';
  this.finalData = finalData;
  this.mongodbSyncStatus = 'pending';
  
  // Calculate completion duration
  if (this.createdAt) {
    const durationMs = this.completedAt - this.createdAt;
    this.completionDuration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
  }
  
  return this.save();
};

onboardingSessionSchema.methods.addAnalyticsEvent = function(eventType, eventData) {
  const event = {
    ...eventData,
    eventType,
    timestamp: new Date()
  };
  
  switch (eventType) {
    case 'help_requested':
      this.analytics.helpTopicsRequested.push(event);
      break;
    case 'language_switched':
      this.analytics.languageSwitches.push(event);
      break;
    case 'error_encountered':
      this.analytics.errorEncounters.push(event);
      break;
  }
  
  return this.save();
};

// Virtual for progress percentage
onboardingSessionSchema.virtual('progressPercentage').get(function() {
  const totalSteps = ['welcome', 'registration', 'email_verification', 'profile_setup', 'interests_selection', 'preferences_setup', 'cultural_orientation', 'feature_tour'];
  const completedCount = this.completedSteps.length;
  return Math.round((completedCount / totalSteps.length) * 100);
});

module.exports = mongoose.model('OnboardingSession', onboardingSessionSchema);