/**
 * Monitoring Configuration for LUDUS Referral System
 * 
 * This file contains all configuration settings for:
 * - Performance monitoring thresholds
 * - Error tracking settings
 * - Health check configurations
 * - Alert configurations
 * - Monitoring intervals
 */

const monitoringConfig = {
  // ===== PERFORMANCE MONITORING =====
  performance: {
    // Request monitoring
    requests: {
      // Response time thresholds (in milliseconds)
      responseTime: {
        warning: 1000,    // 1 second
        critical: 3000,   // 3 seconds
        alert: 5000       // 5 seconds
      },
      // Throughput thresholds
      throughput: {
        min: 10,          // Minimum requests per second
        max: 1000         // Maximum requests per second
      },
      // Error rate thresholds (percentage)
      errorRate: {
        warning: 2,       // 2%
        critical: 5,      // 5%
        alert: 10         // 10%
      }
    },

    // Memory usage thresholds (percentage)
    memory: {
      warning: 70,        // 70%
      critical: 85,       // 85%
      alert: 95           // 95%
    },

    // CPU usage thresholds (percentage)
    cpu: {
      warning: 60,        // 60%
      critical: 80,       // 80%
      alert: 90           // 90%
    },

    // Database performance thresholds
    database: {
      queryTime: {
        warning: 500,     // 500ms
        critical: 1000,   // 1 second
        alert: 2000       // 2 seconds
      },
      connectionPool: {
        warning: 80,      // 80% of max connections
        critical: 90,     // 90% of max connections
        alert: 95         // 95% of max connections
      }
    },

    // Referral system specific metrics
    referral: {
      conversionRate: {
        min: 5,           // Minimum 5% conversion
        warning: 10,      // Warning below 10%
        critical: 5       // Critical below 5%
      },
      rewardDistribution: {
        maxDelay: 5000,   // Maximum 5 seconds for reward processing
        errorThreshold: 3 // Maximum 3 consecutive errors
      }
    }
  },

  // ===== ERROR TRACKING =====
  errors: {
    // Error categorization
    categories: {
      critical: ['database_connection', 'payment_failed', 'authentication_failure'],
      high: ['referral_system', 'wallet_operation', 'external_api_failure'],
      medium: ['validation_error', 'rate_limit_exceeded', 'file_upload_failed'],
      low: ['external_service_timeout', 'cache_miss', 'logging_error']
    },

    // Alert thresholds
    thresholds: {
      consecutiveErrors: 5,      // Alert after 5 consecutive errors
      errorRate: 10,             // Alert if error rate > 10%
      criticalErrors: 1,         // Immediate alert for critical errors
      timeWindow: 300000         // 5 minutes window for rate calculations
    },

    // Error retention
    retention: {
      historySize: 1000,         // Keep last 1000 errors in memory
      alertHistorySize: 100,     // Keep last 100 alerts
      cleanupInterval: 3600000   // Cleanup every hour
    }
  },

  // ===== HEALTH CHECKS =====
  health: {
    // Check intervals (in milliseconds)
    intervals: {
      system: 30000,             // System health every 30 seconds
      database: 60000,           // Database health every minute
      services: 120000,          // Service health every 2 minutes
      detailed: 300000           // Detailed health every 5 minutes
    },

    // Health check timeouts
    timeouts: {
      quick: 5000,               // Quick checks: 5 seconds
      standard: 15000,           // Standard checks: 15 seconds
      detailed: 30000            // Detailed checks: 30 seconds
    },

    // Health status thresholds
    thresholds: {
      uptime: {
        warning: 0.95,           // Warning if uptime < 95%
        critical: 0.90           // Critical if uptime < 90%
      },
      responseTime: {
        warning: 2000,           // Warning if response > 2 seconds
        critical: 5000           // Critical if response > 5 seconds
      }
    }
  },

  // ===== ALERTS =====
  alerts: {
    // Alert channels
    channels: {
      email: {
        enabled: true,
        recipients: ['admin@letsludus.com'],
        smtp: {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || 587,
          secure: false
        }
      },
      slack: {
        enabled: false,
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
        channel: '#alerts'
      },
      dashboard: {
        enabled: true,
        autoRefresh: true,
        refreshInterval: 10000   // 10 seconds
      }
    },

    // Alert levels and actions
    levels: {
      info: {
        actions: ['log', 'dashboard'],
        cooldown: 0
      },
      warning: {
        actions: ['log', 'dashboard', 'email'],
        cooldown: 300000        // 5 minutes
      },
      critical: {
        actions: ['log', 'dashboard', 'email', 'slack'],
        cooldown: 60000         // 1 minute
      },
      emergency: {
        actions: ['log', 'dashboard', 'email', 'slack', 'sms'],
        cooldown: 0
      }
    },

    // Alert cooldowns (in milliseconds)
    cooldowns: {
      default: 300000,          // 5 minutes default
      critical: 60000,          // 1 minute for critical
      emergency: 0               // No cooldown for emergency
    }
  },

  // ===== MONITORING INTERVALS =====
  intervals: {
    // Data collection intervals
    collection: {
      metrics: 10000,            // Collect metrics every 10 seconds
      health: 30000,             // Health checks every 30 seconds
      cleanup: 3600000,          // Cleanup old data every hour
      reporting: 300000          // Generate reports every 5 minutes
    },

    // Data retention
    retention: {
      metrics: 86400000,         // Keep metrics for 24 hours
      errors: 604800000,         // Keep errors for 7 days
      alerts: 2592000000,        // Keep alerts for 30 days
      reports: 2592000000        // Keep reports for 30 days
    }
  },

  // ===== LOGGING =====
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    timestamp: true,
    
    // Log rotation
    rotation: {
      maxSize: '10m',
      maxFiles: 5,
      compress: true
    },

    // Log destinations
    destinations: {
      console: true,
      file: true,
      filePath: 'logs/monitoring.log'
    }
  },

  // ===== EXTERNAL SERVICES =====
  external: {
    // MongoDB Atlas monitoring
    mongodb: {
      enabled: true,
      metrics: ['connections', 'operations', 'queryPerformance'],
      alertThresholds: {
        connectionCount: 80,     // Alert at 80% connection usage
        operationLatency: 1000   // Alert if operations > 1 second
      }
    },

    // Render monitoring
    render: {
      enabled: true,
      metrics: ['responseTime', 'errorRate', 'uptime'],
      webhookUrl: process.env.RENDER_WEBHOOK_URL
    }
  },

  // ===== REFERRAL SYSTEM SPECIFIC =====
  referral: {
    // Performance thresholds
    performance: {
      codeGeneration: {
        maxTime: 2000,           // Max 2 seconds for code generation
        maxRetries: 3            // Max 3 retries for unique code
      },
      rewardProcessing: {
        maxTime: 5000,           // Max 5 seconds for reward processing
        maxRetries: 5            // Max 5 retries for failed rewards
      },
      analytics: {
        maxQueryTime: 10000,     // Max 10 seconds for analytics queries
        cacheTimeout: 300000     // Cache analytics for 5 minutes
      }
    },

    // Business metrics
    business: {
      conversionRate: {
        target: 15,              // Target 15% conversion rate
        warning: 10,             // Warning below 10%
        critical: 5              // Critical below 5%
      },
      rewardEfficiency: {
        target: 95,              // Target 95% reward delivery success
        warning: 90,             // Warning below 90%
        critical: 80             // Critical below 80%
      }
    }
  },

  // ===== DEVELOPMENT OVERRIDES =====
  development: {
    // Override settings for development environment
    overrides: {
      intervals: {
        collection: 5000,        // Faster collection in dev
        health: 15000,           // Faster health checks in dev
        cleanup: 1800000         // Cleanup every 30 minutes in dev
      },
      alerts: {
        email: false,            // Disable email alerts in dev
        slack: false,            // Disable Slack alerts in dev
        cooldowns: {
          default: 30000,        // Shorter cooldowns in dev
          critical: 10000        // Shorter critical cooldowns in dev
        }
      },
      logging: {
        level: 'debug',          // More verbose logging in dev
        destinations: {
          console: true,
          file: false            // Disable file logging in dev
        }
      }
    }
  }
};

