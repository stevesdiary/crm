#!/bin/bash

# Test File Upload Endpoint
# This script tests the CRM file upload functionality

echo "=== CRM File Upload Test ==="
echo ""

# Configuration
API_URL="http://localhost:3004"
TEST_FILE="/tmp/test-upload.txt"

# Create a test file
echo "Creating test file..."
echo "This is a test file for CRM upload functionality" > $TEST_FILE
echo "✓ Test file created: $TEST_FILE"
echo ""

# Step 1: Create a test user and get JWT token
echo "Step 1: Creating test user and logging in..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test123!@#",
    "fullName": "Test User",
    "tenantName": "Test Company"
  }')

echo "Signup response: $SIGNUP_RESPONSE"
echo ""

# Extract token (if signup successful, otherwise try login)
TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Signup failed or user exists, trying login..."
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "testuser@example.com",
      "password": "Test123!@#"
    }')
  
  echo "Login response: $LOGIN_RESPONSE"
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  echo "Make sure the server is running on port 3004"
  exit 1
fi

echo "✓ Authentication successful"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Upload file
echo "Step 2: Uploading file..."
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/files/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$TEST_FILE" \
  -F "entityType=contact" \
  -F "entityId=test-123")

echo "Upload response:"
echo "$UPLOAD_RESPONSE" | jq '.' 2>/dev/null || echo "$UPLOAD_RESPONSE"
echo ""

# Step 3: List uploaded files
echo "Step 3: Listing uploaded files..."
LIST_RESPONSE=$(curl -s -X GET "$API_URL/api/v1/files" \
  -H "Authorization: Bearer $TOKEN")

echo "Files list:"
echo "$LIST_RESPONSE" | jq '.' 2>/dev/null || echo "$LIST_RESPONSE"
echo ""

# Cleanup
rm -f $TEST_FILE
echo "✓ Test file cleaned up"
echo ""
echo "=== Test Complete ==="
