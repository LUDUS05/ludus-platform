const mongoose = require('mongoose');
const User = require('../models/User');
const Rating = require('../models/Rating');
const RatingSystemConfig = require('../models/RatingSystemConfig');
const UserRatingProfile = require('../models/UserRatingProfile');
const RatingAssignment = require('../models/RatingAssignment');
const RatingRecord = require('../models/RatingRecord');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ludus', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize rating system configuration
const initializeRatingSystemConfig = async () => {
  try {
    console.log('Initializing rating system configuration...');
    const config = await RatingSystemConfig.getConfig();
    console.log('Rating system configuration initialized successfully');
    return config;
  } catch (error) {
    console.error('Error initializing rating system config:', error);
    throw error;
  }
};

// Migrate user rating data
const migrateUserRatings = async () => {
  try {
    console.log('Starting user rating migration...');
    
    const users = await User.find({}).select('_id communityRating');
    let migratedCount = 0;
    
    for (const user of users) {
      // Check if user already has a rating profile
      const existingProfile = await UserRatingProfile.findOne({ userId: user._id });
      if (existingProfile) {
        console.log(`User ${user._id} already has a rating profile, skipping...`);
        continue;
      }
      
      // Create new rating profile
      const ratingProfile = new UserRatingProfile({
        userId: user._id,
        overall: {
          currentScore: user.communityRating.averageRating || 0,
          baseScore: user.communityRating.averageRating || 0,
          totalRatings: user.communityRating.totalRatings || 0,
          lastCalculated: user.communityRating.lastUpdated || new Date(),
          trend: 'stable'
        },
        criteria: {
          punctuality: { score: user.communityRating.averageRating || 0, count: 0 },
          engagement: { score: user.communityRating.averageRating || 0, count: 0 },
          respectfulness: { score: user.communityRating.averageRating || 0, count: 0 },
          teamwork: { score: user.communityRating.averageRating || 0, count: 0 }
        },
        tier: {
          current: 'bronze',
          previous: 'bronze',
          changedAt: new Date(),
          nextTierProgress: 0
        },
        monthlyActivity: {
          currentMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
          participationCount: 0,
          bonusApplied: false,
          bonusAmount: 0,
          consecutiveActiveMonths: 0
        },
        rewards: {
          currentDiscountRate: 0,
          freeCredits: 0,
          unlockedBenefits: ['basic_booking_access'],
          nextRewardAt: null,
          totalCreditsEarned: 0
        },
        statistics: {
          totalEventsParticipated: 0,
          averageRatingGiven: 0,
          ratingsGivenCount: 0,
          favoriteCategories: [],
          streakCount: 0,
          longestStreak: 0,
          currentStreak: 0,
          totalHoursParticipated: 0,
          averageSessionDuration: 0
        },
        ratingBehavior: {
          averageTimeToRate: 0,
          ratingCompletionRate: 0,
          helpfulRatingsCount: 0,
          flaggedRatingsCount: 0
        }
      });
      
      await ratingProfile.save();
      
      // Update user with rating profile reference
      await User.findByIdAndUpdate(user._id, { ratingProfile: ratingProfile._id });
      
      migratedCount++;
      console.log(`Migrated user ${user._id} (${migratedCount}/${users.length})`);
    }
    
    console.log(`User rating migration completed. Migrated ${migratedCount} users.`);
  } catch (error) {
    console.error('Error migrating user ratings:', error);
    throw error;
  }
};

