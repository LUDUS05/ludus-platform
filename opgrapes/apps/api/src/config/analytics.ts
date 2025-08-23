export interface AnalyticsConfig {
  // Redis Configuration
  redis: {
    url: string;
    host: string;
    port: number;
    password?: string;
    db: number;
    retryDelayOnFailover: number;
    maxRetriesPerRequest: number;
  };

  // Mixpanel Configuration
  mixpanel: {
    token: string;
    enabled: boolean;
    trackAnonymousUsers: boolean;
    batchSize: number;
    flushInterval: number;
  };

  // Winston Logging Configuration
  logging: {
    level: string;
    filename: string;
    maxSize: string;
    maxFiles: number;
    format: string;
  };

  // Analytics Features Configuration
  features: {
    userTracking: boolean;
    pageViewTracking: boolean;
    clickTracking: boolean;
    formTracking: boolean;
    scrollTracking: boolean;
    performanceTracking: boolean;
    errorTracking: boolean;
    revenueTracking: boolean;
    conversionTracking: boolean;
    retentionTracking: boolean;
  };

  // Data Retention Configuration
  retention: {
    userEvents: number; // days
    pageViews: number; // days
    clicks: number; // days
    forms: number; // days
    scrolls: number; // days
    errors: number; // days
    revenue: number; // days
    conversions: number; // days
    retention: number; // days
    vendorAnalytics: number; // days
    systemHealth: number; // days
  };

  // Cache Configuration
  cache: {
    activityTTL: number; // seconds
    userRecommendationsTTL: number; // seconds
    searchResultsTTL: number; // seconds
    vendorDataTTL: number; // seconds
    maxCacheSize: number; // MB
    evictionPolicy: 'lru' | 'lfu' | 'fifo';
  };

  // Performance Thresholds
  performance: {
    slowResponseThreshold: number; // milliseconds
    errorRateThreshold: number; // percentage
    memoryUsageThreshold: number; // MB
    cpuUsageThreshold: number; // percentage
  };

  // Privacy Configuration
  privacy: {
    anonymizeIPs: boolean;
    respectDoNotTrack: boolean;
    dataRetentionCompliance: boolean;
    gdprCompliance: boolean;
    cookieConsent: boolean;
  };
}

/**
 * Default analytics configuration
 */
export const defaultAnalyticsConfig: AnalyticsConfig = {
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3
  },

  mixpanel: {
    token: process.env.MIXPANEL_TOKEN || '',
    enabled: !!process.env.MIXPANEL_TOKEN,
    trackAnonymousUsers: true,
    batchSize: 50,
    flushInterval: 10000
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filename: 'logs/analytics',
    maxSize: '20m',
    maxFiles: 14,
    format: 'json'
  },

  features: {
    userTracking: true,
    pageViewTracking: true,
    clickTracking: true,
    formTracking: true,
    scrollTracking: true,
    performanceTracking: true,
    errorTracking: true,
    revenueTracking: true,
    conversionTracking: true,
    retentionTracking: true
  },

  retention: {
    userEvents: 30,
    pageViews: 30,
    clicks: 30,
    forms: 30,
    scrolls: 30,
    errors: 7,
    revenue: 365,
    conversions: 90,
    retention: 365,
    vendorAnalytics: 90,
    systemHealth: 7
  },

  cache: {
    activityTTL: 3600, // 1 hour
    userRecommendationsTTL: 1800, // 30 minutes
    searchResultsTTL: 900, // 15 minutes
    vendorDataTTL: 7200, // 2 hours
    maxCacheSize: 100, // 100 MB
    evictionPolicy: 'lru'
  },

  performance: {
    slowResponseThreshold: 1000, // 1 second
    errorRateThreshold: 5, // 5%
    memoryUsageThreshold: 512, // 512 MB
    cpuUsageThreshold: 80 // 80%
  },

  privacy: {
    anonymizeIPs: true,
    respectDoNotTrack: true,
    dataRetentionCompliance: true,
    gdprCompliance: true,
    cookieConsent: true
  }
};

