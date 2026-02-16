#!/bin/bash

echo "🚀 Deploying LUDUS Backend to Railway..."

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login check
echo "🔐 Checking Railway authentication..."
railway whoami || {
    echo "❌ Please login to Railway first: railway login"
    exit 1
}

# Deploy to Railway
echo "📦 Deploying to Railway..."
railway up

echo "✅ Backend deployment initiated!"
echo "🌐 Check your Railway dashboard for deployment status"