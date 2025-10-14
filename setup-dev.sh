#!/bin/bash
# LUDUS Platform Development Setup Script
echo "🚀 Setting up LUDUS Platform Development Environment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install API dependencies
echo "📦 Installing API dependencies..."
cd apps/api && npm install && cd ..

# Install Web dependencies  
echo "📦 Installing Web dependencies..."
cd apps/web && npm install && cd ..

# Install AI Agents dependencies
echo "📦 Installing AI Agents dependencies..."
cd apps/ai-agents && pip install -r requirements.txt && cd ..

# Copy environment file
echo "⚙️ Setting up environment..."
if [ ! -f .env ]; then
  cp ludus-platform/development.env .env
  echo "✅ Environment file created from template"
else
  echo "✅ Environment file already exists"
fi

echo "🎉 Development environment setup complete!"
echo "Run npm run dev to start all services"

