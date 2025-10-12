/**
 * @fileoverview Enhanced Vendor Service for LUDUS Platform
 * @module services/vendorService
 * 
 * This service provides comprehensive vendor management functionality including:
 * - Vendor CRUD operations
 * - Advanced search and filtering
 * - Analytics and reporting
 * - Document management
 * - Status management
 * - RTL support for Arabic users
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import api from './api';

const vendorService = {
  /**
   * Get all vendors with filters, pagination, and sorting
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Vendors data
   */
  getVendors: async (params = {}) => {
    try {
      const response = await api.get('/vendors', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vendors');
    }
  },

  /**
   * Get a specific vendor by ID
   * @param {string} vendorId - The vendor ID
   * @returns {Promise<Object>} Vendor data
   */
  getVendorById: async (vendorId) => {
    try {
      const response = await api.get(`/vendors/${vendorId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vendor');
    }
  },

  /**
   * Get vendor activities
   * @param {string} vendorId - The vendor ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Vendor activities data
   */
  getVendorActivities: async (vendorId, params = {}) => {
    try {
      const response = await api.get(`/vendors/${vendorId}/activities`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vendor activities');
    }
  },

  /**
   * Get vendor reviews
   * @param {string} vendorId - The vendor ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Vendor reviews data
   */
  getVendorReviews: async (vendorId, params = {}) => {
    try {
      const response = await api.get(`/vendors/${vendorId}/reviews`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vendor reviews');
    }
  },

  /**
   * Register a new vendor
   * @param {Object} vendorData - The vendor data
   * @returns {Promise<Object>} Registered vendor
   */
  registerVendor: async (vendorData) => {
    try {
      const response = await api.post('/vendors', vendorData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to register vendor');
    }
  },

  /**
   * Get vendor analytics and statistics
   * @param {string} vendorId - The vendor ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Analytics data
   */
  getVendorAnalytics: async (vendorId, params = {}) => {
    try {
      const response = await api.get(`/vendors/${vendorId}/analytics`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vendor analytics');
    }
  },

  /**
   * Update vendor status
   * @param {string} vendorId - The vendor ID
   * @param {string} status - New status
   * @param {string} reason - Reason for status change
   * @param {string} adminNotes - Admin notes
   * @returns {Promise<Object>} Update result
   */
  updateVendorStatus: async (vendorId, status, reason = '', adminNotes = '') => {
    try {
      const response = await api.put(`/vendors/${vendorId}/status`, { 
        status, 
        reason, 
        adminNotes 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update vendor status');
    }
  },

  /**
   * Upload vendor document
   * @param {string} vendorId - The vendor ID
   * @param {File} file - The file to upload
   * @param {string} documentType - Type of document
   * @param {string} documentName - Name of document
   * @returns {Promise<Object>} Upload result
   */
  uploadVendorDocument: async (vendorId, file, documentType, documentName) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      formData.append('documentName', documentName);

      const response = await api.post(`/vendors/${vendorId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload document');
    }
  },

  /**
   * Get vendor dashboard data
   * @returns {Promise<Object>} Dashboard data
   */
  getVendorDashboard: async () => {
    try {
      const response = await api.get('/vendors/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vendor dashboard');
    }
  },

  /**
   * Validate vendor data before submission
   * @param {Object} vendorData - The vendor data to validate
   * @returns {Object} Validation result
   */
  validateVendorData: (vendorData) => {
    const errors = {};

    // Validate business name
    if (!vendorData.businessName || vendorData.businessName.trim().length === 0) {
      errors.businessName = 'Business name is required';
    } else if (vendorData.businessName.length > 100) {
      errors.businessName = 'Business name cannot exceed 100 characters';
    }

    // Validate description
    if (!vendorData.description || vendorData.description.trim().length === 0) {
      errors.description = 'Description is required';
    } else if (vendorData.description.length < 5) {
      errors.description = 'Description must be at least 5 characters';
    } else if (vendorData.description.length > 500) {
      errors.description = 'Description cannot exceed 500 characters';
    }

    // Validate email
    if (!vendorData.contactInfo?.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendorData.contactInfo.email)) {
      errors.email = 'Valid email is required';
    }

    // Validate phone
    if (vendorData.contactInfo?.phone && !/^\+966[0-9]{9}$/.test(vendorData.contactInfo.phone)) {
      errors.phone = 'Phone must be a valid Saudi number (+966XXXXXXXXX)';
    }

    // Validate categories
    if (!vendorData.categories || vendorData.categories.length === 0) {
      errors.categories = 'At least one category is required';
    }

    // Validate location
    if (vendorData.location?.city && vendorData.location.city.trim().length === 0) {
      errors.city = 'City is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Format vendor data for display
   * @param {Object} vendor - The vendor object
   * @param {string} language - The language (ar/en)
   * @returns {Object} Formatted vendor data
   */
  formatVendorForDisplay: (vendor, language = 'ar') => {
    const isArabic = language === 'ar';
    
    return {
      id: vendor._id,
      businessName: vendor.businessName,
      description: vendor.description,
      contactInfo: {
        email: vendor.contactInfo?.email || '',
        phone: vendor.contactInfo?.phone || '',
        website: vendor.contactInfo?.website || '',
        socialMedia: vendor.contactInfo?.socialMedia || {}
      },
      location: {
        address: vendor.location?.address || '',
        city: vendor.location?.city || '',
        state: vendor.location?.state || '',
        coordinates: vendor.location?.coordinates || []
      },
      images: {
        logo: vendor.images?.logo || '',
        banner: vendor.images?.banner || '',
        gallery: vendor.images?.gallery || []
      },
      categories: vendor.categories || [],
      rating: {
        average: vendor.rating?.average || 0,
        count: vendor.rating?.count || 0
      },
      status: vendor.statusHistory?.[vendor.statusHistory.length - 1]?.status || 'inactive',
      isActive: vendor.isActive || false,
      isFeatured: vendor.isFeatured || false,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt
    };
  },

  /**
   * Get vendor status information
   * @param {string} status - The vendor status
   * @param {string} language - The language (ar/en)
   * @returns {Object} Status styling information
   */
  getVendorStatusInfo: (status, language = 'ar') => {
    const isArabic = language === 'ar';
    
    const statusMap = {
      'pending': {
        color: 'yellow',
        text: isArabic ? 'في الانتظار' : 'Pending',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800'
      },
      'active': {
        color: 'green',
        text: isArabic ? 'نشط' : 'Active',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800'
      },
      'suspended': {
        color: 'red',
        text: isArabic ? 'معلق' : 'Suspended',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800'
      },
      'inactive': {
        color: 'gray',
        text: isArabic ? 'غير نشط' : 'Inactive',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800'
      },
      'rejected': {
        color: 'red',
        text: isArabic ? 'مرفوض' : 'Rejected',
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
   * Generate vendor slug from business name
   * @param {string} businessName - The business name
   * @returns {string} Generated slug
   */
  generateSlug: (businessName) => {
    return businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  },

  /**
   * Get vendor categories
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
   * Get vendor statuses
   * @returns {Array} Available statuses
   */
  getStatuses: () => {
    return [
      { id: 'pending', name: 'Pending', nameAr: 'في الانتظار' },
      { id: 'active', name: 'Active', nameAr: 'نشط' },
      { id: 'suspended', name: 'Suspended', nameAr: 'معلق' },
      { id: 'inactive', name: 'Inactive', nameAr: 'غير نشط' },
      { id: 'rejected', name: 'Rejected', nameAr: 'مرفوض' }
    ];
  },

  /**
   * Get document types
   * @returns {Array} Available document types
   */
  getDocumentTypes: () => {
    return [
      { id: 'license', name: 'Business License', nameAr: 'رخصة تجارية' },
      { id: 'certification', name: 'Certification', nameAr: 'شهادة' },
      { id: 'insurance', name: 'Insurance', nameAr: 'تأمين' },
      { id: 'identity', name: 'Identity Document', nameAr: 'وثيقة هوية' },
      { id: 'other', name: 'Other', nameAr: 'أخرى' }
    ];
  },

  /**
   * Calculate vendor statistics
   * @param {Object} analytics - Analytics data from API
   * @param {string} language - The language (ar/en)
   * @returns {Object} Formatted statistics
   */
  formatAnalyticsSummary: (analytics, language = 'ar') => {
    const isArabic = language === 'ar';
    const bookingStats = analytics.bookingStats || {};
    const activityStats = analytics.activityStats || {};

    return {
      totalBookings: bookingStats.totalBookings || 0,
      confirmedBookings: bookingStats.confirmedBookings || 0,
      completedBookings: bookingStats.completedBookings || 0,
      cancelledBookings: bookingStats.cancelledBookings || 0,
      totalRevenue: bookingStats.totalRevenue || 0,
      averageBookingValue: bookingStats.averageBookingValue || 0,
      totalActivities: activityStats.totalActivities || 0,
      publishedActivities: activityStats.publishedActivities || 0,
      draftActivities: activityStats.draftActivities || 0,
      suspendedActivities: activityStats.suspendedActivities || 0,
      conversionRate: bookingStats.totalBookings > 0 
        ? Math.round((bookingStats.confirmedBookings / bookingStats.totalBookings) * 100) 
        : 0,
      displayText: {
        totalBookings: isArabic ? 'إجمالي الحجوزات' : 'Total Bookings',
        totalRevenue: isArabic ? 'إجمالي الإيرادات' : 'Total Revenue',
        conversionRate: isArabic ? 'معدل التحويل' : 'Conversion Rate',
        averageValue: isArabic ? 'متوسط القيمة' : 'Average Value',
        totalActivities: isArabic ? 'إجمالي الأنشطة' : 'Total Activities',
        publishedActivities: isArabic ? 'الأنشطة المنشورة' : 'Published Activities'
      }
    };
  },

  /**
   * Check if vendor can be edited
   * @param {Object} vendor - The vendor object
   * @returns {boolean} Whether vendor can be edited
   */
  canEditVendor: (vendor) => {
    const status = vendor.statusHistory?.[vendor.statusHistory.length - 1]?.status || 'inactive';
    return status === 'pending' || status === 'active';
  },

  /**
   * Check if vendor can be activated
   * @param {Object} vendor - The vendor object
   * @returns {boolean} Whether vendor can be activated
   */
  canActivateVendor: (vendor) => {
    const status = vendor.statusHistory?.[vendor.statusHistory.length - 1]?.status || 'inactive';
    return status === 'pending' && vendor.isActive === false;
  },

  /**
   * Get vendor management actions
   * @param {Object} vendor - The vendor object
   * @param {string} language - The language (ar/en)
   * @returns {Array} Available actions
   */
  getVendorActions: (vendor, language = 'ar') => {
    const isArabic = language === 'ar';
    const status = vendor.statusHistory?.[vendor.statusHistory.length - 1]?.status || 'inactive';
    const actions = [];

    if (status === 'pending') {
      actions.push({
        id: 'approve',
        name: isArabic ? 'موافقة' : 'Approve',
        color: 'green',
        icon: 'check'
      });
      actions.push({
        id: 'reject',
        name: isArabic ? 'رفض' : 'Reject',
        color: 'red',
        icon: 'x'
      });
    }

    if (status === 'active') {
      actions.push({
        id: 'suspend',
        name: isArabic ? 'تعليق' : 'Suspend',
        color: 'yellow',
        icon: 'pause'
      });
    }

    if (status === 'suspended') {
      actions.push({
        id: 'activate',
        name: isArabic ? 'تفعيل' : 'Activate',
        color: 'green',
        icon: 'play'
      });
    }

    actions.push(
      {
        id: 'view',
        name: isArabic ? 'عرض' : 'View',
        color: 'blue',
        icon: 'eye'
      },
      {
        id: 'analytics',
        name: isArabic ? 'التحليلات' : 'Analytics',
        color: 'purple',
        icon: 'bar-chart'
      },
      {
        id: 'documents',
        name: isArabic ? 'المستندات' : 'Documents',
        color: 'gray',
        icon: 'file-text'
      }
    );

    return actions;
  }
};

export { vendorService };