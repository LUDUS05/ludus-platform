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
  }
};