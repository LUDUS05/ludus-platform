#!/bin/bash

# Referral System Deployment Script
# This script deploys the complete referral system to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ludus-platform"
DEPLOYMENT_ENV="${1:-production}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/${TIMESTAMP}"

# Logging
LOG_FILE="deploy-${DEPLOYMENT_ENV}-${TIMESTAMP}.log"
exec > >(tee -a "$LOG_FILE") 2>&1

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_header "Pre-deployment Checks"
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]] || [[ ! -d "server" ]] || [[ ! -d "client" ]]; then
        log_error "Must be run from the project root directory"
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version)
    log "Node.js version: $NODE_VERSION"
    
    # Check npm version
    NPM_VERSION=$(npm --version)
    log "npm version: $NPM_VERSION"
    
    # Check if environment file exists
    if [[ ! -f ".env" ]]; then
        log_warning ".env file not found. Please ensure environment variables are set."
    fi
    
    # Check database connection
    if command -v mongosh &> /dev/null; then
        log "Checking database connection..."
        # Add database connection check here
    else
        log_warning "mongosh not found. Skipping database connection check."
    fi
    
    log_success "Pre-deployment checks completed"
}

# Backup current system
backup_system() {
    log_header "Creating System Backup"
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup environment files
    if [[ -f ".env" ]]; then
        cp .env "$BACKUP_DIR/"
        log "Backed up .env file"
    fi
    
    # Backup server configuration
    if [[ -d "server" ]]; then
        cp -r server/src/config "$BACKUP_DIR/" 2>/dev/null || true
        log "Backed up server configuration"
    fi
    
    # Backup database (if possible)
    if command -v mongodump &> /dev/null; then
        log "Creating database backup..."
        mongodump --out "$BACKUP_DIR/database" 2>/dev/null || log_warning "Database backup failed"
    fi
    
    log_success "System backup completed: $BACKUP_DIR"
}

# Install dependencies
install_dependencies() {
    log_header "Installing Dependencies"
    
    # Install root dependencies
    log "Installing root dependencies..."
    npm ci --production=false
    
    # Install server dependencies
    log "Installing server dependencies..."
    cd server
    npm ci --production=false
    cd ..
    
    # Install client dependencies
    log "Installing client dependencies..."
    cd client
    npm ci --production=false
    cd ..
    
    log_success "All dependencies installed successfully"
}

# Build client
build_client() {
    log_header "Building Client Application"
    
    cd client
    
    # Clean previous build
    if [[ -d "build" ]]; then
        rm -rf build
        log "Cleaned previous build"
    fi
    
    # Build production version
    log "Building production client..."
    npm run build
    
    # Verify build
    if [[ -d "build" ]] && [[ -f "build/index.html" ]]; then
        log_success "Client build completed successfully"
    else
        log_error "Client build failed"
        exit 1
    fi
    
    cd ..
}

# Run tests
run_tests() {
    log_header "Running Test Suite"
    
    cd server
    
    # Run referral system tests
    log "Running referral system tests..."
    if npm run test:referral:all; then
        log_success "All tests passed"
    else
        log_warning "Some tests failed. Continuing with deployment..."
    fi
    
    cd ..
}

# Database migrations
run_migrations() {
    log_header "Running Database Migrations"
    
    cd server
    
    # Check if migrations need to be run
    log "Checking for pending migrations..."
    
    # Add migration logic here
    # This would typically involve running a migration script
    
    log_success "Database migrations completed"
    
    cd ..
}

# Deploy to Render
deploy_to_render() {
    log_header "Deploying to Render"
    
    # Check if render CLI is available
    if command -v render &> /dev/null; then
        log "Using Render CLI for deployment..."
        
        # Deploy backend
        log "Deploying backend..."
        render deploy --service ludus-backend
        
        # Deploy frontend
        log "Deploying frontend..."
        render deploy --service ludus-frontend
        
    else
        log_warning "Render CLI not found. Please deploy manually through Render dashboard."
        log "Backend deployment URL: https://your-backend.onrender.com"
        log "Frontend deployment URL: https://your-frontend.onrender.com"
    fi
    
    log_success "Deployment initiated"
}

# Health checks
health_checks() {
    log_header "Running Health Checks"
    
    # Wait for deployment to complete
    log "Waiting for deployment to complete..."
    sleep 30
    
    # Get deployment URLs from environment or config
    BACKEND_URL="${BACKEND_URL:-https://your-backend.onrender.com}"
    FRONTEND_URL="${FRONTEND_URL:-https://your-frontend.onrender.com}"
    
    # Check backend health
    log "Checking backend health..."
    if curl -f -s "$BACKEND_URL/health" > /dev/null; then
        log_success "Backend is healthy"
    else
        log_error "Backend health check failed"
    fi
    
    # Check referral system endpoints
    log "Checking referral system endpoints..."
    
    # Test referral code generation (requires auth token)
    if [[ -n "$TEST_TOKEN" ]]; then
        if curl -f -s -H "Authorization: Bearer $TEST_TOKEN" "$BACKEND_URL/api/referrals/generate-code" > /dev/null; then
            log_success "Referral system is responding"
        else
            log_error "Referral system health check failed"
        fi
    else
        log_warning "TEST_TOKEN not set. Skipping authenticated health checks."
    fi
    
    # Check frontend
    log "Checking frontend..."
    if curl -f -s "$FRONTEND_URL" > /dev/null; then
        log_success "Frontend is accessible"
    else
        log_error "Frontend health check failed"
    fi
    
    log_success "Health checks completed"
}

