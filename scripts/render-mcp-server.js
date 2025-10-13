#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server');
// Compatible import path for current @modelcontextprotocol/sdk versions
let StdioServerTransport;
try {
  // Newer SDK path
  ({ StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio'));
} catch (e1) {
  try {
    // Older CJS dist path
    ({ StdioServerTransport } = require('@modelcontextprotocol/sdk/dist/cjs/server/stdio'));
  } catch (e2) {
    // Fallback to root dist if packaging differs
    ({ StdioServerTransport } = require('@modelcontextprotocol/sdk/dist/server/stdio'));
  }
}

// Render API integration
const RENDER_API_TOKEN = process.env.RENDER_API_TOKEN;
const RENDER_API_BASE = 'https://api.render.com/v1';

class RenderMCPServer extends Server {
  constructor() {
    super({
      name: 'render-mcp-server',
      version: '1.0.0',
    });

    this.setRequestHandler('tools/list', this.handleListTools.bind(this));
    this.setRequestHandler('tools/call', this.handleToolCall.bind(this));
  }

  async handleListTools() {
    return {
      tools: [
        {
          name: 'list_render_services',
          description: 'List all Render services for the account',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'get_service_status',
          description: 'Get the status of a specific Render service',
          inputSchema: {
            type: 'object',
            properties: {
              serviceId: {
                type: 'string',
                description: 'The Render service ID'
              }
            },
            required: ['serviceId']
          }
        },
        {
          name: 'deploy_service',
          description: 'Trigger a manual deployment of a Render service',
          inputSchema: {
            type: 'object',
            properties: {
              serviceId: {
                type: 'string',
                description: 'The Render service ID'
              }
            },
            required: ['serviceId']
          }
        },
        {
          name: 'get_service_logs',
          description: 'Get logs for a specific Render service',
          inputSchema: {
            type: 'object',
            properties: {
              serviceId: {
                type: 'string',
                description: 'The Render service ID'
              },
              limit: {
                type: 'number',
                description: 'Number of log entries to retrieve (default: 100)',
                default: 100
              }
            },
            required: ['serviceId']
          }
        },
        {
          name: 'get_service_metrics',
          description: 'Get performance metrics for a specific Render service',
          inputSchema: {
            type: 'object',
            properties: {
              serviceId: {
                type: 'string',
                description: 'The Render service ID'
              }
            },
            required: ['serviceId']
          }
        },
        {
          name: 'update_service_env',
          description: 'Update environment variables for a Render service',
          inputSchema: {
            type: 'object',
            properties: {
              serviceId: {
                type: 'string',
                description: 'The Render service ID'
              },
              envVars: {
                type: 'object',
                description: 'Environment variables to update',
                additionalProperties: {
                  type: 'string'
                }
              }
            },
            required: ['serviceId', 'envVars']
          }
        }
      ]
    };
  }

  async handleToolCall(name, arguments_) {
    switch (name) {
      case 'list_render_services':
        return await this.listRenderServices();
      case 'get_service_status':
        return await this.getServiceStatus(arguments_.serviceId);
      case 'deploy_service':
        return await this.deployService(arguments_.serviceId);
      case 'get_service_logs':
        return await this.getServiceLogs(arguments_.serviceId, arguments_.limit || 100);
      case 'get_service_metrics':
        return await this.getServiceMetrics(arguments_.serviceId);
      case 'update_service_env':
        return await this.updateServiceEnv(arguments_.serviceId, arguments_.envVars);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async listRenderServices() {
    try {
      const response = await fetch(`${RENDER_API_BASE}/services`, {
        headers: {
          'Authorization': `Bearer ${RENDER_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Render API error: ${response.status} ${response.statusText}`);
      }

      const services = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: `Found ${services.length} Render services:\n\n${services.map(service => 
              `- ${service.service.name} (${service.service.id}): ${service.service.status}`
            ).join('\n')}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error listing Render services: ${error.message}`
          }
        ]
      };
    }
  }

  async getServiceStatus(serviceId) {
    try {
      const response = await fetch(`${RENDER_API_BASE}/services/${serviceId}`, {
        headers: {
          'Authorization': `Bearer ${RENDER_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Render API error: ${response.status} ${response.statusText}`);
      }

      const service = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: `Service: ${service.service.name}\nStatus: ${service.service.status}\nURL: ${service.service.serviceDetails?.url || 'N/A'}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting service status: ${error.message}`
          }
        ]
      };
    }
  }

  async deployService(serviceId) {
    try {
      const response = await fetch(`${RENDER_API_BASE}/services/${serviceId}/deploys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RENDER_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clearCache: 'do_not_clear'
        })
      });

      if (!response.ok) {
        throw new Error(`Render API error: ${response.status} ${response.statusText}`);
      }

      const deploy = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: `Deployment triggered successfully!\nDeploy ID: ${deploy.deploy.id}\nStatus: ${deploy.deploy.status}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error triggering deployment: ${error.message}`
          }
        ]
      };
    }
  }

  async getServiceLogs(serviceId, limit = 100) {
    try {
      const response = await fetch(`${RENDER_API_BASE}/services/${serviceId}/logs?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${RENDER_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Render API error: ${response.status} ${response.statusText}`);
      }

      const logs = await response.json();
      const logEntries = logs.logs?.map(log => 
        `[${log.timestamp}] ${log.level}: ${log.message}`
      ).join('\n') || 'No logs available';

      return {
        content: [
          {
            type: 'text',
            text: `Service Logs (${serviceId}):\n\n${logEntries}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting service logs: ${error.message}`
          }
        ]
      };
    }
  }

  async getServiceMetrics(serviceId) {
    try {
      const response = await fetch(`${RENDER_API_BASE}/services/${serviceId}/metrics`, {
        headers: {
          'Authorization': `Bearer ${RENDER_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Render API error: ${response.status} ${response.statusText}`);
      }

      const metrics = await response.json();
      const metricsText = metrics.metrics ? 
        Object.entries(metrics.metrics).map(([key, value]) => 
          `${key}: ${value}`
        ).join('\n') : 'No metrics available';

      return {
        content: [
          {
            type: 'text',
            text: `Service Metrics (${serviceId}):\n\n${metricsText}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting service metrics: ${error.message}`
          }
        ]
      };
    }
  }

  async updateServiceEnv(serviceId, envVars) {
    try {
      const response = await fetch(`${RENDER_API_BASE}/services/${serviceId}/env-vars`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${RENDER_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          envVars: Object.entries(envVars).map(([key, value]) => ({
            key,
            value
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Render API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: `Environment variables updated successfully for service ${serviceId}!\nUpdated variables: ${Object.keys(envVars).join(', ')}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating environment variables: ${error.message}`
          }
        ]
      };
    }
  }
}

async function main() {
  const server = new RenderMCPServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Render MCP Server started');
}

if (require.main === module) {
  main().catch(console.error);
}
