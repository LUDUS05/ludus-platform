/**
 * @fileoverview Search Service for LUDUS Platform - LDS-016 Implementation
 * @module services/searchService
 * 
 * This service provides comprehensive search and discovery functionality including:
 * - Advanced activity search with filters
 * - Search suggestions and auto-complete
 * - Search analytics and reporting
 * - Search filters and options
 * - RTL support for Arabic users
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import api from './api';

class LUDUSSearchService {
  constructor() {
    this.baseURL = '/api/search';
    this.searchHistory = this.loadSearchHistory();
    this.savedSearches = this.loadSavedSearches();
  }

  /**
   * Search activities with advanced filters.
   * @param {Object} searchParams - The search parameters
   * @returns {Promise<Object>} The search results
   */
  async searchActivities(searchParams = {}) {
    try {
      const response = await api.get(`${this.baseURL}/activities`, { params: searchParams });
      
      // Save search to history
      if (searchParams.query) {
        this.addToSearchHistory(searchParams.query);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error searching activities:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get search suggestions.
   * @param {string} query - The search query
   * @param {string} language - The language (ar/en)
   * @param {number} limit - Maximum number of suggestions
   * @returns {Promise<Object>} The search suggestions
   */
  async getSearchSuggestions(query, language = 'ar', limit = 10) {
    try {
      const response = await api.get(`${this.baseURL}/suggestions`, {
        params: { query, language, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get search filters and options.
   * @param {string} language - The language (ar/en)
   * @returns {Promise<Object>} The search filters
   */
  async getSearchFilters(language = 'ar') {
    try {
      const response = await api.get(`${this.baseURL}/filters`, {
        params: { language }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting search filters:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get search analytics.
   * @param {Object} params - Analytics parameters
   * @returns {Promise<Object>} The search analytics
   */
  async getSearchAnalytics(params = {}) {
    try {
      const response = await api.get(`${this.baseURL}/analytics`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting search analytics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Save search query for analytics.
   * @param {Object} searchData - The search data
   * @returns {Promise<Object>} The save result
   */
  async saveSearchQuery(searchData) {
    try {
      const response = await api.post(`${this.baseURL}/log`, searchData);
      return response.data;
    } catch (error) {
      console.error('Error saving search query:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Build search URL with parameters.
   * @param {Object} params - Search parameters
   * @returns {string} The search URL
   */
  buildSearchURL(params) {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        if (Array.isArray(params[key])) {
          params[key].forEach(item => searchParams.append(key, item));
        } else {
          searchParams.append(key, params[key]);
        }
      }
    });
    
    return `/search?${searchParams.toString()}`;
  }

  /**
   * Parse search URL parameters.
   * @param {string} url - The URL to parse
   * @returns {Object} The parsed parameters
   */
  parseSearchURL(url) {
    const params = new URLSearchParams(url.split('?')[1] || '');
    const result = {};
    
    for (const [key, value] of params.entries()) {
      if (result[key]) {
        if (Array.isArray(result[key])) {
          result[key].push(value);
        } else {
          result[key] = [result[key], value];
        }
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Add search query to history.
   * @param {string} query - The search query
   */
  addToSearchHistory(query) {
    if (!query || query.trim().length < 2) return;
    
    const trimmedQuery = query.trim();
    
    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(item => item !== trimmedQuery);
    
    // Add to beginning
    this.searchHistory.unshift(trimmedQuery);
    
    // Keep only last 20 searches
    this.searchHistory = this.searchHistory.slice(0, 20);
    
    this.saveSearchHistory();
  }

  /**
   * Get search history.
   * @returns {Array} The search history
   */
  getSearchHistory() {
    return this.searchHistory;
  }

  /**
   * Clear search history.
   */
  clearSearchHistory() {
    this.searchHistory = [];
    this.saveSearchHistory();
  }

  /**
   * Save search query.
   * @param {string} name - The saved search name
   * @param {Object} params - The search parameters
   */
  saveSearch(name, params) {
    const savedSearch = {
      id: Date.now().toString(),
      name,
      params,
      createdAt: new Date().toISOString()
    };
    
    this.savedSearches.unshift(savedSearch);
    this.savedSearches = this.savedSearches.slice(0, 10); // Keep only 10 saved searches
    this.saveSavedSearches();
  }

  /**
   * Get saved searches.
   * @returns {Array} The saved searches
   */
  getSavedSearches() {
    return this.savedSearches;
  }

  /**
   * Delete saved search.
   * @param {string} id - The saved search ID
   */
  deleteSavedSearch(id) {
    this.savedSearches = this.savedSearches.filter(search => search.id !== id);
    this.saveSavedSearches();
  }

  /**
   * Load search history from localStorage.
   * @returns {Array} The search history
   */
  loadSearchHistory() {
    try {
      const history = localStorage.getItem('ludus_search_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  }

  /**
   * Save search history to localStorage.
   */
  saveSearchHistory() {
    try {
      localStorage.setItem('ludus_search_history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  /**
   * Load saved searches from localStorage.
   * @returns {Array} The saved searches
   */
  loadSavedSearches() {
    try {
      const searches = localStorage.getItem('ludus_saved_searches');
      return searches ? JSON.parse(searches) : [];
    } catch (error) {
      console.error('Error loading saved searches:', error);
      return [];
    }
  }

  /**
   * Save saved searches to localStorage.
   */
  saveSavedSearches() {
    try {
      localStorage.setItem('ludus_saved_searches', JSON.stringify(this.savedSearches));
    } catch (error) {
      console.error('Error saving saved searches:', error);
    }
  }

  /**
   * Format search results for display.
   * @param {Array} activities - The activities array
   * @param {string} language - The language (ar/en)
   * @returns {Array} The formatted activities
   */
  formatSearchResults(activities, language = 'ar') {
    return activities.map(activity => ({
      id: activity._id,
      title: language === 'ar' ? activity.title : activity.titleEn,
      description: language === 'ar' ? activity.description : activity.descriptionEn,
      category: activity.category,
      tags: activity.tags || [],
      features: activity.features || [],
      difficulty: activity.difficulty,
      duration: activity.duration,
      pricing: activity.pricing,
      location: activity.location,
      images: activity.images || [],
      rating: activity.rating,
      statistics: activity.statistics,
      vendorName: language === 'ar' ? activity.vendorNameAr : activity.vendorName,
      reviewCount: activity.reviewCount || 0,
      averageRating: activity.averageRating || 0,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt
    }));
  }

  /**
   * Get search result summary.
   * @param {Object} searchData - The search data
   * @returns {Object} The search summary
   */
  getSearchSummary(searchData) {
    const { activities, pagination, filters } = searchData.data;
    
    return {
      totalResults: pagination.total,
      currentPage: pagination.page,
      totalPages: pagination.pages,
      resultsPerPage: pagination.limit,
      hasResults: activities.length > 0,
      hasMorePages: pagination.page < pagination.pages,
      activeFilters: Object.keys(filters).filter(key => 
        filters[key] !== undefined && 
        filters[key] !== null && 
        filters[key] !== '' &&
        filters[key] !== 0
      ).length,
      searchQuery: filters.query || '',
      resultsCount: activities.length
    };
  }

  /**
   * Validate search parameters.
   * @param {Object} params - The search parameters
   * @returns {Object} Validation result
   */
  validateSearchParams(params) {
    const errors = {};
    
    if (params.query && params.query.length > 100) {
      errors.query = 'Search query cannot exceed 100 characters';
    }
    
    if (params.priceMin && (params.priceMin < 0 || params.priceMin > 10000)) {
      errors.priceMin = 'Minimum price must be between 0 and 10000';
    }
    
    if (params.priceMax && (params.priceMax < 0 || params.priceMax > 10000)) {
      errors.priceMax = 'Maximum price must be between 0 and 10000';
    }
    
    if (params.priceMin && params.priceMax && params.priceMin > params.priceMax) {
      errors.priceRange = 'Minimum price cannot be greater than maximum price';
    }
    
    if (params.rating && (params.rating < 0 || params.rating > 5)) {
      errors.rating = 'Rating must be between 0 and 5';
    }
    
    if (params.radius && (params.radius < 1 || params.radius > 500)) {
      errors.radius = 'Radius must be between 1 and 500 km';
    }
    
    if (params.latitude && (params.latitude < -90 || params.latitude > 90)) {
      errors.latitude = 'Latitude must be between -90 and 90';
    }
    
    if (params.longitude && (params.longitude < -180 || params.longitude > 180)) {
      errors.longitude = 'Longitude must be between -180 and 180';
    }
    
    if (params.page && (params.page < 1 || params.page > 100)) {
      errors.page = 'Page must be between 1 and 100';
    }
    
    if (params.limit && (params.limit < 1 || params.limit > 100)) {
      errors.limit = 'Limit must be between 1 and 100';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Get search filter options.
   * @param {string} language - The language (ar/en)
   * @returns {Object} The filter options
   */
  getFilterOptions(language = 'ar') {
    const options = {
      ar: {
        categories: {
          'sports': 'رياضة',
          'music': 'موسيقى',
          'art': 'فن',
          'food': 'طعام',
          'outdoor': 'هواء طلق',
          'fitness': 'لياقة بدنية',
          'workshops': 'ورش عمل',
          'culture': 'ثقافة',
          'nightlife': 'سهرات',
          'trips': 'رحلات'
        },
        difficulties: {
          'beginner': 'مبتدئ',
          'intermediate': 'متوسط',
          'advanced': 'متقدم',
          'expert': 'خبير'
        },
        durations: {
          'short': 'قصير (أقل من ساعة)',
          'medium': 'متوسط (1-3 ساعات)',
          'long': 'طويل (3-6 ساعات)',
          'full-day': 'يوم كامل'
        },
        groupSizes: {
          'individual': 'فردي',
          'small': 'مجموعة صغيرة (2-5)',
          'medium': 'مجموعة متوسطة (6-15)',
          'large': 'مجموعة كبيرة (16+)'
        },
        sortOptions: {
          'relevance': 'الأكثر صلة',
          'price': 'السعر',
          'rating': 'التقييم',
          'date': 'التاريخ',
          'popularity': 'الشعبية',
          'distance': 'المسافة'
        }
      },
      en: {
        categories: {
          'sports': 'Sports',
          'music': 'Music',
          'art': 'Art',
          'food': 'Food',
          'outdoor': 'Outdoor',
          'fitness': 'Fitness',
          'workshops': 'Workshops',
          'culture': 'Culture',
          'nightlife': 'Nightlife',
          'trips': 'Trips'
        },
        difficulties: {
          'beginner': 'Beginner',
          'intermediate': 'Intermediate',
          'advanced': 'Advanced',
          'expert': 'Expert'
        },
        durations: {
          'short': 'Short (< 1 hour)',
          'medium': 'Medium (1-3 hours)',
          'long': 'Long (3-6 hours)',
          'full-day': 'Full Day'
        },
        groupSizes: {
          'individual': 'Individual',
          'small': 'Small Group (2-5)',
          'medium': 'Medium Group (6-15)',
          'large': 'Large Group (16+)'
        },
        sortOptions: {
          'relevance': 'Most Relevant',
          'price': 'Price',
          'rating': 'Rating',
          'date': 'Date',
          'popularity': 'Popularity',
          'distance': 'Distance'
        }
      }
    };
    
    return options[language] || options.ar;
  }

  /**
   * Generate search suggestions based on query.
   * @param {string} query - The search query
   * @param {string} language - The language (ar/en)
   * @returns {Array} The suggestions
   */
  generateSuggestions(query, language = 'ar') {
    if (!query || query.length < 2) return [];
    
    const suggestions = [];
    const filterOptions = this.getFilterOptions(language);
    
    // Add category suggestions
    Object.keys(filterOptions.categories).forEach(category => {
      if (filterOptions.categories[category].toLowerCase().includes(query.toLowerCase())) {
        suggestions.push({
          type: 'category',
          text: filterOptions.categories[category],
          value: category
        });
      }
    });
    
    // Add difficulty suggestions
    Object.keys(filterOptions.difficulties).forEach(difficulty => {
      if (filterOptions.difficulties[difficulty].toLowerCase().includes(query.toLowerCase())) {
        suggestions.push({
          type: 'difficulty',
          text: filterOptions.difficulties[difficulty],
          value: difficulty
        });
      }
    });
    
    return suggestions.slice(0, 5);
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
}

export const searchService = new LUDUSSearchService();
export default searchService;

