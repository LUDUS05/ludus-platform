/**
 * QR Code Optimization Service
 * 
 * This service provides:
 * - Optimized QR code generation with caching
 * - Multiple QR code formats and sizes
 * - Batch QR code generation
 * - QR code analytics and tracking
 * - Performance optimization for high-volume generation
 */

const QRCode = require('qrcode');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const cachingService = require('./cachingService');

class QRCodeOptimizationService {
  constructor() {
    this.config = {
      // QR code generation options
      defaultOptions: {
        errorCorrectionLevel: 'M', // Medium error correction
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      },
      
      // Size presets
      sizes: {
        small: { width: 128, height: 128 },
        medium: { width: 256, height: 256 },
        large: { width: 512, height: 512 },
        xlarge: { width: 1024, height: 1024 }
      },
      
      // Caching configuration
      cache: {
        enabled: true,
        ttl: 86400, // 24 hours
        maxSize: 1000, // Max cached QR codes
        cleanupInterval: 3600000 // 1 hour
      },
      
      // Storage configuration
      storage: {
        path: process.env.QR_STORAGE_PATH || 'uploads/qrcodes',
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedFormats: ['png', 'svg', 'pdf']
      },
      
      // Performance configuration
      performance: {
        batchSize: 10,
        maxConcurrent: 5,
        timeout: 30000, // 30 seconds
        retryAttempts: 3
      }
    };
    
    // Initialize service
    this.initializeService();
  }

  // ===== INITIALIZATION =====

  /**
   * Initialize QR code optimization service
   */
  async initializeService() {
    try {
      logger.info('Initializing QR code optimization service...');
      
      // Ensure storage directory exists
      await this.ensureStorageDirectory();
      
      // Initialize caching
      if (this.config.cache.enabled) {
        await this.initializeCaching();
      }
      
      // Start cleanup process
      this.startCleanupProcess();
      
      logger.info('QR code optimization service initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize QR code optimization service:', error);
    }
  }

  /**
   * Ensure storage directory exists
   */
  async ensureStorageDirectory() {
    try {
      await fs.mkdir(this.config.storage.path, { recursive: true });
      logger.info(`QR code storage directory ensured: ${this.config.storage.path}`);
    } catch (error) {
      logger.error('Failed to create QR code storage directory:', error);
      throw error;
    }
  }

  /**
   * Initialize caching for QR codes
   */
  async initializeCaching() {
    try {
      // Warm up cache with common QR codes
      await this.warmCache();
      logger.info('QR code cache initialized and warmed');
    } catch (error) {
      logger.error('Failed to initialize QR code cache:', error);
    }
  }

  /**
   * Start cleanup process
   */
  startCleanupProcess() {
    setInterval(async () => {
      await this.cleanupExpiredFiles();
    }, this.config.cache.cleanupInterval);
    
    logger.info('QR code cleanup process started');
  }

  // ===== QR CODE GENERATION =====

  /**
   * Generate optimized QR code
   */
  async generateQRCode(data, options = {}) {
    try {
      // Merge options with defaults
      const qrOptions = { ...this.config.defaultOptions, ...options };
      
      // Generate cache key
      const cacheKey = this.generateCacheKey(data, qrOptions);
      
      // Check cache first
      if (this.config.cache.enabled) {
        const cached = await this.getCachedQRCode(cacheKey);
        if (cached) {
          logger.debug(`QR code served from cache: ${cacheKey}`);
          return cached;
        }
      }
      
      // Generate QR code
      const qrCode = await this.generateQRCodeData(data, qrOptions);
      
      // Cache the result
      if (this.config.cache.enabled) {
        await this.cacheQRCode(cacheKey, qrCode);
      }
      
      logger.debug(`QR code generated: ${cacheKey}`);
      return qrCode;
      
    } catch (error) {
      logger.error('Failed to generate QR code:', error);
      throw error;
    }
  }

  /**
   * Generate QR code data
   */
  async generateQRCodeData(data, options) {
    try {
      const qrCodeData = await QRCode.toDataURL(data, options);
      
      return {
        data: qrCodeData,
        format: options.type,
        size: {
          width: options.width || this.config.sizes.medium.width,
          height: options.height || this.config.sizes.medium.height
        },
        options: options,
        generatedAt: new Date(),
        dataLength: data.length
      };
      
    } catch (error) {
      logger.error('Failed to generate QR code data:', error);
      throw error;
    }
  }

  /**
   * Generate QR code for referral link
   */
  async generateReferralQRCode(referralCode, userId, options = {}) {
    try {
      const referralData = {
        code: referralCode,
        userId: userId,
        timestamp: Date.now(),
        type: 'referral'
      };
      
      const qrOptions = {
        ...options,
        size: options.size || 'medium',
        format: options.format || 'png'
      };
      
      // Generate QR code
      const qrCode = await this.generateQRCode(JSON.stringify(referralData), qrOptions);
      
      // Track generation
      await this.trackQRCodeGeneration(referralCode, userId, qrOptions);
      
      return qrCode;
      
    } catch (error) {
      logger.error('Failed to generate referral QR code:', error);
      throw error;
    }
  }

