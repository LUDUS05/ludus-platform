import { Router } from 'express';
import AnalyticsService from '../services/analytics/AnalyticsService.js';
import EventTracker from '../services/analytics/EventTracker.js';
import CacheManager from '../services/performance/CacheManager.js';
import { trackUserAction, trackConversion, trackRevenue } from '../middleware/analytics.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Initialize services
const analyticsService = new AnalyticsService();
const eventTracker = new EventTracker();
const cacheManager = new CacheManager();

/**
 * @route   GET /api/analytics/health
 * @desc    Get analytics system health
 * @access  Public
 */
router.get('/health', async (req, res) => {
  try {
    const health = await analyticsService.generateInsights();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      data: health
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/analytics/insights
 * @desc    Get analytics insights and metrics
 * @access  Private (Admin only)
 */
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const insights = await analyticsService.generateInsights();
    const cacheStats = await cacheManager.getCacheStats();

    res.json({
      success: true,
      data: {
        insights,
        cache: cacheStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate insights'
    });
  }
});

/**
 * @route   GET /api/analytics/user/:userId
 * @desc    Get user analytics and behavior data
 * @access  Private (User can only access their own data, Admin can access all)
 */
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.userId || req.user?.id;

    // Check if user is accessing their own data or is admin
    if (requestingUserId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userSummary = await eventTracker.getUserInteractionSummary(userId);
    
    res.json({
      success: true,
      data: {
        userId,
        summary: userSummary,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user analytics'
    });
  }
});

/**
 * @route   GET /api/analytics/page/:page
 * @desc    Get page performance metrics
 * @access  Private (Admin only)
 */
router.get('/page/:page', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { page } = req.params;
    const { timeRange = 'day' } = req.query;

    const pageMetrics = await eventTracker.getPagePerformanceMetrics(
      page, 
      timeRange as 'day' | 'week' | 'month'
    );

    res.json({
      success: true,
      data: {
        page,
        timeRange,
        metrics: pageMetrics,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get page metrics'
    });
  }
});

/**
 * @route   GET /api/analytics/form/:formId
 * @desc    Get form performance metrics
 * @access  Private (Admin only)
 */
router.get('/form/:formId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { formId } = req.params;
    const { timeRange = 'day' } = req.query;

    const formMetrics = await eventTracker.getFormPerformanceMetrics(
      formId, 
      timeRange as 'day' | 'week' | 'month'
    );

    res.json({
      success: true,
      data: {
        formId,
        timeRange,
        metrics: formMetrics,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get form metrics'
    });
  }
});

/**
 * @route   GET /api/analytics/cache/stats
 * @desc    Get cache performance statistics
 * @access  Private (Admin only)
 */
router.get('/cache/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const cacheStats = await cacheManager.getCacheStats();

    res.json({
      success: true,
      data: {
        cache: cacheStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get cache stats'
    });
  }
});

/**
 * @route   POST /api/analytics/cache/invalidate
 * @desc    Invalidate cache patterns
 * @access  Private (Admin only)
 */
router.post('/cache/invalidate', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { pattern, reason } = req.body;

    if (!pattern) {
      return res.status(400).json({ error: 'Cache pattern is required' });
    }

    await cacheManager.invalidateCache(pattern, reason || 'manual');

    res.json({
      success: true,
      message: `Cache invalidated for pattern: ${pattern}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to invalidate cache'
    });
  }
});

/**
 * @route   POST /api/analytics/events/track
 * @desc    Track custom analytics events
 * @access  Private
 */
router.post('/events/track', authenticateToken, async (req, res) => {
  try {
    const { event, properties } = req.body;
    const userId = req.user?.userId || req.user?.id;

    if (!event) {
      return res.status(400).json({ error: 'Event name is required' });
    }

    await analyticsService.trackUserAction(event, userId || 'anonymous', {
      ...properties,
      timestamp: new Date(),
      source: 'api'
    });

    res.json({
      success: true,
      message: 'Event tracked successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track event'
    });
  }
});

/**
 * @route   POST /api/analytics/conversion/track
 * @desc    Track conversion funnel progression
 * @access  Private
 */
router.post('/conversion/track', authenticateToken, async (req, res) => {
  try {
    const { funnel, step, stepName, value, metadata } = req.body;
    const userId = req.user?.userId || req.user?.id;

    if (!funnel || !step || !stepName) {
      return res.status(400).json({ 
        error: 'Funnel ID, step number, and step name are required' 
      });
    }

    await analyticsService.trackConversion(
      funnel,
      step,
      stepName,
      userId || 'anonymous',
      value,
      {
        ...metadata,
        timestamp: new Date(),
        source: 'api'
      }
    );

    res.json({
      success: true,
      message: 'Conversion tracked successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track conversion'
    });
  }
});

/**
 * @route   POST /api/analytics/revenue/track
 * @desc    Track revenue events
 * @access  Private
 */
router.post('/revenue/track', authenticateToken, async (req, res) => {
  try {
    const { amount, currency, activityId, vendorId, paymentMethod, transactionId } = req.body;
    const userId = req.user?.userId || req.user?.id;

    if (!amount || !currency || !activityId || !vendorId) {
      return res.status(400).json({ 
        error: 'Amount, currency, activity ID, and vendor ID are required' 
      });
    }

    await analyticsService.trackRevenue(
      userId || 'anonymous',
      parseFloat(amount),
      currency,
      activityId,
      vendorId,
      paymentMethod || 'unknown',
      transactionId || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    );

    res.json({
      success: true,
      message: 'Revenue tracked successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track revenue'
    });
  }
});

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get analytics dashboard data
 * @access  Private (Admin only)
 */
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const [insights, cacheStats] = await Promise.all([
      analyticsService.generateInsights(),
      cacheManager.getCacheStats()
    ]);

    res.json({
      success: true,
      data: {
        insights,
        cache: cacheStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get dashboard data'
    });
  }
});

/**
 * @route   POST /api/analytics/cleanup
 * @desc    Trigger analytics data cleanup
 * @access  Private (Admin only)
 */
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Trigger cleanup for all services
    await Promise.all([
      analyticsService.cleanupOldData(),
      eventTracker.cleanupOldEventData(),
      cacheManager.cleanupOldCache()
    ]);

    res.json({
      success: true,
      message: 'Analytics data cleanup completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cleanup analytics data'
    });
  }
});

export default router;
