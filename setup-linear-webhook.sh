#!/bin/bash

# Linear Webhook Setup Script
# This script helps you set up the Linear webhook for automatic Notion sync

echo "🚀 Linear to Notion Sync Setup"
echo "==============================="
echo ""

# Check if .env file exists
if [ ! -f "apps/api/.env" ]; then
    echo "❌ .env file not found in apps/api/"
    echo "   Please copy .env.example to .env and configure your API keys"
    exit 1
fi

echo "✅ .env file found"

# Check for required environment variables
echo ""
echo "🔍 Checking environment variables..."

if ! grep -q "LINEAR_API_KEY=" apps/api/.env; then
    echo "⚠️  LINEAR_API_KEY not found in .env"
    echo "   Please add your Linear API key to apps/api/.env"
    echo "   Get it from: https://linear.app/settings/api"
fi

if ! grep -q "NOTION_API_KEY=" apps/api/.env; then
    echo "⚠️  NOTION_API_KEY not found in .env"
    echo "   Please add your Notion API key to apps/api/.env"
    echo "   Get it from: https://www.notion.so/my-integrations"
fi

if ! grep -q "LINEAR_WEBHOOK_SECRET=" apps/api/.env; then
    echo "⚠️  LINEAR_WEBHOOK_SECRET not found in .env"
    echo "   Please add a webhook secret for security"
    echo "   Generate one with: openssl rand -hex 32"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Configure your API keys in apps/api/.env"
echo "2. Install dependencies: cd apps/api && npm install"
echo "3. Start the server: cd apps/api && npm run dev"
echo "4. Set up Linear webhook:"
echo "   - Go to https://linear.app/settings/api"
echo "   - Click 'Create Webhook'"
echo "   - Set URL to: https://your-domain.com/api/linear-webhook"
echo "   - Select events: Issue Created, Issue Updated, Issue Removed"
echo "   - Copy the webhook secret to LINEAR_WEBHOOK_SECRET in .env"
echo ""
echo "5. Test the integration:"
echo "   - Run: node test-linear-sync.js"
echo "   - Check: curl https://your-domain.com/api/linear-webhook/status"
echo ""
echo "📖 For detailed setup instructions, see: LINEAR_NOTION_SYNC_SETUP.md"
echo ""
echo "✨ Setup script completed!"
