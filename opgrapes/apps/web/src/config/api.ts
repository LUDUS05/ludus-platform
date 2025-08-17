// API Configuration
export const API_CONFIG = {
  // Base URLs
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  WEB_URL: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000',
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH_TOKEN: '/api/auth/refresh-token',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      VERIFY_EMAIL: '/api/auth/verify-email',
      ME: '/api/auth/me',
    },
    USERS: {
      BASE: '/api/users',
      PROFILE: '/api/users/profile',
      AVATAR: '/api/users/profile/avatar',
      PREFERENCES: '/api/users/preferences',
      CHANGE_PASSWORD: '/api/users/change-password',
    },
    VENDORS: {
      BASE: '/api/vendors',
      PROFILE: '/api/vendors/profile',
      LOGO: '/api/vendors/profile/logo',
      BANNER: '/api/vendors/profile/banner',
      DASHBOARD: '/api/vendors/dashboard',
      STATS: '/api/vendors/stats',
      SPECIALTIES: '/api/vendors/specialties',
      CATEGORIES: '/api/vendors/categories',
    },
    ACTIVITIES: {
      BASE: '/api/activities',
      CATEGORIES: '/api/activities/categories',
      FEATURED: '/api/activities/featured',
      VENDOR: '/api/activities/vendor',
      STATUS: '/api/activities/:id/status',
      FEATURE: '/api/activities/:id/feature',
    },
    BOOKINGS: {
      BASE: '/api/bookings',
      MY_BOOKINGS: '/api/bookings/my-bookings',
      STATS: '/api/bookings/stats/overview',
      CONFIRM: '/api/bookings/:id/confirm',
      CANCEL: '/api/bookings/:id/cancel',
      COMPLETE: '/api/bookings/:id/complete',
    },
    ADMIN: {
      BASE: '/api/admin',
      DASHBOARD: '/api/admin/dashboard/overview',
      USERS: '/api/admin/users',
      VENDORS: '/api/admin/vendors',
      ACTIVITIES: '/api/admin/activities',
      ANALYTICS: {
        USERS: '/api/admin/analytics/users',
        BOOKINGS: '/api/admin/analytics/bookings',
      },
    },
  },
  
  // Request Configuration
  REQUEST: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
  
  // Response Configuration
  RESPONSE: {
    SUCCESS_CODES: [200, 201, 204],
    CLIENT_ERROR_CODES: [400, 401, 403, 404, 409, 422, 429],
    SERVER_ERROR_CODES: [500, 502, 503, 504],
  },
  
  // Authentication Configuration
  AUTH: {
    TOKEN_KEY: 'ludus_auth_token',
    REFRESH_TOKEN_KEY: 'ludus_refresh_token',
    TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes
    AUTO_REFRESH: true,
  },
  
  // File Upload Configuration
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    IMAGE_COMPRESSION: {
      QUALITY: 0.8,
      MAX_WIDTH: 1920,
      MAX_HEIGHT: 1080,
    },
  },
  
  // Pagination Configuration
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },
  
  // Search Configuration
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    MAX_QUERY_LENGTH: 100,
    DEBOUNCE_DELAY: 300, // 300ms
    AUTO_SEARCH_DELAY: 1000, // 1 second
  },
  
  // Cache Configuration
  CACHE: {
    ENABLED: true,
    TTL: 5 * 60 * 1000, // 5 minutes
    MAX_ITEMS: 100,
    STORAGE_KEY: 'ludus_api_cache',
  },
  
  // Error Handling Configuration
  ERROR_HANDLING: {
    SHOW_TOASTS: true,
    LOG_TO_CONSOLE: process.env.NODE_ENV === 'development',
    RETRY_ON_NETWORK_ERROR: true,
    RETRY_ON_SERVER_ERROR: false,
    MAX_ERROR_MESSAGE_LENGTH: 200,
  },
  
  // Development Configuration
  DEVELOPMENT: {
    MOCK_API: process.env.NEXT_PUBLIC_MOCK_API === 'true',
    LOG_REQUESTS: process.env.NODE_ENV === 'development',
    LOG_RESPONSES: process.env.NODE_ENV === 'development',
    SLOW_NETWORK_SIMULATION: process.env.NEXT_PUBLIC_SLOW_NETWORK === 'true',
    NETWORK_DELAY: 1000, // 1 second
  },
} as const;