  /**
   * Generate QR code for invitation
   */
  async generateInvitationQRCode(invitationId, activityId, options = {}) {
    try {
      const invitationData = {
        invitationId: invitationId,
        activityId: activityId,
        timestamp: Date.now(),
        type: 'invitation'
      };
      
      const qrOptions = {
        ...options,
        size: options.size || 'medium',
        format: options.format || 'png'
      };
      
      // Generate QR code
      const qrCode = await this.generateQRCode(JSON.stringify(invitationData), qrOptions);
      
      // Track generation
      await this.trackQRCodeGeneration(invitationId, null, qrOptions, 'invitation');
      
      return qrCode;
      
    } catch (error) {
      logger.error('Failed to generate invitation QR code:', error);
      throw error;
    }
  }

  // ===== BATCH GENERATION =====

  /**
   * Generate multiple QR codes in batch
   */
  async generateBatchQRCodes(items, options = {}) {
    try {
      const batchSize = options.batchSize || this.config.performance.batchSize;
      const results = [];
      
      // Process in batches
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
          batch.map(item => this.generateQRCode(item.data, { ...options, ...item.options }))
        );
        
        // Process batch results
        batchResults.forEach((result, index) => {
          const item = batch[index];
          if (result.status === 'fulfilled') {
            results.push({
              ...item,
              qrCode: result.value,
              success: true
            });
          } else {
            results.push({
              ...item,
              error: result.reason.message,
              success: false
            });
          }
        });
        
        // Add small delay between batches to prevent overwhelming
        if (i + batchSize < items.length) {
          await this.delay(100);
        }
      }
      
