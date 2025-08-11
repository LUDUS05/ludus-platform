# Local CI Test Script for Windows PowerShell
# This script simulates the CI workflow locally for testing

param(
    [switch]$SkipInstall
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Local CI Test..." -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Please run this script from the project root."
    exit 1
}

if (-not $SkipInstall) {
    Write-Status "Installing dependencies..."
    npm ci
}

Write-Status "Running linting..."
npm run lint

Write-Status "Running type checking..."
npm run typecheck

Write-Status "Building project..."
npm run build

Write-Status "Running tests..."
npm run test

Write-Status "Installing Playwright browsers..."
npx playwright install --with-deps

Write-Status "Starting API service..."
$apiProcess = Start-Process -FilePath "npm" -ArgumentList "--workspace", "apps/api", "run", "dev" -PassThru -WindowStyle Hidden

# Wait for API to be ready
Write-Status "Waiting for API to be ready..."
$apiReady = $false
$timeout = 30
$elapsed = 0

while (-not $apiReady -and $elapsed -lt $timeout) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $apiReady = $true
        }
    } catch {
        Start-Sleep -Seconds 1
        $elapsed++
    }
}

if (-not $apiReady) {
    Write-Error "API service failed to start within $timeout seconds"
    Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Status "API service is ready on port 4000"

Write-Status "Starting Web service..."
$webProcess = Start-Process -FilePath "npm" -ArgumentList "--workspace", "apps/web", "run", "dev" -PassThru -WindowStyle Hidden

# Wait for Web to be ready
Write-Status "Waiting for Web to be ready..."
$webReady = $false
$elapsed = 0

while (-not $webReady -and $elapsed -lt $timeout) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $webReady = $true
        }
    } catch {
        Start-Sleep -Seconds 1
        $elapsed++
    }
}

if (-not $webReady) {
    Write-Error "Web service failed to start within $timeout seconds"
    Stop-Process -Id $apiProcess.Id, $webProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Status "Web service is ready on port 3000"

Write-Status "Running E2E tests..."
$env:BASE_URL = "http://localhost:3000"
npm --workspace apps/web run e2e

Write-Status "Cleaning up services..."
Stop-Process -Id $apiProcess.Id, $webProcess.Id -Force -ErrorAction SilentlyContinue

Write-Status "🎉 Local CI test completed successfully!" -ForegroundColor Green