/**
 * Get analytics configuration with environment overrides
 */
export function getAnalyticsConfig(): AnalyticsConfig {
  const config = { ...defaultAnalyticsConfig };

  // Override with environment variables if present
  if (process.env.REDIS_URL) {
    config.redis.url = process.env.REDIS_URL;
  }

  if (process.env.REDIS_HOST) {
    config.redis.host = process.env.REDIS_HOST;
  }

  if (process.env.REDIS_PORT) {
    config.redis.port = parseInt(process.env.REDIS_PORT);
  }

  if (process.env.REDIS_PASSWORD) {
    config.redis.password = process.env.REDIS_PASSWORD;
  }

  if (process.env.REDIS_DB) {
    config.redis.db = parseInt(process.env.REDIS_DB);
  }

  if (process.env.MIXPANEL_TOKEN) {
    config.mixpanel.token = process.env.MIXPANEL_TOKEN;
    config.mixpanel.enabled = true;
  }

  if (process.env.LOG_LEVEL) {
    config.logging.level = process.env.LOG_LEVEL;
  }

  // Feature flags from environment
  if (process.env.ANALYTICS_USER_TRACKING !== undefined) {
    config.features.userTracking = process.env.ANALYTICS_USER_TRACKING === 'true';
  }

  if (process.env.ANALYTICS_PAGE_VIEW_TRACKING !== undefined) {
    config.features.pageViewTracking = process.env.ANALYTICS_PAGE_VIEW_TRACKING === 'true';
  }

  if (process.env.ANALYTICS_CLICK_TRACKING !== undefined) {
    config.features.clickTracking = process.env.ANALYTICS_CLICK_TRACKING === 'true';
  }

  if (process.env.ANALYTICS_FORM_TRACKING !== undefined) {
    config.features.formTracking = process.env.ANALYTICS_FORM_TRACKING === 'true';
  }

  if (process.env.ANALYTICS_SCROLL_TRACKING !== undefined) {
    config.features.scrollTracking = process.env.ANALYTICS_SCROLL_TRACKING === 'true';
  }

  if (process.env.ANALYTICS_PERFORMANCE_TRACKING !== undefined) {
    config.features.performanceTracking = process.env.ANALYTICS_PERFORMANCE_TRACKING === 'true';
  }

  if (process.env.ANALYTICS_ERROR_TRACKING !== undefined) {
    config.features.errorTracking = process.env.ANALYTICS_ERROR_TRACKING === 'true';
  }

  if (process.env.ANALYTICS_REVENUE_TRACKING !== undefined) {
    config.features.revenueTracking = process.env.ANALYTICS_REVENUE_TRACKING === 'true';
  }

  if (process.env.ANALYTICS_CONVERSION_TRACKING !== undefined) {
    config.features.conversionTracking = process.env.ANALYTICS_CONVERSION_TRACKING === 'true';
  }

  if (process.env.ANALYTICS_RETENTION_TRACKING !== undefined) {
    config.features.retentionTracking = process.env.ANALYTICS_RETENTION_TRACKING === 'true';
  }

  // Performance thresholds from environment
  if (process.env.SLOW_RESPONSE_THRESHOLD) {
    config.performance.slowResponseThreshold = parseInt(process.env.SLOW_RESPONSE_THRESHOLD);
  }

  if (process.env.ERROR_RATE_THRESHOLD) {
    config.performance.errorRateThreshold = parseFloat(process.env.ERROR_RATE_THRESHOLD);
  }

  if (process.env.MEMORY_USAGE_THRESHOLD) {
    config.performance.memoryUsageThreshold = parseInt(process.env.MEMORY_USAGE_THRESHOLD);
  }

  if (process.env.CPU_USAGE_THRESHOLD) {
    config.performance.cpuUsageThreshold = parseInt(process.env.CPU_USAGE_THRESHOLD);
  }

  // Privacy settings from environment
  if (process.env.ANONYMIZE_IPS !== undefined) {
    config.privacy.anonymizeIPs = process.env.ANONYMIZE_IPS === 'true';
  }

  if (process.env.RESPECT_DO_NOT_TRACK !== undefined) {
    config.privacy.respectDoNotTrack = process.env.RESPECT_DO_NOT_TRACK === 'true';
  }

  if (process.env.GDPR_COMPLIANCE !== undefined) {
    config.privacy.gdprCompliance = process.env.GDPR_COMPLIANCE === 'true';
  }

  return config;
}