// ===== HELPER FUNCTIONS =====

/**
 * Get configuration value with environment override
 */
function getConfig(path, defaultValue = null) {
  const keys = path.split('.');
  let value = monitoringConfig;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  
  return value;
}

/**
 * Get environment-specific configuration
 */
function getEnvConfig(path, defaultValue = null) {
  const baseValue = getConfig(path, defaultValue);
  
  if (process.env.NODE_ENV === 'development') {
    const devValue = getConfig(`development.overrides.${path}`);
    return devValue !== null ? devValue : baseValue;
  }
  
  return baseValue;
}

/**
 * Validate configuration
 */
function validateConfig() {
  const errors = [];
  
  // Validate performance thresholds
  const perf = monitoringConfig.performance;
  if (perf.requests.responseTime.warning >= perf.requests.responseTime.critical) {
    errors.push('Performance warning threshold must be less than critical threshold');
  }
  
  if (perf.memory.warning >= perf.memory.critical) {
    errors.push('Memory warning threshold must be less than critical threshold');
  }
  
  // Validate error thresholds
  if (monitoringConfig.errors.thresholds.errorRate > 100) {
    errors.push('Error rate threshold cannot exceed 100%');
  }
  
  // Validate intervals
  if (monitoringConfig.intervals.collection.collection < 1000) {
    errors.push('Collection interval must be at least 1 second');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
  
  return true;
}

/**
 * Get monitoring configuration for specific service
 */
function getServiceConfig(serviceName) {
  const serviceConfigs = {
    referral: {
      ...monitoringConfig.referral,
      performance: {
        ...monitoringConfig.performance.referral,
        ...monitoringConfig.referral.performance
      }
    },
    database: {
      ...monitoringConfig.performance.database,
      health: monitoringConfig.health
    },
    api: {
      ...monitoringConfig.performance.requests,
      health: monitoringConfig.health
    }
  };
  
  return serviceConfigs[serviceName] || monitoringConfig;
}

// ===== EXPORTS =====

module.exports = {
  config: monitoringConfig,
  getConfig,
  getEnvConfig,
  validateConfig,
  getServiceConfig
};

// Auto-validate on load
if (require.main === module) {
  try {
    validateConfig();
    console.log('✅ Monitoring configuration validated successfully');
  } catch (error) {
    console.error('❌ Monitoring configuration validation failed:', error.message);
    process.exit(1);
  }
}
