# OPGrapes Development Startup Script
# This script starts both the backend API and frontend web servers

Write-Host "🚀 Starting OPGrapes Development Environment..." -ForegroundColor Green
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $connection -ne $null
    }
    catch {
        return $false
    }
}

# Check if ports are available
Write-Host "🔍 Checking port availability..." -ForegroundColor Yellow

if (Test-Port -Port 5000) {
    Write-Host "❌ Port 5000 is already in use. Please stop the process using this port." -ForegroundColor Red
    Write-Host "   You can use: netstat -ano | findstr :5000" -ForegroundColor Gray
    exit 1
}

if (Test-Port -Port 3000) {
    Write-Host "❌ Port 3000 is already in use. Please stop the process using this port." -ForegroundColor Red
    Write-Host "   You can use: netstat -ano | findstr :3000" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Ports 5000 and 3000 are available" -ForegroundColor Green
Write-Host ""

# Start backend API server
Write-Host "🔥 Starting Backend API Server (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'apps/api'; npm run dev" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend web server
Write-Host "🌐 Starting Frontend Web Server (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'apps/web'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "🎉 Development servers started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "🔌 Backend: http://localhost:5000" -ForegroundColor White
Write-Host "🔍 Health Check: http://localhost:5000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "💡 Press Ctrl+C in each terminal window to stop the servers" -ForegroundColor Yellow
Write-Host "📚 See BACKEND_INTEGRATION.md for more information" -ForegroundColor Gray