/**
 * Validate analytics configuration
 */
export function validateAnalyticsConfig(config: AnalyticsConfig): string[] {
  const errors: string[] = [];

  // Validate Redis configuration
  if (!config.redis.url && (!config.redis.host || !config.redis.port)) {
    errors.push('Redis configuration is incomplete. Either REDIS_URL or REDIS_HOST + REDIS_PORT must be provided.');
  }

  // Validate Mixpanel configuration
  if (config.mixpanel.enabled && !config.mixpanel.token) {
    errors.push('Mixpanel is enabled but no token is provided.');
  }

  // Validate retention periods
  Object.entries(config.retention).forEach(([key, value]) => {
    if (value < 1) {
      errors.push(`Retention period for ${key} must be at least 1 day.`);
    }
  });

  // Validate cache TTLs
  Object.entries(config.cache).forEach(([key, value]) => {
    if (key.includes('TTL') && value < 60) {
      errors.push(`Cache TTL for ${key} must be at least 60 seconds.`);
    }
  });

  // Validate performance thresholds
  if (config.performance.slowResponseThreshold < 100) {
    errors.push('Slow response threshold must be at least 100ms.');
  }

  if (config.performance.errorRateThreshold < 0 || config.performance.errorRateThreshold > 100) {
    errors.push('Error rate threshold must be between 0 and 100.');
  }

  return errors;
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig(): Partial<AnalyticsConfig> {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return {
        logging: {
          level: 'warn',
          filename: 'logs/analytics',
          maxSize: '100m',
          maxFiles: 30,
          format: 'json'
        },
        features: {
          userTracking: true,
          pageViewTracking: true,
          clickTracking: true,
          formTracking: true,
          scrollTracking: true,
          performanceTracking: true,
          errorTracking: true,
          revenueTracking: true,
          conversionTracking: true,
          retentionTracking: true
        },
        privacy: {
          anonymizeIPs: true,
          respectDoNotTrack: true,
          dataRetentionCompliance: true,
          gdprCompliance: true,
          cookieConsent: true
        }
      };

    case 'test':
      return {
        logging: {
          level: 'error',
          filename: 'logs/analytics-test',
          maxSize: '10m',
          maxFiles: 5,
          format: 'json'
        },
        features: {
          userTracking: false,
          pageViewTracking: false,
          clickTracking: false,
          formTracking: false,
          scrollTracking: false,
          performanceTracking: false,
          errorTracking: true,
          revenueTracking: false,
          conversionTracking: false,
          retentionTracking: false
        }
      };

    case 'development':
    default:
      return {
        logging: {
          level: 'debug',
          filename: 'logs/analytics-dev',
          maxSize: '20m',
          maxFiles: 7,
          format: 'json'
        },
        features: {
          userTracking: true,
          pageViewTracking: true,
          clickTracking: true,
          formTracking: true,
          scrollTracking: true,
          performanceTracking: true,
          errorTracking: true,
          revenueTracking: true,
          conversionTracking: true,
          retentionTracking: true
        }
      };
  }
}

export default {
  getAnalyticsConfig,
  validateAnalyticsConfig,
  getEnvironmentConfig,
  defaultAnalyticsConfig
};
