# Git Repository Setup Script for OPGrapes
# This script helps set up the Git repository and test the CI workflow

param(
    [string]$RemoteUrl = "",
    [switch]$SkipGitSetup,
    [switch]$TestOnly
)

Write-Host "🚀 OPGrapes Git Repository Setup" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

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

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Please run this script from the project root."
    exit 1
}

# Check if Git is available
$gitAvailable = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitAvailable) {
    Write-Warning "Git is not available in the current PowerShell session."
    Write-Info "Please ensure Git is installed and available in your PATH."
    Write-Info "You can download Git from: https://git-scm.com/downloads"
    
    if (-not $SkipGitSetup) {
        Write-Error "Cannot proceed without Git. Use -SkipGitSetup to skip Git setup."
        exit 1
    }
}

# Git Setup Section
if (-not $SkipGitSetup -and $gitAvailable) {
    Write-Status "Setting up Git repository..."
    
    # Check if already a git repository
    if (Test-Path ".git") {
        Write-Info "Git repository already exists."
        $currentRemote = git remote get-url origin 2>$null
        if ($currentRemote) {
            Write-Info "Current remote origin: $currentRemote"
        }
    } else {
        Write-Status "Initializing Git repository..."
        git init
        
        Write-Status "Adding all files..."
        git add .
        
        Write-Status "Creating initial commit..."
        git commit -m "Initial commit: OPGrapes monorepo setup"
        
        if ($RemoteUrl) {
            Write-Status "Adding remote origin: $RemoteUrl"
            git remote add origin $RemoteUrl
            
            Write-Status "Setting main as default branch..."
            git branch -M main
            
            Write-Info "Repository setup complete!"
            Write-Info "Next steps:"
            Write-Info "1. Push to remote: git push -u origin main"
            Write-Info "2. Set up branch protection rules on GitHub"
        } else {
            Write-Info "Repository initialized locally!"
            Write-Info "To add a remote later: git remote add origin <your-repo-url>"
        }
    }
}

# Test the project setup
Write-Status "Testing project setup..."

# Check dependencies
if (-not (Test-Path "node_modules")) {
    Write-Status "Installing dependencies..."
    npm install
} else {
    Write-Info "Dependencies already installed."
}

# Test basic commands
Write-Status "Testing basic commands..."

try {
    Write-Info "Testing typecheck..."
    npm run typecheck
    Write-Status "Typecheck passed!"
} catch {
    Write-Error "Typecheck failed: $_"
}

try {
    Write-Info "Testing lint..."
    npm run lint
    Write-Status "Lint passed!"
} catch {
    Write-Error "Lint failed: $_"
}

try {
    Write-Info "Testing build..."
    npm run build
    Write-Status "Build passed!"
} catch {
    Write-Error "Build failed: $_"
}

# Test local CI if requested
if ($TestOnly -or $true) {
    Write-Status "Testing local CI workflow..."
    Write-Info "This will start both services and run E2E tests..."
    
    $response = Read-Host "Do you want to run the local CI test? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        try {
            & ".\scripts\test-ci.ps1"
        } catch {
            Write-Error "Local CI test failed: $_"
        }
    }
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "================" -ForegroundColor Green

if ($gitAvailable -and -not $SkipGitSetup) {
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Push to GitHub: git push -u origin main" -ForegroundColor White
    Write-Host "2. Set up branch protection rules on GitHub" -ForegroundColor White
    Write-Host "3. Create a feature branch: git checkout -b feature/test-ci" -ForegroundColor White
    Write-Host "4. Make changes and test locally: npm run test:ci:local:win" -ForegroundColor White
    Write-Host "5. Push and create a pull request" -ForegroundColor White
    Write-Host "6. Watch the CI workflow run on GitHub Actions" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Install Git and add to PATH" -ForegroundColor White
    Write-Host "2. Run this script again without -SkipGitSetup" -ForegroundColor White
    Write-Host "3. Or manually set up Git repository" -ForegroundColor White
}

Write-Host ""
Write-Host "🔗 Useful Commands:" -ForegroundColor Cyan
Write-Host "- npm run dev:all          # Start both services" -ForegroundColor White
Write-Host "- npm run test:ci:local:win # Test CI locally" -ForegroundColor White
Write-Host "- npm run typecheck        # Check types" -ForegroundColor White
Write-Host "- npm run lint             # Lint code" -ForegroundColor White
