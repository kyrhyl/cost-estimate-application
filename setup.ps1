# UPA Estimating App - Setup Script
# Run this script to check prerequisites and setup the project

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "UPA Estimating App - Setup Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
    
    $majorVersion = [int]($nodeVersion -replace 'v|\..*', '')
    if ($majorVersion -lt 18) {
        Write-Host "⚠ Warning: Node.js 18+ recommended (you have $nodeVersion)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Node.js not found! Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoVersion = mongo --version 2>&1 | Select-String "MongoDB shell version"
    if ($mongoVersion) {
        Write-Host "✓ MongoDB installed: $mongoVersion" -ForegroundColor Green
    } else {
        throw "MongoDB not detected"
    }
} catch {
    Write-Host "⚠ MongoDB not found locally" -ForegroundColor Yellow
    Write-Host "  You can use:" -ForegroundColor Yellow
    Write-Host "  - Install MongoDB Community: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    Write-Host "  - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas" -ForegroundColor Yellow
}
Write-Host ""

# Check if node_modules exists
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
    $installDeps = Read-Host "Reinstall dependencies? (y/N)"
    if ($installDeps -eq 'y' -or $installDeps -eq 'Y') {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Check .env.local
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "mongodb://") {
        Write-Host "✓ .env.local exists with MongoDB URI" -ForegroundColor Green
        
        # Check if it's the default/template value
        if ($envContent -match "mongodb://localhost:27017") {
            Write-Host "  Using local MongoDB (default)" -ForegroundColor Cyan
        } elseif ($envContent -match "mongodb\+srv://") {
            Write-Host "  Using MongoDB Atlas (cloud)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "⚠ .env.local exists but may not be configured properly" -ForegroundColor Yellow
        Write-Host "  Please check that MONGODB_URI is set correctly" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ .env.local not found!" -ForegroundColor Red
    Write-Host "  Please create .env.local with your MongoDB connection string" -ForegroundColor Yellow
    Write-Host "  See .env.local file in the project root for template" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Setup Summary" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$readyToGo = $true

if (-not (Test-Path "node_modules")) {
    Write-Host "✗ Dependencies not installed" -ForegroundColor Red
    $readyToGo = $false
}

if (-not (Test-Path ".env.local")) {
    Write-Host "✗ .env.local not configured" -ForegroundColor Red
    $readyToGo = $false
}

if ($readyToGo) {
    Write-Host "✓ All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Review .env.local to ensure MongoDB URI is correct" -ForegroundColor White
    Write-Host "2. Start MongoDB (if using local): net start MongoDB" -ForegroundColor White
    Write-Host "3. Run the development server: npm run dev" -ForegroundColor White
    Write-Host "4. Open browser to: http://localhost:3000" -ForegroundColor White
    Write-Host ""
    
    $startNow = Read-Host "Start development server now? (Y/n)"
    if ($startNow -ne 'n' -and $startNow -ne 'N') {
        Write-Host ""
        Write-Host "Starting development server..." -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""
        npm run dev
    }
} else {
    Write-Host "⚠ Setup incomplete. Please fix the issues above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "For detailed setup instructions, see:" -ForegroundColor Cyan
    Write-Host "- QUICKSTART.md (quick guide)" -ForegroundColor White
    Write-Host "- SETUP.md (detailed guide)" -ForegroundColor White
}

Write-Host ""
Write-Host "For help, check the documentation:" -ForegroundColor Cyan
Write-Host "- README.md - Project overview" -ForegroundColor White
Write-Host "- QUICKSTART.md - Quick start guide" -ForegroundColor White
Write-Host "- SETUP.md - Detailed setup" -ForegroundColor White
Write-Host "- FORMULAS.md - Formula reference" -ForegroundColor White
Write-Host "- API-TESTING.md - API testing guide" -ForegroundColor White
Write-Host ""
