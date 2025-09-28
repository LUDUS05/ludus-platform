/**
 * @fileoverview OnboardingSession model for tracking AI agent onboarding sessions
 * @module models/OnboardingSession
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
  
  // User reference (optional for anonymous sessions)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  // Session status
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'abandoned'],
    default: 'active',
    index: true
  },
  
  // Current onboarding step
  currentStep: {
    type: String,
    enum: ['welcome', 'socialProof', 'auth', 'profile', 'referral', 'interests', 'preferences'],
    index: true
  },
  
  // Completed steps tracking
  completedSteps: [{
    step: {
      type: String,
      enum: ['welcome', 'socialProof', 'auth', 'profile', 'referral', 'interests', 'preferences'],
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  
  // User preferences and collected data
  preferences: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Cultural context for personalization
  culturalContext: {
    type: String,
    default: 'saudi_arabia',
    enum: ['saudi_arabia', 'gulf', 'middle_east', 'international']
  },
  
  // Language preference
  languagePreference: {
    type: String,
    default: 'ar',
    enum: ['ar', 'en']
  },
  
  // Conversation history with AI agent
  conversationHistory: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    step: {
      type: String,
      enum: ['welcome', 'socialProof', 'auth', 'profile', 'referral', 'interests', 'preferences']
    },
    intent: {
      type: String,
      enum: ['registration_help', 'profile_setup', 'feature_explanation', 'technical_support', 'cultural_guidance', 'next_step', 'general_inquiry']
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  
  // Progress tracking
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Session analytics
  analytics: {
    // Time spent on each step (in seconds)
    stepDurations: {
      type: Map,
      of: Number,
      default: new Map()
    },
    
    // Total session duration
    totalDuration: {
      type: Number,
      default: 0 // in seconds
    },
    
    // Number of questions asked
    questionsAsked: {
      type: Number,
      default: 0
    },
    
    // Number of help requests
    helpRequests: {
      type: Number,
      default: 0
    },
    
    // Drop-off points
    dropOffPoints: [{
      step: String,
      timestamp: Date,
      reason: String
    }],
    
    // Cultural tips provided
    culturalTipsProvided: {
      type: Number,
      default: 0
    },
    
    // Language switches during session
    languageSwitches: {
      type: Number,
      default: 0
    }
  },
  
  // Session metadata
  metadata: {
    // Device/browser info
    userAgent: String,
    ipAddress: String,
    
    // Referral source
    referralSource: String,
    
    // UTM parameters
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    
    // Geographic info
    country: String,
    city: String,
    timezone: String,
    
    // Session quality indicators
    completionLikelihood: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    
    // AI agent performance metrics
    agentResponseTime: {
      type: Number,
      default: 0 // in milliseconds
    },
    
    userSatisfactionScore: {
      type: Number,
      min: 1,
      max: 5
    },
    
    // Session tags for categorization
    tags: [String]
  }
}, {
  timestamps: true,
  // Add indexes for performance
  indexes: [
    { sessionId: 1 },
    { userId: 1 },
    { status: 1, createdAt: -1 },
    { currentStep: 1, status: 1 },
    { languagePreference: 1 },
    { 'analytics.totalDuration': -1 },
    { progressPercentage: -1 }
  ]
});

// Middleware to update session analytics
onboardingSessionSchema.pre('save', function(next) {
  if (this.isModified('conversationHistory')) {
    // Update analytics based on conversation
    this.analytics.questionsAsked = this.conversationHistory.filter(
      msg => msg.role === 'user' && msg.content.includes('?')
    ).length;
    
    this.analytics.helpRequests = this.conversationHistory.filter(
      msg => msg.role === 'user' && (
        msg.intent === 'technical_support' || 
        msg.content.toLowerCase().includes('help') ||
        msg.content.toLowerCase().includes('مساعدة')
      )
    ).length;
    
    // Calculate total duration
    if (this.conversationHistory.length > 0) {
      const firstMessage = new Date(this.conversationHistory[0].timestamp);
      const lastMessage = new Date(this.conversationHistory[this.conversationHistory.length - 1].timestamp);
      this.analytics.totalDuration = Math.floor((lastMessage - firstMessage) / 1000);
    }
  }
  
  next();
});

// Static methods
onboardingSessionSchema.statics.findActiveSession = function(userId) {
  return this.findOne({
    userId: userId,
    status: 'active'
  }).sort({ updatedAt: -1 });
};

onboardingSessionSchema.statics.getSessionAnalytics = function(sessionId) {
  return this.findOne({ sessionId }).select('analytics progressPercentage status completedSteps');
};

onboardingSessionSchema.statics.getCompletionStats = function(dateRange = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgProgress: { $avg: '$progressPercentage' },
        avgDuration: { $avg: '$analytics.totalDuration' }
      }
    }
  ]);
};

onboardingSessionSchema.statics.getCulturalAnalytics = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$languagePreference',
        sessions: { $sum: 1 },
        completedSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        avgCulturalTips: { $avg: '$analytics.culturalTipsProvided' },
        avgProgress: { $avg: '$progressPercentage' }
      }
    }
  ]);
};

// Instance methods
onboardingSessionSchema.methods.addConversationEntry = function(role, content, step = null, intent = null, metadata = {}) {
  this.conversationHistory.push({
    role,
    content,
    timestamp: new Date(),
    step,
    intent,
    metadata
  });
  
  // Update progress if step is provided
  if (step && !this.completedSteps.find(cs => cs.step === step)) {
    this.completedSteps.push({
      step,
      completedAt: new Date(),
      data: metadata
    });
    
    // Recalculate progress percentage
    const totalSteps = 7;
    this.progressPercentage = Math.min((this.completedSteps.length / totalSteps) * 100, 100);
  }
  
  return this.save();
};

onboardingSessionSchema.methods.updateStep = function(newStep, completed = false) {
  this.currentStep = newStep;
  
  if (completed && !this.completedSteps.find(cs => cs.step === newStep)) {
    this.completedSteps.push({
      step: newStep,
      completedAt: new Date()
    });
    
    // Recalculate progress
    const totalSteps = 7;
    this.progressPercentage = Math.min((this.completedSteps.length / totalSteps) * 100, 100);
  }
  
  return this.save();
};

onboardingSessionSchema.methods.markCompleted = function(finalData = {}) {
  this.status = 'completed';
  this.progressPercentage = 100;
  this.preferences = { ...this.preferences, ...finalData };
  
  return this.save();
};

onboardingSessionSchema.methods.getProgress = function() {
  return {
    percentage: this.progressPercentage,
    currentStep: this.currentStep,
    completedSteps: this.completedSteps.map(cs => cs.step),
    totalSteps: 7,
    status: this.status
  };
};

module.exports = mongoose.model('OnboardingSession', onboardingSessionSchema);