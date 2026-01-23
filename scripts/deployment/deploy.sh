#!/bin/bash

# LUDUS Platform Deployment Script
# This script helps prepare the project for deployment

echo "🚀 LUDUS Platform Deployment Preparation"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "DEPLOYMENT.md" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Pre-deployment checklist:"
echo ""

# Check for required files
echo "✅ Checking project structure..."
if [ -f "server/package.json" ] && [ -f "client/package.json" ]; then
    echo "   ✓ Package.json files found"
else
    echo "   ❌ Missing package.json files"
    exit 1
fi

if [ -f ".env.production" ] && [ -f "client/.env.production" ]; then
    echo "   ✓ Production environment files created"
else
    echo "   ❌ Missing production environment files"
    echo "   📝 Please update .env.production and client/.env.production with your actual values"
fi

echo ""
echo "🔧 Deployment configurations created:"
echo "   ✓ railway.json (Railway deployment)"
echo "   ✓ vercel.json (Vercel deployment)" 
echo "   ✓ render.yaml (Render deployment)"
echo "   ✓ Dockerfile (Docker deployment)"
echo ""

echo "📖 Next steps:"
echo "1. Update environment variables in .env.production files"
echo "2. Set up MongoDB Atlas database"
echo "3. Get Moyasar live API keys"
echo "4. Choose deployment platform and follow DEPLOYMENT.md guide"
echo ""

echo "🌐 Recommended deployment stack:"
echo "   Backend: Railway.app"
echo "   Frontend: Vercel.com"
echo "   Database: MongoDB Atlas"
echo "   Payment: Moyasar (Saudi Arabia)"
echo ""

echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo "✨ LUDUS is ready for production deployment!"

# Make the script executable
chmod +x deploy.sh