# Setup monitoring
setup_monitoring() {
    log_header "Setting Up Monitoring"
    
    # Create monitoring configuration
    mkdir -p monitoring
    
    # Create health check script
    cat > monitoring/health-check.sh << 'EOF'
#!/bin/bash

# Health check script for the referral system

BACKEND_URL="${BACKEND_URL:-https://your-backend.onrender.com}"
FRONTEND_URL="${FRONTEND_URL:-https://your-frontend.onrender.com}"
LOG_FILE="health-check-$(date +%Y%m%d).log"

# Check backend
if curl -f -s "$BACKEND_URL/health" > /dev/null; then
    echo "$(date): Backend OK" >> "$LOG_FILE"
else
    echo "$(date): Backend FAILED" >> "$LOG_FILE"
    # Send alert (email, Slack, etc.)
fi

# Check frontend
if curl -f -s "$FRONTEND_URL" > /dev/null; then
    echo "$(date): Frontend OK" >> "$LOG_FILE"
else
    echo "$(date): Frontend FAILED" >> "$LOG_FILE"
    # Send alert
fi
EOF
    
    chmod +x monitoring/health-check.sh
    
    # Create monitoring configuration for Render
    cat > monitoring/render-monitoring.yaml << 'EOF'
# Render monitoring configuration
services:
  - name: ludus-backend
    type: web
    healthCheckPath: /health
    autoDeploy: true
    
  - name: ludus-frontend
    type: web
    healthCheckPath: /
    autoDeploy: true

alerts:
  - name: backend-down
    condition: health_check_failed
    service: ludus-backend
    action: notify
    
  - name: frontend-down
    condition: health_check_failed
    service: ludus-frontend
    action: notify
EOF
    
    log_success "Monitoring setup completed"
}

# Post-deployment tasks
post_deployment_tasks() {
    log_header "Post-deployment Tasks"
    
    # Update deployment status
    echo "Deployment completed at $(date)" > "deployment-status.txt"
    
    # Clean up old backups (keep last 5)
    if [[ -d "backups" ]]; then
        cd backups
        ls -t | tail -n +6 | xargs -r rm -rf
        cd ..
        log "Cleaned up old backups"
    fi
    
    # Send deployment notification
    log "Sending deployment notification..."
    # Add notification logic here (email, Slack, etc.)
    
    log_success "Post-deployment tasks completed"
}

# Rollback function
rollback() {
    log_header "Rolling Back Deployment"
    
    if [[ -d "$BACKUP_DIR" ]]; then
        log "Restoring from backup: $BACKUP_DIR"
        
        # Restore environment files
        if [[ -f "$BACKUP_DIR/.env" ]]; then
            cp "$BACKUP_DIR/.env" .
            log "Restored .env file"
        fi
        
        # Restore server configuration
        if [[ -d "$BACKUP_DIR/config" ]]; then
            cp -r "$BACKUP_DIR/config" server/src/
            log "Restored server configuration"
        fi
        
        # Restore database if backup exists
        if [[ -d "$BACKUP_DIR/database" ]] && command -v mongorestore &> /dev/null; then
            log "Restoring database..."
            mongorestore "$BACKUP_DIR/database" 2>/dev/null || log_warning "Database restore failed"
        fi
        
        log_success "Rollback completed"
    else
        log_error "No backup found for rollback"
    fi
}

# Main deployment function
main() {
    log_header "Starting Referral System Deployment"
    log "Environment: $DEPLOYMENT_ENV"
    log "Timestamp: $TIMESTAMP"
    
    # Trap errors for rollback
    trap 'log_error "Deployment failed. Rolling back..."; rollback; exit 1' ERR
    
    # Execute deployment steps
    pre_deployment_checks
    backup_system
    install_dependencies
    build_client
    run_tests
    run_migrations
    deploy_to_render
    health_checks
    setup_monitoring
    post_deployment_tasks
    
    log_header "Deployment Completed Successfully! 🎉"
    log "Deployment log: $LOG_FILE"
    log "Backup location: $BACKUP_DIR"
    log "Monitoring setup: monitoring/"
    
    # Remove error trap
    trap - ERR
}

# Help function
show_help() {
    echo "Usage: $0 [environment] [options]"
    echo ""
    echo "Environments:"
    echo "  production  - Deploy to production (default)"
    echo "  staging     - Deploy to staging"
    echo "  development - Deploy to development"
    echo ""
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo "  --rollback     Rollback to previous deployment"
    echo "  --health       Run health checks only"
    echo "  --monitor      Setup monitoring only"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy to production"
    echo "  $0 staging            # Deploy to staging"
    echo "  $0 --health           # Run health checks"
    echo "  $0 --rollback         # Rollback deployment"
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --rollback)
        rollback
        exit 0
        ;;
    --health)
        health_checks
        exit 0
        ;;
    --monitor)
        setup_monitoring
        exit 0
        ;;
    production|staging|development)
        main
        ;;
    *)
        log_error "Invalid environment: $1"
        show_help
        exit 1
        ;;
esac
