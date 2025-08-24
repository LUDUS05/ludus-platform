import { Request, Response, NextFunction } from 'express';
import AnalyticsService from '../services/analytics/AnalyticsService.js';
import EventTracker from '../services/analytics/EventTracker.js';

export interface AnalyticsRequest extends Request {
  analytics?: {
    userId?: string;
    sessionId?: string;
    startTime: number;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface AnalyticsResponse extends Response {
  analytics?: {
    responseTime: number;
    statusCode: number;
    contentLength: number;
  };
}

/**
 * Analytics middleware for tracking API requests and user behavior
 */
export const analyticsMiddleware = (analyticsService: AnalyticsService, eventTracker: EventTracker) => {
  return async (req: AnalyticsRequest, res: AnalyticsResponse, next: NextFunction) => {
    const startTime = Date.now();
    
    // Extract user information from request
    const userId = req.user?.userId || req.user?.id || req.headers['x-user-id'] as string;
    const sessionId = req.headers['x-session-id'] as string || generateSessionId();
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Add analytics context to request
    req.analytics = {
      userId,
      sessionId,
      startTime,
      ipAddress,
      userAgent
    };

    // Track page view for web requests
    if (req.headers.accept?.includes('text/html')) {
      try {
        await eventTracker.trackPageView({
          userId: userId || 'anonymous',
          page: req.path,
          referrer: req.headers.referer,
          timestamp: new Date(),
          sessionId,
          loadTime: 0, // Will be updated after response
          metadata: {
            method: req.method,
            query: req.query,
            params: req.params
          }
        });
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    }

    // Track API request
    try {
      await analyticsService.trackUserAction('api_request', userId || 'anonymous', {
        method: req.method,
        path: req.path,
        query: req.query,
        params: req.params,
        sessionId,
        ipAddress,
        userAgent,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to track API request:', error);
    }

    // Override response methods to track response data
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;

    res.send = function(data: any) {
      trackResponseMetrics(req, res, startTime, data);
      return originalSend.call(this, data);
    };

    res.json = function(data: any) {
      trackResponseMetrics(req, res, startTime, data);
      return originalJson.call(this, data);
    };

    res.end = function(data?: any) {
      trackResponseMetrics(req, res, startTime, data);
      return originalEnd.call(this, data);
    };

    next();
  };
};

/**
 * Track response metrics and user actions
 */
async function trackResponseMetrics(
  req: AnalyticsRequest, 
  res: AnalyticsResponse, 
  startTime: number, 
  data?: any
) {
  if (!req.analytics) return;

  const responseTime = Date.now() - startTime;
  const statusCode = res.statusCode;
  const contentLength = data ? JSON.stringify(data).length : 0;

  // Add response metrics to response object
  res.analytics = {
    responseTime,
    statusCode,
    contentLength
  };

  // Track response metrics
  try {
    const analyticsService = new AnalyticsService();
    const eventTracker = new EventTracker();

    // Track API response
    await analyticsService.trackUserAction('api_response', req.analytics.userId || 'anonymous', {
      method: req.method,
      path: req.path,
      responseTime,
      statusCode,
      contentLength,
      sessionId: req.analytics.sessionId,
      timestamp: new Date()
    });

    // Track performance metrics
    if (responseTime > 1000) { // Log slow responses
      await analyticsService.trackError(
        new Error(`Slow API response: ${req.method} ${req.path} took ${responseTime}ms`),
        req.analytics.userId,
        {
          method: req.method,
          path: req.path,
          responseTime,
          statusCode
        },
        'medium'
      );
    }

    // Track successful vs failed requests
    if (statusCode >= 400) {
      await analyticsService.trackUserAction('api_error', req.analytics.userId || 'anonymous', {
        method: req.method,
        path: req.path,
        statusCode,
        responseTime,
        sessionId: req.analytics.sessionId,
        timestamp: new Date()
      });
    } else {
      await analyticsService.trackUserAction('api_success', req.analytics.userId || 'anonymous', {
        method: req.method,
        path: req.path,
        statusCode,
        responseTime,
        sessionId: req.analytics.sessionId,
        timestamp: new Date()
      });
    }

    // Close services
    await analyticsService.close();
    await eventTracker.close();

  } catch (error) {
    console.error('Failed to track response metrics:', error);
  }
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * User action tracking middleware for specific user actions
 */
export const trackUserAction = (action: string, metadata?: Record<string, any>) => {
  return async (req: AnalyticsRequest, res: AnalyticsResponse, next: NextFunction) => {
    try {
      const analyticsService = new AnalyticsService();
      
      await analyticsService.trackUserAction(action, req.analytics?.userId || 'anonymous', {
        ...metadata,
        path: req.path,
        method: req.method,
        sessionId: req.analytics?.sessionId,
        timestamp: new Date()
      });

      await analyticsService.close();
    } catch (error) {
      console.error('Failed to track user action:', error);
    }

    next();
  };
};

/**
 * Conversion funnel tracking middleware
 */
export const trackConversion = (funnel: string, step: number, stepName: string, metadata?: Record<string, any>) => {
  return async (req: AnalyticsRequest, res: AnalyticsResponse, next: NextFunction) => {
    try {
      const analyticsService = new AnalyticsService();
      
      await analyticsService.trackConversion(
        funnel,
        step,
        stepName,
        req.analytics?.userId || 'anonymous',
        undefined,
        {
          ...metadata,
          path: req.path,
          method: req.method,
          sessionId: req.analytics?.sessionId
        }
      );

      await analyticsService.close();
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }

    next();
  };
};

/**
 * Revenue tracking middleware
 */
export const trackRevenue = (metadata?: Record<string, any>) => {
  return async (req: AnalyticsRequest, res: AnalyticsResponse, next: NextFunction) => {
    try {
      const analyticsService = new AnalyticsService();
      
      // Extract revenue data from request body or query
      const { amount, currency, activityId, vendorId, paymentMethod, transactionId } = req.body || req.query;
      
      if (amount && currency && activityId && vendorId) {
        await analyticsService.trackRevenue(
          req.analytics?.userId || 'anonymous',
          parseFloat(amount),
          currency,
          activityId,
          vendorId,
          paymentMethod || 'unknown',
          transactionId || generateTransactionId()
        );
      }

      await analyticsService.close();
    } catch (error) {
      console.error('Failed to track revenue:', error);
    }

    next();
  };
};

/**
 * Generate a unique transaction ID
 */
function generateTransactionId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Performance monitoring middleware
 */
export const performanceMonitor = () => {
  return async (req: AnalyticsRequest, res: AnalyticsResponse, next: NextFunction) => {
    const startTime = process.hrtime.bigint();
    
    res.on('finish', async () => {
      try {
        const analyticsService = new AnalyticsService();
        
        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        
        // Track system health metrics
        const memoryUsage = process.memoryUsage();
        await analyticsService.trackSystemHealth({
          uptime: process.uptime(),
          responseTime,
          errorRate: 0, // Would need to track this over time
          activeConnections: 0, // Would need to track this
          memoryUsage: memoryUsage.heapUsed,
          cpuUsage: 0 // Would need to track this over time
        });

        await analyticsService.close();
      } catch (error) {
        console.error('Failed to track performance metrics:', error);
      }
    });

    next();
  };
};

export default {
  analyticsMiddleware,
  trackUserAction,
  trackConversion,
  trackRevenue,
  performanceMonitor
};