// Environment-specific configurations
export const getApiConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  return {
    ...API_CONFIG,
    BASE_URL: isProduction 
      ? process.env.NEXT_PUBLIC_API_URL 
      : isTest 
        ? 'http://localhost:5000'
        : API_CONFIG.BASE_URL,
    REQUEST: {
      ...API_CONFIG.REQUEST,
      TIMEOUT: isProduction ? 15000 : API_CONFIG.REQUEST.TIMEOUT,
      RETRY_ATTEMPTS: isProduction ? 2 : API_CONFIG.REQUEST.RETRY_ATTEMPTS,
    },
    ERROR_HANDLING: {
      ...API_CONFIG.ERROR_HANDLING,
      LOG_TO_CONSOLE: isDevelopment,
      SHOW_TOASTS: !isTest,
    },
    DEVELOPMENT: {
      ...API_CONFIG.DEVELOPMENT,
      MOCK_API: isDevelopment && process.env.NEXT_PUBLIC_MOCK_API === 'true',
      LOG_REQUESTS: isDevelopment,
      LOG_RESPONSES: isDevelopment,
    },
  };
};

// API URL builder utility
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  const config = getApiConfig();
  let url = `${config.BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  return url;
};

// API endpoint constants
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH_LOGIN: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN),
  AUTH_REGISTER: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER),
  AUTH_LOGOUT: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT),
  AUTH_REFRESH: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN),
  AUTH_FORGOT_PASSWORD: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD),
  AUTH_RESET_PASSWORD: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD),
  AUTH_VERIFY_EMAIL: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL),
  AUTH_ME: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.ME),
  
  // User endpoints
  USERS_BASE: buildApiUrl(API_CONFIG.ENDPOINTS.USERS.BASE),
  USERS_PROFILE: buildApiUrl(API_CONFIG.ENDPOINTS.USERS.PROFILE),
  USERS_AVATAR: buildApiUrl(API_CONFIG.ENDPOINTS.USERS.AVATAR),
  USERS_PREFERENCES: buildApiUrl(API_CONFIG.ENDPOINTS.USERS.PREFERENCES),
  USERS_CHANGE_PASSWORD: buildApiUrl(API_CONFIG.ENDPOINTS.USERS.CHANGE_PASSWORD),
  
  // Vendor endpoints
  VENDORS_BASE: buildApiUrl(API_CONFIG.ENDPOINTS.VENDORS.BASE),
  VENDORS_PROFILE: buildApiUrl(API_CONFIG.ENDPOINTS.VENDORS.PROFILE),
  VENDORS_LOGO: buildApiUrl(API_CONFIG.ENDPOINTS.VENDORS.LOGO),
  VENDORS_BANNER: buildApiUrl(API_CONFIG.ENDPOINTS.VENDORS.BANNER),
  VENDORS_DASHBOARD: buildApiUrl(API_CONFIG.ENDPOINTS.VENDORS.DASHBOARD),
  VENDORS_STATS: buildApiUrl(API_CONFIG.ENDPOINTS.VENDORS.STATS),
  VENDORS_SPECIALTIES: buildApiUrl(API_CONFIG.ENDPOINTS.VENDORS.SPECIALTIES),
  VENDORS_CATEGORIES: buildApiUrl(API_CONFIG.ENDPOINTS.VENDORS.CATEGORIES),
  
  // Activity endpoints
  ACTIVITIES_BASE: buildApiUrl(API_CONFIG.ENDPOINTS.ACTIVITIES.BASE),
  ACTIVITIES_CATEGORIES: buildApiUrl(API_CONFIG.ENDPOINTS.ACTIVITIES.CATEGORIES),
  ACTIVITIES_FEATURED: buildApiUrl(API_CONFIG.ENDPOINTS.ACTIVITIES.FEATURED),
  ACTIVITIES_VENDOR: buildApiUrl(API_CONFIG.ENDPOINTS.ACTIVITIES.VENDOR),
  
  // Booking endpoints
  BOOKINGS_BASE: buildApiUrl(API_CONFIG.ENDPOINTS.BOOKINGS.BASE),
  BOOKINGS_MY: buildApiUrl(API_CONFIG.ENDPOINTS.BOOKINGS.MY_BOOKINGS),
  BOOKINGS_STATS: buildApiUrl(API_CONFIG.ENDPOINTS.BOOKINGS.STATS),
  
  // Admin endpoints
  ADMIN_BASE: buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.BASE),
  ADMIN_DASHBOARD: buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD),
  ADMIN_USERS: buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.USERS),
  ADMIN_VENDORS: buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.VENDORS),
  ADMIN_ACTIVITIES: buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.ACTIVITIES),
  ADMIN_ANALYTICS_USERS: buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.ANALYTICS.USERS),
  ADMIN_ANALYTICS_BOOKINGS: buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.ANALYTICS.BOOKINGS),
};

// Export the configuration
export default getApiConfig();
