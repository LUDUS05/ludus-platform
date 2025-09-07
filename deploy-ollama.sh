#!/bin/bash

# LUDUS Ollama Deployment Script
# This script deploys the Ollama service with the new multi-stage startup process

set -e

echo "🚀 Starting LUDUS Ollama Deployment..."
echo "=================================="

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

# Check if Ollama files exist
if [ ! -f "ollama/Dockerfile" ] || [ ! -f "ollama/start.sh" ] || [ ! -f "ollama/Modelfile" ]; then
    echo "❌ Error: Required Ollama files not found."
    echo "Expected files:"
    echo "  - ollama/Dockerfile"
    echo "  - ollama/start.sh"
    echo "  - ollama/Modelfile"
    exit 1
fi

echo "✅ All required files found"

# Make start.sh executable
chmod +x ollama/start.sh
echo "✅ Made start.sh executable"

# Test the Dockerfile locally (optional - skip if Docker not available)
echo "🔍 Testing Dockerfile syntax..."
if command -v docker > /dev/null 2>&1; then
    if docker build -t ludus-ollama-test ollama/ > /dev/null 2>&1; then
        echo "✅ Dockerfile syntax is valid"
        docker rmi ludus-ollama-test > /dev/null 2>&1 || true
    else
        echo "❌ Dockerfile syntax error detected"
        exit 1
    fi
else
    echo "⚠️  Docker not available locally, skipping syntax check"
    echo "✅ Proceeding with deployment (Render will validate Dockerfile)"
fi

# Commit changes
echo "📝 Committing changes..."
git add ollama/Dockerfile ollama/start.sh render.yaml
git commit -m "feat(ollama): implement multi-stage startup process with health checks

- Enhanced Dockerfile with proper health checks and environment variables
- Implemented robust multi-stage startup script with retry logic
- Added graceful shutdown handling and comprehensive logging
- Updated render.yaml with improved Ollama service configuration
- Fixed agents API Ollama host URL configuration

This addresses the core deployment issues with proper initialization order,
model download timing, and health check configuration."

echo "✅ Changes committed"

# Push to repository
echo "🚀 Pushing to repository..."
git push origin new-main

echo "✅ Pushed to repository"

echo ""
echo "🎉 Ollama deployment initiated!"
echo "=================================="
echo ""
echo "📋 Deployment Summary:"
echo "  • Multi-stage startup process implemented"
echo "  • Health checks configured with 120s grace period"
echo "  • Retry logic for model downloads"
echo "  • Graceful shutdown handling"
echo "  • Comprehensive logging with timestamps"
echo ""
echo "🔍 Monitor deployment at:"
echo "  • Render Dashboard: https://dashboard.render.com"
echo "  • Service URL: https://ludus-ollama.onrender.com"
echo "  • Health Check: https://ludus-ollama.onrender.com/api/tags"
echo ""
echo "⏱️  Expected deployment time: 5-10 minutes"
echo "   (Model download may take additional time on first deployment)"
echo ""
echo "🧪 Test the deployment:"
echo "  curl https://ludus-ollama.onrender.com/api/tags"
echo ""
echo "📊 Check logs in Render dashboard for detailed startup progress"
