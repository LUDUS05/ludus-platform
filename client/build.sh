#!/bin/bash

# LUDUS Frontend Build Script for Render
# This script handles the build process for static site deployment

echo "🚀 Starting LUDUS Frontend Build Process..."

# Set environment variables for build
export SKIP_PREFLIGHT_CHECK=true
export CI=false

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Build output available in ./build directory"
