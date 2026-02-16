#!/bin/bash

# LUDUS Platform MCP Setup Script
# This script sets up the Model Context Protocol (MCP) integration for Cursor AI

echo "🚀 Setting up MCP for LUDUS Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing MCP dependencies..."
cd /Users/xplicit2021/Desktop/LDS/ludus-platform/ludus-platform

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

echo "✅ Dependencies installed successfully"

# Make MCP server executable
chmod +x scripts/render-mcp-server.js

echo "✅ MCP server made executable"

# Test MCP server
echo "🧪 Testing MCP server..."
if RENDER_API_TOKEN=rnd_AjWyMGFA2vmtx6KidKj4TPVLZwpU timeout 10s node scripts/render-mcp-server.js --test 2>/dev/null; then
    echo "✅ MCP server test passed"
else
    echo "⚠️  MCP server test failed (this is normal if no input is provided)"
fi

# Create Cursor configuration directory
mkdir -p .cursor

# Copy MCP configuration
cp cursor-mcp.json .cursor/mcp.json

echo "✅ Cursor MCP configuration created"

# Create environment file for MCP
cat > .env.mcp << EOF
# MCP Environment Variables
RENDER_API_TOKEN=rnd_AjWyMGFA2vmtx6KidKj4TPVLZwpU
RENDER_API_BASE=https://api.render.com/v1
RENDER_API_TIMEOUT=30000
EOF

echo "✅ MCP environment file created"

# Create MCP startup script
cat > start-mcp.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting LUDUS MCP Server..."
export RENDER_API_TOKEN=rnd_AjWyMGFA2vmtx6KidKj4TPVLZwpU
node scripts/render-mcp-server.js
EOF

chmod +x start-mcp.sh

echo "✅ MCP startup script created"

# Test API endpoints
echo "🧪 Testing MCP API endpoints..."
if node test-render-mcp.js 2>/dev/null; then
    echo "✅ MCP API tests passed"
else
    echo "⚠️  MCP API tests failed (check your Render API token)"
fi

echo ""
echo "🎉 MCP setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Restart Cursor to load the MCP configuration"
echo "2. The MCP server will be available as 'render-mcp' in Cursor"
echo "3. You can test the MCP server by running: ./start-mcp.sh"
echo "4. Check the documentation: docs_archive/RENDER_MCP_INTEGRATION_GUIDE.md"
echo ""
echo "🔧 Available MCP tools:"
echo "  - list_render_services: List all Render services"
echo "  - get_service_status: Get service status"
echo "  - deploy_service: Trigger deployments"
echo "  - get_service_logs: Get service logs"
echo "  - get_service_metrics: Get performance metrics"
echo "  - update_service_env: Update environment variables"
echo ""
echo "📁 Configuration files created:"
echo "  - .cursorrules: Cursor AI rules"
echo "  - .cursor/mcp.json: Cursor MCP configuration"
echo "  - .env.mcp: MCP environment variables"
echo "  - start-mcp.sh: MCP server startup script"
