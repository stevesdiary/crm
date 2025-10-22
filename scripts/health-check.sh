#!/bin/bash

# Health check script for deployment verification

API_URL="${API_URL:-http://localhost:3000}"
MAX_RETRIES=30
RETRY_INTERVAL=10

echo "Starting health check for $API_URL"

for i in $(seq 1 $MAX_RETRIES); do
  echo "Attempt $i/$MAX_RETRIES..."
  
  response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
  
  if [ "$response" = "200" ]; then
    echo "✓ Health check passed!"
    exit 0
  fi
  
  echo "Health check failed (HTTP $response). Retrying in ${RETRY_INTERVAL}s..."
  sleep $RETRY_INTERVAL
done

echo "✗ Health check failed after $MAX_RETRIES attempts"
exit 1
