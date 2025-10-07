# LUDUS Platform MCP Usage Guide

## Overview

The LUDUS platform includes a comprehensive Model Context Protocol (MCP) integration that allows AI agents and developers to interact with Render services through a standardized interface. This guide explains how to use the MCP tools effectively.

## Quick Start

### 1. Setup MCP
```bash
# Run the setup script
./setup-mcp.sh

# Or manually start the MCP server
RENDER_API_TOKEN=rnd_AjWyMGFA2vmtx6KidKj4TPVLZwpU node scripts/render-mcp-server.js
```

### 2. Restart Cursor
After running the setup script, restart Cursor to load the MCP configuration.

### 3. Use MCP Tools
The MCP tools will be available in Cursor's tool palette. Look for tools prefixed with "render-mcp".

## Available MCP Tools

### 1. List Render Services
**Tool**: `list_render_services`
**Description**: Lists all Render services in your account
**Parameters**: None
**Example**:
```json
{
  "name": "list_render_services",
  "arguments": {}
}
```

### 2. Get Service Status
**Tool**: `get_service_status`
**Description**: Get detailed status of a specific Render service
**Parameters**:
- `serviceId` (string): The Render service ID
**Example**:
```json
{
  "name": "get_service_status",
  "arguments": {
    "serviceId": "srv-d2v0ehje5dus73f7amu0"
  }
}
```

### 3. Deploy Service
**Tool**: `deploy_service`
**Description**: Trigger a manual deployment of a Render service
**Parameters**:
- `serviceId` (string): The Render service ID
**Example**:
```json
{
  "name": "deploy_service",
  "arguments": {
    "serviceId": "srv-d2v0ehje5dus73f7amu0"
  }
}
```

### 4. Get Service Logs
**Tool**: `get_service_logs`
**Description**: Retrieve logs for a specific Render service
**Parameters**:
- `serviceId` (string): The Render service ID
- `limit` (number, optional): Number of log entries (default: 100)
**Example**:
```json
{
  "name": "get_service_logs",
  "arguments": {
    "serviceId": "srv-d2v0ehje5dus73f7amu0",
    "limit": 50
  }
}
```

### 5. Get Service Metrics
**Tool**: `get_service_metrics`
**Description**: Get performance metrics for a Render service
**Parameters**:
- `serviceId` (string): The Render service ID
**Example**:
```json
{
  "name": "get_service_metrics",
  "arguments": {
    "serviceId": "srv-d2v0ehje5dus73f7amu0"
  }
}
```

### 6. Update Service Environment
**Tool**: `update_service_env`
**Description**: Update environment variables for a Render service
**Parameters**:
- `serviceId` (string): The Render service ID
- `envVars` (object): Environment variables to update
**Example**:
```json
{
  "name": "update_service_env",
  "arguments": {
    "serviceId": "srv-d2v0ehje5dus73f7amu0",
    "envVars": {
      "NODE_ENV": "production",
      "API_URL": "https://api.letsludus.com"
    }
  }
}
```

## Common Use Cases

### 1. Check All Services Status
```bash
# Use the list_render_services tool to see all services
# Then use get_service_status for each service you want to check
```

### 2. Deploy a Service
```bash
# First get the service ID from list_render_services
# Then use deploy_service with the service ID
```

### 3. Debug a Service
```bash
# Use get_service_logs to see recent logs
# Use get_service_metrics to check performance
# Use get_service_status to see current state
```

### 4. Update Environment Variables
```bash
# Use update_service_env to modify environment variables
# This is useful for configuration changes without code deployment
```

## Error Handling

The MCP tools include comprehensive error handling:

- **Authentication Errors**: Check your Render API token
- **Service Not Found**: Verify the service ID is correct
- **API Rate Limits**: Wait before making additional requests
- **Network Errors**: Check your internet connection

## Best Practices

### 1. Always Check Service Status First
Before performing operations, check the service status to ensure it's in a good state.

### 2. Monitor Logs During Deployments
Use the logs tool to monitor deployment progress and catch any issues early.

### 3. Use Metrics for Performance Monitoring
Regularly check service metrics to ensure optimal performance.

### 4. Test Environment Changes
When updating environment variables, test the changes in a staging environment first.

## Troubleshooting

### MCP Server Not Starting
1. Check if Node.js 18+ is installed
2. Verify the RENDER_API_TOKEN is set correctly
3. Check if the MCP SDK is installed: `npm list @modelcontextprotocol/sdk`

### Tools Not Available in Cursor
1. Restart Cursor after running the setup script
2. Check if `.cursor/mcp.json` exists
3. Verify the MCP server is running

### API Errors
1. Check your Render API token validity
2. Verify service IDs are correct
3. Check Render API status page for outages

## Configuration Files

### `.cursorrules`
Contains Cursor AI rules and MCP tool descriptions.

### `.cursor/mcp.json`
Cursor MCP server configuration.

### `.env.mcp`
Environment variables for MCP server.

### `start-mcp.sh`
Script to start the MCP server manually.

## API Integration

The MCP tools also work through REST API endpoints:

- **Base URL**: `/api/render-mcp`
- **Authentication**: JWT token required
- **Role**: Admin or Super Admin only

### Example API Usage
```bash
# List services
curl -H "Authorization: Bearer <token>" \
     http://localhost:5000/api/render-mcp/services

# Deploy service
curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     http://localhost:5000/api/render-mcp/services/srv-123/deploy
```

## Security Considerations

1. **API Token Security**: Keep your Render API token secure
2. **Access Control**: Only admin users can use MCP tools
3. **Input Validation**: All inputs are validated and sanitized
4. **Rate Limiting**: Respect Render API rate limits

## Performance Tips

1. **Use Appropriate Limits**: Don't request more logs than needed
2. **Cache Results**: Cache service lists and status when possible
3. **Batch Operations**: Group related operations together
4. **Monitor Usage**: Keep track of API usage to avoid limits

## Support

For issues or questions:

1. Check this guide first
2. Review the test scripts: `test-render-mcp.js`
3. Check Render API documentation
4. Contact the development team

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Compatibility**: Cursor AI, Node.js 18+, Render API v1
