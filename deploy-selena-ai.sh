#!/bin/bash

# LUDUS Selena AI Service Deployment Script
# Deploys FastAPI service with 4 Selena AI agents to Render
#
# Performance Targets:
# - <200ms response time
# - 1000+ concurrent requests capability
# - 99.9% uptime
#
# Created: 2025-09-28 GMT+3 (Riyadh)

set -e

echo "🚀 LUDUS Selena AI Service Deployment"
echo "===================================="
echo "Deploying FastAPI service with 4 Selena AI agents"
echo ""

# Configuration
SERVICE_NAME="ludus-selena-ai"
DOCKER_IMAGE="ludus/selena-ai:latest"
PORT=8081

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check prerequisites
echo -e "${BLUE}📋 Checking Prerequisites${NC}"

# Check if Redis is configured
if [ -z "$REDIS_URL" ]; then
    echo -e "${YELLOW}⚠️ REDIS_URL not set - session management will be disabled${NC}"
else
    echo -e "${GREEN}✅ Redis configured${NC}"
fi

# Check if Ollama is configured
if [ -z "$OLLAMA_HOST" ]; then
    echo -e "${YELLOW}⚠️ OLLAMA_HOST not set - using default localhost:11434${NC}"
    export OLLAMA_HOST="http://localhost:11434"
else
    echo -e "${GREEN}✅ Ollama configured: $OLLAMA_HOST${NC}"
fi

# Check if Ollama model is configured
if [ -z "$OLLAMA_MODEL" ]; then
    echo -e "${YELLOW}⚠️ OLLAMA_MODEL not set - using default llama3.2${NC}"
    export OLLAMA_MODEL="llama3.2"
else
    echo -e "${GREEN}✅ Ollama model: $OLLAMA_MODEL${NC}"
fi

echo ""

# Build and deploy steps
echo -e "${BLUE}🔨 Building Selena AI Service${NC}"

# Navigate to agents directory
cd /workspace/agents

# Create deployment-ready configuration
echo "Creating deployment configuration..."

# Create render.yaml for Selena AI service
cat > render-selena.yaml << EOF
services:
  - type: web
    name: $SERVICE_NAME
    env: python
    region: oregon
    plan: starter
    buildCommand: |
      cd agents
      pip install -r requirements.txt
    startCommand: |
      cd agents
      uvicorn api.main:app --host 0.0.0.0 --port \$PORT --workers 1
    envVars:
      - key: REDIS_URL
        fromService:
          type: redis
          name: ludus-redis
      - key: OLLAMA_HOST
        value: $OLLAMA_HOST
      - key: OLLAMA_MODEL  
        value: $OLLAMA_MODEL
      - key: ENVIRONMENT
        value: production
      - key: LOG_LEVEL
        value: INFO
      - key: MAX_CONCURRENT_REQUESTS
        value: 1000
      - key: TARGET_RESPONSE_TIME_MS
        value: 200
    healthCheckPath: /health
    
  - type: redis
    name: ludus-redis
    plan: starter
    maxmemoryPolicy: allkeys-lru
EOF

echo -e "${GREEN}✅ Deployment configuration created${NC}"

# Update agents requirements if needed
echo "Updating Python dependencies..."

# Check if the required packages are in requirements.txt
if ! grep -q "pydantic" requirements.txt; then
    echo "Adding missing dependencies to requirements.txt..."
    cat >> requirements.txt << EOF

# Selena AI Service Dependencies (Added 2025-09-28)
pydantic==2.9.1
aiohttp==3.9.1
psutil==5.9.6
python-dotenv==1.0.0
EOF
fi

echo -e "${GREEN}✅ Dependencies updated${NC}"

# Run local tests first
echo ""
echo -e "${BLUE}🧪 Running Local Tests${NC}"

if [ -f "../test-selena-agents.sh" ]; then
    echo "Starting local FastAPI server for testing..."
    
    # Start server in background
    python3 -m uvicorn api.main:app --host 0.0.0.0 --port $PORT &
    SERVER_PID=$!
    
    # Wait for server to start
    echo "Waiting for server to start..."
    sleep 5
    
    # Run tests
    echo "Running Selena AI tests..."
    bash ../test-selena-agents.sh
    
    TEST_RESULT=$?
    
    # Stop server
    kill $SERVER_PID 2>/dev/null || true
    
    if [ $TEST_RESULT -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed!${NC}"
    else
        echo -e "${RED}❌ Some tests failed${NC}"
        echo "Please fix issues before deploying to production"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️ Test script not found, skipping local tests${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Deployment Instructions${NC}"
echo "=========================="
echo ""
echo "To deploy to Render:"
echo "1. Commit your changes to Git"
echo "2. Push to your repository"
echo "3. Connect repository to Render"
echo "4. Use the render-selena.yaml configuration"
echo ""
echo "Manual deployment commands:"
echo ""
echo "# Using Render CLI (if installed)"
echo "render deploy --config render-selena.yaml"
echo ""
echo "# Or deploy via Render dashboard:"
echo "1. Go to https://render.com"
echo "2. Create new Web Service"
echo "3. Connect your Git repository"
echo "4. Use these settings:"
echo "   - Build Command: cd agents && pip install -r requirements.txt"
echo "   - Start Command: cd agents && uvicorn api.main:app --host 0.0.0.0 --port \$PORT"
echo "   - Environment: Python"
echo "   - Region: Oregon (closest to Saudi Arabia)"
echo ""
echo -e "${GREEN}🎯 Expected Performance After Deployment:${NC}"
echo "- Response Time: <200ms average"
echo "- Concurrency: 1000+ simultaneous requests"
echo "- Uptime: 99.9% availability"
echo "- Languages: Arabic (primary) + English"
echo ""
echo -e "${BLUE}📊 Health Check URLs:${NC}"
echo "- https://your-service.onrender.com/health"
echo "- https://your-service.onrender.com/selena/agents"
echo "- https://your-service.onrender.com/docs (API documentation)"
echo ""
echo -e "${GREEN}✨ Selena AI Service deployment preparation complete!${NC}"