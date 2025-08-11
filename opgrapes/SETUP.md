# 🚀 OPGrapes Setup Guide

This guide will help you set up the Git repository and test the CI workflow for the OPGrapes project.

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Node.js 20+** installed
- ✅ **npm 9+** installed  
- ✅ **Git** installed and available in PATH
- ✅ **PowerShell** (for Windows users)

## 🔧 Quick Setup

### Option 1: Automated Setup (Recommended)

Run the automated setup script:

```powershell
# From the project root directory
npm run setup:git
```

This script will:
- Initialize Git repository
- Test all project commands
- Offer to run local CI tests
- Provide next steps

### Option 2: Manual Setup

If you prefer manual setup, follow these steps:

#### 1. Initialize Git Repository

```powershell
# Initialize Git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: OPGrapes monorepo setup"

# Set main as default branch
git branch -M main
```

#### 2. Add Remote Origin

```powershell
# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/opgrapes.git

# Verify remote
git remote -v
```

#### 3. Push to GitHub

```powershell
# Push to GitHub
git push -u origin main
```

## 🧪 Testing the Setup

### Test Basic Commands

```powershell
# Test type checking
npm run typecheck

# Test linting
npm run lint

# Test building
npm run build

# Test running tests
npm run test
```

### Test Local CI Workflow

```powershell
# Test the complete CI workflow locally
npm run test:ci:local:win
```

This will:
- Start both API and Web services
- Run health checks
- Execute E2E tests
- Clean up services

## 🚀 CI/CD Workflow

### GitHub Actions Setup

The project includes a comprehensive CI workflow at `.github/workflows/ci.yml` that:

- ✅ Runs on pushes to `main` and pull requests
- ✅ Installs dependencies with caching
- ✅ Runs linting and type checking
- ✅ Builds all packages
- ✅ Runs unit tests
- ✅ Starts services and runs E2E tests
- ✅ Caches Playwright browsers
- ✅ Uploads test reports

### Testing the CI Workflow

1. **Create a feature branch:**
   ```powershell
   git checkout -b feature/test-ci
   ```

2. **Make a small change** (e.g., update README)

3. **Test locally:**
   ```powershell
   npm run test:ci:local:win
   ```

4. **Commit and push:**
   ```powershell
   git add .
   git commit -m "test: add CI workflow test"
   git push origin feature/test-ci
   ```

5. **Create a Pull Request** on GitHub

6. **Watch the CI workflow run** in the Actions tab

## 🔒 Branch Protection

### Recommended GitHub Settings

Set up branch protection rules for the `main` branch:

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

### Required Status Checks

The following checks must pass:
- `build-test` (our CI workflow)

## 🐛 Troubleshooting

### Common Issues

#### Git Not Found
```powershell
# Check if Git is available
Get-Command git -ErrorAction SilentlyContinue

# If not found, install Git from: https://git-scm.com/downloads
```

#### Port Conflicts
```powershell
# Check what's using ports 3000 and 4000
netstat -ano | findstr :3000
netstat -ano | findstr :4000

# Kill processes if needed
taskkill /PID <PID> /F
```

#### Dependencies Issues
```powershell
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

#### PowerShell Execution Policy
```powershell
# Check execution policy
Get-ExecutionPolicy

# If restricted, run scripts with bypass
powershell -ExecutionPolicy Bypass -File scripts/setup-git.ps1
```

### Getting Help

1. **Check the logs** in the CI workflow
2. **Run local tests** to isolate issues
3. **Check service health** at:
   - API: `http://localhost:4000/health`
   - Web: `http://localhost:3000/health`

## 📝 Next Steps After Setup

1. **Set up branch protection rules** on GitHub
2. **Create your first feature branch**
3. **Make changes and test locally**
4. **Create pull requests** and watch CI run
5. **Set up deployment pipeline** (optional)
6. **Add team members** and collaborate

## 🔗 Useful Commands

```powershell
# Development
npm run dev:all          # Start both services
npm run dev:web          # Start web only
npm run dev:api          # Start API only

# Testing
npm run test:ci:local:win # Test CI locally
npm run typecheck        # Check types
npm run lint             # Lint code
npm run build            # Build project

# Git
git status               # Check status
git add .                # Stage changes
git commit -m "message"  # Commit changes
git push origin branch   # Push to remote
```

## 🎯 Success Criteria

Your setup is complete when:

- ✅ Git repository is initialized and connected to GitHub
- ✅ All npm commands run successfully
- ✅ Local CI tests pass
- ✅ GitHub Actions CI workflow runs on pull requests
- ✅ Branch protection is configured
- ✅ You can create feature branches and test changes

---

**Need help?** Check the troubleshooting section or run `npm run setup:git` for automated assistance.
