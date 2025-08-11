#!/bin/bash

# Production Deployment Script for OPGrapes
# This script builds, tests, and deploys the application with Docker

set -e  # Exit on any error

# Configuration
PROJECT_NAME="opgrapes"
REGISTRY_URL=""  # Set your container registry URL here
TAG=$(git rev-parse --short HEAD)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    
    # Build API image
    log_info "Building API image..."
    docker build \
        --target runner \
        -f apps/api/Dockerfile \
        -t ${PROJECT_NAME}-api:${TAG} \
        -t ${PROJECT_NAME}-api:latest \
        .
    
    # Build Web image
    log_info "Building Web image..."
    docker build \
        --target runner \
        -f apps/web/Dockerfile \
        -t ${PROJECT_NAME}-web:${TAG} \
        -t ${PROJECT_NAME}-web:latest \
        .
    
    log_success "Docker images built successfully"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Run API tests
    log_info "Running API tests..."
    docker run --rm ${PROJECT_NAME}-api:${TAG} npm test || {
        log_error "API tests failed"
        exit 1
    }
    
    # Run Web tests
    log_info "Running Web tests..."
    docker run --rm ${PROJECT_NAME}-web:${TAG} npm test || {
        log_error "Web tests failed"
        exit 1
    }
    
    log_success "All tests passed"
}

# Deploy application
deploy_application() {
    log_info "Deploying application..."
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f docker-compose.optimized.yml down || true
    
    # Start new containers
    log_info "Starting new containers..."
    docker-compose -f docker-compose.optimized.yml up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Check health status
    check_health_status
    
    log_success "Application deployed successfully"
}

# Check health status
check_health_status() {
    log_info "Checking health status..."
    
    # Check API health
    local api_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/health || echo "000")
    if [ "$api_health" = "200" ]; then
        log_success "API is healthy"
    else
        log_error "API health check failed (HTTP $api_health)"
        exit 1
    fi
    
    # Check Web health
    local web_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "000")
    if [ "$web_health" = "200" ]; then
        log_success "Web application is healthy"
    else
        log_error "Web application health check failed (HTTP $web_health)"
        exit 1
    fi
}

# Rollback function
rollback() {
    log_warning "Rolling back to previous version..."
    
    # Stop current containers
    docker-compose -f docker-compose.optimized.yml down || true
    
    # Start previous version (if available)
    if docker images | grep -q "${PROJECT_NAME}-api:previous"; then
        log_info "Rolling back to previous version..."
        docker tag ${PROJECT_NAME}-api:previous ${PROJECT_NAME}-api:latest
        docker tag ${PROJECT_NAME}-web:previous ${PROJECT_NAME}-web:latest
        docker-compose -f docker-compose.optimized.yml up -d
    else
        log_error "No previous version available for rollback"
        exit 1
    fi
}

# Main deployment flow
main() {
    log_info "Starting production deployment..."
    log_info "Project: ${PROJECT_NAME}"
    log_info "Tag: ${TAG}"
    log_info "Timestamp: ${TIMESTAMP}"
    
    # Set up error handling
    trap 'log_error "Deployment failed. Rolling back..."; rollback' ERR
    
    # Execute deployment steps
    check_prerequisites
    build_images
    run_tests
    deploy_application
    
    log_success "Production deployment completed successfully!"
    log_info "API: http://localhost:4000"
    log_info "Web: http://localhost:3000"
}

# Run main function
main "$@"
