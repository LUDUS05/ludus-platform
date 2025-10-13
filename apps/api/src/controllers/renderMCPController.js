/**
 * @fileoverview Render MCP (Model Context Protocol) Controller for LUDUS platform.
 * 
 * This controller provides comprehensive integration with Render's API for managing
 * services, deployments, logs, metrics, and environment variables. It serves as
 * the backend interface for AI agents to interact with Render services.
 * 
 * Key Features:
 * - Service listing and status monitoring
 * - Deployment triggering and history tracking
 * - Log retrieval and analysis
 * - Performance metrics collection
 * - Environment variable management
 * - Health monitoring and status checks
 * - Error handling and response formatting
 * 
 * @module controllers/renderMCPController
 * @version 1.0.0
 * @author LUDUS Development Team
 * @since 2025-01-01
 * @see {@link https://api.render.com/v1} Render API Documentation
 */

const axios = require('axios');

// Render API configuration
const RENDER_API_TOKEN = process.env.RENDER_API_TOKEN;
const RENDER_API_BASE = 'https://api.render.com/v1';

/**
 * Render MCP Controller class for managing Render services.
 * 
 * Provides a comprehensive interface for AI agents to interact with Render
 * services through the Model Context Protocol. Handles service management,
 * deployment operations, monitoring, and configuration.
 * 
 * @class RenderMCPController
 * @version 1.0.0
 */
