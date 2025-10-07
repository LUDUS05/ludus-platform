const UserRatingProfile = require('../models/UserRatingProfile');
const RatingRecord = require('../models/RatingRecord');
const RatingSystemConfig = require('../models/RatingSystemConfig');

class RatingCalculationEngine {
  constructor() {
    this.engineVersion = '2.0.0';
    this.calculationTypes = {
      WEIGHTED_AVERAGE: 'weighted_average',
      TIME_DECAY: 'time_decay',
      RELIABILITY_ADJUSTED: 'reliability_adjusted',
      TIER_WEIGHTED: 'tier_weighted',
      ACTIVITY_BONUS: 'activity_bonus'
    };
  }

  /**
   * Main calculation entry point - recalculates user rating profile
   * @param {String} userId - User ID to recalculate
   * @param {Object} options - Calculation options
   * @returns {Object} Updated user rating profile
   */
  async recalculateUserRating(userId, options = {}) {
    try {
      console.log(`🧮 Recalculating rating for user ${userId}`);
      
      const profile = await UserRatingProfile.findOne({ userId });
      if (!profile) {
        throw new Error('User rating profile not found');
      }

      const config = await RatingSystemConfig.getConfig();
      
      // Get all ratings for this user
      const ratings = await this.getUserRatings(userId, options);
      
      if (ratings.length === 0) {
        console.log(`No ratings found for user ${userId}`);
        return profile;
      }

      // Calculate new scores
      const calculationResult = await this.calculateComprehensiveScore(ratings, config, options);
      
      // Update profile with new calculations
      await this.updateProfileWithCalculations(profile, calculationResult, config);
      
      // Apply monthly bonuses if applicable
      await this.applyMonthlyBonuses(profile, config);
      
      // Update tier and benefits
      const tierChanged = await this.updateTierAndBenefits(profile, config);
      
      // Save updated profile
      await profile.save();
      
      console.log(`✅ Rating recalculated for user ${userId}: ${profile.overall.currentScore.toFixed(2)} (${profile.tier.current})`);
      
      return {
        profile,
        tierChanged,
        calculationResult
      };
      
    } catch (error) {
      console.error('❌ Error recalculating user rating:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive score using multiple algorithms
   */
  async calculateComprehensiveScore(ratings, config, options = {}) {
    const calculationType = options.calculationType || this.calculationTypes.WEIGHTED_AVERAGE;
    
    let result;
    switch (calculationType) {
      case this.calculationTypes.WEIGHTED_AVERAGE:
        result = this.calculateWeightedAverage(ratings, config);
        break;
      case this.calculationTypes.TIME_DECAY:
        result = this.calculateTimeDecayScore(ratings, config);
        break;
      case this.calculationTypes.RELIABILITY_ADJUSTED:
        result = await this.calculateReliabilityAdjustedScore(ratings, config);
        break;
      case this.calculationTypes.TIER_WEIGHTED:
        result = await this.calculateTierWeightedScore(ratings, config);
        break;
      default:
        result = this.calculateWeightedAverage(ratings, config);
    }

    // Apply activity bonus
    result = await this.applyActivityBonus(result, config, options);
    
    return result;
  }

  /**
   * Calculate weighted average score based on criteria weights
   */
  calculateWeightedAverage(ratings, config) {
    const criteriaTotals = {};
    const criteriaCounts = {};
    const criteriaWeights = {};
    
    // Initialize criteria tracking
    config.ratingCriteria.forEach(criterion => {
      criteriaTotals[criterion.id] = 0;
      criteriaCounts[criterion.id] = 0;
      criteriaWeights[criterion.id] = criterion.weight;
    });

    // Process each rating
    ratings.forEach(rating => {
      config.ratingCriteria.forEach(criterion => {
        if (rating.criteria && rating.criteria[criterion.id]) {
          const score = rating.criteria[criterion.id].score;
          criteriaTotals[criterion.id] += score;
          criteriaCounts[criterion.id]++;
        }
      });
    });

    // Calculate weighted average for each criterion
    const criteriaScores = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    config.ratingCriteria.forEach(criterion => {
      if (criteriaCounts[criterion.id] > 0) {
        criteriaScores[criterion.id] = {
          score: criteriaTotals[criterion.id] / criteriaCounts[criterion.id],
          count: criteriaCounts[criterion.id],
          weight: criteriaWeights[criterion.id]
        };
        
        totalWeightedScore += criteriaScores[criterion.id].score * criteriaWeights[criterion.id];
        totalWeight += criteriaWeights[criterion.id];
      } else {
        criteriaScores[criterion.id] = {
          score: 0,
          count: 0,
          weight: criteriaWeights[criterion.id]
        };
      }
    });

    const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    return {
      overallScore,
      criteriaScores,
      totalRatings: ratings.length,
      calculationType: this.calculationTypes.WEIGHTED_AVERAGE,
      metadata: {
        totalWeight,
        criteriaCounts,
        lastCalculated: new Date()
      }
    };
  }

  /**
   * Calculate time-decay score (recent ratings weighted more heavily)
   */
  calculateTimeDecayScore(ratings, config) {
    const now = new Date();
    const decayMonths = config.systemSettings.ratingDecayMonths;
    const decayThreshold = new Date(now.getTime() - (decayMonths * 30 * 24 * 60 * 60 * 1000));
    
    // Filter ratings within decay period
    const recentRatings = ratings.filter(rating => 
      new Date(rating.submittedAt) >= decayThreshold
    );

    if (recentRatings.length === 0) {
      return this.calculateWeightedAverage(ratings, config);
    }

    // Calculate time weights
    const timeWeights = recentRatings.map(rating => {
      const daysSinceRating = (now - new Date(rating.submittedAt)) / (1000 * 60 * 60 * 24);
      const monthsSinceRating = daysSinceRating / 30;
      return Math.exp(-monthsSinceRating / decayMonths); // Exponential decay
    });

    const criteriaTotals = {};
    const criteriaWeights = {};
    const totalTimeWeight = timeWeights.reduce((sum, weight) => sum + weight, 0);

    // Initialize criteria tracking
    config.ratingCriteria.forEach(criterion => {
      criteriaTotals[criterion.id] = 0;
      criteriaWeights[criterion.id] = criterion.weight;
    });

    // Process ratings with time weights
    recentRatings.forEach((rating, index) => {
      const timeWeight = timeWeights[index];
      config.ratingCriteria.forEach(criterion => {
        if (rating.criteria && rating.criteria[criterion.id]) {
          const score = rating.criteria[criterion.id].score;
          criteriaTotals[criterion.id] += score * timeWeight;
        }
      });
    });

    // Calculate time-weighted scores
    const criteriaScores = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    config.ratingCriteria.forEach(criterion => {
      if (totalTimeWeight > 0) {
        criteriaScores[criterion.id] = {
          score: criteriaTotals[criterion.id] / totalTimeWeight,
          count: recentRatings.length,
          weight: criteriaWeights[criterion.id]
        };
        
        totalWeightedScore += criteriaScores[criterion.id].score * criteriaWeights[criterion.id];
        totalWeight += criteriaWeights[criterion.id];
      } else {
        criteriaScores[criterion.id] = {
          score: 0,
          count: 0,
          weight: criteriaWeights[criterion.id]
        };
      }
    });

    const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    return {
      overallScore,
      criteriaScores,
      totalRatings: recentRatings.length,
      calculationType: this.calculationTypes.TIME_DECAY,
      metadata: {
        totalWeight,
        timeWeights,
        decayMonths,
        recentRatingsCount: recentRatings.length,
        totalRatingsCount: ratings.length,
        lastCalculated: new Date()
      }
    };
  }

  /**
   * Calculate reliability-adjusted score based on rater reliability
   */
  async calculateReliabilityAdjustedScore(ratings, config) {
    const reliabilityAdjustedRatings = await Promise.all(ratings.map(async (rating) => {
      const raterReliability = await this.getRaterReliability(rating.raterId);
      return {
        ...rating,
        reliabilityWeight: raterReliability
      };
    }));

    const criteriaTotals = {};
    const criteriaWeights = {};
    const totalReliabilityWeight = reliabilityAdjustedRatings.reduce((sum, rating) => 
      sum + rating.reliabilityWeight, 0);

    // Initialize criteria tracking
    config.ratingCriteria.forEach(criterion => {
      criteriaTotals[criterion.id] = 0;
      criteriaWeights[criterion.id] = criterion.weight;
    });

    // Process ratings with reliability weights
    reliabilityAdjustedRatings.forEach(rating => {
      config.ratingCriteria.forEach(criterion => {
        if (rating.criteria && rating.criteria[criterion.id]) {
          const score = rating.criteria[criterion.id].score;
          criteriaTotals[criterion.id] += score * rating.reliabilityWeight;
        }
      });
    });

    // Calculate reliability-weighted scores
    const criteriaScores = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    config.ratingCriteria.forEach(criterion => {
      if (totalReliabilityWeight > 0) {
        criteriaScores[criterion.id] = {
          score: criteriaTotals[criterion.id] / totalReliabilityWeight,
          count: ratings.length,
          weight: criteriaWeights[criterion.id]
        };
        
        totalWeightedScore += criteriaScores[criterion.id].score * criteriaWeights[criterion.id];
        totalWeight += criteriaWeights[criterion.id];
      } else {
        criteriaScores[criterion.id] = {
          score: 0,
          count: 0,
          weight: criteriaWeights[criterion.id]
        };
      }
    });

    const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    return {
      overallScore,
      criteriaScores,
      totalRatings: ratings.length,
      calculationType: this.calculationTypes.RELIABILITY_ADJUSTED,
      metadata: {
        totalWeight,
        totalReliabilityWeight,
        averageReliability: totalReliabilityWeight / ratings.length,
        lastCalculated: new Date()
      }
    };
  }

  /**
   * Calculate tier-weighted score (higher tier raters have more influence)
   */
  async calculateTierWeightedScore(ratings, config) {
    const tierWeights = { bronze: 1.0, silver: 1.2, gold: 1.5, platinum: 2.0 };
    
    const tierAdjustedRatings = await Promise.all(ratings.map(async (rating) => {
      const raterProfile = await UserRatingProfile.findOne({ userId: rating.raterId });
      const raterTier = raterProfile?.tier?.current || 'bronze';
      return {
        ...rating,
        tierWeight: tierWeights[raterTier] || 1.0,
        raterTier
      };
    }));

    const criteriaTotals = {};
    const criteriaWeights = {};
    const totalTierWeight = tierAdjustedRatings.reduce((sum, rating) => 
      sum + rating.tierWeight, 0);

    // Initialize criteria tracking
    config.ratingCriteria.forEach(criterion => {
      criteriaTotals[criterion.id] = 0;
      criteriaWeights[criterion.id] = criterion.weight;
    });

    // Process ratings with tier weights
    tierAdjustedRatings.forEach(rating => {
      config.ratingCriteria.forEach(criterion => {
        if (rating.criteria && rating.criteria[criterion.id]) {
          const score = rating.criteria[criterion.id].score;
          criteriaTotals[criterion.id] += score * rating.tierWeight;
        }
      });
    });

    // Calculate tier-weighted scores
    const criteriaScores = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    config.ratingCriteria.forEach(criterion => {
      if (totalTierWeight > 0) {
        criteriaScores[criterion.id] = {
          score: criteriaTotals[criterion.id] / totalTierWeight,
          count: ratings.length,
          weight: criteriaWeights[criterion.id]
        };
        
        totalWeightedScore += criteriaScores[criterion.id].score * criteriaWeights[criterion.id];
        totalWeight += criteriaWeights[criterion.id];
      } else {
        criteriaScores[criterion.id] = {
          score: 0,
          count: 0,
          weight: criteriaWeights[criterion.id]
        };
      }
    });

    const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    return {
      overallScore,
      criteriaScores,
      totalRatings: ratings.length,
      calculationType: this.calculationTypes.TIER_WEIGHTED,
      metadata: {
        totalWeight,
        totalTierWeight,
        tierDistribution: this.calculateTierDistribution(tierAdjustedRatings),
        lastCalculated: new Date()
      }
    };
  }

  /**
   * Apply activity bonus to the calculated score
   */
  async applyActivityBonus(calculationResult, config, options) {
    const activityBonus = config.activityBonus;
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Get user's monthly activity
    const userId = options.userId;
    if (!userId) return calculationResult;

    const profile = await UserRatingProfile.findOne({ userId });
    if (!profile) return calculationResult;

    const monthlyActivity = profile.monthlyActivity;
    
    // Check if user is eligible for bonus
    if (monthlyActivity.currentMonth === currentMonth &&
        monthlyActivity.participationCount >= activityBonus.activitiesPerMonth &&
        !monthlyActivity.bonusApplied) {
      
      const bonusAmount = Math.min(activityBonus.bonusStars, activityBonus.maxBonusPerMonth);
      const bonusAdjustedScore = Math.min(5.0, calculationResult.overallScore + bonusAmount);
      
      calculationResult.overallScore = bonusAdjustedScore;
      calculationResult.activityBonus = {
        applied: true,
        amount: bonusAmount,
        originalScore: calculationResult.overallScore - bonusAmount
      };
      
      console.log(`🎁 Applied activity bonus of ${bonusAmount} to user ${userId}`);
    } else {
      calculationResult.activityBonus = {
        applied: false,
        amount: 0,
        reason: monthlyActivity.bonusApplied ? 'already_applied' : 'insufficient_activity'
      };
    }

    return calculationResult;
  }

  /**
   * Update profile with calculation results
   */
  async updateProfileWithCalculations(profile, calculationResult, config) {
    const previousScore = profile.overall.currentScore;
    
    // Update overall scores
    profile.overall.currentScore = calculationResult.overallScore;
    profile.overall.baseScore = calculationResult.activityBonus?.originalScore || calculationResult.overallScore;
    profile.overall.totalRatings = calculationResult.totalRatings;
    profile.overall.lastCalculated = new Date();
    
    // Determine trend
    if (calculationResult.overallScore > previousScore + 0.1) {
      profile.overall.trend = 'improving';
    } else if (calculationResult.overallScore < previousScore - 0.1) {
      profile.overall.trend = 'declining';
    } else {
      profile.overall.trend = 'stable';
    }
    
    // Add to score history
    profile.overall.scoreHistory.push({
      score: calculationResult.overallScore,
      date: new Date(),
      reason: calculationResult.activityBonus?.applied ? 'bonus_applied' : 'new_rating',
      calculationType: calculationResult.calculationType
    });
    
    // Keep only last 50 score history entries
    if (profile.overall.scoreHistory.length > 50) {
      profile.overall.scoreHistory = profile.overall.scoreHistory.slice(-50);
    }
    
    // Update criteria scores
    config.ratingCriteria.forEach(criterion => {
      if (calculationResult.criteriaScores[criterion.id]) {
        const criteriaScore = calculationResult.criteriaScores[criterion.id];
        profile.criteria[criterion.id].score = criteriaScore.score;
        profile.criteria[criterion.id].count = criteriaScore.count;
        profile.criteria[criterion.id].lastUpdated = new Date();
      }
    });
    
    // Update statistics
    profile.statistics.totalEventsParticipated = calculationResult.totalRatings;
  }

  /**
   * Apply monthly bonuses
   */
  async applyMonthlyBonuses(profile, config) {
    const activityBonus = config.activityBonus;
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    if (profile.monthlyActivity.currentMonth === currentMonth &&
        profile.monthlyActivity.participationCount >= activityBonus.activitiesPerMonth &&
        !profile.monthlyActivity.bonusApplied) {
      
      const bonusAmount = Math.min(activityBonus.bonusStars, activityBonus.maxBonusPerMonth);
      
      // Apply bonus to base score
      profile.overall.baseScore = Math.min(5.0, profile.overall.baseScore + bonusAmount);
      profile.overall.currentScore = profile.overall.baseScore;
      
      // Mark bonus as applied
      profile.monthlyActivity.bonusApplied = true;
      profile.monthlyActivity.bonusAmount = bonusAmount;
      
      // Add to score history
      profile.overall.scoreHistory.push({
        score: profile.overall.currentScore,
        date: new Date(),
        reason: 'bonus_applied'
      });
      
      console.log(`🎁 Applied monthly bonus of ${bonusAmount} to user ${profile.userId}`);
    }
  }

  /**
   * Update tier and benefits based on current score
   */
  async updateTierAndBenefits(profile, config) {
    const currentScore = profile.overall.currentScore;
    const newTier = config.getTierForRating(currentScore);
    const currentTier = profile.tier.current;
    
    if (newTier !== currentTier) {
      // Add to tier history
      profile.tier.tierHistory.push({
        tier: newTier,
        achievedAt: new Date(),
        ratingAtTime: currentScore
      });
      
      // Update tier info
      profile.tier.previous = currentTier;
      profile.tier.current = newTier;
      profile.tier.changedAt = new Date();
      
      // Update rewards
      profile.rewards.currentDiscountRate = config.getDiscountRate(newTier);
      profile.rewards.unlockedBenefits = config.getTierBenefits(newTier);
      
      console.log(`🏆 User ${profile.userId} tier changed: ${currentTier} → ${newTier}`);
      return true;
    }
    
    return false;
  }

  /**
   * Get user ratings with filtering options
   */
  async getUserRatings(userId, options = {}) {
    const query = { targetUserId: userId };
    
    if (options.status) {
      query.status = options.status;
    }
    
    if (options.dateRange) {
      query.submittedAt = {
        $gte: options.dateRange.start,
        $lte: options.dateRange.end
      };
    }
    
    if (options.excludeFlagged) {
      query.status = { $ne: 'flagged' };
    }
    
    return await RatingRecord.find(query)
      .populate('raterId', 'firstName lastName')
      .sort({ submittedAt: -1 });
  }

  /**
   * Get rater reliability score
   */
  async getRaterReliability(raterId) {
    try {
      const profile = await UserRatingProfile.findOne({ userId: raterId });
      if (!profile) return 0.5;
      
      const { ratingBehavior } = profile;
      let reliabilityScore = 0.5;
      
      // Factor in completion rate
      if (ratingBehavior.ratingCompletionRate > 80) reliabilityScore += 0.3;
      else if (ratingBehavior.ratingCompletionRate > 60) reliabilityScore += 0.2;
      else if (ratingBehavior.ratingCompletionRate > 40) reliabilityScore += 0.1;
      
      // Factor in helpful ratings
      if (ratingBehavior.helpfulRatingsCount > 10) reliabilityScore += 0.2;
      else if (ratingBehavior.helpfulRatingsCount > 5) reliabilityScore += 0.1;
      
      return Math.min(1, reliabilityScore);
    } catch (error) {
      console.error('Error calculating rater reliability:', error);
      return 0.5;
    }
  }

  /**
   * Calculate tier distribution from ratings
   */
  calculateTierDistribution(ratings) {
    const distribution = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    
    ratings.forEach(rating => {
      distribution[rating.raterTier] = (distribution[rating.raterTier] || 0) + 1;
    });
    
    return distribution;
  }

  /**
   * Batch recalculate multiple users
   */
  async batchRecalculateUsers(userIds, options = {}) {
    console.log(`🔄 Batch recalculating ${userIds.length} users`);
    
    const results = await Promise.allSettled(
      userIds.map(userId => this.recalculateUserRating(userId, options))
    );
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    console.log(`✅ Batch recalculation complete: ${successful} successful, ${failed} failed`);
    
    return {
      total: userIds.length,
      successful,
      failed,
      results
    };
  }

  /**
   * Get calculation statistics
   */
  async getCalculationStatistics(options = {}) {
    const pipeline = [
      {
        $group: {
          _id: null,
          totalProfiles: { $sum: 1 },
          averageScore: { $avg: '$overall.currentScore' },
          tierDistribution: {
            $push: '$tier.current'
          },
          scoreDistribution: {
            $push: '$overall.currentScore'
          }
        }
      }
    ];

    const result = await UserRatingProfile.aggregate(pipeline);
    
    if (result.length === 0) {
      return {
        totalProfiles: 0,
        averageScore: 0,
        tierDistribution: {},
        scoreDistribution: []
      };
    }

    const stats = result[0];
    
    // Calculate tier distribution
    const tierCounts = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    stats.tierDistribution.forEach(tier => {
      tierCounts[tier] = (tierCounts[tier] || 0) + 1;
    });

    return {
      totalProfiles: stats.totalProfiles,
      averageScore: Math.round(stats.averageScore * 100) / 100,
      tierDistribution: tierCounts,
      scoreDistribution: stats.scoreDistribution
    };
  }
}

module.exports = new RatingCalculationEngine();
