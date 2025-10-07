/**
 * @fileoverview Health check endpoints for LUDUS platform monitoring.
 * 
 * Purpose: Provides health check endpoints for monitoring database connectivity,
 * API performance, and overall system health for the LUDUS platform.
 * 
 * Business Context: Critical for production monitoring and alerting systems.
 * These endpoints are used by monitoring tools, load balancers, and DevOps
 * teams to ensure platform availability and performance.
 * 
 * Implementation Notes:
 * - Database health checks
 * - API performance metrics
 * - System resource monitoring
 * - Graceful error handling
 * - Comprehensive logging
 * 
 * Dependencies:
 * - Database connection health
 * - System performance metrics
 * - Error tracking services
 * 
 * Evolution: Created for production monitoring and health checks
 * with comprehensive metrics and alerting support.
 * 
 * @version 1.0.0
 * @since 2025-10-06
 * @modified 2025-10-06 - Initial implementation for LDS-005
 */

const express = require('express');
const router = express.Router();
const { healthCheck: dbHealthCheck } = require('../config/database');
const { getConnectionState } = require('../config/mongodb-atlas');

/**
 * Basic health check endpoint.
 * 
 * Purpose: Provides a simple health check for load balancers and
 * basic monitoring systems.
 * 
 * @route GET /health
 * @returns {Object} Basic health status
 */
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Basic system health
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      responseTime: Date.now() - startTime
    };

    res.status(200).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * Database health check endpoint.
 * 
 * Purpose: Provides detailed database health information including
 * connection status, performance metrics, and error rates.
 * 
 * @route GET /health/database
 * @returns {Object} Database health status and metrics
 */
router.get('/database', async (req, res) => {
  try {
    const dbHealth = await dbHealthCheck();
    const connectionState = getConnectionState();
    
    const response = {
      ...dbHealth,
      connectionState,
      timestamp: new Date().toISOString()
    };

    const statusCode = dbHealth.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(response);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      message: 'Database health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Detailed system health check endpoint.
 * 
 * Purpose: Provides comprehensive system health information including
 * database, memory, CPU, and performance metrics.
 * 
 * @route GET /health/detailed
 * @returns {Object} Detailed system health status
 */
router.get('/detailed', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Database health
    const dbHealth = await dbHealthCheck();
    const connectionState = getConnectionState();
    
    // System metrics
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Performance metrics
    const performance = {
      responseTime: Date.now() - startTime,
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        usage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100) // %
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    };

    const health = {
      status: dbHealth.status === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      connectionState,
      performance,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT || 5000
      }
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      message: 'Detailed health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Readiness check endpoint.
 * 
 * Purpose: Indicates if the service is ready to accept traffic.
 * Used by Kubernetes and other orchestration systems.
 * 
 * @route GET /health/ready
 * @returns {Object} Readiness status
 */
router.get('/ready', async (req, res) => {
  try {
    const dbHealth = await dbHealthCheck();
    
    if (dbHealth.status === 'healthy') {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        reason: 'Database not healthy',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      reason: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Liveness check endpoint.
 * 
 * Purpose: Indicates if the service is alive and running.
 * Used by Kubernetes and other orchestration systems.
 * 
 * @route GET /health/live
 * @returns {Object} Liveness status
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Metrics endpoint for monitoring systems.
 * 
 * Purpose: Provides metrics in a format suitable for monitoring
 * systems like Prometheus or DataDog.
 * 
 * @route GET /health/metrics
 * @returns {Object} System metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const connectionState = getConnectionState();
    const memoryUsage = process.memoryUsage();
    
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external
      },
      database: {
        connected: connectionState.isConnected,
        connectionCount: connectionState.connectionCount,
        errorCount: connectionState.errorCount,
        slowQueries: connectionState.slowQueries,
        uptime: connectionState.uptime
      },
      performance: {
        responseTime: Date.now() - req.startTime || 0
      }
    };

    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to collect metrics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
