import { createClient, RedisClientType } from 'redis';
import winston from 'winston';
import { InteractionEvent, SessionData } from './AnalyticsService';

export interface ClickEvent {
  userId: string;
  elementId: string;
  elementType: string;
  elementText?: string;
  page: string;
  timestamp: Date;
  coordinates?: { x: number; y: number };
  metadata: Record<string, any>;
}

export interface PageViewEvent {
  userId: string;
  page: string;
  referrer?: string;
  timestamp: Date;
  sessionId: string;
  loadTime: number;
  metadata: Record<string, any>;
}

export interface ScrollEvent {
  userId: string;
  page: string;
  scrollDepth: number;
  timestamp: Date;
  sessionId: string;
  metadata: Record<string, any>;
}

export interface FormInteractionEvent {
  userId: string;
  formId: string;
  fieldName: string;
  action: 'focus' | 'blur' | 'input' | 'submit' | 'validation_error';
  timestamp: Date;
  page: string;
  sessionId: string;
  metadata: Record<string, any>;
}

export class EventTracker {
  private redis!: RedisClientType;
  private logger!: winston.Logger;

  constructor() {
    this.initializeRedis();
    this.initializeLogger();
  }

  private async initializeRedis(): Promise<void> {
    try {
      this.redis = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      this.redis.on('error', (err) => {
        console.error('EventTracker Redis Client Error:', err);
      });

      this.redis.on('connect', () => {
        console.log('EventTracker Redis Client Connected');
      });

      await this.redis.connect();
    } catch (error) {
      console.error('Failed to initialize EventTracker Redis:', error);
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
      defaultMeta: { service: 'event-tracker' },
      transports: [
        new winston.transports.File({ filename: 'logs/event-tracker-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/event-tracker-combined.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  /**
   * Track user clicks and interactions
   */
  async trackClick(event: ClickEvent): Promise<void> {
    try {
      // Store click event
      await this.redis.lPush(`clicks:${event.userId}`, JSON.stringify(event));
      await this.redis.expire(`clicks:${event.userId}`, 86400); // 24 hours

      // Store in global clicks stream
      await this.redis.lPush('clicks:global', JSON.stringify(event));
      await this.redis.expire('clicks:global', 604800); // 7 days

      // Track element-specific clicks
      await this.redis.hIncrBy(`element:clicks:${event.elementId}`, 'count', 1);
      await this.redis.expire(`element:clicks:${event.elementId}`, 2592000); // 30 days

      this.logger.info('Click tracked', { userId: event.userId, elementId: event.elementId, page: event.page });

    } catch (error) {
      this.logger.error('Failed to track click', { error, event });
    }
  }

  /**
   * Track page views
   */
  async trackPageView(event: PageViewEvent): Promise<void> {
    try {
      // Store page view event
      await this.redis.lPush(`pageviews:${event.userId}`, JSON.stringify(event));
      await this.redis.expire(`pageviews:${event.userId}`, 86400); // 24 hours

      // Store in global page views stream
      await this.redis.lPush('pageviews:global', JSON.stringify(event));
      await this.redis.expire('pageviews:global', 604800); // 7 days

      // Track page-specific metrics
      await this.redis.hIncrBy(`page:views:${event.page}`, 'count', 1);
      await this.redis.hSet(`page:views:${event.page}`, 'lastViewed', new Date().toISOString());
      await this.redis.expire(`page:views:${event.page}`, 2592000); // 30 days

      // Track session data
      await this.updateSessionData(event.sessionId, event.userId, event.page, event.timestamp);

      this.logger.info('Page view tracked', { userId: event.userId, page: event.page, loadTime: event.loadTime });

    } catch (error) {
      this.logger.error('Failed to track page view', { error, event });
    }
  }

  /**
   * Track scroll events
   */
  async trackScroll(event: ScrollEvent): Promise<void> {
    try {
      // Store scroll event
      await this.redis.lPush(`scrolls:${event.userId}`, JSON.stringify(event));
      await this.redis.expire(`scrolls:${event.userId}`, 86400); // 24 hours

      // Track scroll depth distribution
      const depthBucket = Math.floor(event.scrollDepth / 25) * 25; // Group by 25% increments
      await this.redis.hIncrBy(`scroll:depth:${event.page}`, `${depthBucket}`, 1);
      await this.redis.expire(`scroll:depth:${event.page}`, 2592000); // 30 days

      this.logger.info('Scroll tracked', { userId: event.userId, page: event.page, scrollDepth: event.scrollDepth });

    } catch (error) {
      this.logger.error('Failed to track scroll', { error, event });
    }
  }

  /**
   * Track form interactions
   */
  async trackFormInteraction(event: FormInteractionEvent): Promise<void> {
    try {
      // Store form interaction event
      await this.redis.lPush(`forms:${event.userId}`, JSON.stringify(event));
      await this.redis.expire(`forms:${event.userId}`, 86400); // 24 hours

      // Track form-specific metrics
      await this.redis.hIncrBy(`form:interactions:${event.formId}`, event.action, 1);
      await this.redis.expire(`form:interactions:${event.formId}`, 2592000); // 30 days

      // Track field-specific interactions
      if (event.fieldName) {
        await this.redis.hIncrBy(`field:interactions:${event.formId}:${event.fieldName}`, event.action, 1);
        await this.redis.expire(`field:interactions:${event.formId}:${event.fieldName}`, 2592000); // 30 days
      }

      this.logger.info('Form interaction tracked', { 
        userId: event.userId, 
        formId: event.formId, 
        action: event.action,
        fieldName: event.fieldName 
      });

    } catch (error) {
      this.logger.error('Failed to track form interaction', { error, event });
    }
  }

  /**
   * Track session data
   */
  private async updateSessionData(sessionId: string, userId: string, page: string, timestamp: Date): Promise<void> {
    try {
      const sessionKey = `session:${sessionId}`;
      let sessionData: SessionData;

      // Get existing session or create new one
      const existingSession = await this.redis.get(sessionKey);
      if (existingSession) {
        sessionData = JSON.parse(existingSession);
        sessionData.pages.push(page);
        sessionData.endTime = timestamp;
        sessionData.duration = timestamp.getTime() - new Date(sessionData.startTime).getTime();
      } else {
        sessionData = {
          sessionId,
          userId,
          startTime: timestamp,
          pages: [page],
          interactions: [],
          duration: 0
        };
      }

      // Update session data
      await this.redis.set(sessionKey, JSON.stringify(sessionData));
      await this.redis.expire(sessionKey, 86400); // 24 hours

    } catch (error) {
      this.logger.error('Failed to update session data', { error, sessionId, userId });
    }
  }

  /**
   * Get user interaction summary
   */
  async getUserInteractionSummary(userId: string, timeRange: 'day' | 'week' | 'month' = 'day'): Promise<Record<string, any>> {
    try {
      const summary: Record<string, any> = {};

      // Get recent clicks
      const recentClicks = await this.redis.lRange(`clicks:${userId}`, 0, 49);
      summary.recentClicks = recentClicks.map(c => JSON.parse(c));

      // Get recent page views
      const recentPageViews = await this.redis.lRange(`pageviews:${userId}`, 0, 49);
      summary.recentPageViews = recentPageViews.map(p => JSON.parse(p));

      // Get recent form interactions
      const recentForms = await this.redis.lRange(`forms:${userId}`, 0, 49);
      summary.recentForms = recentForms.map(f => JSON.parse(f));

      // Get scroll behavior
      const recentScrolls = await this.redis.lRange(`scrolls:${userId}`, 0, 49);
      summary.recentScrolls = recentScrolls.map(s => JSON.parse(s));

      return summary;

    } catch (error) {
      this.logger.error('Failed to get user interaction summary', { error, userId });
      return {};
    }
  }

  /**
   * Get page performance metrics
   */
  async getPagePerformanceMetrics(page: string, timeRange: 'day' | 'week' | 'month' = 'day'): Promise<Record<string, any>> {
    try {
      const metrics: Record<string, any> = {};

      // Get page views
      const pageViews = await this.redis.hGet(`page:views:${page}`, 'count');
      metrics.totalViews = parseInt(pageViews || '0');

      // Get last viewed time
      const lastViewed = await this.redis.hGet(`page:views:${page}`, 'lastViewed');
      metrics.lastViewed = lastViewed;

      // Get scroll depth distribution
      const scrollDepth = await this.redis.hGetAll(`scroll:depth:${page}`);
      metrics.scrollDepthDistribution = scrollDepth;

      return metrics;

    } catch (error) {
      this.logger.error('Failed to get page performance metrics', { error, page });
      return {};
    }
  }

  /**
   * Get form performance metrics
   */
  async getFormPerformanceMetrics(formId: string, timeRange: 'day' | 'week' | 'month' = 'day'): Promise<Record<string, any>> {
    try {
      const metrics: Record<string, any> = {};

      // Get form interactions
      const interactions = await this.redis.hGetAll(`form:interactions:${formId}`);
      metrics.interactions = interactions;

      // Calculate conversion rate (submits vs total interactions)
      const totalInteractions = Object.values(interactions).reduce((sum, count) => sum + parseInt(count), 0);
      const submits = parseInt(interactions.submit || '0');
      metrics.conversionRate = totalInteractions > 0 ? (submits / totalInteractions) * 100 : 0;

      return metrics;

    } catch (error) {
      this.logger.error('Failed to get form performance metrics', { error, formId });
      return {};
    }
  }

  /**
   * Cleanup old event data
   */
  async cleanupOldEventData(): Promise<void> {
    try {
      // This method will be called periodically to clean up old event data
      // Implementation depends on your data retention policy
      this.logger.info('Event data cleanup completed');
    } catch (error) {
      this.logger.error('Failed to cleanup old event data', { error });
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
      this.logger.info('EventTracker closed');
    } catch (error) {
      this.logger.error('Failed to close EventTracker', { error });
    }
  }
}

export default EventTracker;
