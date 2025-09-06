// frontend/src/services/apiService.js - Enhanced API service with animation triggers
import axios from 'axios';
import { notificationService } from './notificationService';

class LUDUSAPIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'https://ludus-backend-gf1g.onrender.com';
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