class RenderMCPController {
  /**
   * Creates an instance of RenderMCPController.
   */
  constructor() {
    this.apiClient = axios.create({
      baseURL: RENDER_API_BASE,
      headers: {
        'Authorization': `Bearer ${RENDER_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * List all Render services for the authenticated account.
   * 
   * Retrieves a comprehensive list of all services associated with the Render
   * account, including their status, URLs, types, and metadata. This endpoint
   * is used by AI agents to get an overview of the deployment infrastructure.
   * 
   * @async
   * @method listServices
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @returns {Promise<void>} JSON response with services list
   * 
   * @example
   * GET /api/render-mcp/services
   * 
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "services": [...],
   *     "total": 5
   *   }
   * }
   */
  async listServices(req, res) {
    try {
      const response = await this.apiClient.get('/services');
      const services = response.data;

      res.json({
        success: true,
        data: {
          services: services.map(service => ({
            id: service.service.id,
            name: service.service.name,
            status: service.service.status,
            url: service.service.serviceDetails?.url || null,
            type: service.service.type,
            region: service.service.region,
            createdAt: service.service.createdAt,
            updatedAt: service.service.updatedAt
          })),
          total: services.length
        }
      });
    } catch (error) {
      console.error('Error listing Render services:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list Render services',
        details: error.response?.data || error.message
      });
    }
  }

  /**
   * Get the status of a specific service.
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @returns {Promise<void>}
   */
  async getServiceStatus(req, res) {
    try {
      const { serviceId } = req.params;
      
      if (!serviceId) {
        return res.status(400).json({
          success: false,
          error: 'Service ID is required'
        });
      }

      const response = await this.apiClient.get(`/services/${serviceId}`);
      const service = response.data;

      res.json({
        success: true,
        data: {
          id: service.service.id,
          name: service.service.name,
          status: service.service.status,
          url: service.service.serviceDetails?.url || null,
          type: service.service.type,
          region: service.service.region,
          createdAt: service.service.createdAt,
          updatedAt: service.service.updatedAt,
          lastDeploy: service.service.lastDeploy
        }
      });
    } catch (error) {
      console.error('Error getting service status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get service status',
        details: error.response?.data || error.message
      });
    }
  }

  /**
   * Trigger a new deployment for a service.
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @returns {Promise<void>}
   */
  async deployService(req, res) {
    try {
      const { serviceId } = req.params;
      const { clearCache = 'do_not_clear' } = req.body;
      
      if (!serviceId) {
        return res.status(400).json({
          success: false,
          error: 'Service ID is required'
        });
      }

      const response = await this.apiClient.post(`/services/${serviceId}/deploys`, {
        clearCache
      });

      const deploy = response.data;

      res.json({
        success: true,
        data: {
          deployId: deploy.deploy.id,
          status: deploy.deploy.status,
          commit: deploy.deploy.commit,
          createdAt: deploy.deploy.createdAt
        },
        message: 'Deployment triggered successfully'
      });
    } catch (error) {
      console.error('Error triggering deployment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to trigger deployment',
        details: error.response?.data || error.message
      });
    }
  }

  /**
   * Get the logs for a specific service.
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @returns {Promise<void>}
   */
  async getServiceLogs(req, res) {
    try {
      const { serviceId } = req.params;
      const { limit = 100 } = req.query;
      
      if (!serviceId) {
        return res.status(400).json({
          success: false,
          error: 'Service ID is required'
        });
      }

      const response = await this.apiClient.get(`/services/${serviceId}/logs`, {
        params: { limit: parseInt(limit) }
      });

      const logs = response.data;

      res.json({
        success: true,
        data: {
          serviceId,
          logs: logs.logs || [],
          total: logs.logs?.length || 0
        }
      });
    } catch (error) {
      console.error('Error getting service logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get service logs',
        details: error.response?.data || error.message
      });
    }
  }

  /**
   * Get metrics for a specific service.
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @returns {Promise<void>}
   */
  async getServiceMetrics(req, res) {
    try {
      const { serviceId } = req.params;
      
      if (!serviceId) {
        return res.status(400).json({
          success: false,
          error: 'Service ID is required'
        });
      }

      const response = await this.apiClient.get(`/services/${serviceId}/metrics`);
      const metrics = response.data;

      res.json({
        success: true,
        data: {
          serviceId,
          metrics: metrics.metrics || {},
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting service metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get service metrics',
        details: error.response?.data || error.message
      });
    }
  }

  /**
   * Update environment variables for a service.
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @returns {Promise<void>}
   */
  async updateServiceEnv(req, res) {
    try {
      const { serviceId } = req.params;
      const { envVars } = req.body;
      
      if (!serviceId) {
        return res.status(400).json({
          success: false,
          error: 'Service ID is required'
        });
      }

      if (!envVars || typeof envVars !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Environment variables object is required'
        });
      }

      const envVarsArray = Object.entries(envVars).map(([key, value]) => ({
        key,
        value: String(value)
      }));

      const response = await this.apiClient.patch(`/services/${serviceId}/env-vars`, {
        envVars: envVarsArray
      });

      res.json({
        success: true,
        data: {
          serviceId,
          updatedVars: Object.keys(envVars),
          total: envVarsArray.length
        },
        message: 'Environment variables updated successfully'
      });
    } catch (error) {
      console.error('Error updating environment variables:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update environment variables',
        details: error.response?.data || error.message
      });
    }
  }

  /**
   * Get the deployment history for a service.
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @returns {Promise<void>}
   */
  async getDeploymentHistory(req, res) {
    try {
      const { serviceId } = req.params;
      const { limit = 10 } = req.query;
      
      if (!serviceId) {
        return res.status(400).json({
          success: false,
          error: 'Service ID is required'
        });
      }

      const response = await this.apiClient.get(`/services/${serviceId}/deploys`, {
        params: { limit: parseInt(limit) }
      });

      const deploys = response.data;

      res.json({
        success: true,
        data: {
          serviceId,
          deploys: deploys.deploys || [],
          total: deploys.deploys?.length || 0
        }
      });
    } catch (error) {
      console.error('Error getting deployment history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get deployment history',
        details: error.response?.data || error.message
      });
    }
  }

  /**
   * Health check for the Render MCP.
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @returns {Promise<void>}
   */
  async healthCheck(req, res) {
    try {
      // Test API connectivity
      const response = await this.apiClient.get('/services', {
        params: { limit: 1 }
      });

      res.json({
        success: true,
        data: {
          status: 'healthy',
          apiConnected: true,
          timestamp: new Date().toISOString(),
          servicesCount: response.data.length
        }
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        data: {
          status: 'unhealthy',
          apiConnected: false,
          timestamp: new Date().toISOString()
        },
        error: 'Render API connection failed',
        details: error.message
      });
    }
  }
}

module.exports = new RenderMCPController();
