const UserRatingProfile = require('../models/UserRatingProfile');
const RatingRecord = require('../models/RatingRecord');
const User = require('../models/User');

class RatingAssignmentAlgorithm {
  constructor() {
    this.algorithmVersion = '2.0.0';
    this.strategies = {
      BALANCED: 'balanced',
      RANDOM: 'random',
      PREFERENCE_BASED: 'preference_based',
      TIER_BALANCED: 'tier_balanced',
      DEMOGRAPHIC_BALANCED: 'demographic_balanced',
      ACTIVITY_TYPE_MATCH: 'activity_type_match'
    };
  }

  /**
   * Main algorithm entry point - generates intelligent rating assignments
   * @param {Array} participants - Array of participant objects
   * @param {Object} vendor - Vendor object
   * @param {Object} config - Rating system configuration
   * @param {Object} options - Algorithm options
   * @returns {Array} Array of rating assignments
   */
  async generateRatingAssignments(participants, vendor, config, options = {}) {
    try {
      console.log(`🎯 Generating rating assignments for ${participants.length} participants`);
      
      // Validate input
      this.validateInput(participants, vendor, config);
      
      // Get enhanced participant data
      const enhancedParticipants = await this.enhanceParticipantData(participants);
      
      // Choose assignment strategy
      const strategy = this.selectOptimalStrategy(enhancedParticipants, config, options);
      console.log(`📊 Selected strategy: ${strategy}`);
      
      // Generate assignments based on strategy
      let assignments;
      switch (strategy) {
        case this.strategies.BALANCED:
          assignments = await this.generateBalancedAssignments(enhancedParticipants, vendor, config);
          break;
        case this.strategies.PREFERENCE_BASED:
          assignments = await this.generatePreferenceBasedAssignments(enhancedParticipants, vendor, config);
          break;
        case this.strategies.TIER_BALANCED:
          assignments = await this.generateTierBalancedAssignments(enhancedParticipants, vendor, config);
          break;
        case this.strategies.DEMOGRAPHIC_BALANCED:
          assignments = await this.generateDemographicBalancedAssignments(enhancedParticipants, vendor, config);
          break;
        case this.strategies.ACTIVITY_TYPE_MATCH:
          assignments = await this.generateActivityTypeMatchAssignments(enhancedParticipants, vendor, config);
          break;
        default:
          assignments = await this.generateBalancedAssignments(enhancedParticipants, vendor, config);
      }
      
      // Optimize assignments for quality
      assignments = await this.optimizeAssignments(assignments, enhancedParticipants, config);
      
      // Validate final assignments
      const validationResult = this.validateAssignments(assignments, enhancedParticipants, config);
      
      console.log(`✅ Generated ${assignments.length} assignments with ${validationResult.coveragePercentage.toFixed(1)}% coverage`);
      
      return {
        assignments,
        strategy,
        metrics: validationResult,
        algorithmVersion: this.algorithmVersion
      };
      
    } catch (error) {
      console.error('❌ Error generating rating assignments:', error);
      throw error;
    }
  }

