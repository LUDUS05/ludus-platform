import { api } from './api';

export const ratingService = {
  // Submit post-event rating
  submitRating: async (ratingData) => {
    const response = await api.post('/ratings', ratingData);
    return response.data;
  },

  // Check if user needs to rate an event
  checkRatingStatus: async (eventId) => {
    const response = await api.get(`/ratings/check/${eventId}`);
    return response.data;
  },

  // Get user's community rating
  getUserCommunityRating: async (userId) => {
    const response = await api.get(`/ratings/community/${userId}`);
    return response.data;
  },

  // Get event rating statistics
  getEventRatings: async (eventId) => {
    const response = await api.get(`/ratings/event/${eventId}`);
    return response.data;
  },

  // Get user's submitted ratings
  getMyRatings: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/ratings/my-ratings?${queryParams.toString()}`);
    return response.data;
  },

  // Get admin rating statistics
  getAdminRatingStats: async () => {
    const response = await api.get('/ratings/admin/stats');
    return response.data;
  },

  // Helper functions for rating display
  formatRatingDisplay: (rating) => {
    if (!rating || rating === 0) return 'No rating';
    return `${rating.toFixed(1)} ⭐`;
  },

  getRatingColor: (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  },

  getRatingBadgeStyle: (rating) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-800 border-green-200';
    if (rating >= 3.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rating >= 2.5) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  },

  // Validation helpers
  validateParticipantRatings: (participantRatings, minRequired = 2) => {
    if (!participantRatings || participantRatings.length < minRequired) {
      return {
        valid: false,
        error: `You must rate at least ${minRequired} other participants`
      };
    }

    for (const rating of participantRatings) {
      if (!rating.rating || rating.rating < 1 || rating.rating > 5) {
        return {
          valid: false,
          error: 'All participant ratings must be between 1 and 5 stars'
        };
      }
    }

    return { valid: true };
  },

  validateEventRating: (eventRating) => {
    if (!eventRating || eventRating < 1 || eventRating > 5) {
      return {
        valid: false,
        error: 'Event rating must be between 1 and 5 stars'
      };
    }
    return { valid: true };
  },

  validatePartnerRating: (partnerRating) => {
    if (!partnerRating || partnerRating < 1 || partnerRating > 5) {
      return {
        valid: false,
        error: 'Partner rating must be between 1 and 5 stars'
      };
    }
    return { valid: true };
  },

  // Star display helper
  renderStarRating: (rating, maxStars = 5) => {
    const filledStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = maxStars - filledStars - (hasHalfStar ? 1 : 0);

    return {
      filled: '★'.repeat(filledStars),
      half: hasHalfStar ? '☆' : '',
      empty: '☆'.repeat(emptyStars)
    };
  },

  // Calculate rating statistics
  calculateRatingDistribution: (ratings) => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    let sum = 0;

    ratings.forEach(rating => {
      const rounded = Math.round(rating);
      if (rounded >= 1 && rounded <= 5) {
        distribution[rounded]++;
        total++;
        sum += rating;
      }
    });

    return {
      distribution,
      average: total > 0 ? sum / total : 0,
      total
    };
  },

  // Format rating text for different contexts
  getRatingText: (rating, context = 'default') => {
    const texts = {
      default: {
        5: 'Excellent',
        4: 'Very Good',
        3: 'Good',
        2: 'Fair',
        1: 'Poor'
      },
      participant: {
        5: 'Amazing participant!',
        4: 'Great to be around',
        3: 'Good company',
        2: 'Could be better',
        1: 'Difficult to interact with'
      },
      event: {
        5: 'Outstanding event!',
        4: 'Great experience',
        3: 'Enjoyable',
        2: 'Okay',
        1: 'Disappointing'
      },
      partner: {
        5: 'Exceptional service',
        4: 'Very professional',
        3: 'Good service',
        2: 'Average',
        1: 'Poor service'
      }
    };

    return texts[context]?.[Math.round(rating)] || 'No rating';
  },

  // Enhanced Rating System Methods
  // Get rating system configuration
  getRatingSystemConfig: async () => {
    const response = await api.get('/rating-system/config');
    return response.data;
  },

  // Update rating system configuration (admin only)
  updateRatingSystemConfig: async (configData) => {
    const response = await api.put('/rating-system/config', configData);
    return response.data;
  },

  // Get user rating profile
  getUserRatingProfile: async (userId) => {
    const response = await api.get(`/rating-system/profile/${userId}`);
    return response.data;
  },

  // Get user rating assignments
  getUserRatingAssignments: async (userId) => {
    const response = await api.get(`/rating-system/assignments/user/${userId}`);
    return response.data;
  },

  // Get specific rating assignment
  getRatingAssignment: async (assignmentId) => {
    const response = await api.get(`/rating-system/assignments/${assignmentId}`);
    return response.data;
  },

  // Submit enhanced rating
  submitEnhancedRating: async (ratingData) => {
    const response = await api.post('/rating-system/ratings', ratingData);
    return response.data;
  },

  // Get user ratings (enhanced)
  getUserRatings: async (userId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/rating-system/ratings/user/${userId}?${queryParams.toString()}`);
    return response.data;
  },

  // Get ratings by user (what others rated this user)
  getRatingsByUser: async (userId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/rating-system/ratings/by-user/${userId}?${queryParams.toString()}`);
    return response.data;
  },

  // Get rating statistics
  getRatingStatistics: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/rating-system/statistics?${queryParams.toString()}`);
    return response.data;
  },

  // Get top rated users
  getTopRatedUsers: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/rating-system/top-users?${queryParams.toString()}`);
    return response.data;
  },

  // Flag a rating
  flagRating: async (ratingId, reason) => {
    const response = await api.post(`/rating-system/ratings/${ratingId}/flag`, { reason });
    return response.data;
  },

  // Review a flagged rating (admin only)
  reviewRating: async (ratingId, decision, notes) => {
    const response = await api.post(`/rating-system/ratings/${ratingId}/review`, { decision, notes });
    return response.data;
  },

  // Get flagged ratings (admin only)
  getFlaggedRatings: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/rating-system/ratings/flagged?${queryParams.toString()}`);
    return response.data;
  },

  // Process monthly bonuses (admin only)
  processMonthlyBonuses: async () => {
    const response = await api.post('/rating-system/process-bonuses');
    return response.data;
  },

  // Get rating system health (admin only)
  getRatingSystemHealth: async () => {
    const response = await api.get('/rating-system/health');
    return response.data;
  },

  // Advanced Algorithm Methods
  // Generate advanced rating assignments
  generateAdvancedRatingAssignments: async (eventId, options = {}) => {
    const response = await api.post(`/rating-system/assignments/advanced/${eventId}`, options);
    return response.data;
  },

  // Recalculate user rating with advanced engine
  recalculateWithAdvancedEngine: async (userId, options = {}) => {
    const response = await api.post(`/rating-system/recalculate/${userId}`, options);
    return response.data;
  },

  // Batch recalculate multiple users
  batchRecalculateUsers: async (userIds, options = {}) => {
    const response = await api.post('/rating-system/batch-recalculate', { userIds, options });
    return response.data;
  },

  // Get calculation statistics
  getCalculationStatistics: async (options = {}) => {
    const queryParams = new URLSearchParams(options);
    const response = await api.get(`/rating-system/statistics/calculation?${queryParams.toString()}`);
    return response.data;
  },

  // Select optimal algorithm strategy
  selectOptimalStrategy: async (participants, options = {}) => {
    const response = await api.post('/rating-system/strategy/select', { participants, options });
    return response.data;
  },

  // Enhanced helper functions
  getTierColor: (tier) => {
    const tierColors = {
      bronze: 'text-amber-600',
      silver: 'text-gray-400',
      gold: 'text-yellow-500',
      platinum: 'text-purple-500'
    };
    return tierColors[tier] || tierColors.bronze;
  },

  getTierName: (tier) => {
    const tierNames = {
      bronze: 'Bronze',
      silver: 'Silver',
      gold: 'Gold',
      platinum: 'Platinum'
    };
    return tierNames[tier] || 'Bronze';
  },

  getTrendIcon: (trend) => {
    const trendIcons = {
      improving: '↗️',
      declining: '↘️',
      stable: '→'
    };
    return trendIcons[trend] || '→';
  },

  getTrendColor: (trend) => {
    const trendColors = {
      improving: 'text-green-600',
      declining: 'text-red-600',
      stable: 'text-gray-600'
    };
    return trendColors[trend] || 'text-gray-600';
  },

  formatTimeSpent: (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  calculateTierProgress: (currentScore, tier) => {
    const tierThresholds = {
      bronze: { min: 0, max: 2.5 },
      silver: { min: 2.5, max: 3.5 },
      gold: { min: 3.5, max: 4.5 },
      platinum: { min: 4.5, max: 5.0 }
    };
    
    const threshold = tierThresholds[tier];
    if (!threshold) return 0;
    
    const progress = ((currentScore - threshold.min) / (threshold.max - threshold.min)) * 100;
    return Math.min(100, Math.max(0, progress));
  }
};