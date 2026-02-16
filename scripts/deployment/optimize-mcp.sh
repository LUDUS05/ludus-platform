#!/bin/bash

echo "🔧 LUDUS Platform - MCP Optimization Tool"
echo "========================================"
echo ""

echo "Current issue: 122 tools enabled (exceeds 80 tool limit)"
echo "This can degrade performance and cause compatibility issues."
echo ""

echo "📋 Available MCP Configurations:"
echo ""

echo "1. MINIMAL (Recommended for immediate use)"
echo "   - Render MCP: Deployment management"
echo "   - Linear MCP: Issue tracking (already working)"
echo "   - Estimated tools: ~20-30"
echo "   - Status: ✅ Ready to use immediately"
echo ""

echo "2. OPTIMIZED (Recommended for full functionality)"
echo "   - Render MCP: Deployment management"
echo "   - GitHub MCP (Lightweight): Essential repository operations"
echo "   - Notion MCP: Documentation management"
echo "   - Linear MCP: Issue tracking"
echo "   - Estimated tools: ~50-70"
echo "   - Status: 🔄 Requires GitHub/Notion tokens"
echo ""

echo "3. FULL (Current - causes tool limit warning)"
echo "   - All comprehensive MCP servers"
echo "   - Estimated tools: 122+"
echo "   - Status: ⚠️  Performance issues"
echo ""

echo "🎯 Recommendation: Start with MINIMAL, then upgrade to OPTIMIZED"
echo ""

read -p "Choose configuration (1=Minimal, 2=Optimized, 3=Keep Full): " choice

case $choice in
    1)
        echo "🔧 Switching to MINIMAL configuration..."
        cp .cursor/mcp-minimal.json .cursor/mcp.json
        echo "✅ Switched to minimal configuration"
        echo "✅ Available tools: Render + Linear"
        echo "✅ Ready to use immediately"
        ;;
    2)
        echo "🔧 Switching to OPTIMIZED configuration..."
        cp .cursor/mcp-optimized.json .cursor/mcp.json
        echo "✅ Switched to optimized configuration"
        echo "🔄 You'll need GitHub and Notion tokens for full functionality"
        echo "✅ Linear and Render will work immediately"
        ;;
    3)
        echo "⚠️  Keeping FULL configuration"
        echo "⚠️  You may experience performance issues"
        echo "⚠️  Some models may not work properly with 122+ tools"
        ;;
    *)
        echo "❌ Invalid choice. Keeping current configuration."
        ;;
esac

echo ""
echo "📊 Next Steps:"
echo "1. Restart Cursor to load new MCP configuration"
echo "2. Test MCP tools in Cursor interface"
echo "3. If you chose Optimized, get GitHub/Notion tokens"
echo "4. Begin LUDUS platform development!"
echo ""

echo "🧪 Testing current configuration..."
node check-mcp-status.js