// Migrate existing rating records
const migrateRatingRecords = async () => {
  try {
    console.log('Starting rating records migration...');
    
    const ratings = await Rating.find({}).populate('rater event');
    let migratedCount = 0;
    
    for (const rating of ratings) {
      // Check if rating record already exists
      const existingRecord = await RatingRecord.findOne({
        eventId: rating.event._id,
        raterId: rating.rater._id
      });
      
      if (existingRecord) {
        console.log(`Rating record already exists for event ${rating.event._id} and rater ${rating.rater._id}, skipping...`);
        continue;
      }
      
      // Migrate participant ratings
      for (const participantRating of rating.participantRatings) {
        const ratingRecord = new RatingRecord({
          eventId: rating.event._id,
          activityTitle: rating.event.title || 'Unknown Activity',
          activityDate: rating.event.date || new Date(),
          raterId: rating.rater._id,
          raterName: `${rating.rater.firstName} ${rating.rater.lastName}`,
          raterTier: 'bronze', // Default tier for migrated ratings
          targetUserId: participantRating.participant,
          targetName: 'Unknown User', // Will be populated if needed
          targetType: 'peer',
          targetTier: 'bronze',
          criteria: {
            punctuality: { score: participantRating.rating, comment: participantRating.comment || '' },
            engagement: { score: participantRating.rating, comment: participantRating.comment || '' },
            respectfulness: { score: participantRating.rating, comment: participantRating.comment || '' },
            teamwork: { score: participantRating.rating, comment: participantRating.comment || '' }
          },
          overallScore: participantRating.rating,
          weightedScore: participantRating.rating,
          criteriaWeights: {
            punctuality: 0.2,
            engagement: 0.3,
            respectfulness: 0.3,
            teamwork: 0.2
          },
          generalComment: rating.feedback || '',
          wouldParticipateAgain: true,
          reportFlags: [],
          submittedAt: rating.submittedAt || new Date(),
          ipAddress: 'migrated',
          userAgent: 'migration',
          deviceInfo: 'desktop',
          responseTime: 0,
          isVerified: rating.status === 'verified',
          verificationMethod: 'migration',
          verificationScore: 1.0,
          impactOnTarget: {
            tierChangeBefore: 'bronze',
            tierChangeAfter: 'bronze',
            scoreChangeBefore: 0,
            scoreChangeAfter: 0,
            tierChanged: false,
            scoreImpact: 0
          },
          qualityMetrics: {
            completenessScore: 1.0,
            consistencyScore: 1.0,
            helpfulnessScore: 0.5,
            isOutlier: false,
            outlierReason: 'none'
          },
          status: rating.status === 'flagged' ? 'flagged' : 'verified',
          analytics: {
            viewCount: 0,
            helpfulVotes: 0,
            notHelpfulVotes: 0,
            shareCount: 0
          }
        });
        
        await ratingRecord.save();
        migratedCount++;
      }
      
      console.log(`Migrated rating for event ${rating.event._id} (${migratedCount} records created)`);
    }
    
    console.log(`Rating records migration completed. Created ${migratedCount} rating records.`);
  } catch (error) {
    console.error('Error migrating rating records:', error);
    throw error;
  }
};

// Update user rating profiles with migrated data
const updateUserRatingProfiles = async () => {
  try {
    console.log('Updating user rating profiles with migrated data...');
    
    const config = await RatingSystemConfig.getConfig();
    const profiles = await UserRatingProfile.find({});
    
    for (const profile of profiles) {
      // Get all ratings for this user
      const userRatings = await RatingRecord.find({ targetUserId: profile.userId });
      
      if (userRatings.length > 0) {
        // Calculate new overall score
        const totalScore = userRatings.reduce((sum, rating) => sum + rating.overallScore, 0);
        const averageScore = totalScore / userRatings.length;
        
        // Update profile
        profile.overall.currentScore = averageScore;
        profile.overall.baseScore = averageScore;
        profile.overall.totalRatings = userRatings.length;
        profile.overall.lastCalculated = new Date();
        
        // Update tier
        const newTier = config.getTierForRating(averageScore);
        if (newTier !== profile.tier.current) {
          profile.tier.previous = profile.tier.current;
          profile.tier.current = newTier;
          profile.tier.changedAt = new Date();
        }
        
        // Update rewards
        profile.rewards.currentDiscountRate = config.getDiscountRate(newTier);
        profile.rewards.unlockedBenefits = config.getTierBenefits(newTier);
        
        // Update statistics
        profile.statistics.totalEventsParticipated = userRatings.length;
        
        await profile.save();
        console.log(`Updated profile for user ${profile.userId} with ${userRatings.length} ratings`);
      }
    }
    
    console.log('User rating profiles update completed.');
  } catch (error) {
    console.error('Error updating user rating profiles:', error);
    throw error;
  }
};

// Main migration function
const runMigration = async () => {
  try {
    console.log('Starting LUDUS Rating System Migration...');
    console.log('=====================================');
    
    await connectDB();
    
    // Step 1: Initialize rating system configuration
    await initializeRatingSystemConfig();
    
    // Step 2: Migrate user ratings
    await migrateUserRatings();
    
    // Step 3: Migrate rating records
    await migrateRatingRecords();
    
    // Step 4: Update user rating profiles
    await updateUserRatingProfiles();
    
    console.log('=====================================');
    console.log('Rating System Migration Completed Successfully!');
    console.log('=====================================');
    
    // Display migration summary
    const totalUsers = await User.countDocuments();
    const totalProfiles = await UserRatingProfile.countDocuments();
    const totalRecords = await RatingRecord.countDocuments();
    const totalConfigs = await RatingSystemConfig.countDocuments();
    
    console.log('Migration Summary:');
    console.log(`- Total Users: ${totalUsers}`);
    console.log(`- Rating Profiles Created: ${totalProfiles}`);
    console.log(`- Rating Records Migrated: ${totalRecords}`);
    console.log(`- System Configurations: ${totalConfigs}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run migration if this script is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  runMigration,
  initializeRatingSystemConfig,
  migrateUserRatings,
  migrateRatingRecords,
  updateUserRatingProfiles
};
