#!/bin/bash
set -e

echo "Verifying environment variables documentation..."

# Check if .env.template exists
if [ ! -f ".env.template" ]; then
    echo "❌ Error: .env.template file not found"
    exit 1
fi

# Required variables
REQUIRED_VARS=(
    "VITE_AI_PROVIDER"
    "VITE_GEMINI_API_KEY"
    "AWS_REGION"
    "PORT"
    "NODE_ENV"
)

# Check each required variable is documented
MISSING_VARS=()
for VAR in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^$VAR=" .env.template && ! grep -q "^# $VAR=" .env.template; then
        MISSING_VARS+=("$VAR")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Error: The following required variables are not documented in .env.template:"
    for VAR in "${MISSING_VARS[@]}"; do
        echo "  - $VAR"
    done
    exit 1
fi

echo "✅ All required environment variables are documented"
