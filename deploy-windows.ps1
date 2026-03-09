# AWS Elastic Beanstalk Deployment Script for Windows
# Run this script to deploy the application

Write-Host "=== Productivity Copilot Deployment Script ===" -ForegroundColor Green

# Check if EB CLI is installed
Write-Host "`nStep 1: Checking prerequisites..." -ForegroundColor Yellow
try {
    $ebVersion = eb --version 2>&1
    Write-Host "✓ EB CLI is installed: $ebVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ EB CLI is not installed" -ForegroundColor Red
    Write-Host "Please install it with: pip install awsebcli --upgrade --user" -ForegroundColor Yellow
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed" -ForegroundColor Red
    exit 1
}

# Build the application
Write-Host "`nStep 2: Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build successful" -ForegroundColor Green

# Check if EB is initialized
Write-Host "`nStep 3: Checking Elastic Beanstalk initialization..." -ForegroundColor Yellow
if (Test-Path ".elasticbeanstalk/config.yml") {
    Write-Host "✓ EB is already initialized" -ForegroundColor Green
} else {
    Write-Host "EB is not initialized. Please run:" -ForegroundColor Yellow
    Write-Host "  eb init -p node.js-18 productivity-copilot --region us-east-1" -ForegroundColor Cyan
    exit 1
}

# Deploy
Write-Host "`nStep 4: Deploying to Elastic Beanstalk..." -ForegroundColor Yellow
$VERSION = Get-Date -Format "yyyyMMdd-HHmmss"
eb deploy --label $VERSION

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Deployment successful!" -ForegroundColor Green
    Write-Host "`nChecking application health..." -ForegroundColor Yellow
    eb health
    
    Write-Host "`nTo open the application in your browser, run:" -ForegroundColor Yellow
    Write-Host "  eb open" -ForegroundColor Cyan
} else {
    Write-Host "`n✗ Deployment failed" -ForegroundColor Red
    Write-Host "Check logs with: eb logs" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
