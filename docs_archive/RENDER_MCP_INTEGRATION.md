# Render MCP Integration for Cursor AI

## Overview
This project now includes a complete Model Context Protocol (MCP) integration with Render, allowing Cursor AI to directly interact with your Render services.

## What's Included

### 1. MCP Configuration (`.cursor/mcp.json`)
- **Git MCP Server**: Full Git operations through AI
- **Sequential Thinking Server**: Advanced problem-solving capabilities
- **Custom Render Server**: Direct Render API integration

### 2. Custom Render MCP Server (`scripts/render-mcp-server.js`)
- **List Render Services**: View all your Render services
- **Get Service Status**: Check individual service health
- **Deploy Service**: Trigger manual deployments

## Setup Instructions

### 1. Environment Variables
```bash
export RENDER_API_TOKEN=rnd_oyTExRtWHAK8ECwOG4TTrfI1VVFl
```

### 2. Restart Cursor
After setting the environment variable, restart Cursor to activate the MCP servers.

### 3. Available MCP Tools

#### Render Integration
- `list_render_services` - List all Render services
- `get_service_status <serviceId>` - Check service status
- `deploy_service <serviceId>` - Trigger deployment

#### Git Operations
- Full Git workflow management through AI
- Commit, push, branch, merge operations

#### Advanced AI
- Sequential thinking for complex problem solving
- Step-by-step reasoning capabilities

## Usage Examples

### List All Render Services
```
Use the list_render_services tool to see all my Render services
```

### Check Service Status
```
Check the status of my frontend service using get_service_status
```

### Deploy a Service
```
Trigger a manual deployment of my backend service
```

## API Token Security
- Your Render API token is stored in the MCP configuration
- The token provides read/write access to your Render account
- Keep this token secure and don't share it publicly

## Troubleshooting

### MCP Server Not Starting
1. Check if `RENDER_API_TOKEN` is set
2. Verify the token is valid
3. Restart Cursor after setting environment variables

### API Errors
1. Verify your Render API token has the correct permissions
2. Check if the service IDs are correct
3. Ensure your Render account is active

## Next Steps
1. Set the `RENDER_API_TOKEN` environment variable
2. Restart Cursor
3. Start using AI-powered Render management!

## Support
For issues with the MCP integration, check:
- Cursor MCP documentation
- Render API documentation
- MCP protocol specifications
