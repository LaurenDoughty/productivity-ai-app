#!/bin/bash
set -e

echo "=== Build Validation Script ==="

# Run linting
echo "Running ESLint..."
npm run lint

# Run type checking
echo "Running TypeScript type check..."
npm run type-check

# Verify environment variables are documented
echo "Verifying environment variables..."
bash scripts/verify-env.sh

# Run tests
echo "Running tests..."
npm run test:unit

echo "✅ All validation checks passed"
