#!/bin/bash

echo "🚀 Installing MCP Dependencies..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install @modelcontextprotocol/sdk axios

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install @modelcontextprotocol/sdk
cd ..

echo "✅ Dependencies installed!"

# Test the installation
echo "🧪 Testing MCP installation..."
node test-mcp-simple.js

echo ""
echo "🎉 MCP setup complete!"
echo "📋 Next steps:"
echo "1. Restart Cursor"
echo "2. Look for 'render-mcp' tools in Cursor"
echo "3. Test with: ./start-mcp.sh"
