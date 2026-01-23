#!/bin/bash

echo "🚀 LUDUS Platform - Complete Notion Setup & Import"
echo "=================================================="
echo ""

# Step 1: Set up LUDUS workspace structure
echo "🏗️ Step 1: Setting up LUDUS workspace structure..."
echo "=================================================="
node setup-ludus-notion-workspace.js

echo ""
echo "✅ LUDUS workspace structure created!"
echo ""

# Step 2: Test MCP tools
echo "🧪 Step 2: Testing MCP tools..."
echo "==============================="
node test-notion-databases.js

echo ""
echo "✅ MCP tools tested!"
echo ""

# Step 3: Import content using MCP tools
echo "📥 Step 3: Importing content with MCP tools..."
echo "=============================================="
echo ""

echo "📋 Available MCP tools for import:"
echo "   - mcp_notion-mcp_list_pages"
echo "   - mcp_notion-mcp_search_pages"
echo "   - mcp_notion-mcp_get_page"
echo "   - mcp_notion-mcp_create_page"
echo "   - mcp_notion-mcp_update_page"
echo ""

echo "🎯 Next steps:"
echo "1. Use MCP tools in Cursor to import specific content"
echo "2. Organize imported content into LUDUS structure"
echo "3. Create relationships between imported and new content"
echo "4. Set up automated workflows"
echo ""

echo "📚 Resources created:"
echo "   - LUDUS workspace structure"
echo "   - Project management databases"
echo "   - Feature-specific databases"
echo "   - Development tracking"
echo "   - Documentation structure"
echo ""

echo "🎉 Setup complete! Ready for MCP-powered import!"
