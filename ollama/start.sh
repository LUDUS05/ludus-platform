#!/bin/bash

set -e  # Exit on any error

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to wait for Ollama server to be ready
wait_for_ollama() {
    local max_attempts=30
    local attempt=1
    
    log "Waiting for Ollama server to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            log "Ollama server is ready!"
            return 0
        fi
        
        log "Attempt $attempt/$max_attempts: Ollama server not ready yet, waiting..."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    log "ERROR: Ollama server failed to start within expected time"
    return 1
}

# Function to check if model exists
model_exists() {
    local model_name=$1
    ollama list | grep -q "$model_name" 2>/dev/null
}

# Function to pull model with retry
pull_model_with_retry() {
    local model_name=$1
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Attempting to pull $model_name (attempt $attempt/$max_attempts)..."
        
        if ollama pull "$model_name"; then
            log "Successfully pulled $model_name"
            return 0
        else
            log "Failed to pull $model_name on attempt $attempt"
            attempt=$((attempt + 1))
            sleep 10
        fi
    done
    
    log "ERROR: Failed to pull $model_name after $max_attempts attempts"
    return 1
}

# Function to create custom model with retry
create_custom_model_with_retry() {
    local model_name="lds_crew/lds"
    local max_attempts=3
    local attempt=1
    
    # Check if model already exists
    if model_exists "$model_name"; then
        log "Model $model_name already exists, skipping creation"
        return 0
    fi
    
    while [ $attempt -le $max_attempts ]; do
        log "Attempting to create custom model $model_name (attempt $attempt/$max_attempts)..."
        
        if ollama create "$model_name" -f /Modelfile; then
            log "Successfully created custom model $model_name"
            return 0
        else
            log "Failed to create $model_name on attempt $attempt"
            attempt=$((attempt + 1))
            sleep 10
        fi
    done
    
    log "ERROR: Failed to create $model_name after $max_attempts attempts"
    return 1
}

# Main startup sequence
main() {
    log "Starting LUDUS Ollama service initialization..."
    
    # Stage 1: Start Ollama server
    log "Stage 1: Starting Ollama server..."
    ollama serve &
    OLLAMA_PID=$!
    
    # Stage 2: Wait for server to be ready
    log "Stage 2: Waiting for Ollama server to be ready..."
    if ! wait_for_ollama; then
        log "ERROR: Failed to start Ollama server"
        kill $OLLAMA_PID 2>/dev/null || true
        exit 1
    fi
    
    # Stage 3: Pull base model
    log "Stage 3: Pulling base model llama3.2:latest..."
    if ! pull_model_with_retry "llama3.2:latest"; then
        log "ERROR: Failed to pull base model"
        kill $OLLAMA_PID 2>/dev/null || true
        exit 1
    fi
    
    # Stage 4: Create custom LUDUS model
    log "Stage 4: Creating custom LUDUS model..."
    if ! create_custom_model_with_retry; then
        log "ERROR: Failed to create custom model"
        kill $OLLAMA_PID 2>/dev/null || true
        exit 1
    fi
    
    # Stage 5: Verify deployment
    log "Stage 5: Verifying deployment..."
    if ollama list | grep -q "lds_crew/lds"; then
        log "SUCCESS: LUDUS Ollama service is ready!"
        log "Available models:"
        ollama list
    else
        log "ERROR: Custom model verification failed"
        kill $OLLAMA_PID 2>/dev/null || true
        exit 1
    fi
    
    # Stage 6: Keep container running
    log "Stage 6: Service ready, keeping container running..."
    wait $OLLAMA_PID
}

# Handle signals for graceful shutdown
trap 'log "Received shutdown signal, stopping Ollama..."; kill $OLLAMA_PID 2>/dev/null || true; exit 0' SIGTERM SIGINT

# Run main function
main "$@"