      logger.info(`Batch QR code generation completed: ${results.length} items`);
      return results;
      
    } catch (error) {
      logger.error('Failed to generate batch QR codes:', error);
      throw error;
    }
  }

  /**
   * Generate QR codes for multiple referral codes
   */
  async generateReferralQRCodesBatch(referralCodes, options = {}) {
    try {
      const items = referralCodes.map(code => ({
        data: JSON.stringify({
          code: code.code,
          userId: code.userId,
          timestamp: Date.now(),
          type: 'referral'
        }),
        options: {
          ...options,
          size: options.size || 'medium',
          format: options.format || 'png'
        },
        referralCode: code
      }));
      
      return await this.generateBatchQRCodes(items, options);
      
    } catch (error) {
      logger.error('Failed to generate referral QR codes batch:', error);
      throw error;
    }
  }

  // ===== CACHING =====

  /**
   * Generate cache key for QR code
   */
  generateCacheKey(data, options) {
    const hash = crypto.createHash('md5').update(data + JSON.stringify(options)).digest('hex');
    return `qrcode:${hash}`;
  }

  /**
   * Get cached QR code
   */
  async getCachedQRCode(cacheKey) {
    try {
      return await cachingService.get(cacheKey);
    } catch (error) {
      logger.debug('Failed to get cached QR code:', error);
      return null;
    }
  }

  /**
   * Cache QR code
   */
  async cacheQRCode(cacheKey, qrCode) {
    try {
      await cachingService.set(cacheKey, qrCode, this.config.cache.ttl);
    } catch (error) {
      logger.debug('Failed to cache QR code:', error);
    }
  }

  /**
   * Warm up cache with common QR codes
   */
  async warmCache() {
    try {
      const commonData = [
        'https://ludus.com',
        'https://ludus.com/referral',
        'https://ludus.com/help'
      ];
      
      const warmPromises = commonData.map(async (data) => {
        const cacheKey = this.generateCacheKey(data, this.config.defaultOptions);
        const qrCode = await this.generateQRCodeData(data, this.config.defaultOptions);
        await this.cacheQRCode(cacheKey, qrCode);
      });
      
      await Promise.allSettled(warmPromises);
      logger.info('QR code cache warmed with common codes');
      
    } catch (error) {
      logger.error('Failed to warm QR code cache:', error);
    }
  }

  // ===== STORAGE AND FILES =====

  /**
   * Save QR code to file
   */
  async saveQRCodeToFile(qrCode, filename, format = 'png') {
    try {
      const filePath = path.join(this.config.storage.path, `${filename}.${format}`);
      
      if (format === 'png') {
        // Convert data URL to buffer
        const base64Data = qrCode.data.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        await fs.writeFile(filePath, buffer);
      } else if (format === 'svg') {
        // Generate SVG
        const svgData = await QRCode.toString(qrCode.options.data || qrCode.data, {
          ...qrCode.options,
          type: 'svg'
        });
        await fs.writeFile(filePath, svgData);
      }
      
      logger.debug(`QR code saved to file: ${filePath}`);
      return filePath;
      
    } catch (error) {
      logger.error('Failed to save QR code to file:', error);
      throw error;
    }
  }

  /**
   * Download QR code
   */
  async downloadQRCode(data, options = {}) {
    try {
      const qrCode = await this.generateQRCode(data, options);
      const filename = `qrcode_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
      const filePath = await this.saveQRCodeToFile(qrCode, filename, options.format || 'png');
      
      return {
        filePath,
        filename: `${filename}.${options.format || 'png'}`,
        qrCode,
        downloadUrl: `/uploads/qrcodes/${filename}.${options.format || 'png'}`
      };
      
    } catch (error) {
      logger.error('Failed to download QR code:', error);
      throw error;
    }
  }

  // ===== ANALYTICS AND TRACKING =====

  /**
   * Track QR code generation
   */
  async trackQRCodeGeneration(identifier, userId, options, type = 'referral') {
    try {
      const trackingData = {
        identifier,
        userId,
        type,
        options,
        timestamp: new Date(),
        userAgent: null, // Could be passed from request
        ipAddress: null  // Could be passed from request
      };
      
      // Store tracking data (could be saved to database)
      logger.debug(`QR code generation tracked: ${identifier} (${type})`);
      
      // Update cache statistics
      if (this.config.cache.enabled) {
        await this.updateCacheStats(type);
      }
      
    } catch (error) {
      logger.error('Failed to track QR code generation:', error);
    }
  }

  /**
   * Update cache statistics
   */
  async updateCacheStats(type) {
    try {
      const statsKey = `qrcode:stats:${type}`;
      const currentStats = await cachingService.get(statsKey) || { count: 0, lastUpdated: null };
      
      currentStats.count++;
      currentStats.lastUpdated = new Date();
      
      await cachingService.set(statsKey, currentStats, 86400); // 24 hours
      
    } catch (error) {
      logger.debug('Failed to update cache stats:', error);
    }
  }

  // ===== PERFORMANCE OPTIMIZATION =====

  /**
   * Optimize QR code options for performance
   */
  optimizeOptionsForPerformance(options = {}) {
    const optimized = { ...options };
    
    // Reduce quality for faster generation
    if (!optimized.quality) {
      optimized.quality = 0.8;
    }
    
    // Use smaller size for faster generation
    if (!optimized.width && !optimized.height) {
      optimized.width = this.config.sizes.small.width;
      optimized.height = this.config.sizes.small.height;
    }
    
    // Use lower error correction for faster generation
    if (!optimized.errorCorrectionLevel) {
      optimized.errorCorrectionLevel = 'L'; // Low error correction
    }
    
    return optimized;
  }

  /**
   * Pre-generate common QR codes
   */
  async pregenerateCommonQRCodes() {
    try {
      const commonCodes = [
        { data: 'https://ludus.com', options: { size: 'small' } },
        { data: 'https://ludus.com/referral', options: { size: 'medium' } },
        { data: 'https://ludus.com/help', options: { size: 'small' } }
      ];
      
      const results = await this.generateBatchQRCodes(commonCodes);
      logger.info(`Pre-generated ${results.length} common QR codes`);
      
      return results;
      
    } catch (error) {
      logger.error('Failed to pre-generate common QR codes:', error);
    }
  }

  // ===== CLEANUP =====

  /**
   * Cleanup expired files
   */
  async cleanupExpiredFiles() {
    try {
      const files = await fs.readdir(this.config.storage.path);
      const now = Date.now();
      let cleanedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(this.config.storage.path, file);
        const stats = await fs.stat(filePath);
        
        // Remove files older than 7 days
        if (now - stats.mtime.getTime() > 7 * 24 * 60 * 60 * 1000) {
          await fs.unlink(filePath);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        logger.info(`Cleaned up ${cleanedCount} expired QR code files`);
      }
      
    } catch (error) {
      logger.error('Failed to cleanup expired files:', error);
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get QR code statistics
   */
  async getQRCodeStats() {
    try {
      const stats = {
        cache: {
          enabled: this.config.cache.enabled,
          ttl: this.config.cache.ttl,
          maxSize: this.config.cache.maxSize
        },
        storage: {
          path: this.config.storage.path,
          maxFileSize: this.config.storage.maxFileSize
        },
        performance: {
          batchSize: this.config.performance.batchSize,
          maxConcurrent: this.config.performance.maxConcurrent
        }
      };
      
      // Get cache statistics if available
      if (this.config.cache.enabled) {
        try {
          const cacheStats = await cachingService.getCacheStats();
          stats.cache.stats = cacheStats;
        } catch (error) {
          logger.debug('Failed to get cache stats:', error);
        }
      }
      
      return stats;
      
    } catch (error) {
      logger.error('Failed to get QR code stats:', error);
      return null;
    }
  }

  /**
   * Get service health
   */
  async getHealth() {
    try {
      const health = {
        status: 'healthy',
        storage: {
          status: 'healthy',
          path: this.config.storage.path
        },
        cache: {
          status: this.config.cache.enabled ? 'enabled' : 'disabled'
        },
        performance: {
          status: 'healthy',
          batchSize: this.config.performance.batchSize
        }
      };
      
      // Check storage directory
      try {
        await fs.access(this.config.storage.path);
        health.storage.status = 'healthy';
      } catch (error) {
        health.storage.status = 'error';
        health.storage.error = error.message;
      }
      
      // Overall status
      if (health.storage.status === 'error') {
        health.status = 'unhealthy';
      }
      
      return health;
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const qrCodeOptimizationService = new QRCodeOptimizationService();

module.exports = qrCodeOptimizationService;
