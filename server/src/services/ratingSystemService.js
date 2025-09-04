const RatingSystemConfig = require('../models/RatingSystemConfig');
const UserRatingProfile = require('../models/UserRatingProfile');
const RatingAssignment = require('../models/RatingAssignment');
const RatingRecord = require('../models/RatingRecord');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');

class RatingSystemService {
  constructor() {
    this.config = null;
    this.initializeConfig();
  }

  // Initialize rating system configuration
  async initializeConfig() {
    try {
      this.config = await RatingSystemConfig.getConfig();
      console.log('Rating system configuration loaded successfully');
    } catch (error) {
      console.error('Failed to load rating system configuration:', error);
      throw error;
    }
  }

  // Ensure config is loaded
  async ensureConfig() {
    if (!this.config) {
      await this.initializeConfig();
    }
    return this.config;
  }

  // Create or get user rating profile
  async getUserRatingProfile(userId) {
    try {
      let profile = await UserRatingProfile.findOne({ userId });
      
      if (!profile) {
        // Create new profile for user
        profile = new UserRatingProfile({
          userId,
          overall: {
            currentScore: 0,
            baseScore: 0,
            totalRatings: 0,
            lastCalculated: new Date(),
            trend: 'stable'
          },
          criteria: {
            punctuality: { score: 0, count: 0 },
            engagement: { score: 0, count: 0 },
            respectfulness: { score: 0, count: 0 },
            teamwork: { score: 0, count: 0 }
          },
          tier: {
            current: 'bronze',
            previous: 'bronze',
            changedAt: new Date(),
            nextTierProgress: 0
          },
          monthlyActivity: {
            currentMonth: new Date().toISOString().slice(0, 7),
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

        await profile.save();

        // Update user with rating profile reference
        await User.findByIdAndUpdate(userId, { ratingProfile: profile._id });
      }

      return profile;
    } catch (error) {
      console.error('Error getting user rating profile:', error);
      throw error;
    }
  }

  // Create rating assignments for an event
  async createRatingAssignments(eventId) {
    try {
      const config = await this.ensureConfig();
      
      // Get event details
      const event = await Activity.findById(eventId).populate('vendor');
      if (!event) {
        throw new Error('Event not found');
      }

      // Get confirmed participants
      const bookings = await Booking.find({
        activity: eventId,
        status: { $in: ['confirmed', 'completed'] }
      }).populate('user');

      const participants = bookings.map(booking => ({
        id: booking.user._id,
        name: `${booking.user.firstName} ${booking.user.lastName}`,
        joined: booking.createdAt,
        tier: 'bronze' // Will be updated with actual tier
      }));

      // Check minimum participants requirement
      if (participants.length < config.systemSettings.minParticipantsForRating) {
        console.log(`Not enough participants for rating (${participants.length} < ${config.systemSettings.minParticipantsForRating})`);
        return null;
      }

      // Get user tiers
      for (let participant of participants) {
        const profile = await this.getUserRatingProfile(participant.id);
        participant.tier = profile.tier.current;
      }

      // Create rating assignment document
      const assignment = new RatingAssignment({
        eventId,
        activityTitle: event.title,
        vendorId: event.vendor._id,
        vendorName: event.vendor.name,
        activityDate: event.date,
        activityCategory: event.category,
        participants,
        assignments: [],
        distributionMetrics: {
          totalAssignments: 0,
          completedRatings: 0,
          coveragePercentage: 0,
          balanceScore: 0,
          averageRatingsPerUser: 0,
          minRatingsPerUser: 0,
          maxRatingsPerUser: 0,
          distributionVariance: 0
        },
        status: 'pending',
        algorithmVersion: '1.0.0',
        assignmentStrategy: 'balanced',
        expiresAt: new Date(Date.now() + (config.systemSettings.ratingWindowDays * 24 * 60 * 60 * 1000))
      });

      // Generate rating assignments using intelligent distribution
      const assignments = await this.generateRatingAssignments(participants, event.vendor, config);
      assignment.assignments = assignments;

      // Calculate distribution metrics
      assignment.calculateDistributionMetrics();

      // Validate assignment integrity
      const issues = assignment.validateAssignmentIntegrity();
      if (issues.length > 0) {
        console.warn('Assignment integrity issues:', issues);
      }

      await assignment.save();
      console.log(`Created rating assignments for event ${eventId} with ${assignments.length} assignments`);

      return assignment;
    } catch (error) {
      console.error('Error creating rating assignments:', error);
      throw error;
    }
  }

  // Generate intelligent rating assignments
  async generateRatingAssignments(participants, vendor, config) {
    const assignments = [];
    const maxRatingsPerUser = config.systemSettings.maxRatingsPerUser;
    
    // Create a copy of participants for assignment tracking
    const availableParticipants = [...participants];
    const participantRatingCounts = {};
    
    // Initialize rating counts
    participants.forEach(p => {
      participantRatingCounts[p.id.toString()] = 0;
    });

    // Generate assignments for each participant
    for (const participant of participants) {
      const assignment = {
        raterId: participant.id,
        raterName: participant.name,
        raterTier: participant.tier,
        toRate: [],
        completed: [],
        pending: [],
        notificationsSent: 0,
        expiresAt: new Date(Date.now() + (config.systemSettings.ratingWindowDays * 24 * 60 * 60 * 1000)),
        isCompleted: false,
        completionRate: 0
      };

      // Add vendor rating (mandatory)
      assignment.toRate.push({
        id: vendor._id,
        name: vendor.name,
        type: 'vendor',
        assignmentReason: 'mandatory',
        priority: 1
      });

      // Add peer ratings
      const peerRatingsNeeded = Math.min(maxRatingsPerUser - 1, availableParticipants.length - 1);
      const selectedPeers = this.selectPeersForRating(
        participant,
        availableParticipants.filter(p => p.id.toString() !== participant.id.toString()),
        peerRatingsNeeded,
        participantRatingCounts
      );

      selectedPeers.forEach(peer => {
        assignment.toRate.push({
          id: peer.id,
          name: peer.name,
          type: 'peer',
          assignmentReason: 'random_selection',
          priority: 2
        });
        
        // Update rating counts
        participantRatingCounts[peer.id.toString()]++;
        assignment.pending.push(peer.id);
      });

      assignments.push(assignment);
    }

    return assignments;
  }

  // Select peers for rating with intelligent distribution
  selectPeersForRating(rater, availablePeers, countNeeded, ratingCounts) {
    // Sort peers by rating count (prefer those with fewer ratings)
    const sortedPeers = availablePeers.sort((a, b) => {
      const countA = ratingCounts[a.id.toString()] || 0;
      const countB = ratingCounts[b.id.toString()] || 0;
      return countA - countB;
    });

    // Select peers ensuring good distribution
    const selected = [];
    const used = new Set();

    // First pass: select peers with lowest rating counts
    for (const peer of sortedPeers) {
      if (selected.length >= countNeeded) break;
      if (!used.has(peer.id.toString())) {
        selected.push(peer);
        used.add(peer.id.toString());
      }
    }

    // Second pass: fill remaining slots if needed
    if (selected.length < countNeeded) {
      for (const peer of sortedPeers) {
        if (selected.length >= countNeeded) break;
        if (!used.has(peer.id.toString())) {
          selected.push(peer);
          used.add(peer.id.toString());
        }
      }
    }

    return selected;
  }

  // Submit a rating
  async submitRating(ratingData) {
    try {
      const config = await this.ensureConfig();
      
      const {
        eventId,
        raterId,
        targetUserId,
        criteria,
        overallScore,
        generalComment,
        wouldParticipateAgain,
        reportFlags
      } = ratingData;

      // Validate rating data
      await this.validateRatingSubmission(ratingData);

      // Get or create rating profile for rater
      const raterProfile = await this.getUserRatingProfile(raterId);
      
      // Get target user info
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        throw new Error('Target user not found');
      }

      // Get event info
      const event = await Activity.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // Calculate weighted score
      const weightedScore = this.calculateWeightedScore(criteria, config);

      // Create rating record
      const ratingRecord = new RatingRecord({
        eventId,
        activityTitle: event.title,
        activityCategory: event.category,
        activityDate: event.date,
        raterId,
        raterName: `${raterProfile.userId.firstName} ${raterProfile.userId.lastName}`,
        raterTier: raterProfile.tier.current,
        targetUserId,
        targetName: `${targetUser.firstName} ${targetUser.lastName}`,
        targetType: targetUserId.toString() === event.vendor.toString() ? 'vendor' : 'peer',
        targetTier: 'bronze', // Will be updated
        criteria,
        overallScore,
        weightedScore,
        criteriaWeights: this.getCriteriaWeights(config),
        generalComment,
        wouldParticipateAgain,
        reportFlags: reportFlags || [],
        submittedAt: new Date(),
        ipAddress: 'masked', // Should be provided by controller
        userAgent: 'mobile', // Should be provided by controller
        deviceInfo: 'mobile',
        responseTime: 0, // Should be calculated
        isVerified: true,
        verificationMethod: 'participation_confirmed',
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
        status: 'submitted',
        analytics: {
          viewCount: 0,
          helpfulVotes: 0,
          notHelpfulVotes: 0,
          shareCount: 0
        }
      });

      // Calculate quality metrics
      ratingRecord.calculateQualityMetrics();

      await ratingRecord.save();

      // Update rating assignment
      await this.updateRatingAssignment(eventId, raterId, targetUserId, ratingRecord);

      // Recalculate target user's rating profile
      await this.recalculateUserRating(targetUserId);

      // Update rater's statistics
      await this.updateRaterStatistics(raterId);

      console.log(`Rating submitted successfully for user ${targetUserId} by ${raterId}`);

      return ratingRecord;
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  }

  // Validate rating submission
  async validateRatingSubmission(ratingData) {
    const { eventId, raterId, targetUserId, criteria, overallScore } = ratingData;

    // Check if user has already rated this target for this event
    const existingRating = await RatingRecord.findOne({
      eventId,
      raterId,
      targetUserId
    });

    if (existingRating) {
      throw new Error('You have already rated this person for this event');
    }

    // Validate criteria scores
    const requiredCriteria = ['punctuality', 'engagement', 'respectfulness', 'teamwork'];
    for (const criterion of requiredCriteria) {
      if (!criteria[criterion] || criteria[criterion].score < 1 || criteria[criterion].score > 5) {
        throw new Error(`Invalid score for ${criterion}`);
      }
    }

    // Validate overall score
    if (overallScore < 1 || overallScore > 5) {
      throw new Error('Invalid overall score');
    }

    // Check if user attended the event
    const booking = await Booking.findOne({
      user: raterId,
      activity: eventId,
      status: { $in: ['confirmed', 'completed'] }
    });

    if (!booking) {
      throw new Error('You can only rate events you have attended');
    }
  }

  // Calculate weighted score
  calculateWeightedScore(criteria, config) {
    let weightedSum = 0;
    let totalWeight = 0;

    config.ratingCriteria.forEach(criterion => {
      if (criterion.isActive && criteria[criterion.id]) {
        weightedSum += criteria[criterion.id].score * criterion.weight;
        totalWeight += criterion.weight;
      }
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  // Get criteria weights
  getCriteriaWeights(config) {
    const weights = {};
    config.ratingCriteria.forEach(criterion => {
      weights[criterion.id] = criterion.weight;
    });
    return weights;
  }

  // Update rating assignment
  async updateRatingAssignment(eventId, raterId, targetUserId, ratingRecord) {
    const assignment = await RatingAssignment.findOne({ eventId });
    if (assignment) {
      assignment.updateAssignmentCompletion(raterId, targetUserId, {
        overallScore: ratingRecord.overallScore,
        criteria: ratingRecord.criteria
      });
      await assignment.save();
    }
  }

  // Recalculate user rating profile
  async recalculateUserRating(userId) {
    try {
      const config = await this.ensureConfig();
      const profile = await this.getUserRatingProfile(userId);

      // Get all ratings for this user
      const ratings = await RatingRecord.find({
        targetUserId: userId,
        status: { $ne: 'flagged' }
      });

      if (ratings.length === 0) {
        return profile;
      }

      // Calculate criteria scores
      const criteriaTotals = {};
      const criteriaCounts = {};

      config.ratingCriteria.forEach(criterion => {
        criteriaTotals[criterion.id] = 0;
        criteriaCounts[criterion.id] = 0;
      });

      ratings.forEach(rating => {
        config.ratingCriteria.forEach(criterion => {
          if (rating.criteria[criterion.id]) {
            criteriaTotals[criterion.id] += rating.criteria[criterion.id].score;
            criteriaCounts[criterion.id]++;
          }
        });
      });

      // Update criteria scores
      config.ratingCriteria.forEach(criterion => {
        if (criteriaCounts[criterion.id] > 0) {
          profile.criteria[criterion.id].score = criteriaTotals[criterion.id] / criteriaCounts[criterion.id];
          profile.criteria[criterion.id].count = criteriaCounts[criterion.id];
          profile.criteria[criterion.id].lastUpdated = new Date();
        }
      });

      // Calculate overall score
      const newOverallScore = profile.calculateOverallScore(config);
      const previousScore = profile.overall.currentScore;

      profile.overall.currentScore = newOverallScore;
      profile.overall.baseScore = newOverallScore;
      profile.overall.totalRatings = ratings.length;
      profile.overall.lastCalculated = new Date();

      // Determine trend
      if (newOverallScore > previousScore + 0.1) {
        profile.overall.trend = 'improving';
      } else if (newOverallScore < previousScore - 0.1) {
        profile.overall.trend = 'declining';
      } else {
        profile.overall.trend = 'stable';
      }

      // Update tier
      const tierChanged = profile.updateTier(config);
      if (tierChanged) {
        console.log(`User ${userId} tier changed to ${profile.tier.current}`);
      }

      // Calculate next tier progress
      profile.tier.nextTierProgress = profile.calculateNextTierProgress(config);

      await profile.save();

      return profile;
    } catch (error) {
      console.error('Error recalculating user rating:', error);
      throw error;
    }
  }

  // Update rater statistics
  async updateRaterStatistics(raterId) {
    try {
      const profile = await this.getUserRatingProfile(raterId);

      // Get all ratings given by this user
      const ratingsGiven = await RatingRecord.find({ raterId });

      // Calculate average rating given
      const totalScore = ratingsGiven.reduce((sum, rating) => sum + rating.overallScore, 0);
      const averageRatingGiven = ratingsGiven.length > 0 ? totalScore / ratingsGiven.length : 0;

      // Update statistics
      profile.statistics.ratingsGivenCount = ratingsGiven.length;
      profile.statistics.averageRatingGiven = averageRatingGiven;

      await profile.save();
    } catch (error) {
      console.error('Error updating rater statistics:', error);
      throw error;
    }
  }

  // Get user's rating assignments
  async getUserRatingAssignments(userId, status = null) {
    try {
      const query = { 'assignments.raterId': userId };
      if (status) {
        query.status = status;
      }

      return await RatingAssignment.find(query)
        .populate('eventId', 'title description date')
        .populate('vendorId', 'name')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting user rating assignments:', error);
      throw error;
    }
  }

  // Get rating statistics
  async getRatingStatistics(options = {}) {
    try {
      const matchStage = {};
      
      if (options.dateRange) {
        matchStage.submittedAt = {
          $gte: options.dateRange.start,
          $lte: options.dateRange.end
        };
      }

      if (options.status) {
        matchStage.status = options.status;
      }

      return await RatingRecord.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalRatings: { $sum: 1 },
            averageRating: { $avg: '$overallScore' },
            averageWeightedRating: { $avg: '$weightedScore' },
            flaggedRatings: {
              $sum: { $cond: [{ $eq: ['$status', 'flagged'] }, 1, 0] }
            },
            verifiedRatings: {
              $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] }
            }
          }
        }
      ]);
    } catch (error) {
      console.error('Error getting rating statistics:', error);
      throw error;
    }
  }

  // Get top rated users
  async getTopRatedUsers(limit = 10, tier = null) {
    try {
      return await UserRatingProfile.getTopRatedUsers(limit, tier);
    } catch (error) {
      console.error('Error getting top rated users:', error);
      throw error;
    }
  }

  // Process monthly bonuses
  async processMonthlyBonuses() {
    try {
      const config = await this.ensureConfig();
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const profiles = await UserRatingProfile.find({
        'monthlyActivity.currentMonth': { $ne: currentMonth }
      });

      let processedCount = 0;

      for (const profile of profiles) {
        // Apply monthly bonus if eligible
        const bonusAmount = profile.applyMonthlyBonus(config);
        
        if (bonusAmount > 0) {
          console.log(`Applied ${bonusAmount} bonus to user ${profile.userId}`);
        }

        // Reset monthly activity
        profile.resetMonthlyActivity(currentMonth);
        await profile.save();
        processedCount++;
      }

      console.log(`Processed monthly bonuses for ${processedCount} users`);
      return processedCount;
    } catch (error) {
      console.error('Error processing monthly bonuses:', error);
      throw error;
    }
  }
}

module.exports = new RatingSystemService();
