#!/bin/bash

# Configuration
API_BASE_URL="https://example.execute-api.us-east-1.amazonaws.com/prod"
PRODUCT_ID="PROD-a8f585d852a348508e7fb024ff0e2060"

echo "=== 1. Initialize Stock ==="
curl -X POST "${API_BASE_URL}/api/inventory" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: CORR-998877" \
  -d '{
    "product_id": "'"${PRODUCT_ID}"'",
    "stock": 100
  }'

echo -e "\n\n=== 2. Get Stock Info ==="
curl -X GET "${API_BASE_URL}/api/inventory/${PRODUCT_ID}" \
  -H "X-Correlation-ID: CORR-998877"

echo -e "\n\n=== 3. List All Inventory Items ==="
curl -X GET "${API_BASE_URL}/api/inventory" \
  -H "X-Correlation-ID: CORR-998877"

echo -e "\n\n=== 4. Adjust Absolute Stock (Admin) ==="
curl -X PATCH "${API_BASE_URL}/api/inventory/${PRODUCT_ID}/stock" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: CORR-998877" \
  -d '{
    "stock": 250
  }'

echo -e "\n\n=== 5. Reserve Stock ==="
curl -X PATCH "${API_BASE_URL}/api/inventory/reserve" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: CORR-998877" \
  -d '{
    "product_id": "'"${PRODUCT_ID}"'",
    "quantity": 5
  }'

echo -e "\n\n=== 6. Release Reservation ==="
curl -X PATCH "${API_BASE_URL}/api/inventory/release" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: CORR-998877" \
  -d '{
    "product_id": "'"${PRODUCT_ID}"'",
    "quantity": 2
  }'

echo -e "\n\n=== 7. Deduct Stock ==="
curl -X PATCH "${API_BASE_URL}/api/inventory/deduct" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: CORR-998877" \
  -d '{
    "product_id": "'"${PRODUCT_ID}"'",
    "quantity": 3
  }'

echo -e "\n\n=== 8. Restore Stock ==="
curl -X PATCH "${API_BASE_URL}/api/inventory/restore" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: CORR-998877" \
  -d '{
    "product_id": "'"${PRODUCT_ID}"'",
    "quantity": 3
  }'
