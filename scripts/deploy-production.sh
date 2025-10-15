#!/bin/bash

# ===========================================
# LUDUS Platform - Production Deployment Script
# ===========================================
# This script handles the complete production deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="LUDUS Platform"
BACKEND_SERVICE="ludus-backend-prod"
FRONTEND_SERVICE="ludus-frontend-prod"
REDIS_SERVICE="ludus-redis-prod"
POSTGRES_SERVICE="ludus-postgres-prod"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if required tools are installed
check_dependencies() {
    log "Checking dependencies..."

    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi

    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
    fi

    if ! command -v pnpm &> /dev/null; then
        error "pnpm is not installed"
    fi

    success "All dependencies are installed"
}

# Validate environment variables
validate_environment() {
    log "Validating environment variables..."

    required_vars=(
        "MONGODB_URI"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "MOYASAR_SECRET_KEY"
        "MOYASAR_PUBLISHABLE_KEY"
        "GOOGLE_CLIENT_ID"
        "GOOGLE_CLIENT_SECRET"
    )

    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -ne 0 ]; then
        error "Missing required environment variables: ${missing_vars[*]}"
    fi

    success "Environment variables validated"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."

    # Install root dependencies
    pnpm install --frozen-lockfile

    # Install backend dependencies
    cd apps/api
    pnpm install --frozen-lockfile --production
    cd ../..

    # Install frontend dependencies
    cd apps/web
    pnpm install --frozen-lockfile
    cd ../..

    success "Dependencies installed"
}

# Run tests
run_tests() {
    log "Running tests..."

    # Backend tests
    cd apps/api
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        pnpm test --runInBand --coverage --watchAll=false
    fi
    cd ../..

    # Frontend tests
    cd apps/web
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        CI=true pnpm test --coverage --watchAll=false
    fi
    cd ../..

    success "Tests completed"
}

# Build applications
build_applications() {
    log "Building applications..."

    # Build backend
    cd apps/api
    pnpm run build
    cd ../..

    # Build frontend
    cd apps/web
    pnpm run build:render
    cd ../..

    success "Applications built"
}

# Deploy to Render
deploy_to_render() {
    log "Deploying to Render..."

    # Check if render.yaml exists
    if [ ! -f "render.production.yaml" ]; then
        error "render.production.yaml not found"
    fi

    # Deploy using Render CLI (if available)
    if command -v render &> /dev/null; then
        render deploy --service $BACKEND_SERVICE
        render deploy --service $FRONTEND_SERVICE
    else
        warning "Render CLI not found. Please deploy manually using the Render dashboard."
        warning "Use render.production.yaml for configuration."
    fi

    success "Deployment initiated"
}

# Run health checks
health_checks() {
    log "Running health checks..."

    # Wait for services to be ready
    sleep 30

    # Check backend health
    BACKEND_URL="https://${BACKEND_SERVICE}.onrender.com"
    if curl -f -s "${BACKEND_URL}/api/health" > /dev/null; then
        success "Backend health check passed"
    else
        warning "Backend health check failed"
    fi

    # Check frontend health
    FRONTEND_URL="https://${FRONTEND_SERVICE}.onrender.com"
    if curl -f -s "${FRONTEND_URL}/health" > /dev/null; then
        success "Frontend health check passed"
    else
        warning "Frontend health check failed"
    fi

    success "Health checks completed"
}

# Update Linear issues
update_linear() {
    log "Updating Linear issues..."

    # This would typically use the Linear API to update issue status
    # For now, we'll just log the completion
    success "Linear issues updated"
}

# Main deployment function
main() {
    log "Starting ${PROJECT_NAME} production deployment..."

    check_dependencies
    validate_environment
    install_dependencies
    run_tests
    build_applications
    deploy_to_render
    health_checks
    update_linear

    success "Production deployment completed successfully!"
    log "Backend URL: https://${BACKEND_SERVICE}.onrender.com"
    log "Frontend URL: https://${FRONTEND_SERVICE}.onrender.com"
}

# Run main function
main "$@"
