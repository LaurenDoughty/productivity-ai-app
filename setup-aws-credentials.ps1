# AWS Credentials Setup Script
# This will store credentials in the standard AWS location: ~/.aws/credentials

Write-Host "AWS Credentials Setup" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will store your credentials in: $env:USERPROFILE\.aws\credentials" -ForegroundColor Yellow
Write-Host "This is the standard, secure location for AWS credentials." -ForegroundColor Yellow
Write-Host ""

# Create .aws directory if it doesn't exist
$awsDir = "$env:USERPROFILE\.aws"
if (-not (Test-Path $awsDir)) {
    New-Item -ItemType Directory -Path $awsDir | Out-Null
    Write-Host "Created .aws directory" -ForegroundColor Green
}

# Prompt for credentials
$accessKey = Read-Host "Enter your AWS Access Key ID"
$secretKey = Read-Host "Enter your AWS Secret Access Key" -AsSecureString
$secretKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretKey))

# Create credentials file
$credentialsContent = @"
[default]
aws_access_key_id = $accessKey
aws_secret_access_key = $secretKeyPlain
region = us-east-1
"@

$credentialsFile = "$awsDir\credentials"
$credentialsContent | Out-File -FilePath $credentialsFile -Encoding ASCII

Write-Host ""
Write-Host "Credentials saved to: $credentialsFile" -ForegroundColor Green
Write-Host ""
Write-Host "Now setting up Gemini API key..." -ForegroundColor Cyan
$geminiKey = Read-Host "Enter your Gemini API Key"

# Save Gemini key to a separate secure file
$geminiKeyFile = "$awsDir\gemini-key.txt"
$geminiKey | Out-File -FilePath $geminiKeyFile -Encoding ASCII

Write-Host ""
Write-Host "Gemini API key saved to: $geminiKeyFile" -ForegroundColor Green
Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Your credentials are now stored securely and will be used automatically." -ForegroundColor Cyan
