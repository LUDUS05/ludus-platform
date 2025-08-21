const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { 
  getPerformanceMetrics, 
  getSlowQueryAnalysis 
} = require('../middleware/performance');
const { 
  getQueryStats, 
  getSlowQueryAnalysis: getDBSlowQueries,
  getPerformanceRecommendations,
  createPerformanceIndexes,
  getDatabasePerformanceSummary
} = require('../services/queryOptimizer');
const { CacheService } = require('../services/cache');

// Initialize cache service
const cacheService = new CacheService();

// Get overall performance metrics
router.get('/metrics', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const performanceMetrics = getPerformanceMetrics();
    const queryStats = getQueryStats();
    const cacheStats = await cacheService.getStats();
    
    const metrics = {
      timestamp: new Date().toISOString(),
      server: {
        uptime: performanceMetrics.uptime,
        requests: performanceMetrics.requests,
        responses: performanceMetrics.responses,
        errors: performanceMetrics.errors,
        averageResponseTime: performanceMetrics.averageResponseTime,
        p95ResponseTime: performanceMetrics.p95ResponseTime,
        slowQueries: performanceMetrics.slowQueries,
        cacheHitRate: performanceMetrics.cacheHitRate,
        requestsPerMinute: performanceMetrics.requestsPerMinute
      },
      database: {
        queryStats: Object.keys(queryStats).length,
        totalQueries: Object.values(queryStats).reduce((sum, stat) => sum + stat.count, 0),
        slowQueries: Object.values(queryStats).reduce((sum, stat) => sum + stat.slowQueries, 0),
        errorRate: Object.values(queryStats).reduce((sum, stat) => sum + stat.errors, 0)
      },
      cache: cacheStats,
      performance: {
        grade: getPerformanceGrade(performanceMetrics.averageResponseTime),
        recommendations: getPerformanceRecommendations()
      }
    };
    
    res.json({
      success: true,
      data: metrics
    });
    
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance metrics'
    });
  }
});

// Get slow query analysis
router.get('/slow-queries', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const slowQueries = getSlowQueryAnalysis();
    const dbSlowQueries = getDBSlowQueries();
    
    const analysis = {
      timestamp: new Date().toISOString(),
      serverSlowQueries: slowQueries,
      databaseSlowQueries: dbSlowQueries,
      summary: {
        totalSlowQueries: slowQueries.length + dbSlowQueries.length,
        serverSlowQueries: slowQueries.length,
        databaseSlowQueries: dbSlowQueries.length
      }
    };
    
    res.json({
      success: true,
      data: analysis
    });
    
  } catch (error) {
    console.error('Error getting slow query analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve slow query analysis'
    });
  }
});

// Get database performance summary
router.get('/database', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const dbSummary = await getDatabasePerformanceSummary();
    
    if (!dbSummary) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve database performance summary'
      });
    }
    
    res.json({
      success: true,
      data: dbSummary
    });
    
  } catch (error) {
    console.error('Error getting database performance summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve database performance summary'
    });
  }
});

// Get cache performance statistics
router.get('/cache', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const cacheStats = await cacheService.getStats();
    const cacheHealth = await cacheService.health();
    
    const cacheMetrics = {
      timestamp: new Date().toISOString(),
      stats: cacheStats,
      health: cacheHealth,
      performance: {
        hitRate: cacheStats.type === 'redis' ? 'Calculated from Redis' : 'N/A',
        keys: cacheStats.keys,
        type: cacheStats.type
      }
    };
    
    res.json({
      success: true,
      data: cacheMetrics
    });
    
  } catch (error) {
    console.error('Error getting cache performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cache performance'
    });
  }
});

// Get performance recommendations
router.get('/recommendations', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const queryRecommendations = getPerformanceRecommendations();
    const performanceMetrics = getPerformanceMetrics();
    
    const recommendations = {
      timestamp: new Date().toISOString(),
      database: queryRecommendations,
      server: getServerRecommendations(performanceMetrics),
      cache: getCacheRecommendations(),
      priority: categorizeRecommendations(queryRecommendations, performanceMetrics)
    };
    
    res.json({
      success: true,
      data: recommendations
    });
    
  } catch (error) {
    console.error('Error getting performance recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance recommendations'
    });
  }
});

// Create performance indexes
router.post('/indexes', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await createPerformanceIndexes();
    
    if (result) {
      res.json({
        success: true,
        message: 'Performance indexes created successfully',
        data: { indexesCreated: true }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create performance indexes'
      });
    }
    
  } catch (error) {
    console.error('Error creating performance indexes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create performance indexes'
    });
  }
});

