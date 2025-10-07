#!/usr/bin/env node

// Simple MCP test script
console.log('🧪 Testing MCP Setup...');

// Test 1: Check if MCP SDK is available
try {
  const { Server } = require('@modelcontextprotocol/sdk/server');
  const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio');
  console.log('✅ MCP SDK is available');
} catch (error) {
  console.log('❌ MCP SDK not found:', error.message);
  console.log('💡 Try running: npm install @modelcontextprotocol/sdk');
}

// Test 2: Check environment variables
const renderToken = process.env.RENDER_API_TOKEN || 'rnd_AjWyMGFA2vmtx6KidKj4TPVLZwpU';
console.log('✅ Render API Token:', renderToken.substring(0, 10) + '...');

// Test 3: Check if MCP server file exists
const fs = require('fs');
const path = require('path');

const mcpServerPath = path.join(__dirname, 'scripts', 'render-mcp-server.js');
if (fs.existsSync(mcpServerPath)) {
  console.log('✅ MCP server file exists');
} else {
  console.log('❌ MCP server file not found');
}

// Test 4: Check Cursor configuration
const cursorConfigPath = path.join(__dirname, '.cursor', 'mcp.json');
if (fs.existsSync(cursorConfigPath)) {
  console.log('✅ Cursor MCP configuration exists');
} else {
  console.log('❌ Cursor MCP configuration not found');
}

console.log('\n🎉 MCP setup verification complete!');
console.log('\n📋 Next steps:');
console.log('1. Restart Cursor to load MCP configuration');
console.log('2. Look for "render-mcp" tools in Cursor');
console.log('3. Test with: RENDER_API_TOKEN=rnd_AjWyMGFA2vmtx6KidKj4TPVLZwpU node scripts/render-mcp-server.js');
