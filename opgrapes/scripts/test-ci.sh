#!/bin/bash

# Local CI Test Script
# This script simulates the CI workflow locally for testing

set -e

echo "🚀 Starting Local CI Test..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Installing dependencies..."
npm ci

print_status "Running linting..."
npm run lint

print_status "Running type checking..."
npm run typecheck

print_status "Building project..."
npm run build

print_status "Running tests..."
npm run test

print_status "Installing Playwright browsers..."
npx playwright install --with-deps

print_status "Starting API service..."
npm --workspace apps/api run dev &
API_PID=$!

# Wait for API to be ready
print_status "Waiting for API to be ready..."
timeout 30 bash -c 'until curl -f http://localhost:4000/health 2>/dev/null; do sleep 1; done' || {
    print_error "API service failed to start"
    kill $API_PID 2>/dev/null || true
    exit 1
}
print_status "API service is ready on port 4000"

print_status "Starting Web service..."
npm --workspace apps/web run dev &
WEB_PID=$!

# Wait for Web to be ready
print_status "Waiting for Web to be ready..."
timeout 30 bash -c 'until curl -f http://localhost:3000/health 2>/dev/null; do sleep 1; done' || {
    print_error "Web service failed to start"
    kill $API_PID $WEB_PID 2>/dev/null || true
    exit 1
}
print_status "Web service is ready on port 3000"

print_status "Running E2E tests..."
export BASE_URL=http://localhost:3000
npm --workspace apps/web run e2e

print_status "Cleaning up services..."
kill $API_PID $WEB_PID 2>/dev/null || true

print_status "🎉 Local CI test completed successfully!"
