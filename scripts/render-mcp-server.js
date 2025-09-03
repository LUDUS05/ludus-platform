#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio');

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
