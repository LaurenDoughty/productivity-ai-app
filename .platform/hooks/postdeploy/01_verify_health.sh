#!/bin/bash
set -e

echo "Verifying application health..."

# Wait for application to start
sleep 10

# Check health endpoint
HEALTH_CHECK_URL="http://localhost:8080/health"
MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_CHECK_URL)
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "Health check passed (HTTP $HTTP_CODE)"
    exit 0
  fi
  
  echo "Health check failed (HTTP $HTTP_CODE), retrying... ($((RETRY_COUNT + 1))/$MAX_RETRIES)"
  RETRY_COUNT=$((RETRY_COUNT + 1))
  sleep 5
done

echo "Health check failed after $MAX_RETRIES attempts"
exit 1
