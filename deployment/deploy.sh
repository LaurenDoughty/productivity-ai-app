#!/bin/bash
set -e

echo "=== Productivity Copilot Deployment Script ==="

# Configuration
APP_NAME="productivity-copilot"
ENV_NAME="productivity-copilot-prod"
REGION="us-east-1"

# Check if EB CLI is installed
if ! command -v eb &> /dev/null; then
    echo "Error: EB CLI is not installed. Install it with: pip install awsebcli"
    exit 1
fi

# Run validation
echo "Running build validation..."
bash scripts/validate-build.sh

# Create version metadata
VERSION=$(date +%Y%m%d-%H%M%S)
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

cat > deployment/version.json <<EOF
{
  "version": "$VERSION",
  "buildTimestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "gitCommit": "$GIT_COMMIT",
  "environment": "production"
}
EOF

echo "Version: $VERSION"
echo "Git Commit: $GIT_COMMIT"

# Build application
echo "Building application..."
npm run build

# Deploy to Elastic Beanstalk
echo "Deploying to Elastic Beanstalk..."
eb deploy $ENV_NAME --region $REGION --label $VERSION

# Wait for deployment to complete
echo "Waiting for deployment to complete..."
eb health $ENV_NAME --region $REGION

# Verify health check
echo "Verifying health check..."
sleep 10

HEALTH_URL=$(eb status $ENV_NAME --region $REGION | grep "CNAME" | awk '{print $2}')
if [ -n "$HEALTH_URL" ]; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$HEALTH_URL/health")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Deployment successful! Health check passed."
        echo "Application URL: https://$HEALTH_URL"
    else
        echo "⚠️  Deployment completed but health check failed (HTTP $HTTP_CODE)"
        exit 1
    fi
else
    echo "⚠️  Could not determine application URL"
fi

echo "=== Deployment Complete ==="
