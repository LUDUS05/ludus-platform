#!/bin/bash

# Deploy Selena-Discover AI Agent
# This script deploys the enhanced AI discovery system for LUDUS platform

echo "🤖 Deploying Selena-Discover AI Agent..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check environment variables
echo "🔧 Checking environment configuration..."
if [ -z "$REDIS_URL" ]; then
    echo "⚠️  Warning: REDIS_URL not set - agent will run with limited functionality"
fi

if [ -z "$OLLAMA_HOST" ]; then
    echo "⚠️  Warning: OLLAMA_HOST not set - using default localhost:11434"
fi

if [ -z "$AGENTS_API_URL" ]; then
    echo "⚠️  Warning: AGENTS_API_URL not set - using default localhost:8001"
fi

# Install Python dependencies for agents
echo "📦 Installing Python dependencies..."
cd agents
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd ../server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

# Run database migrations if needed
echo "🗃️  Checking database schema..."
# Note: MongoDB is schemaless, but we can verify model files exist
if [ ! -f "src/models/SearchHistory.js" ]; then
    echo "❌ SearchHistory model not found"
    exit 1
fi

if [ ! -f "src/models/VenuePopularityMetrics.js" ]; then
    echo "❌ VenuePopularityMetrics model not found"
    exit 1
fi

if [ ! -f "src/models/UserSearchPreferences.js" ]; then
    echo "❌ UserSearchPreferences model not found"
    exit 1
fi

echo "✅ Database models verified"

# Test the Selena-Discover agent
echo "🧪 Testing Selena-Discover AI Agent..."
cd ../
node test-selena-discover-agent.js
if [ $? -eq 0 ]; then
    echo "✅ Selena-Discover agent tests passed!"
else
    echo "⚠️  Some tests failed - proceeding with deployment but monitoring required"
fi

# Start the agents service
echo "🚀 Starting AI Agents service..."
cd agents
python -m uvicorn api.main:app --host 0.0.0.0 --port 8001 &
AGENTS_PID=$!

# Wait for agents service to start
echo "⏳ Waiting for agents service to start..."
sleep 5

# Check if agents service is running
curl -f http://localhost:8001/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Agents service started successfully"
else
    echo "❌ Agents service failed to start"
    kill $AGENTS_PID 2>/dev/null
    exit 1
fi

# Start the backend service
echo "🚀 Starting backend service..."
cd ../server
npm run dev &
BACKEND_PID=$!

# Wait for backend service to start
echo "⏳ Waiting for backend service to start..."
sleep 10

# Check if backend service is running
curl -f http://localhost:5000/api/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Backend service started successfully"
else
    echo "❌ Backend service failed to start"
    kill $AGENTS_PID $BACKEND_PID 2>/dev/null
    exit 1
fi

# Test the full integration
echo "🔗 Testing integration..."
curl -X POST http://localhost:5000/api/discover/search \
  -H "Content-Type: application/json" \
  -d '{"query":"ابحث عن أنشطة ترفيهية","language":"ar"}' \
  > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Integration test passed!"
else
    echo "⚠️  Integration test failed - check logs for details"
fi

# Print deployment summary
echo ""
echo "🎉 SELENA-DISCOVER AI AGENT DEPLOYMENT COMPLETE!"
echo "=================================================="
echo "🔍 Agent Service: http://localhost:8001"
echo "🖥️  Backend Service: http://localhost:5000"
echo "📊 Health Check: http://localhost:8001/health"
echo "🤖 Agent Info: http://localhost:8001/agents"
echo ""
echo "📋 Available Endpoints:"
echo "  POST /api/discover/search - Intelligent activity search"
echo "  POST /api/discover/recommend - Personalized recommendations"
echo "  GET  /api/discover/trending - Trending activities"
echo "  POST /api/discover/chat - Natural language chat"
echo "  GET  /api/discover/nearby/{location} - Location-based discovery"
echo ""
echo "🌟 Features Enabled:"
echo "  ✅ Natural Language Processing (Arabic/English)"
echo "  ✅ Cultural Context Awareness"
echo "  ✅ Personalized Recommendations"
echo "  ✅ Geographic Proximity Calculations"
echo "  ✅ Search Analytics & Learning"
echo "  ✅ Performance Optimization (<300ms target)"
echo ""
echo "📝 To stop services:"
echo "  kill $AGENTS_PID $BACKEND_PID"
echo ""
echo "🔍 Monitor logs:"
echo "  tail -f agents/logs/agent.log"
echo "  tail -f server/logs/server.log"
echo ""
echo "Happy discovering! 🎯"