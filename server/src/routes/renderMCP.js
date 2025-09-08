const express = require('express');
const router = express.Router();
const renderMCPController = require('../controllers/renderMCPController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Apply authentication to all routes
router.use(authenticateToken);

// Apply admin role requirement to all routes
router.use(requireRole(['admin', 'super_admin']));

/**
 * @route GET /api/render-mcp/health
 * @desc Health check for Render MCP API connectivity
 * @access Admin only
 */
router.get('/health', renderMCPController.healthCheck);

/**
 * @route GET /api/render-mcp/services
 * @desc List all Render services
 * @access Admin only
 */
router.get('/services', renderMCPController.listServices);

/**
 * @route GET /api/render-mcp/services/:serviceId
 * @desc Get specific service status
 * @access Admin only
 */
router.get('/services/:serviceId', renderMCPController.getServiceStatus);

/**
 * @route POST /api/render-mcp/services/:serviceId/deploy
 * @desc Trigger deployment for a service
 * @access Admin only
 */
router.post('/services/:serviceId/deploy', renderMCPController.deployService);

/**
 * @route GET /api/render-mcp/services/:serviceId/logs
 * @desc Get service logs
 * @access Admin only
 * @query limit - Number of log entries to retrieve (default: 100)
 */
router.get('/services/:serviceId/logs', renderMCPController.getServiceLogs);

/**
 * @route GET /api/render-mcp/services/:serviceId/metrics
 * @desc Get service performance metrics
 * @access Admin only
 */
router.get('/services/:serviceId/metrics', renderMCPController.getServiceMetrics);

/**
 * @route PATCH /api/render-mcp/services/:serviceId/env-vars
 * @desc Update service environment variables
 * @access Admin only
 * @body { envVars: { key: value } }
 */
router.patch('/services/:serviceId/env-vars', renderMCPController.updateServiceEnv);

/**
 * @route GET /api/render-mcp/services/:serviceId/deploys
 * @desc Get deployment history for a service
 * @access Admin only
 * @query limit - Number of deployments to retrieve (default: 10)
 */
router.get('/services/:serviceId/deploys', renderMCPController.getDeploymentHistory);

module.exports = router;
