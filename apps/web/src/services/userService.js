/**
 * @fileoverview Enhanced User Service for LUDUS platform
 * @module services/userService
 * 
 * This service provides comprehensive user management capabilities including:
 * - User profile management
 * - User preferences and settings
 * - User statistics and analytics
 * - User search and discovery
 * - User dashboard data
 * - User activity history
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import api from './api';

const userService = {
  // User Profile Management
  getUserProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateUserProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  updateProfileImage: async (imageUrl) => {
    const response = await api.put('/users/profile-image', { imageUrl });
    return response.data;
  },

  // User Preferences
  getUserPreferences: async () => {
    const response = await api.get('/users/preferences');
    return response.data;
  },

  updateUserPreferences: async (preferences) => {
    const response = await api.put('/users/preferences', { preferences });
    return response.data;
  },

  // User Location
  updateUserLocation: async (locationData) => {
    const response = await api.put('/users/location', locationData);
    return response.data;
  },

  // User Statistics
  getUserStats: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/users/stats?${queryParams}`);
    return response.data;
  },

  // User Activity History
  getUserActivityHistory: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/users/activity-history?${queryParams}`);
    return response.data;
  },

  // User Dashboard
  getDashboardData: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/users/dashboard?${queryParams}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/users/dashboard-stats');
    return response.data;
  },

  // User Bookings
  getUserBookings: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/users/bookings?${queryParams}`);
    return response.data;
  },

  // User Favorites
  getUserFavorites: async () => {
    const response = await api.get('/users/favorites');
    return response.data;
  },

  addToFavorites: async (activityId) => {
    const response = await api.post(`/users/favorites/${activityId}`);
    return response.data;
  },

  removeFromFavorites: async (activityId) => {
    const response = await api.delete(`/users/favorites/${activityId}`);
    return response.data;
  },

  // User Search
  searchUsers: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/users/search?${queryParams}`);
    return response.data;
  },

  searchUsersAdvanced: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/users/search-advanced?${queryParams}`);
    return response.data;
  },

  // Utility Functions
  formatUserDisplayName: (user, language = 'ar') => {
    if (language === 'ar' && user.profile?.firstNameAr && user.profile?.lastNameAr) {
      return `${user.profile.firstNameAr} ${user.profile.lastNameAr}`;
    }
    return `${user.firstName || user.profile?.firstName || ''} ${user.lastName || user.profile?.lastName || ''}`.trim();
  },

  formatUserLocation: (user) => {
    if (user.location) {
      const parts = [];
      if (user.location.city) parts.push(user.location.city);
      if (user.location.region) parts.push(user.location.region);
      if (user.location.country) parts.push(user.location.country);
      return parts.join(', ');
    }
    return 'Location not specified';
  },

  getUserInitials: (user) => {
    const firstName = user.firstName || user.profile?.firstName || '';
    const lastName = user.lastName || user.profile?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  },

  getUserAge: (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  },

  formatUserStats: (stats) => {
    return {
      totalBookings: stats.totalBookings || 0,
      completedBookings: stats.completedBookings || 0,
      totalSpent: stats.totalSpent || 0,
      favoriteActivities: stats.favoriteActivities || 0,
      memberSince: stats.memberSince ? new Date(stats.memberSince).toLocaleDateString() : 'Unknown',
      lastActive: stats.lastActive ? new Date(stats.lastActive).toLocaleDateString() : 'Unknown'
    };
  },

  // Preference Helpers
  getPreferenceOptions: () => {
    return {
      categories: [
        { value: 'fitness', label: 'Fitness & Sports', icon: '💪' },
        { value: 'arts', label: 'Arts & Culture', icon: '🎨' },
        { value: 'food', label: 'Food & Dining', icon: '🍽️' },
        { value: 'outdoor', label: 'Outdoor Adventures', icon: '🏔️' },
        { value: 'unique', label: 'Unique Experiences', icon: '✨' },
        { value: 'wellness', label: 'Wellness & Health', icon: '🧘' }
      ],
      activityTypes: [
        { value: 'indoor', label: 'Indoor', icon: '🏠' },
        { value: 'outdoor', label: 'Outdoor', icon: '🌳' },
        { value: 'physical', label: 'Physical', icon: '🏃' },
        { value: 'mental', label: 'Mental', icon: '🧠' },
        { value: 'social', label: 'Social', icon: '👥' },
        { value: 'solo', label: 'Solo', icon: '🧍' },
        { value: 'group', label: 'Group', icon: '👨‍👩‍👧‍👦' }
      ],
      preferredTimes: [
        { value: 'weekday-morning', label: 'Weekday Morning', icon: '🌅' },
        { value: 'weekday-afternoon', label: 'Weekday Afternoon', icon: '☀️' },
        { value: 'weekday-evening', label: 'Weekday Evening', icon: '🌆' },
        { value: 'weekend-morning', label: 'Weekend Morning', icon: '🌄' },
        { value: 'weekend-afternoon', label: 'Weekend Afternoon', icon: '🌞' },
        { value: 'weekend-evening', label: 'Weekend Evening', icon: '🌃' }
      ],
      languages: [
        { value: 'ar', label: 'Arabic', flag: '🇸🇦' },
        { value: 'en', label: 'English', flag: '🇺🇸' },
        { value: 'fr', label: 'French', flag: '🇫🇷' },
        { value: 'es', label: 'Spanish', flag: '🇪🇸' },
        { value: 'ur', label: 'Urdu', flag: '🇵🇰' },
        { value: 'hi', label: 'Hindi', flag: '🇮🇳' },
        { value: 'tr', label: 'Turkish', flag: '🇹🇷' },
        { value: 'fa', label: 'Persian', flag: '🇮🇷' }
      ],
      genderOptions: [
        { value: 'male', label: 'Male', icon: '👨' },
        { value: 'female', label: 'Female', icon: '👩' }
      ],
      ageRanges: [
        { value: '18-25', label: '18-25 years' },
        { value: '26-35', label: '26-35 years' },
        { value: '36-45', label: '36-45 years' },
        { value: '46-55', label: '46-55 years' },
        { value: '56-65', label: '56-65 years' },
        { value: '65+', label: '65+ years' }
      ]
    };
  },

  // Validation Helpers
  validateProfileData: (profileData) => {
    const errors = {};

    if (!profileData.firstName || profileData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    if (!profileData.lastName || profileData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    if (profileData.bio && profileData.bio.length > 500) {
      errors.bio = 'Bio cannot exceed 500 characters';
    }

    if (profileData.phone && !/^\+966[0-9]{9}$/.test(profileData.phone)) {
      errors.phone = 'Please enter a valid Saudi phone number (+966XXXXXXXXX)';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  validateLocationData: (locationData) => {
    const errors = {};

    if (!locationData.city || locationData.city.trim().length < 2) {
      errors.city = 'City is required';
    }

    if (!locationData.region || locationData.region.trim().length < 2) {
      errors.region = 'Region is required';
    }

    if (locationData.coordinates && locationData.coordinates.length !== 2) {
      errors.coordinates = 'Invalid coordinates format';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Social Links Helpers
  validateSocialLink: (platform, url) => {
    const patterns = {
      instagram: /^@?[a-zA-Z0-9._]+$/,
      twitter: /^@?[a-zA-Z0-9_]+$/,
      linkedin: /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
      website: /^https?:\/\/.+/,
      snapchat: /^@?[a-zA-Z0-9._]+$/
    };

    if (!url) return true; // Empty is valid
    return patterns[platform] ? patterns[platform].test(url) : true;
  },

  formatSocialLink: (platform, value) => {
    if (!value) return '';
    
    switch (platform) {
      case 'instagram':
      case 'twitter':
      case 'snapchat':
        return value.startsWith('@') ? value : `@${value}`;
      case 'linkedin':
        return value.startsWith('http') ? value : `https://linkedin.com/in/${value}`;
      case 'website':
        return value.startsWith('http') ? value : `https://${value}`;
      default:
        return value;
    }
  },

  // Dashboard Helpers
  formatDashboardStats: (stats) => {
    return {
      totalBookings: stats.totalBookings || 0,
      upcomingBookings: stats.upcomingBookings || 0,
      completedBookings: stats.completedBookings || 0,
      totalSpent: stats.totalSpent || 0,
      favoriteCategories: stats.favoriteCategories || [],
      recentActivity: stats.recentActivity || []
    };
  },

  // Search Helpers
  buildSearchFilters: (filters) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item));
        } else {
          searchParams.append(key, value);
        }
      }
    });

    return searchParams.toString();
  },

  // Activity History Helpers
  formatActivityHistory: (activities) => {
    return activities.map(activity => ({
      id: activity.id,
      title: activity.activity?.title || 'Unknown Activity',
      category: activity.activity?.category || 'Unknown',
      vendor: activity.vendor?.businessName || 'Unknown Vendor',
      status: activity.status,
      bookingDate: activity.bookingDate,
      timeSlot: activity.timeSlot,
      participants: activity.participants,
      pricing: activity.pricing,
      createdAt: activity.createdAt
    }));
  },

  // Notification Helpers
  getNotificationPreferences: (preferences) => {
    return {
      email: preferences?.notifications?.email ?? true,
      sms: preferences?.notifications?.sms ?? false,
      push: preferences?.notifications?.push ?? true,
      marketing: preferences?.notifications?.marketing ?? true,
      activityUpdates: preferences?.notifications?.activityUpdates ?? true,
      socialUpdates: preferences?.notifications?.socialUpdates ?? true,
      reminderNotifications: preferences?.notifications?.reminderNotifications ?? true
    };
  },

  updateNotificationPreferences: (currentPreferences, updates) => {
    return {
      ...currentPreferences,
      notifications: {
        ...currentPreferences.notifications,
        ...updates
      }
    };
  }
};

export { userService };