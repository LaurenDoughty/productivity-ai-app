# Elastic Beanstalk Deployment Script
# Run this after setting credentials with: . .\set-credentials.ps1

Write-Host "🚀 Starting Elastic Beanstalk Deployment" -ForegroundColor Cyan
Write-Host ""

# Add EB CLI to PATH
$env:Path += ";$env:APPDATA\Python\Python312\Scripts"

# Verify credentials are set
if (-not $env:AWS_ACCESS_KEY_ID) {
    Write-Host "❌ AWS_ACCESS_KEY_ID not set!" -ForegroundColor Red
    Write-Host "Please run: . .\set-credentials.ps1" -ForegroundColor Yellow
    exit 1
}

if (-not $env:VITE_GEMINI_API_KEY) {
    Write-Host "❌ VITE_GEMINI_API_KEY not set!" -ForegroundColor Red
    Write-Host "Please run: . .\set-credentials.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Credentials verified" -ForegroundColor Green
Write-Host ""

# Step 1: Initialize EB (if not already initialized)
if (-not (Test-Path ".elasticbeanstalk")) {
    Write-Host "📦 Step 1: Initializing Elastic Beanstalk..." -ForegroundColor Cyan
    eb init -p node.js-18 productivity-copilot --region us-east-1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ EB initialization failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ EB initialized" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✅ EB already initialized" -ForegroundColor Green
    Write-Host ""
}

# Step 2: Create and deploy environment
Write-Host "🚀 Step 2: Creating environment and deploying..." -ForegroundColor Cyan
Write-Host "This will take 5-10 minutes..." -ForegroundColor Yellow
Write-Host ""

$envVars = "NODE_ENV=production,PORT=8080,VITE_AI_PROVIDER=gemini,VITE_GEMINI_API_KEY=$($env:VITE_GEMINI_API_KEY),VITE_MAX_RETRIES=3,VITE_INITIAL_DELAY_MS=1000,VITE_MAX_DELAY_MS=10000,VITE_BACKOFF_MULTIPLIER=2,VITE_MAX_REQUESTS_PER_MINUTE=60,VITE_MAX_TOKENS_PER_MINUTE=100000,APP_VERSION=1.0.0"

eb create productivity-copilot-prod `
  --instance-type t3.micro `
  --single `
  --envvars $envVars

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "Check logs with: eb logs" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""

# Step 3: Show status
Write-Host "📊 Environment Status:" -ForegroundColor Cyan
eb status

Write-Host ""
Write-Host "🌐 Opening application in browser..." -ForegroundColor Cyan
eb open

Write-Host ""
Write-Host "✅ Deployment successful!" -ForegroundColor Green
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  eb status  - Check environment status" -ForegroundColor White
Write-Host "  eb health  - Check application health" -ForegroundColor White
Write-Host "  eb logs    - View application logs" -ForegroundColor White
Write-Host "  eb deploy  - Deploy updates" -ForegroundColor White
Write-Host "  eb terminate productivity-copilot-prod - Delete environment" -ForegroundColor White