  /**
   * Enhanced balanced assignment algorithm with multiple optimization factors
   */
  async generateBalancedAssignments(participants, vendor, config) {
    const assignments = [];
    const maxRatingsPerUser = config.systemSettings.maxRatingsPerUser;
    const participantRatingCounts = new Map();
    const participantRatingHistory = new Map();
    
    // Initialize tracking maps
    participants.forEach(p => {
      participantRatingCounts.set(p.id.toString(), 0);
      participantRatingHistory.set(p.id.toString(), []);
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

      // Calculate optimal peer ratings needed
      const peerRatingsNeeded = Math.min(
        maxRatingsPerUser - 1, // Subtract 1 for vendor rating
        participants.length - 1, // Subtract 1 for self
        Math.ceil(participants.length * 0.6) // Ensure good coverage
      );

      // Select peers using multi-factor optimization
      const selectedPeers = await this.selectOptimalPeers(
        participant,
        participants.filter(p => p.id.toString() !== participant.id.toString()),
        peerRatingsNeeded,
        participantRatingCounts,
        participantRatingHistory,
        config
      );

      // Add selected peers to assignment
      selectedPeers.forEach((peer, index) => {
        assignment.toRate.push({
          id: peer.id,
          name: peer.name,
          type: 'peer',
          assignmentReason: this.determineAssignmentReason(peer, participant, index),
          priority: 2 + index
        });
        
        // Update tracking
        participantRatingCounts.set(peer.id.toString(), 
          participantRatingCounts.get(peer.id.toString()) + 1);
        participantRatingHistory.get(participant.id.toString()).push(peer.id.toString());
        assignment.pending.push(peer.id);
      });

      assignments.push(assignment);
    }

    return assignments;
  }

  /**
   * Select optimal peers using multi-factor analysis
   */
  async selectOptimalPeers(rater, availablePeers, countNeeded, ratingCounts, ratingHistory, config) {
    // Calculate scores for each peer based on multiple factors
    const peerScores = await Promise.all(availablePeers.map(async (peer) => {
      const score = await this.calculatePeerScore(rater, peer, ratingCounts, ratingHistory, config);
      return { peer, score };
    }));

    // Sort by score (higher is better)
    peerScores.sort((a, b) => b.score - a.score);

    // Select top peers ensuring diversity
    const selected = [];
    const used = new Set();

    // First pass: select highest scoring peers
    for (const { peer, score } of peerScores) {
      if (selected.length >= countNeeded) break;
      if (!used.has(peer.id.toString())) {
        selected.push(peer);
        used.add(peer.id.toString());
      }
    }

    // Second pass: ensure diversity if needed
    if (selected.length < countNeeded) {
      const remaining = availablePeers.filter(p => !used.has(p.id.toString()));
      const diversityScore = this.calculateDiversityScore(selected);
      
      if (diversityScore < 0.7) { // Low diversity threshold
        // Add diverse peers
        for (const peer of remaining) {
          if (selected.length >= countNeeded) break;
          if (this.wouldImproveDiversity(selected, peer)) {
            selected.push(peer);
            used.add(peer.id.toString());
          }
        }
      }
    }

    return selected.slice(0, countNeeded);
  }

  /**
   * Calculate comprehensive peer score based on multiple factors
   */
  async calculatePeerScore(rater, peer, ratingCounts, ratingHistory, config) {
    let score = 0;

    // Factor 1: Rating count balance (prefer peers with fewer ratings)
    const peerRatingCount = ratingCounts.get(peer.id.toString()) || 0;
    const maxRatingCount = Math.max(...Array.from(ratingCounts.values()));
    const balanceScore = maxRatingCount > 0 ? (maxRatingCount - peerRatingCount) / maxRatingCount : 1;
    score += balanceScore * 0.3;

    // Factor 2: Historical rating relationship (avoid rating same people repeatedly)
    const raterHistory = ratingHistory.get(rater.id.toString()) || [];
    const hasRatedBefore = raterHistory.includes(peer.id.toString());
    const historyScore = hasRatedBefore ? 0.2 : 1.0;
    score += historyScore * 0.2;

    // Factor 3: Tier compatibility (prefer rating across different tiers)
    const tierCompatibility = this.calculateTierCompatibility(rater.tier, peer.tier);
    score += tierCompatibility * 0.15;

    // Factor 4: Activity participation history
    const participationScore = await this.calculateParticipationCompatibility(rater.id, peer.id);
    score += participationScore * 0.15;

    // Factor 5: Rating reliability (prefer reliable raters)
    const reliabilityScore = await this.calculateRaterReliability(rater.id);
    score += reliabilityScore * 0.1;

    // Factor 6: Geographic/demographic diversity
    const diversityScore = this.calculateDemographicDiversity(rater, peer);
    score += diversityScore * 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate tier compatibility score
   */
  calculateTierCompatibility(raterTier, peerTier) {
    const tierValues = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
    const raterValue = tierValues[raterTier] || 1;
    const peerValue = tierValues[peerTier] || 1;
    
    // Prefer cross-tier ratings for better diversity
    const tierDifference = Math.abs(raterValue - peerValue);
    return tierDifference > 0 ? 0.8 : 0.4;
  }

  /**
   * Calculate participation compatibility
   */
  async calculateParticipationCompatibility(raterId, peerId) {
    try {
      // Get recent activities both users participated in
      const raterProfile = await UserRatingProfile.findOne({ userId: raterId });
      const peerProfile = await UserRatingProfile.findOne({ userId: peerId });
      
      if (!raterProfile || !peerProfile) return 0.5;
      
      // Calculate compatibility based on activity patterns
      const raterCategories = raterProfile.statistics.favoriteCategories || [];
      const peerCategories = peerProfile.statistics.favoriteCategories || [];
      
      const commonCategories = raterCategories.filter(cat => peerCategories.includes(cat));
      const compatibility = commonCategories.length / Math.max(raterCategories.length, peerCategories.length, 1);
      
      return compatibility;
    } catch (error) {
      console.error('Error calculating participation compatibility:', error);
      return 0.5;
    }
  }

  /**
   * Calculate rater reliability score
   */
  async calculateRaterReliability(raterId) {
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
   * Calculate demographic diversity score
   */
  calculateDemographicDiversity(rater, peer) {
    // This would be enhanced with actual demographic data
    // For now, return a base score
    return 0.7;
  }

  /**
   * Calculate diversity score for selected peers
   */
  calculateDiversityScore(selectedPeers) {
    if (selectedPeers.length <= 1) return 1;
    
    const tiers = selectedPeers.map(p => p.tier);
    const uniqueTiers = new Set(tiers);
    
    return uniqueTiers.size / Math.min(tiers.length, 4); // 4 is max tier count
  }

  /**
   * Check if adding a peer would improve diversity
   */
  wouldImproveDiversity(selectedPeers, candidatePeer) {
    const currentTiers = selectedPeers.map(p => p.tier);
    const candidateTier = candidatePeer.tier;
    
    return !currentTiers.includes(candidateTier);
  }

  /**
   * Determine assignment reason for tracking
   */
  determineAssignmentReason(peer, rater, index) {
    if (index === 0) return 'random_selection';
    if (index === 1) return 'coverage_balance';
    return 'demographic_balance';
  }

  /**
   * Optimize assignments for better quality and coverage
   */
  async optimizeAssignments(assignments, participants, config) {
    console.log('🔧 Optimizing assignments for quality...');
    
    // Calculate current coverage
    const coverage = this.calculateCoverage(assignments, participants);
    
    // If coverage is low, add more assignments
    if (coverage < 0.8) {
      assignments = await this.improveCoverage(assignments, participants, config);
    }
    
    // Balance rating loads
    assignments = this.balanceRatingLoads(assignments, participants, config);
    
    // Remove conflicts
    assignments = this.removeConflicts(assignments);
    
    return assignments;
  }

  /**
   * Calculate coverage percentage
   */
  calculateCoverage(assignments, participants) {
    const participantIds = new Set(participants.map(p => p.id.toString()));
    const ratedUserIds = new Set();
    
    assignments.forEach(assignment => {
      assignment.toRate.forEach(target => {
        if (target.type === 'peer') {
          ratedUserIds.add(target.id.toString());
        }
      });
    });
    
    return ratedUserIds.size / participantIds.size;
  }

  /**
   * Improve coverage by adding more assignments
   */
  async improveCoverage(assignments, participants, config) {
    const maxRatingsPerUser = config.systemSettings.maxRatingsPerUser;
    const participantRatingCounts = new Map();
    
    // Count current ratings per participant
    participants.forEach(p => {
      participantRatingCounts.set(p.id.toString(), 0);
    });
    
    assignments.forEach(assignment => {
      assignment.toRate.forEach(target => {
        if (target.type === 'peer') {
          participantRatingCounts.set(target.id.toString(), 
            participantRatingCounts.get(target.id.toString()) + 1);
        }
      });
    });
    
    // Add more ratings for participants with low coverage
    for (const assignment of assignments) {
      const currentPeerRatings = assignment.toRate.filter(t => t.type === 'peer').length;
      const maxPeerRatings = maxRatingsPerUser - 1; // Subtract vendor rating
      
      if (currentPeerRatings < maxPeerRatings) {
        const additionalRatingsNeeded = maxPeerRatings - currentPeerRatings;
        const availablePeers = participants.filter(p => 
          p.id.toString() !== assignment.raterId.toString() &&
          !assignment.toRate.some(t => t.id.toString() === p.id.toString())
        );
        
        // Select additional peers with lowest rating counts
        const sortedPeers = availablePeers.sort((a, b) => {
          const countA = participantRatingCounts.get(a.id.toString());
          const countB = participantRatingCounts.get(b.id.toString());
          return countA - countB;
        });
        
        const additionalPeers = sortedPeers.slice(0, additionalRatingsNeeded);
        additionalPeers.forEach(peer => {
          assignment.toRate.push({
            id: peer.id,
            name: peer.name,
            type: 'peer',
            assignmentReason: 'coverage_improvement',
            priority: assignment.toRate.length + 1
          });
          assignment.pending.push(peer.id);
          participantRatingCounts.set(peer.id.toString(), 
            participantRatingCounts.get(peer.id.toString()) + 1);
        });
      }
    }
    
    return assignments;
  }

  /**
   * Balance rating loads across participants
   */
  balanceRatingLoads(assignments, participants, config) {
    const participantRatingCounts = new Map();
    
    // Count ratings per participant
    participants.forEach(p => {
      participantRatingCounts.set(p.id.toString(), 0);
    });
    
    assignments.forEach(assignment => {
      assignment.toRate.forEach(target => {
        if (target.type === 'peer') {
          participantRatingCounts.set(target.id.toString(), 
            participantRatingCounts.get(target.id.toString()) + 1);
        }
      });
    });
    
    // Calculate variance
    const counts = Array.from(participantRatingCounts.values());
    const average = counts.reduce((sum, count) => sum + count, 0) / counts.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / counts.length;
    
    console.log(`📊 Rating load variance: ${variance.toFixed(2)}`);
    
    return assignments;
  }

  /**
   * Remove conflicts from assignments
   */
  removeConflicts(assignments) {
    const conflicts = [];
    
    assignments.forEach(assignment => {
      assignment.toRate.forEach(target => {
        // Check for self-rating
        if (assignment.raterId.toString() === target.id.toString()) {
          conflicts.push({
            type: 'self_rating',
            assignmentId: assignment.raterId,
            targetId: target.id
          });
        }
      });
    });
    
    // Remove conflicts
    conflicts.forEach(conflict => {
      const assignment = assignments.find(a => a.raterId.toString() === conflict.assignmentId.toString());
      if (assignment) {
        assignment.toRate = assignment.toRate.filter(t => t.id.toString() !== conflict.targetId.toString());
        assignment.pending = assignment.pending.filter(id => id.toString() !== conflict.targetId.toString());
      }
    });
    
    if (conflicts.length > 0) {
      console.log(`⚠️ Removed ${conflicts.length} conflicts`);
    }
    
    return assignments;
  }

  /**
   * Validate final assignments
   */
  validateAssignments(assignments, participants, config) {
    const participantIds = new Set(participants.map(p => p.id.toString()));
    const ratedUserIds = new Set();
    const ratingCounts = new Map();
    
    // Initialize rating counts
    participants.forEach(p => {
      ratingCounts.set(p.id.toString(), 0);
    });
    
    // Count ratings
    assignments.forEach(assignment => {
      assignment.toRate.forEach(target => {
        if (target.type === 'peer') {
          ratedUserIds.add(target.id.toString());
          ratingCounts.set(target.id.toString(), 
            ratingCounts.get(target.id.toString()) + 1);
        }
      });
    });
    
    // Calculate metrics
    const coveragePercentage = (ratedUserIds.size / participantIds.size) * 100;
    const counts = Array.from(ratingCounts.values());
    const averageRatings = counts.reduce((sum, count) => sum + count, 0) / counts.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - averageRatings, 2), 0) / counts.length;
    const balanceScore = Math.max(0, 1 - (variance / (averageRatings + 1)));
    
    return {
      totalAssignments: assignments.length,
      completedRatings: 0,
      coveragePercentage,
      balanceScore,
      averageRatingsPerUser: averageRatings,
      minRatingsPerUser: Math.min(...counts),
      maxRatingsPerUser: Math.max(...counts),
      distributionVariance: variance
    };
  }

  /**
   * Select optimal strategy based on participant characteristics
   */
  selectOptimalStrategy(participants, config, options) {
    if (options.strategy) return options.strategy;
    
    const participantCount = participants.length;
    const tierDistribution = this.analyzeTierDistribution(participants);
    
    // Strategy selection logic
    if (participantCount < 5) {
      return this.strategies.BALANCED;
    } else if (tierDistribution.variance > 0.5) {
      return this.strategies.TIER_BALANCED;
    } else if (participantCount > 15) {
      return this.strategies.DEMOGRAPHIC_BALANCED;
    } else {
      return this.strategies.BALANCED;
    }
  }

  /**
   * Analyze tier distribution of participants
   */
  analyzeTierDistribution(participants) {
    const tierCounts = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    
    participants.forEach(p => {
      tierCounts[p.tier] = (tierCounts[p.tier] || 0) + 1;
    });
    
    const counts = Object.values(tierCounts);
    const total = counts.reduce((sum, count) => sum + count, 0);
    const average = total / counts.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / counts.length;
    
    return { tierCounts, variance };
  }

  /**
   * Enhance participant data with additional information
   */
  async enhanceParticipantData(participants) {
    const enhanced = await Promise.all(participants.map(async (participant) => {
      try {
        const profile = await UserRatingProfile.findOne({ userId: participant.id });
        const user = await User.findById(participant.id);
        
        return {
          ...participant,
          tier: profile?.tier?.current || 'bronze',
          ratingCount: profile?.overall?.totalRatings || 0,
          averageRating: profile?.overall?.currentScore || 0,
          reliabilityScore: profile?.ratingBehavior?.ratingCompletionRate || 0,
          preferences: user?.preferences || {},
          demographics: {
            // Add demographic data when available
            age: user?.dateOfBirth ? this.calculateAge(user.dateOfBirth) : null,
            location: user?.location?.city || null
          }
        };
      } catch (error) {
        console.error(`Error enhancing participant ${participant.id}:`, error);
        return {
          ...participant,
          tier: 'bronze',
          ratingCount: 0,
          averageRating: 0,
          reliabilityScore: 0,
          preferences: {},
          demographics: {}
        };
      }
    }));
    
    return enhanced;
  }

  /**
   * Calculate age from date of birth
   */
  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Validate input parameters
   */
  validateInput(participants, vendor, config) {
    if (!participants || participants.length === 0) {
      throw new Error('Participants array is required and cannot be empty');
    }
    
    if (!vendor || !vendor._id) {
      throw new Error('Valid vendor object is required');
    }
    
    if (!config || !config.systemSettings) {
      throw new Error('Valid configuration object is required');
    }
    
    if (participants.length < config.systemSettings.minParticipantsForRating) {
      throw new Error(`Insufficient participants: ${participants.length} < ${config.systemSettings.minParticipantsForRating}`);
    }
  }

  /**
   * Generate preference-based assignments (for future implementation)
   */
  async generatePreferenceBasedAssignments(participants, vendor, config) {
    // Implementation for preference-based assignment
    // This would use user preferences, activity history, and compatibility scores
    return await this.generateBalancedAssignments(participants, vendor, config);
  }

  /**
   * Generate tier-balanced assignments (for future implementation)
   */
  async generateTierBalancedAssignments(participants, vendor, config) {
    // Implementation for tier-balanced assignment
    // This would ensure balanced rating distribution across different tiers
    return await this.generateBalancedAssignments(participants, vendor, config);
  }

  /**
   * Generate demographic-balanced assignments (for future implementation)
   */
  async generateDemographicBalancedAssignments(participants, vendor, config) {
    // Implementation for demographic-balanced assignment
    // This would consider age, location, and other demographic factors
    return await this.generateBalancedAssignments(participants, vendor, config);
  }

  /**
   * Generate activity-type match assignments (for future implementation)
   */
  async generateActivityTypeMatchAssignments(participants, vendor, config) {
    // Implementation for activity-type match assignment
    // This would match participants based on activity preferences and compatibility
    return await this.generateBalancedAssignments(participants, vendor, config);
  }
}

module.exports = new RatingAssignmentAlgorithm();
