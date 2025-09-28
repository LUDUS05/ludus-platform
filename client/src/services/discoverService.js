/**
 * @fileoverview Discover Service for Selena-Discover AI Agent Integration
 * 
 * This service handles all communication with the Selena-Discover AI agent,
 * providing intelligent search, recommendations, and analytics capabilities.
 * 
 * @version 1.0.0
 * @author LUDUS Development Team - Selena-Discover Implementation
 * @since 2025-09-28
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class DiscoverService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token interceptor
    this.apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Discover API Error:', error);
        
        // Handle specific error cases
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Perform intelligent search using Selena-Discover AI
   * @param {Object} searchRequest - Search parameters
   * @returns {Promise<Object>} Search results with AI insights
   */
  async intelligentSearch(searchRequest) {
    try {
      const response = await this.apiClient.post('/discover/search', searchRequest);
      return response.data;
    } catch (error) {
      // Fallback to basic search if AI agent is unavailable
      console.warn('AI search failed, falling back to basic search:', error.message);
      return await this.basicSearch(searchRequest);
    }
  }

  /**
   * Get personalized recommendations
   * @param {Object} recommendationRequest - Recommendation parameters
   * @returns {Promise<Object>} Personalized recommendations
   */
  async getPersonalizedRecommendations(recommendationRequest) {
    try {
      const response = await this.apiClient.post('/discover/recommend', recommendationRequest);
      return response.data;
    } catch (error) {
      console.error('Recommendation request failed:', error);
      throw error;
    }
  }

  /**
   * Apply advanced filters with AI assistance
   * @param {Object} filterData - Filter parameters
   * @returns {Promise<Object>} Filtered results with suggestions
   */
  async advancedFilter(filterData) {
    try {
      const response = await this.apiClient.post('/discover/filter', filterData);
      return response.data;
    } catch (error) {
      console.error('Filter request failed:', error);
      throw error;
    }
  }

  /**
   * Get trending activities with cultural insights
   * @param {Object} options - Trending options
   * @returns {Promise<Object>} Trending activities and insights
   */
  async getTrendingActivities(options = {}) {
    try {
      const params = {
        location: options.location,
        timeframe: options.timeframe || 'week',
        cultural_context: options.culturalContext || 'saudi_modern',
        language: options.language || 'ar'
      };

      const response = await this.apiClient.get('/discover/trending', { params });
      return response.data;
    } catch (error) {
      console.error('Trending request failed:', error);
      throw error;
    }
  }

  /**
   * Get nearby activities with intelligent proximity analysis
   * @param {string} location - Location identifier
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Nearby activities with insights
   */
  async getNearbyActivities(location, options = {}) {
    try {
      const params = {
        radius: options.radius || 25,
        user_id: options.userId,
        language: options.language || 'ar'
      };

      const response = await this.apiClient.get(`/discover/nearby/${location}`, { params });
      return response.data;
    } catch (error) {
      console.error('Nearby search failed:', error);
      throw error;
    }
  }

  /**
   * Save user preferences and track interactions
   * @param {Object} preferenceData - User preference and interaction data
   * @returns {Promise<Object>} Update result
   */
  async saveUserPreferences(preferenceData) {
    try {
      const response = await this.apiClient.post('/discover/preferences', preferenceData);
      return response.data;
    } catch (error) {
      console.error('Save preferences failed:', error);
      throw error;
    }
  }

  /**
   * Track user interaction for learning algorithms
   * @param {Object} interactionData - Interaction data
   * @returns {Promise<void>}
   */
  async trackInteraction(interactionData) {
    try {
      await this.apiClient.post('/discover/track-interaction', interactionData);
    } catch (error) {
      console.warn('Interaction tracking failed:', error.message);
      // Don't throw - interaction tracking failures shouldn't break user experience
    }
  }

  /**
   * Get user's search history and patterns
   * @param {Object} options - History options
   * @returns {Promise<Object>} Search history and patterns
   */
  async getSearchHistory(options = {}) {
    try {
      const params = {
        page: options.page || 1,
        limit: options.limit || 20,
        timeframe: options.timeframe || 30
      };

      const response = await this.apiClient.get('/discover/history', { params });
      return response.data;
    } catch (error) {
      console.error('Get search history failed:', error);
      throw error;
    }
  }

  /**
   * Get user's preference profile
   * @returns {Promise<Object>} User preference profile
   */
  async getUserPreferenceProfile() {
    try {
      const response = await this.apiClient.get('/discover/profile');
      return response.data;
    } catch (error) {
      console.error('Get user profile failed:', error);
      throw error;
    }
  }

  /**
   * Get discover agent health status
   * @returns {Promise<Object>} Health status
   */
  async getAgentHealth() {
    try {
      const response = await this.apiClient.get('/discover/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Get discover analytics (admin only)
   * @param {Object} options - Analytics options
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalytics(options = {}) {
    try {
      const params = {
        timeframe: options.timeframe || 'week',
        detailed: options.detailed || false
      };

      const response = await this.apiClient.get('/discover/admin/analytics', { params });
      return response.data;
    } catch (error) {
      console.error('Get analytics failed:', error);
      throw error;
    }
  }

  /**
   * Get performance dashboard data (admin only)
   * @param {Object} options - Dashboard options
   * @returns {Promise<Object>} Dashboard data
   */
  async getPerformanceDashboard(options = {}) {
    try {
      const params = {
        timeframe: options.timeframe || 'day'
      };

      const response = await this.apiClient.get('/discover/admin/dashboard', { params });
      return response.data;
    } catch (error) {
      console.error('Get dashboard data failed:', error);
      throw error;
    }
  }

  /**
   * Get cultural search trends
   * @param {Object} options - Trend options
   * @returns {Promise<Object>} Cultural trends
   */
  async getCulturalTrends(options = {}) {
    try {
      const params = {
        timeframe: options.timeframe || 7
      };

      const response = await this.apiClient.get('/discover/cultural-trends', { params });
      return response.data;
    } catch (error) {
      console.error('Get cultural trends failed:', error);
      throw error;
    }
  }

  /**
   * Fallback basic search when AI agent is unavailable
   * @param {Object} searchRequest - Search parameters
   * @returns {Promise<Object>} Basic search results
   */
  async basicSearch(searchRequest) {
    try {
      // Use existing activity search endpoint as fallback
      const params = {
        q: searchRequest.query,
        category: searchRequest.filters?.category,
        city: searchRequest.location?.city,
        minPrice: searchRequest.filters?.price_range?.[0],
        maxPrice: searchRequest.filters?.price_range?.[1],
        limit: 15
      };

      const response = await this.apiClient.get('/activities/search', { params });
      
      // Format to match discover agent response structure
      return {
        success: true,
        data: {
          results: response.data.data?.activities || [],
          totalCount: response.data.data?.count || 0,
          searchQuery: searchRequest.query,
          processedQuery: { originalQuery: searchRequest.query },
          recommendations: [],
          culturalInsights: [],
          geographicClusters: [],
          searchSuggestions: [],
          performanceMetrics: { fallbackMode: true },
          userLearning: {}
        }
      };
    } catch (error) {
      console.error('Basic search fallback failed:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions based on partial query
   * @param {string} partialQuery - Partial search query
   * @param {string} language - Language preference
   * @returns {Promise<Array>} Search suggestions
   */
  async getSearchSuggestions(partialQuery, language = 'ar') {
    try {
      // This could be enhanced with a dedicated suggestion endpoint
      // For now, return static suggestions based on language
      const suggestions = {
        ar: [
          'أنشطة مغامرات في الرياض',
          'ورش طبخ تراثية',
          'أنشطة عائلية في جدة',
          'رياضات مائية في البحر الأحمر',
          'جولات ثقافية في الدرعية',
          'أنشطة اللياقة البدنية',
          'فعاليات فنية وإبداعية',
          'تجارب الطعام السعودي'
        ],
        en: [
          'Adventure activities in Riyadh',
          'Traditional cooking workshops',
          'Family activities in Jeddah',
          'Red Sea water sports',
          'Cultural tours in Diriyah',
          'Fitness activities',
          'Art and creative events',
          'Saudi food experiences'
        ]
      };

      const languageSuggestions = suggestions[language] || suggestions.en;
      
      if (!partialQuery || partialQuery.length < 2) {
        return languageSuggestions.slice(0, 5);
      }

      // Filter suggestions based on partial query
      const filtered = languageSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(partialQuery.toLowerCase())
      );

      return filtered.length > 0 ? filtered : languageSuggestions.slice(0, 3);
    } catch (error) {
      console.error('Get suggestions failed:', error);
      return [];
    }
  }

  /**
   * Chat with Selena-Discover agent
   * @param {Object} chatRequest - Chat message and context
   * @returns {Promise<Object>} Agent response
   */
  async chatWithSelena(chatRequest) {
    try {
      // This would integrate with the agents API chat endpoint
      const response = await axios.post(
        process.env.REACT_APP_AGENTS_API_URL || 'http://localhost:8000/chat',
        {
          message: chatRequest.message,
          session_id: chatRequest.sessionId,
          language: chatRequest.language || 'ar',
          agent_type: 'discover'
        }
      );

      return response.data;
    } catch (error) {
      console.error('Chat with Selena failed:', error);
      throw error;
    }
  }

  /**
   * Export search data for analytics
   * @param {string} userId - User ID
   * @param {Object} options - Export options
   * @returns {Promise<Object>} Exported data
   */
  async exportSearchData(userId, options = {}) {
    try {
      const params = {
        format: options.format || 'json',
        timeframe: options.timeframe || 'month'
      };

      const response = await this.apiClient.get(`/discover/export/${userId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Export search data failed:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const discoverService = new DiscoverService();
export default DiscoverService;