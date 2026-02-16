/**
 * @fileoverview Enhanced Activity Service for LUDUS Platform
 * @module services/activityService
 * 
 * This service provides comprehensive activity management functionality including:
 * - Activity CRUD operations
 * - Advanced search and filtering
 * - Category and partner management
 * - Pricing and scheduling management
 * - Media management
 * - Analytics and reporting
 * - RTL support for Arabic users
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import api from './api';

const activityService = {
  /**
   * Get all activities with filters, pagination, and sorting
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Activities data
   */
  getActivities: async (params = {}) => {
    try {
      const response = await api.get('/activities', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch activities');
    }
  },

  /**
   * Get a specific activity by ID
   * @param {string} activityId - The activity ID
   * @returns {Promise<Object>} Activity data
   */
  getActivityById: async (activityId) => {
    try {
      const response = await api.get(`/activities/${activityId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch activity');
    }
  },

  /**
   * Search activities with advanced filters
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results
   */
  searchActivities: async (searchParams = {}) => {
    try {
      const response = await api.get('/activities/search', { params: searchParams });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search activities');
    }
  },

  /**
   * Get popular activities
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Popular activities data
   */
  getPopularActivities: async (params = {}) => {
    try {
      const response = await api.get('/activities/popular', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch popular activities');
    }
  },

  /**
   * Get activities by category
   * @param {string} category - Category name
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Category activities data
   */
  getActivitiesByCategory: async (category, params = {}) => {
    try {
      const response = await api.get(`/activities/category/${category}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch category activities');
    }
  },

  /**
   * Create a new enhanced activity
   * @param {Object} activityData - The activity data
   * @returns {Promise<Object>} Created activity
   */
  createActivity: async (activityData) => {
    try {
      const response = await api.post('/activities/enhanced', activityData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create activity');
    }
  },

  /**
   * Update an existing activity
   * @param {string} activityId - The activity ID
   * @param {Object} updateData - The update data
   * @returns {Promise<Object>} Updated activity
   */
  updateActivity: async (activityId, updateData) => {
    try {
      const response = await api.put(`/activities/${activityId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update activity');
    }
  },

  /**
   * Delete an activity
   * @param {string} activityId - The activity ID
   * @returns {Promise<Object>} Deletion result
   */
  deleteActivity: async (activityId) => {
    try {
      const response = await api.delete(`/activities/${activityId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete activity');
    }
  },

  /**
   * Get activity analytics and statistics
   * @param {string} activityId - The activity ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Analytics data
   */
  getActivityAnalytics: async (activityId, params = {}) => {
    try {
      const response = await api.get(`/activities/${activityId}/analytics`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch activity analytics');
    }
  },

  /**
   * Update activity status
   * @param {string} activityId - The activity ID
   * @param {string} status - New status
   * @param {string} reason - Reason for status change
   * @returns {Promise<Object>} Update result
   */
  updateActivityStatus: async (activityId, status, reason = '') => {
    try {
      const response = await api.put(`/activities/${activityId}/status`, { status, reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update activity status');
    }
  },

  /**
   * Get partner's activities
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Partner activities data
   */
  getPartnerActivities: async (params = {}) => {
    try {
      const response = await api.get('/activities/partner/my', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch partner activities');
    }
  },

  /**
   * Duplicate an activity
   * @param {string} activityId - The activity ID
   * @returns {Promise<Object>} Duplicated activity
   */
  duplicateActivity: async (activityId) => {
    try {
      const response = await api.post(`/activities/${activityId}/duplicate`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to duplicate activity');
    }
  },

  /**
   * Validate activity data before submission
   * @param {Object} activityData - The activity data to validate
   * @returns {Object} Validation result
   */
  validateActivityData: (activityData) => {
    const errors = {};

    // Validate title
    if (!activityData.title || activityData.title.trim().length === 0) {
      errors.title = 'Activity title is required';
    } else if (activityData.title.length > 100) {
      errors.title = 'Title cannot exceed 100 characters';
    }

    // Validate description
    if (!activityData.description || activityData.description.trim().length === 0) {
      errors.description = 'Activity description is required';
    } else if (activityData.description.length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters';
    }

    // Validate full description
    if (!activityData.fullDescription || activityData.fullDescription.trim().length === 0) {
      errors.fullDescription = 'Full description is required';
    } else if (activityData.fullDescription.length > 5000) {
      errors.fullDescription = 'Full description cannot exceed 5000 characters';
    }

    // Validate category
    if (!activityData.category?.id) {
      errors.category = 'Category is required';
    }

    // Validate pricing
    if (!activityData.pricing?.basePrice || activityData.pricing.basePrice < 0) {
      errors.basePrice = 'Valid base price is required';
    }

    // Validate capacity
    if (!activityData.capacity?.max || activityData.capacity.max < 1) {
      errors.maxCapacity = 'Maximum capacity must be at least 1';
    }

    if (!activityData.capacity?.min || activityData.capacity.min < 1) {
      errors.minCapacity = 'Minimum capacity must be at least 1';
    }

    if (activityData.capacity?.min > activityData.capacity?.max) {
      errors.capacity = 'Minimum capacity cannot be greater than maximum capacity';
    }

    // Validate duration
    if (!activityData.duration?.hours || activityData.duration.hours < 0.5) {
      errors.duration = 'Duration must be at least 0.5 hours';
    }

    // Validate location
    if (!activityData.location?.city || activityData.location.city.trim().length === 0) {
      errors.city = 'City is required';
    }

    if (!activityData.location?.region || activityData.location.region.trim().length === 0) {
      errors.region = 'Region is required';
    }

    // Validate coordinates if provided
    if (activityData.location?.coordinates) {
      const { latitude, longitude } = activityData.location.coordinates;
      if (latitude < -90 || latitude > 90) {
        errors.latitude = 'Latitude must be between -90 and 90';
      }
      if (longitude < -180 || longitude > 180) {
        errors.longitude = 'Longitude must be between -180 and 180';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Format activity data for display
   * @param {Object} activity - The activity object
   * @param {string} language - The language (ar/en)
   * @returns {Object} Formatted activity data
   */
  formatActivityForDisplay: (activity, language = 'ar') => {
    const isArabic = language === 'ar';
    
    return {
      id: activity._id,
      title: isArabic ? activity.title : (activity.titleEn || activity.title),
      description: isArabic ? activity.description : (activity.descriptionEn || activity.description),
      fullDescription: isArabic ? activity.fullDescription : (activity.fullDescriptionEn || activity.fullDescription),
      category: {
        name: isArabic ? activity.category?.name : (activity.category?.nameEn || activity.category?.name),
        id: activity.category?.id
      },
      pricing: {
        basePrice: activity.pricing?.basePrice || 0,
        currency: activity.pricing?.currency || 'SAR',
        priceType: activity.pricing?.priceType || 'per_person'
      },
      capacity: {
        min: activity.capacity?.min || 1,
        max: activity.capacity?.max || 10
      },
      duration: {
        hours: activity.duration?.hours || 2,
        minutes: activity.duration?.minutes || 0
      },
      location: {
        city: isArabic ? activity.location?.city : (activity.location?.cityEn || activity.location?.city),
        region: isArabic ? activity.location?.region : (activity.location?.regionEn || activity.location?.region),
        address: isArabic ? activity.location?.address : (activity.location?.addressEn || activity.location?.address),
        coordinates: activity.location?.coordinates
      },
      images: activity.images || [],
      videos: activity.videos || [],
      status: activity.status || 'draft',
      isActive: activity.isActive || false,
      rating: activity.rating || 0,
      reviewCount: activity.reviewCount || 0,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt
    };
  },

  /**
   * Get activity status information
   * @param {string} status - The activity status
   * @param {string} language - The language (ar/en)
   * @returns {Object} Status styling information
   */
  getActivityStatusInfo: (status, language = 'ar') => {
    const isArabic = language === 'ar';
    
    const statusMap = {
      'draft': {
        color: 'gray',
        text: isArabic ? 'مسودة' : 'Draft',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800'
      },
      'published': {
        color: 'green',
        text: isArabic ? 'منشور' : 'Published',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800'
      },
      'suspended': {
        color: 'yellow',
        text: isArabic ? 'معلق' : 'Suspended',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800'
      },
      'archived': {
        color: 'red',
        text: isArabic ? 'مؤرشف' : 'Archived',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800'
      }
    };

    return statusMap[status] || {
      color: 'gray',
      text: isArabic ? 'غير معروف' : 'Unknown',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800'
    };
  },

  /**
   * Format currency for display
   * @param {number} amount - The amount to format
   * @param {string} currency - The currency code
   * @param {string} language - The language (ar/en)
   * @returns {string} Formatted currency string
   */
  formatCurrency: (amount, currency = 'SAR', language = 'ar') => {
    const isArabic = language === 'ar';
    
    if (isArabic) {
      return `${amount.toFixed(2)} ${currency === 'SAR' ? 'ريال' : currency}`;
    } else {
      return `${currency} ${amount.toFixed(2)}`;
    }
  },

  /**
   * Format duration for display
   * @param {Object} duration - The duration object
   * @param {string} language - The language (ar/en)
   * @returns {string} Formatted duration string
   */
  formatDuration: (duration, language = 'ar') => {
    const isArabic = language === 'ar';
    const hours = duration.hours || 0;
    const minutes = duration.minutes || 0;

    if (hours === 0 && minutes === 0) {
      return isArabic ? 'غير محدد' : 'Not specified';
    }

    if (hours === 0) {
      return isArabic ? `${minutes} دقيقة` : `${minutes} minutes`;
    }

    if (minutes === 0) {
      return isArabic ? `${hours} ساعة` : `${hours} hours`;
    }

    return isArabic ? `${hours} ساعة ${minutes} دقيقة` : `${hours}h ${minutes}m`;
  },

  /**
   * Generate activity slug from title
   * @param {string} title - The activity title
   * @returns {string} Generated slug
   */
  generateSlug: (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  },

  /**
   * Get activity categories
   * @returns {Array} Available categories
   */
  getCategories: () => {
    return [
      { id: 'fitness', name: 'Fitness', nameAr: 'اللياقة البدنية' },
      { id: 'arts', name: 'Arts', nameAr: 'الفنون' },
      { id: 'food', name: 'Food', nameAr: 'الطعام' },
      { id: 'outdoor', name: 'Outdoor', nameAr: 'الأنشطة الخارجية' },
      { id: 'unique', name: 'Unique', nameAr: 'فريدة' },
      { id: 'wellness', name: 'Wellness', nameAr: 'العافية' }
    ];
  },

  /**
   * Get activity price types
   * @returns {Array} Available price types
   */
  getPriceTypes: () => {
    return [
      { id: 'per_person', name: 'Per Person', nameAr: 'لكل شخص' },
      { id: 'per_group', name: 'Per Group', nameAr: 'للمجموعة' },
      { id: 'per_hour', name: 'Per Hour', nameAr: 'للساعة' }
    ];
  },

  /**
   * Get activity statuses
   * @returns {Array} Available statuses
   */
  getStatuses: () => {
    return [
      { id: 'draft', name: 'Draft', nameAr: 'مسودة' },
      { id: 'published', name: 'Published', nameAr: 'منشور' },
      { id: 'suspended', name: 'Suspended', nameAr: 'معلق' },
      { id: 'archived', name: 'Archived', nameAr: 'مؤرشف' }
    ];
  },

  /**
   * Calculate activity statistics
   * @param {Object} analytics - Analytics data from API
   * @param {string} language - The language (ar/en)
   * @returns {Object} Formatted statistics
   */
  formatAnalyticsSummary: (analytics, language = 'ar') => {
    const isArabic = language === 'ar';
    const stats = analytics.stats || {};

    return {
      totalBookings: stats.totalBookings || 0,
      confirmedBookings: stats.confirmedBookings || 0,
      completedBookings: stats.completedBookings || 0,
      cancelledBookings: stats.cancelledBookings || 0,
      totalRevenue: stats.totalRevenue || 0,
      averageBookingValue: stats.averageBookingValue || 0,
      conversionRate: stats.totalBookings > 0 
        ? Math.round((stats.confirmedBookings / stats.totalBookings) * 100) 
        : 0,
      displayText: {
        totalBookings: isArabic ? 'إجمالي الحجوزات' : 'Total Bookings',
        totalRevenue: isArabic ? 'إجمالي الإيرادات' : 'Total Revenue',
        conversionRate: isArabic ? 'معدل التحويل' : 'Conversion Rate',
        averageValue: isArabic ? 'متوسط القيمة' : 'Average Value'
      }
    };
  },

  /**
   * Check if activity can be edited
   * @param {Object} activity - The activity object
   * @returns {boolean} Whether activity can be edited
   */
  canEditActivity: (activity) => {
    return activity.status === 'draft' || activity.status === 'published';
  },

  /**
   * Check if activity can be published
   * @param {Object} activity - The activity object
   * @returns {boolean} Whether activity can be published
   */
  canPublishActivity: (activity) => {
    return activity.status === 'draft' && 
           activity.title && 
           activity.description && 
           activity.pricing?.basePrice > 0 &&
           activity.capacity?.max > 0;
  },

  /**
   * Get activity management actions
   * @param {Object} activity - The activity object
   * @param {string} language - The language (ar/en)
   * @returns {Array} Available actions
   */
  getActivityActions: (activity, language = 'ar') => {
    const isArabic = language === 'ar';
    const actions = [];

    if (activity.status === 'draft') {
      actions.push({
        id: 'publish',
        name: isArabic ? 'نشر' : 'Publish',
        color: 'green',
        icon: 'eye'
      });
    }

    if (activity.status === 'published') {
      actions.push({
        id: 'suspend',
        name: isArabic ? 'تعليق' : 'Suspend',
        color: 'yellow',
        icon: 'pause'
      });
    }

    if (activity.status === 'suspended') {
      actions.push({
        id: 'publish',
        name: isArabic ? 'إعادة النشر' : 'Republish',
        color: 'green',
        icon: 'play'
      });
    }

    actions.push(
      {
        id: 'edit',
        name: isArabic ? 'تعديل' : 'Edit',
        color: 'blue',
        icon: 'edit'
      },
      {
        id: 'duplicate',
        name: isArabic ? 'نسخ' : 'Duplicate',
        color: 'gray',
        icon: 'copy'
      },
      {
        id: 'analytics',
        name: isArabic ? 'التحليلات' : 'Analytics',
        color: 'purple',
        icon: 'bar-chart'
      }
    );

    return actions;
  }
};

export { activityService };
