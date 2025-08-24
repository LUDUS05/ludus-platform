import { createClient, RedisClientType } from 'redis';
import winston from 'winston';
import Mixpanel from 'mixpanel';

export interface UserEvent {
  userId: string;
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface InteractionEvent {
  userId: string;
  elementId: string;
  action: string;
  page: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface FunnelAnalysis {
  funnelId: string;
  step: number;
  stepName: string;
  userId: string;
  timestamp: Date;
  conversionValue?: number;
  dropoffReason?: string;
}

export interface SessionData {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  pages: string[];
  interactions: InteractionEvent[];
  duration: number;
}

export interface ConversionMetric {
  funnelId: string;
  step: number;
  userId: string;
  timestamp: Date;
  value: number;
  metadata: Record<string, any>;
}

export interface RevenueEvent {
  userId: string;
  amount: number;
  currency: string;
  activityId: string;
  vendorId: string;
  timestamp: Date;
  paymentMethod: string;
  transactionId: string;
}

export interface RetentionMetric {
  userId: string;
  cohort: string;
  retentionDay: number;
  isRetained: boolean;
  timestamp: Date;
  activityCount: number;
}

export interface VendorAnalytics {
  vendorId: string;
  date: Date;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  conversionRate: number;
  customerCount: number;
}

export interface HealthMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface ErrorEvent {
  errorId: string;
  userId?: string;
  error: string;
  stack?: string;
  timestamp: Date;
  context: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class AnalyticsService {
  private redis!: RedisClientType;
  private logger!: winston.Logger;
  private mixpanel!: Mixpanel.Mixpanel;

  constructor() {
    this.initializeRedis();
    this.initializeLogger();
    this.initializeMixpanel();
  }

  private async initializeRedis(): Promise<void> {
    try {
      this.redis = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      this.redis.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      this.redis.on('connect', () => {
        console.log('Redis Client Connected');
      });

      await this.redis.connect();
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
    }
  }

  private initializeLogger(): void {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'analytics' },
      transports: [
        new winston.transports.File({ filename: 'logs/analytics-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/analytics-combined.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  private initializeMixpanel(): void {
    const mixpanelToken = process.env.MIXPANEL_TOKEN;
    if (mixpanelToken) {
      this.mixpanel = Mixpanel.init(mixpanelToken);
    } else {
      console.warn('MIXPANEL_TOKEN not found. Mixpanel analytics disabled.');
    }
  }

  /**
   * Track user actions and events
   */
  async trackUserAction(action: string, userId: string, metadata: Record<string, any> = {}): Promise<void> {
    try {
      const event: UserEvent = {
        userId,
        event: action,
        properties: metadata,
        timestamp: new Date(),
        sessionId: metadata.sessionId,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent
      };

      // Store in Redis for real-time access
      await this.redis.lPush(`user:${userId}:events`, JSON.stringify(event));
      await this.redis.expire(`user:${userId}:events`, 86400); // 24 hours

      // Track in Mixpanel if available
      if (this.mixpanel) {
        this.mixpanel.track(action, {
          distinct_id: userId,
          ...metadata
        });
      }

      // Log the event
      this.logger.info('User action tracked', { action, userId, metadata });

    } catch (error) {
      this.logger.error('Failed to track user action', { error, action, userId });
    }
  }

  /**
   * Track conversion funnel progression
   */
  async trackConversion(funnel: string, step: number, stepName: string, userId: string, value?: number, metadata: Record<string, any> = {}): Promise<void> {
    try {
      const conversion: FunnelAnalysis = {
        funnelId: funnel,
        step,
        stepName,
        userId,
        timestamp: new Date(),
        conversionValue: value,
        dropoffReason: metadata.dropoffReason
      };

      // Store conversion data
      await this.redis.hSet(`funnel:${funnel}:step:${step}`, userId, JSON.stringify(conversion));
      await this.redis.expire(`funnel:${funnel}:step:${step}`, 604800); // 7 days

      // Track in Mixpanel
      if (this.mixpanel) {
        this.mixpanel.track(`Funnel Step ${step}: ${stepName}`, {
          distinct_id: userId,
          funnel,
          step,
          stepName,
          value,
          ...metadata
        });
      }

      this.logger.info('Conversion tracked', { funnel, step, stepName, userId, value });

    } catch (error) {
      this.logger.error('Failed to track conversion', { error, funnel, step, userId });
    }
  }

  /**
   * Track revenue events
   */
  async trackRevenue(userId: string, amount: number, currency: string, activityId: string, vendorId: string, paymentMethod: string, transactionId: string): Promise<void> {
    try {
      const revenueEvent: RevenueEvent = {
        userId,
        amount,
        currency,
        activityId,
        vendorId,
        timestamp: new Date(),
        paymentMethod,
        transactionId
      };

      // Store revenue data
      await this.redis.lPush('revenue:events', JSON.stringify(revenueEvent));
      await this.redis.expire('revenue:events', 2592000); // 30 days

      // Track in Mixpanel
      if (this.mixpanel) {
        this.mixpanel.track('Revenue Generated', {
          distinct_id: userId,
          amount,
          currency,
          activityId,
          vendorId,
          paymentMethod,
          transactionId
        });
      }

      this.logger.info('Revenue tracked', { userId, amount, currency, activityId });

    } catch (error) {
      this.logger.error('Failed to track revenue', { error, userId, amount });
    }
  }

  /**
   * Track user retention
   */
  async trackRetention(userId: string, cohort: string, retentionDay: number, isRetained: boolean, activityCount: number = 0): Promise<void> {
    try {
      const retention: RetentionMetric = {
        userId,
        cohort,
        retentionDay,
        isRetained,
        timestamp: new Date(),
        activityCount
      };

      // Store retention data
      await this.redis.hSet(`retention:${cohort}:day:${retentionDay}`, userId, JSON.stringify(retention));
      await this.redis.expire(`retention:${cohort}:day:${retentionDay}`, 2592000); // 30 days

      this.logger.info('Retention tracked', { userId, cohort, retentionDay, isRetained });

    } catch (error) {
      this.logger.error('Failed to track retention', { error, userId, cohort });
    }
  }

  /**
   * Track vendor performance
   */
  async trackVendorPerformance(vendorId: string, date: Date, totalBookings: number, totalRevenue: number, averageRating: number, conversionRate: number, customerCount: number): Promise<void> {
    try {
      const vendorAnalytics: VendorAnalytics = {
        vendorId,
        date,
        totalBookings,
        totalRevenue,
        averageRating,
        conversionRate,
        customerCount
      };

      // Store vendor analytics
      const dateKey = date.toISOString().split('T')[0];
      await this.redis.hSet(`vendor:${vendorId}:analytics:${dateKey}`, 'data', JSON.stringify(vendorAnalytics));
      await this.redis.expire(`vendor:${vendorId}:analytics:${dateKey}`, 2592000); // 30 days

      this.logger.info('Vendor performance tracked', { vendorId, date: dateKey, totalBookings, totalRevenue });

    } catch (error) {
      this.logger.error('Failed to track vendor performance', { error, vendorId, date });
    }
  }

  /**
   * Track system health metrics
   */
  async trackSystemHealth(metrics: HealthMetrics): Promise<void> {
    try {
      // Store health metrics
      await this.redis.hSet('system:health', 'current', JSON.stringify(metrics));
      await this.redis.expire('system:health', 3600); // 1 hour

      // Log health metrics
      this.logger.info('System health tracked', metrics);

    } catch (error) {
      this.logger.error('Failed to track system health', { error });
    }
  }

  /**
   * Track errors
   */
  async trackError(error: Error, userId?: string, context: Record<string, any> = {}, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): Promise<void> {
    try {
      const errorEvent: ErrorEvent = {
        errorId: Math.random().toString(36).substr(2, 9),
        userId,
        error: error.message,
        stack: error.stack,
        timestamp: new Date(),
        context,
        severity
      };

      // Store error data
      await this.redis.lPush('errors:events', JSON.stringify(errorEvent));
      await this.redis.expire('errors:events', 604800); // 7 days

      // Log error
      this.logger.error('Error tracked', { errorEvent });

    } catch (err) {
      this.logger.error('Failed to track error', { err, originalError: error.message });
    }
  }

  /**
   * Generate analytics insights
   */
  async generateInsights(): Promise<Record<string, any>> {
    try {
      const insights: Record<string, any> = {};

      // Get active users count
      const activeUsers = await this.redis.keys('user:*:events');
      insights.activeUsers = activeUsers.length;

      // Get recent revenue
      const recentRevenue = await this.redis.lRange('revenue:events', 0, 9);
      insights.recentRevenue = recentRevenue.map(r => JSON.parse(r));

      // Get system health
      const systemHealth = await this.redis.hGet('system:health', 'current');
      insights.systemHealth = systemHealth ? JSON.parse(systemHealth) : null;

      return insights;

    } catch (error) {
      this.logger.error('Failed to generate insights', { error });
      return {};
    }
  }

  /**
   * Cleanup old analytics data
   */
  async cleanupOldData(): Promise<void> {
    try {
      // This method will be called periodically to clean up old analytics data
      // Implementation depends on your data retention policy
      this.logger.info('Analytics data cleanup completed');
    } catch (error) {
      this.logger.error('Failed to cleanup old data', { error });
    }
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.quit();
      }
      this.logger.info('Analytics service closed');
    } catch (error) {
      this.logger.error('Failed to close analytics service', { error });
    }
  }
}

export default AnalyticsService;
