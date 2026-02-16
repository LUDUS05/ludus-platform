/**
 * @fileoverview Review Service for LUDUS Platform - LDS-015 Implementation
 * @module services/reviewService
 * 
 * This service provides comprehensive review management functionality including:
 * - Review CRUD operations
 * - Review analytics and reporting
 * - Partner response management
 * - Helpful votes and social features
 * - RTL support for Arabic users
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import api from './api';

class LUDUSReviewService {
  constructor() {
    this.baseURL = '/api/reviews';
  }

  /**
   * Create a new review for an activity.
   * @param {Object} reviewData - The review data
   * @returns {Promise<Object>} The created review
   */
  async createReview(reviewData) {
    try {
      const response = await api.post(this.baseURL, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get reviews for an activity.
   * @param {string} activityId - The activity ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} The reviews and statistics
   */
  async getActivityReviews(activityId, params = {}) {
    try {
      const response = await api.get(`${this.baseURL}/activity/${activityId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching activity reviews:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get user's reviews.
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} The user's reviews
   */
  async getUserReviews(params = {}) {
    try {
      const response = await api.get(`${this.baseURL}/user`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update a review.
   * @param {string} reviewId - The review ID
   * @param {Object} updateData - The update data
   * @returns {Promise<Object>} The updated review
   */
  async updateReview(reviewId, updateData) {
    try {
      const response = await api.put(`${this.baseURL}/${reviewId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a review.
   * @param {string} reviewId - The review ID
   * @returns {Promise<Object>} The deletion result
   */
  async deleteReview(reviewId) {
    try {
      const response = await api.delete(`${this.baseURL}/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Add helpful vote to a review.
   * @param {string} reviewId - The review ID
   * @returns {Promise<Object>} The updated helpful count
   */
  async addHelpfulVote(reviewId) {
    try {
      const response = await api.post(`${this.baseURL}/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      console.error('Error adding helpful vote:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Remove helpful vote from a review.
   * @param {string} reviewId - The review ID
   * @returns {Promise<Object>} The updated helpful count
   */
  async removeHelpfulVote(reviewId) {
    try {
      const response = await api.delete(`${this.baseURL}/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      console.error('Error removing helpful vote:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Add partner response to a review.
   * @param {string} reviewId - The review ID
   * @param {Object} responseData - The response data
   * @returns {Promise<Object>} The updated review
   */
  async addPartnerResponse(reviewId, responseData) {
    try {
      const response = await api.post(`${this.baseURL}/${reviewId}/response`, responseData);
      return response.data;
    } catch (error) {
      console.error('Error adding partner response:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get review analytics.
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} The review analytics
   */
  async getReviewAnalytics(params = {}) {
    try {
      const response = await api.get(`${this.baseURL}/analytics`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching review analytics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get pending reviews for moderation (admin only).
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} The pending reviews
   */
  async getPendingReviews(params = {}) {
    try {
      const response = await api.get(`${this.baseURL}/pending`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Moderate a review (admin only).
   * @param {string} reviewId - The review ID
   * @param {Object} moderationData - The moderation data
   * @returns {Promise<Object>} The moderation result
   */
  async moderateReview(reviewId, moderationData) {
    try {
      const response = await api.put(`${this.baseURL}/${reviewId}/moderate`, moderationData);
      return response.data;
    } catch (error) {
      console.error('Error moderating review:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Upload review image to Cloudinary.
   * @param {File} file - The image file
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} The upload result
   */
  async uploadReviewImage(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', options.folder || 'reviews');
      formData.append('resource_type', 'image');

      const response = await api.post('/api/uploads/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading review image:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete review image from Cloudinary.
   * @param {string} publicId - The Cloudinary public ID
   * @returns {Promise<Object>} The deletion result
   */
  async deleteReviewImage(publicId) {
    try {
      const response = await api.delete(`/api/uploads/image/${publicId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting review image:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Format rating for display.
   * @param {number} rating - The rating value
   * @returns {string} The formatted rating
   */
  formatRating(rating) {
    return rating ? rating.toFixed(1) : '0.0';
  }

  /**
   * Get rating stars for display.
   * @param {number} rating - The rating value
   * @param {number} maxRating - The maximum rating (default: 5)
   * @returns {Array} Array of star objects
   */
  getRatingStars(rating, maxRating = 5) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < maxRating; i++) {
      if (i < fullStars) {
        stars.push({ type: 'full', index: i });
      } else if (i === fullStars && hasHalfStar) {
        stars.push({ type: 'half', index: i });
      } else {
        stars.push({ type: 'empty', index: i });
      }
    }

    return stars;
  }

  /**
   * Calculate rating distribution percentage.
   * @param {Object} distribution - The rating distribution
   * @param {number} total - The total number of reviews
   * @returns {Object} The percentage distribution
   */
  calculateRatingDistribution(distribution, total) {
    const percentage = {};
    for (let i = 1; i <= 5; i++) {
      percentage[i] = total > 0 ? Math.round((distribution[i] || 0) / total * 100) : 0;
    }
    return percentage;
  }

  /**
   * Get review status color.
   * @param {string} status - The review status
   * @returns {string} The color class
   */
  getReviewStatusColor(status) {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      approved: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
      hidden: 'text-gray-600 bg-gray-100'
    };
    return colors[status] || colors.pending;
  }

  /**
   * Get review priority color.
   * @param {string} priority - The review priority
   * @returns {string} The color class
   */
  getReviewPriorityColor(priority) {
    const colors = {
      low: 'text-blue-600 bg-blue-100',
      normal: 'text-gray-600 bg-gray-100',
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100'
    };
    return colors[priority] || colors.normal;
  }

  /**
   * Validate review data before submission.
   * @param {Object} reviewData - The review data
   * @returns {Object} Validation result
   */
  validateReviewData(reviewData) {
    const errors = {};

    if (!reviewData.activityId) {
      errors.activityId = 'Activity ID is required';
    }

    if (!reviewData.bookingId) {
      errors.bookingId = 'Booking ID is required';
    }

    if (!reviewData.rating || !reviewData.rating.overall) {
      errors.rating = 'Overall rating is required';
    } else if (reviewData.rating.overall < 1 || reviewData.rating.overall > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }

    if (reviewData.comment && reviewData.comment.length > 1000) {
      errors.comment = 'Comment cannot exceed 1000 characters';
    }

    if (reviewData.commentAr && reviewData.commentAr.length > 1000) {
      errors.commentAr = 'Arabic comment cannot exceed 1000 characters';
    }

    if (reviewData.images && reviewData.images.length > 10) {
      errors.images = 'Maximum 10 images allowed';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Handle API errors.
   * @param {Error} error - The error object
   * @returns {Error} The processed error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.message || 'An error occurred';
      
      return new Error(`${status}: ${message}`);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error: Please check your connection');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  /**
   * Get review statistics summary.
   * @param {Object} statistics - The review statistics
   * @returns {Object} The formatted statistics
   */
  getReviewStatisticsSummary(statistics) {
    return {
      totalReviews: statistics.totalReviews || 0,
      averageRating: this.formatRating(statistics.averageRating || 0),
      verifiedReviews: statistics.verifiedReviews || 0,
      reviewsWithImages: statistics.reviewsWithImages || 0,
      reviewsWithResponses: statistics.reviewsWithResponses || 0,
      totalHelpfulVotes: statistics.totalHelpfulVotes || 0,
      verificationRate: statistics.verificationRate || 0,
      responseRate: statistics.responseRate || 0
    };
  }

  /**
   * Generate review report data.
   * @param {Array} reviews - The reviews array
   * @param {Object} statistics - The review statistics
   * @returns {Object} The report data
   */
  generateReviewReport(reviews, statistics) {
    const report = {
      summary: this.getReviewStatisticsSummary(statistics),
      reviews: reviews.map(review => ({
        id: review._id,
        user: review.user,
        activity: review.activity,
        rating: review.rating,
        comment: review.comment,
        commentAr: review.commentAr,
        images: review.images || [],
        isVerified: review.isVerified,
        helpfulCount: review.helpful?.count || 0,
        hasPartnerResponse: review.response && review.response.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      })),
      generatedAt: new Date().toISOString()
    };

    return report;
  }
}

export const reviewService = new LUDUSReviewService();
export default reviewService;
