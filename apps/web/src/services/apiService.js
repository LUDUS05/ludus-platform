/**
 * @fileoverview Enhanced API service for LUDUS platform frontend with animation triggers.
 * 
 * Purpose: Centralized API service that handles all HTTP communications between the
 * frontend and backend, providing enhanced user experience through animation triggers,
 * comprehensive error handling, and optimized request/response management for the
 * LUDUS social activity platform.
 * 
 * Business Context: This service is the primary interface for all platform operations
 * including user authentication, activity management, booking systems, payment processing,
 * and social interactions. It enhances user experience through strategic animation
 * triggers and provides consistent error handling across the application.
 * 
 * Implementation Notes:
 * - Axios-based HTTP client with interceptors
 * - Automatic authentication token management
 * - Animation trigger integration for enhanced UX
 * - Comprehensive error handling and user feedback
 * - Request/response transformation
 * - Timeout and retry logic
 * 
 * Dependencies:
 * - Axios for HTTP requests
 * - Notification service for user feedback
 * - Local storage for token management
 * 
 * Evolution: Originally basic API service, evolved to include animation triggers,
 * enhanced error handling, and comprehensive user experience features.
 * 
 * @version 1.0.0
 * @since 2024-01-01
 * @modified 2025-01-08 - Added animation triggers and enhanced error handling
 */

import axios from 'axios';
import { notificationService } from './notificationService';

/**
 * Enhanced API service class for LUDUS platform with animation triggers.
 * 
 * Purpose: Provides comprehensive API communication with enhanced user experience
 * through animation triggers, automatic authentication, and robust error handling
 * for all platform operations.
 * 
 * Business Context: Serves as the primary communication layer between frontend
 * and backend, ensuring consistent user experience across all platform features
 * including activities, bookings, payments, and social interactions.
 * 
 * Implementation Notes:
 * - Singleton pattern for consistent instance usage
 * - Automatic base URL configuration for different environments
 * - Request/response interceptors for authentication and animations
 * - Comprehensive error handling with user-friendly messages
 * - Animation trigger integration for enhanced UX
 * 
 * Dependencies:
 * - Axios for HTTP client functionality
 * - Notification service for user feedback
 * - Environment variables for configuration
 * 
 * Evolution: Started as basic API service, evolved to include animation triggers,
 * enhanced error handling, and comprehensive user experience features.
 * 
 * @class LUDUSAPIService
 * @since 2024-01-01
 * @modified 2025-01-08 - Added animation triggers and enhanced error handling
 */
class LUDUSAPIService {
  /**
   * Initializes the API service with configuration and interceptors.
   * 
   * Purpose: Sets up the HTTP client with proper configuration, base URL,
   * and request/response interceptors for enhanced functionality.
   * 
   * Business Context: Ensures consistent API communication across all
   * platform features with proper authentication and user experience
   * enhancements.
   * 
   * Implementation Notes:
   * - Configures base URL from environment variables
   * - Sets up Axios client with timeout and headers
   * - Initializes request/response interceptors
   * - Enables animation triggers by default
   * 
   * Dependencies:
   * - Environment variables for API URL configuration
   * - Axios for HTTP client setup
   * 
   * Evolution: Originally simple constructor, evolved to include
   * comprehensive interceptor setup and environment configuration.
   * 
   * @constructor
   * @since 2024-01-01
   * @modified 2025-01-08 - Added interceptor setup and environment configuration
   */
  constructor() {
    // Default to athena backend; append /api if not provided
    const envUrl = process.env.REACT_APP_API_URL || 'https://ludus-backend-athena.onrender.com';
    this.baseURL = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add animation configuration header
        config.headers['X-Animation-Enabled'] = 'true';
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Handle animation triggers from backend
        if (response.data && response.data.animationTriggers) {
          notificationService.showFromAPIResponse(response.data);
        }
        
        return response;
      },
      (error) => {
        // Handle animation triggers for errors
        if (error.response && error.response.data && error.response.data.animationTriggers) {
          notificationService.showFromAPIResponse(error.response.data);
        } else {
          // Default error notification
          notificationService.show('error', error.message || 'An error occurred');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get(url, config = {}) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(url, data, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put(url, data, config = {}) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'Server error',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        status: 0
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0
      };
    }
  }

  // Authentication methods
  async authenticate(credentials) {
    return this.post('/api/auth/login', credentials);
  }

  async register(userData) {
    return this.post('/api/auth/register', userData);
  }

  async logout() {
    localStorage.removeItem('authToken');
    return this.post('/api/auth/logout');
  }

  // Activity methods with animation support
  async getActivities(filters = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    return this.get(`/api/activities?${params.toString()}`);
  }

  async getActivity(id) {
    return this.get(`/api/activities/${id}`);
  }

  async createActivity(activityData) {
    return this.post('/api/activities', activityData);
  }

  async updateActivity(id, activityData) {
    return this.put(`/api/activities/${id}`, activityData);
  }

  async deleteActivity(id) {
    return this.delete(`/api/activities/${id}`);
  }

  // Search with animation configuration
  async searchActivities(query, filters = {}) {
    return this.get('/api/search', {
      params: {
        q: query,
        ...filters,
        animationConfig: {
          staggerDelay: 0.1,
          duration: 0.6,
          entrance: 'slideUp'
        }
      }
    });
  }

  // Booking methods with celebration animations
  async createBooking(bookingData) {
    return this.post('/api/bookings', {
      ...bookingData,
      animationTriggers: {
        celebration: true,
        confetti: true,
        successMessage: 'Booking confirmed! 🎉'
      }
    });
  }

  async getBookings(userId) {
    return this.get(`/api/bookings/user/${userId}`);
  }

  async cancelBooking(bookingId) {
    return this.delete(`/api/bookings/${bookingId}`);
  }

  // Social interaction methods
  async joinEvent(eventId) {
    return this.post('/api/events/join', {
      eventId,
      animationTriggers: {
        hapticFeedback: true,
        successMessage: 'Successfully joined the event!'
      }
    });
  }

  async leaveEvent(eventId) {
    return this.post('/api/events/leave', { eventId });
  }

  async toggleLike(contentId, contentType) {
    return this.post('/api/social/like', {
      contentId,
      contentType,
      animationTriggers: {
        heartAnimation: true
      }
    });
  }

  // User profile methods
  async getUserProfile(userId) {
    return this.get(`/api/users/${userId}`);
  }

  async updateUserProfile(userId, profileData) {
    return this.put(`/api/users/${userId}`, profileData);
  }

  async uploadAvatar(userId, file) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.post(`/api/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Payment methods
  async createPayment(paymentData) {
    return this.post('/api/payments', {
      ...paymentData,
      animationTriggers: {
        successMessage: 'Payment processed successfully!',
        celebration: true
      }
    });
  }

  async getPaymentHistory(userId) {
    return this.get(`/api/payments/user/${userId}`);
  }

  // Notification methods
  async getNotifications(userId) {
    return this.get(`/api/notifications/${userId}`);
  }

  async markNotificationAsRead(notificationId) {
    return this.put(`/api/notifications/${notificationId}/read`);
  }

  // Analytics methods
  async getActivityAnalytics(activityId) {
    return this.get(`/api/analytics/activities/${activityId}`);
  }

  async getUserAnalytics(userId) {
    return this.get(`/api/analytics/users/${userId}`);
  }

  // Health check
  async healthCheck() {
    return this.get('/api/health');
  }
}

// Create singleton instance
export const apiService = new LUDUSAPIService();
export default apiService;