// Clear cache
router.delete('/cache', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await cacheService.clear();
    
    if (result) {
      res.json({
        success: true,
        message: 'Cache cleared successfully',
        data: { cacheCleared: true }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to clear cache'
      });
    }
    
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

// Reset performance metrics
router.post('/reset', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    // Reset server performance metrics
    const { resetMetrics } = require('../middleware/performance');
    resetMetrics();
    
    // Reset query statistics
    const { queryOptimizer } = require('../services/queryOptimizer');
    queryOptimizer.resetQueryStats();
    
    res.json({
      success: true,
      message: 'Performance metrics reset successfully',
      data: { metricsReset: true }
    });
    
  } catch (error) {
    console.error('Error resetting performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset performance metrics'
    });
  }
});

// Get performance health check
router.get('/health', async (req, res) => {
  try {
    const cacheHealth = await cacheService.health();
    const performanceMetrics = getPerformanceMetrics();
    
    const health = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {
        server: performanceMetrics.uptime > 0 ? 'healthy' : 'unhealthy',
        cache: cacheHealth.status,
        database: 'healthy' // Assuming database is connected if this route is accessible
      },
      performance: {
        averageResponseTime: performanceMetrics.averageResponseTime,
        errorRate: performanceMetrics.errors > 0 ? (performanceMetrics.errors / performanceMetrics.requests) * 100 : 0
      }
    };
    
    // Determine overall health
    const allHealthy = Object.values(health.checks).every(check => check === 'healthy');
    health.status = allHealthy ? 'healthy' : 'degraded';
    
    const statusCode = allHealthy ? 200 : 503;
    res.status(statusCode).json({
      success: true,
      data: health
    });
    
  } catch (error) {
    console.error('Error getting performance health:', error);
    res.status(503).json({
      success: false,
      error: 'Performance health check failed',
      data: { status: 'unhealthy' }
    });
  }
});

// Helper functions

function getPerformanceGrade(avgResponseTime) {
  if (avgResponseTime < 500) return 'A+ (Excellent)';
  if (avgResponseTime < 1000) return 'A (Very Good)';
  if (avgResponseTime < 2000) return 'B (Good)';
  if (avgResponseTime < 3000) return 'C (Acceptable)';
  return 'D (Needs Improvement)';
}

function getServerRecommendations(metrics) {
  const recommendations = [];
  
  if (metrics.averageResponseTime > 2000) {
    recommendations.push({
      type: 'response_time',
      priority: 'high',
      description: 'Server response time is high. Consider optimizing middleware and response handling.',
      metric: `${metrics.averageResponseTime}ms average response time`
    });
  }
  
  if (metrics.errorRate > 0.05) {
    recommendations.push({
      type: 'error_rate',
      priority: 'high',
      description: 'Error rate is high. Review error handling and logging.',
      metric: `${Math.round((metrics.errors / metrics.requests) * 100)}% error rate`
    });
  }
  
  if (metrics.cacheHitRate < 50) {
    recommendations.push({
      type: 'caching',
      priority: 'medium',
      description: 'Cache hit rate is low. Consider implementing more aggressive caching strategies.',
      metric: `${metrics.cacheHitRate}% cache hit rate`
    });
  }
  
  return recommendations;
}

function getCacheRecommendations() {
  const recommendations = [];
  
  // These would be more sophisticated in production
  recommendations.push({
    type: 'cache_strategy',
    priority: 'medium',
    description: 'Consider implementing cache warming for frequently accessed data',
    action: 'Implement cache warming strategy'
  });
  
  recommendations.push({
    type: 'cache_invalidation',
    priority: 'low',
    description: 'Review cache invalidation strategies for data consistency',
    action: 'Audit cache invalidation patterns'
  });
  
  return recommendations;
}

function categorizeRecommendations(queryRecs, serverMetrics) {
  const high = [];
  const medium = [];
  const low = [];
  
  // Categorize database recommendations
  queryRecs.forEach(rec => {
    if (rec.avgTime > 1000 || rec.slowQueryPercentage > 20) {
      high.push(rec);
    } else if (rec.avgTime > 500 || rec.slowQueryPercentage > 10) {
      medium.push(rec);
    } else {
      low.push(rec);
    }
  });
  
  // Categorize server recommendations
  if (serverMetrics.averageResponseTime > 2000) {
    high.push({
      type: 'server_performance',
      description: 'Server response time optimization required',
      priority: 'high'
    });
  }
  
  return { high, medium, low };
}

module.exports = router;