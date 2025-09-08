const axios = require('axios');

// Render API configuration
const RENDER_API_TOKEN = process.env.RENDER_API_TOKEN || 'rnd_AjWyMGFA2vmtx6KidKj4TPVLZwpU';
const RENDER_API_BASE = 'https://api.render.com/v1';

class RenderMCPController {
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

  // List all Render services
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

  // Get service status
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

  // Trigger deployment
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

  // Get service logs
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

  // Get service metrics
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

  // Update service environment variables
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

  // Get deployment history
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

  // Health check for Render MCP
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
