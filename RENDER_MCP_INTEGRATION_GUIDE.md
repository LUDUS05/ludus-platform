# Render MCP Integration Guide

## Overview

The LUDUS platform now includes a comprehensive Render MCP (Model Context Protocol) integration that allows AI agents and administrators to interact with Render services through a standardized interface. This integration provides both a standalone MCP server and REST API endpoints for managing Render deployments.

## Features

### 🔧 Core Functionality
- **Service Management**: List, monitor, and manage Render services
- **Deployment Control**: Trigger manual deployments and view deployment history
- **Log Access**: Retrieve service logs for debugging and monitoring
- **Metrics Monitoring**: Access performance metrics and service health data
- **Environment Management**: Update service environment variables
- **Health Monitoring**: Comprehensive health checks and status reporting

### 🛡️ Security Features
- **Authentication Required**: All endpoints require valid JWT authentication
- **Role-Based Access**: Admin and super_admin roles only
- **API Key Protection**: Secure Render API token handling
- **Input Validation**: Comprehensive request validation and sanitization

## Architecture

### Components

1. **Standalone MCP Server** (`scripts/render-mcp-server.js`)
   - Model Context Protocol compliant server
   - Direct integration with Render API
   - Tool-based interface for AI agents

2. **REST API Integration** (`server/src/controllers/renderMCPController.js`)
   - Express.js controller with full CRUD operations
   - Integrated with LUDUS authentication system
   - Comprehensive error handling and logging

3. **API Routes** (`server/src/routes/renderMCP.js`)
   - RESTful endpoint definitions
   - Middleware integration (auth, RBAC)
   - Request validation and sanitization

## API Endpoints

### Base URL: `/api/render-mcp`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check for Render API connectivity | ✅ Admin |
| GET | `/services` | List all Render services | ✅ Admin |
| GET | `/services/:serviceId` | Get specific service status | ✅ Admin |
| POST | `/services/:serviceId/deploy` | Trigger deployment | ✅ Admin |
| GET | `/services/:serviceId/logs` | Get service logs | ✅ Admin |
| GET | `/services/:serviceId/metrics` | Get service metrics | ✅ Admin |
| PATCH | `/services/:serviceId/env-vars` | Update environment variables | ✅ Admin |
| GET | `/services/:serviceId/deploys` | Get deployment history | ✅ Admin |

### Request/Response Examples

#### List Services
```bash
GET /api/render-mcp/services
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "srv-d2v0ehje5dus73f7amu0",
        "name": "ludus-frontend",
        "status": "live",
        "url": "https://app.letsludus.com",
        "type": "web_service",
        "region": "oregon",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 1
  }
}
```

#### Trigger Deployment
```bash
POST /api/render-mcp/services/srv-d2v0ehje5dus73f7amu0/deploy
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "clearCache": "do_not_clear"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "deployId": "dpl-abc123",
    "status": "building",
    "commit": "abc123def456",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "Deployment triggered successfully"
}
```

#### Update Environment Variables
```bash
PATCH /api/render-mcp/services/srv-d2v0ehje5d7amu0/env-vars
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "envVars": {
    "NODE_ENV": "production",
    "API_URL": "https://api.letsludus.com"
  }
}
```

## MCP Server Usage

### Standalone MCP Server

The standalone MCP server can be used with AI agents that support the Model Context Protocol:

```bash
# Start the MCP server
RENDER_API_TOKEN=rnd_AjWyMGFA2vmtx6KidKj4TPVLZwpU node scripts/render-mcp-server.js
```

### Available MCP Tools

1. **list_render_services**: List all Render services
2. **get_service_status**: Get status of a specific service
3. **deploy_service**: Trigger manual deployment
4. **get_service_logs**: Retrieve service logs
5. **get_service_metrics**: Get performance metrics
6. **update_service_env**: Update environment variables

### MCP Tool Example

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_render_services",
    "arguments": {}
  }
}
```

## Configuration

### Environment Variables

```bash
# Required: Render API Token
RENDER_API_TOKEN=rnd_AjWyMGFA2vmtx6KidKj4TPVLZwpU

# Optional: API timeout (default: 30000ms)
RENDER_API_TIMEOUT=30000
```

### Dependencies

The following packages are required:

```json
{
  "@modelcontextprotocol/sdk": "^0.5.0",
  "axios": "^1.11.0"
}
```

## Testing

### Automated Tests

Run the comprehensive test suite:

```bash
# Test API endpoints
node test-render-mcp.js

# Test basic API connectivity
node test-render-api-simple.js
```

### Manual Testing

1. **Health Check**:
   ```bash
   curl -H "Authorization: Bearer <token>" \
        http://localhost:5000/api/render-mcp/health
   ```

2. **List Services**:
   ```bash
   curl -H "Authorization: Bearer <token>" \
        http://localhost:5000/api/render-mcp/services
   ```

3. **Get Service Status**:
   ```bash
   curl -H "Authorization: Bearer <token>" \
        http://localhost:5000/api/render-mcp/services/srv-d2v0ehje5dus73f7amu0
   ```

## Deployment

### Render Environment Variables

Add the following environment variables to your Render services:

```bash
RENDER_API_TOKEN=rnd_AjWyMGFA2vmtx6KidKj4TPVLZwpU
```

### Production Considerations

1. **Security**: Ensure the Render API token is properly secured
2. **Rate Limiting**: Monitor API usage to avoid rate limits
3. **Error Handling**: Implement proper error handling and logging
4. **Monitoring**: Set up alerts for failed deployments and API errors

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Verify JWT token is valid and not expired
   - Ensure user has admin or super_admin role

2. **API Connection Errors**:
   - Check Render API token validity
   - Verify network connectivity to api.render.com

3. **Service Not Found**:
   - Verify service ID is correct
   - Check if service exists in your Render account

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=render-mcp:*
```

## Security Considerations

1. **API Token Security**:
   - Store Render API token securely
   - Rotate tokens regularly
   - Never commit tokens to version control

2. **Access Control**:
   - Only admin users can access Render MCP endpoints
   - Implement proper role-based access control
   - Monitor access logs for suspicious activity

3. **Input Validation**:
   - All inputs are validated and sanitized
   - Environment variable updates are restricted
   - Service IDs are validated before API calls

## Performance Optimization

1. **Caching**: Implement caching for frequently accessed data
2. **Rate Limiting**: Respect Render API rate limits
3. **Connection Pooling**: Use connection pooling for API requests
4. **Async Operations**: All operations are asynchronous for better performance

## Monitoring and Alerting

### Key Metrics to Monitor

1. **API Response Times**: Monitor Render API response times
2. **Error Rates**: Track failed API calls and deployments
3. **Service Health**: Monitor service status and availability
4. **Deployment Success**: Track deployment success rates

### Recommended Alerts

1. **High Error Rate**: Alert when error rate exceeds 5%
2. **Failed Deployments**: Alert on deployment failures
3. **Service Down**: Alert when services go offline
4. **API Rate Limit**: Alert when approaching rate limits

## Future Enhancements

1. **Webhook Integration**: Support for Render webhooks
2. **Advanced Metrics**: More detailed performance metrics
3. **Bulk Operations**: Support for bulk service operations
4. **Service Templates**: Template-based service creation
5. **Cost Monitoring**: Integration with Render billing API

## Support

For issues or questions regarding the Render MCP integration:

1. Check the troubleshooting section above
2. Review the test scripts for examples
3. Check Render API documentation: https://render.com/docs/api
4. Contact the development team

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Compatibility**: Node.js 18+, Render API v1
