/**
 * @fileoverview Enhanced Models Index for LUDUS platform - LDS-006 Implementation
 * 
 * This file exports all enhanced models for the LUDUS social activity platform
 * based on the comprehensive database design specification. It provides a centralized
 * way to import and use all enhanced models with their full functionality.
 * 
 * Key Features:
 * - Centralized model exports
 * - Enhanced schemas with Arabic/English support
 * - Comprehensive validation and constraints
 * - Geospatial and performance optimizations
 * - Cultural sensitivity for Saudi market
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

// Enhanced Core Models
const UserEnhanced = require('./UserEnhanced');
const ActivityEnhanced = require('./ActivityEnhanced');
const BookingEnhanced = require('./BookingEnhanced');
const ReviewEnhanced = require('./ReviewEnhanced');
const PartnerEnhanced = require('./PartnerEnhanced');
const CategoryEnhanced = require('./CategoryEnhanced');
const PaymentEnhanced = require('./PaymentEnhanced');
const NotificationEnhanced = require('./NotificationEnhanced');
const LocationEnhanced = require('./LocationEnhanced');

// Legacy Models (for backward compatibility)
const User = require('./User');
const Activity = require('./Activity');
const Booking = require('./Booking');
const Vendor = require('./Vendor');
const Rating = require('./Rating');
const Notification = require('./Notification');
const Page = require('./Page');
const SiteSettings = require('./SiteSettings');
const Referral = require('./Referral');
const ReferralCode = require('./ReferralCode');
const ReferralReward = require('./ReferralReward');
const ReferralConversion = require('./ReferralConversion');
const Wallet = require('./Wallet');
const Form = require('./Form');
const FormResponse = require('./FormResponse');
const Invitation = require('./Invitation');
const Like = require('./Like');
const OnboardingConfig = require('./OnboardingConfig');
const AdminRole = require('./AdminRole');
const RatingAssignment = require('./RatingAssignment');
const RatingRecord = require('./RatingRecord');
const RatingSystemConfig = require('./RatingSystemConfig');
const UserRatingProfile = require('./UserRatingProfile');

// Enhanced Models Export
const EnhancedModels = {
  User: UserEnhanced,
  Activity: ActivityEnhanced,
  Booking: BookingEnhanced,
  Review: ReviewEnhanced,
  Partner: PartnerEnhanced,
  Category: CategoryEnhanced,
  Payment: PaymentEnhanced,
  Notification: NotificationEnhanced,
  Location: LocationEnhanced
};

// Legacy Models Export
const LegacyModels = {
  User,
  Activity,
  Booking,
  Vendor,
  Rating,
  Notification,
  Page,
  SiteSettings,
  Referral,
  ReferralCode,
  ReferralReward,
  ReferralConversion,
  Wallet,
  Form,
  FormResponse,
  Invitation,
  Like,
  OnboardingConfig,
  AdminRole,
  RatingAssignment,
  RatingRecord,
  RatingSystemConfig,
  UserRatingProfile
};

// All Models Export
const AllModels = {
  ...EnhancedModels,
  ...LegacyModels
};

// Model Categories for Easy Access
const ModelCategories = {
  // Core Business Models
  core: {
    User: UserEnhanced,
    Activity: ActivityEnhanced,
    Booking: BookingEnhanced,
    Review: ReviewEnhanced,
    Partner: PartnerEnhanced
  },
  
  // Supporting Models
  supporting: {
    Category: CategoryEnhanced,
    Location: LocationEnhanced,
    Payment: PaymentEnhanced,
    Notification: NotificationEnhanced
  },
  
  // Legacy Models
  legacy: LegacyModels,
  
  // All Enhanced Models
  enhanced: EnhancedModels
};

// Model Relationships for Reference
const ModelRelationships = {
  User: {
    hasMany: ['Booking', 'Review', 'Notification'],
    belongsTo: ['Location'],
    references: ['Partner', 'Category']
  },
  Activity: {
    hasMany: ['Booking', 'Review'],
    belongsTo: ['Partner', 'Category', 'Location'],
    references: ['User']
  },
  Booking: {
    hasMany: ['Payment', 'Review'],
    belongsTo: ['User', 'Activity', 'Partner'],
    references: ['Location']
  },
  Review: {
    belongsTo: ['User', 'Activity', 'Booking'],
    references: ['Partner']
  },
  Partner: {
    hasMany: ['Activity'],
    belongsTo: ['Location'],
    references: ['User', 'Category']
  },
  Category: {
    hasMany: ['Activity'],
    belongsTo: ['Category'],
    references: ['User']
  },
  Payment: {
    belongsTo: ['Booking', 'User'],
    references: ['Activity']
  },
  Notification: {
    belongsTo: ['User'],
    references: ['Booking', 'Activity', 'Payment']
  },
  Location: {
    hasMany: ['User', 'Activity', 'Partner', 'Location'],
    belongsTo: ['Location'],
    references: ['Category']
  }
};

// Export all models and utilities
module.exports = {
  // Enhanced Models
  ...EnhancedModels,
  
  // Legacy Models
  ...LegacyModels,
  
  // All Models
  ...AllModels,
  
  // Model Categories
  categories: ModelCategories,
  
  // Model Relationships
  relationships: ModelRelationships,
  
  // Utility Functions
  utils: {
    /**
     * Get all enhanced models
     * @returns {Object} Object containing all enhanced models
     */
    getEnhancedModels: () => EnhancedModels,
    
    /**
     * Get all legacy models
     * @returns {Object} Object containing all legacy models
     */
    getLegacyModels: () => LegacyModels,
    
    /**
     * Get models by category
     * @param {string} category - Category name
     * @returns {Object} Object containing models in the category
     */
    getModelsByCategory: (category) => ModelCategories[category] || {},
    
    /**
     * Get model relationships
     * @param {string} modelName - Model name
     * @returns {Object} Object containing model relationships
     */
    getModelRelationships: (modelName) => ModelRelationships[modelName] || {},
    
    /**
     * Check if model is enhanced
     * @param {string} modelName - Model name
     * @returns {boolean} True if model is enhanced, false otherwise
     */
    isEnhancedModel: (modelName) => EnhancedModels.hasOwnProperty(modelName),
    
    /**
     * Get model by name
     * @param {string} modelName - Model name
     * @returns {Object} Model schema or null if not found
     */
    getModel: (modelName) => AllModels[modelName] || null
  }
};

// Default export for convenience
module.exports.default = AllModels;

