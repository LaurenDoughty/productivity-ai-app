#!/bin/bash
set -e

echo "=== Productivity Copilot Rollback Script ==="

# Configuration
ENV_NAME="productivity-copilot-prod"
REGION="us-east-1"

# Check if EB CLI is installed
if ! command -v eb &> /dev/null; then
    echo "Error: EB CLI is not installed. Install it with: pip install awsebcli"
    exit 1
fi

# List available versions
echo "Available versions:"
eb appversion --region $REGION

# Prompt for version to rollback to
read -p "Enter version label to rollback to (or press Enter to rollback to previous): " VERSION

if [ -z "$VERSION" ]; then
    echo "Rolling back to previous version..."
    # Get previous version
    PREVIOUS_VERSION=$(eb appversion --region $REGION | grep -v "$(eb status $ENV_NAME --region $REGION | grep 'Deployed Version' | awk '{print $3}')" | head -n 1 | awk '{print $1}')
    VERSION=$PREVIOUS_VERSION
fi

echo "Rolling back to version: $VERSION"

# Confirm rollback
read -p "Are you sure you want to rollback? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Rollback cancelled"
    exit 0
fi

# Perform rollback
echo "Performing rollback..."
eb deploy $ENV_NAME --version $VERSION --region $REGION

# Wait for rollback to complete
echo "Waiting for rollback to complete..."
eb health $ENV_NAME --region $REGION

# Verify health check
echo "Verifying health check..."
sleep 10

HEALTH_URL=$(eb status $ENV_NAME --region $REGION | grep "CNAME" | awk '{print $2}')
if [ -n "$HEALTH_URL" ]; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$HEALTH_URL/health")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Rollback successful! Health check passed."
    else
        echo "⚠️  Rollback completed but health check failed (HTTP $HTTP_CODE)"
        exit 1
    fi
fi

echo "=== Rollback Complete ==="
