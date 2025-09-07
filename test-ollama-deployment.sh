#!/bin/bash

# LUDUS Ollama Deployment Test Script
# This script tests the Ollama deployment and verifies functionality

set -e

echo "🧪 Testing LUDUS Ollama Deployment..."
echo "===================================="

# Configuration
OLLAMA_URL="https://ludus-ollama.onrender.com"
MAX_RETRIES=30
RETRY_INTERVAL=10

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to test endpoint
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    log "Testing $description..."
    
    local response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$url" || echo "000")
    local status_code="${response: -3}"
    
    if [ "$status_code" = "$expected_status" ]; then
        log "✅ $description: HTTP $status_code"
        return 0
    else
        log "❌ $description: HTTP $status_code (expected $expected_status)"
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local description=$2
    local attempt=1
    
    log "Waiting for $description to be ready..."
    
    while [ $attempt -le $MAX_RETRIES ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            log "✅ $description is ready!"
            return 0
        fi
        
        log "Attempt $attempt/$MAX_RETRIES: $description not ready yet, waiting ${RETRY_INTERVAL}s..."
        sleep $RETRY_INTERVAL
        attempt=$((attempt + 1))
    done
    
    log "❌ $description failed to become ready within expected time"
    return 1
}

# Function to test model availability
test_model_availability() {
    log "Testing model availability..."
    
    local response=$(curl -s "$OLLAMA_URL/api/tags" || echo "{}")
    
    if echo "$response" | grep -q "lds_crew/lds"; then
        log "✅ Custom LUDUS model (lds_crew/lds) is available"
        return 0
    else
        log "❌ Custom LUDUS model (lds_crew/lds) not found"
        log "Available models:"
        echo "$response" | jq -r '.models[]?.name // "No models found"' 2>/dev/null || echo "Failed to parse response"
        return 1
    fi
}

# Function to test model inference
test_model_inference() {
    log "Testing model inference..."
    
    local test_payload='{
        "model": "lds_crew/lds",
        "prompt": "Hello, are you working?",
        "stream": false
    }'
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$test_payload" \
        "$OLLAMA_URL/api/generate" || echo "{}")
    
    if echo "$response" | grep -q "response"; then
        log "✅ Model inference test successful"
        local model_response=$(echo "$response" | jq -r '.response // "No response"' 2>/dev/null || echo "Failed to parse response")
        log "Model response: $model_response"
        return 0
    else
        log "❌ Model inference test failed"
        log "Response: $response"
        return 1
    fi
}

# Main test sequence
main() {
    log "Starting comprehensive Ollama deployment test..."
    
    # Test 1: Basic connectivity
    if ! test_endpoint "$OLLAMA_URL/api/tags" "Ollama API connectivity"; then
        log "❌ Basic connectivity test failed"
        exit 1
    fi
    
    # Test 2: Wait for service to be fully ready
    if ! wait_for_service "$OLLAMA_URL/api/tags" "Ollama service"; then
        log "❌ Service readiness test failed"
        exit 1
    fi
    
    # Test 3: Model availability
    if ! test_model_availability; then
        log "❌ Model availability test failed"
        exit 1
    fi
    
    # Test 4: Model inference
    if ! test_model_inference; then
        log "❌ Model inference test failed"
        exit 1
    fi
    
    # Test 5: Health check endpoint
    if ! test_endpoint "$OLLAMA_URL/api/tags" "Health check endpoint"; then
        log "❌ Health check test failed"
        exit 1
    fi
    
    log "🎉 All tests passed! Ollama deployment is successful!"
    
    echo ""
    echo "📊 Test Results Summary:"
    echo "  ✅ API Connectivity: PASSED"
    echo "  ✅ Service Readiness: PASSED"
    echo "  ✅ Model Availability: PASSED"
    echo "  ✅ Model Inference: PASSED"
    echo "  ✅ Health Checks: PASSED"
    echo ""
    echo "🔗 Service URLs:"
    echo "  • Ollama API: $OLLAMA_URL"
    echo "  • Health Check: $OLLAMA_URL/api/tags"
    echo "  • Model List: $OLLAMA_URL/api/tags"
    echo ""
    echo "🧪 Manual Test Commands:"
    echo "  curl $OLLAMA_URL/api/tags"
    echo "  curl -X POST -H 'Content-Type: application/json' -d '{\"model\":\"lds_crew/lds\",\"prompt\":\"Hello\",\"stream\":false}' $OLLAMA_URL/api/generate"
}

# Run main function
main "$@"
