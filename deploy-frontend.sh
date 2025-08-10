#!/bin/bash

echo "🚀 Deploying LUDUS Frontend to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to client directory
cd client

# Login check
echo "🔐 Checking Vercel authentication..."
vercel whoami || {
    echo "❌ Please login to Vercel first: vercel login"
    exit 1
}

# Build and deploy
echo "📦 Building and deploying to Vercel..."
vercel --prod

echo "✅ Frontend deployment completed!"
echo "🌐 Your app should be live on Vercel"