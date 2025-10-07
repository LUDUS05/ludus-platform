#!/bin/bash

# LUDUS Platform Build Script
# This script builds all packages in the correct dependency order

set -e

echo "🏗️  Building LUDUS Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install pnpm first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "pnpm-workspace.yaml" ]; then
    print_error "Please run this script from the root of the LUDUS platform repository."
    exit 1
fi

print_status "Installing dependencies..."
pnpm install

print_status "Building shared packages first..."
pnpm --filter './packages/*' build

print_status "Building applications..."
pnpm --filter './apps/*' build

print_status "Running type checks..."
pnpm type-check

print_status "Running tests..."
pnpm test

print_success "✅ Build completed successfully!"

print_status "Build summary:"
echo "  📦 Shared packages: Built"
echo "  🌐 Web application: Built"
echo "  🔧 API server: Built"
echo "  🤖 AI agents: Built"
echo "  ✅ Type checks: Passed"
echo "  ✅ Tests: Passed"

print_success "🚀 LUDUS Platform is ready for deployment!"
