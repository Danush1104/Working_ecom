#!/bin/bash

# Configuration
API_BASE_URL="https://example.execute-api.us-east-1.amazonaws.com/prod"
PRODUCT_ID="PROD-a8f585d852a348508e7fb024ff0e2060"

echo "=== 1. Create a Product ==="
curl -X POST "${API_BASE_URL}/api/products" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: CORR-123456" \
  -d '{
    "product_id": "'"${PRODUCT_ID}"'",
    "name": "Gaming Laptop",
    "description": "RTX 4060 Gaming Laptop with 16GB RAM",
    "category": "Electronics",
    "price": 65000.00,
    "image_url": "https://example.com/laptop.jpg"
  }'

echo -e "\n\n=== 2. List All Active Products ==="
curl -X GET "${API_BASE_URL}/api/products" \
  -H "X-Correlation-ID: CORR-123456"

echo -e "\n\n=== 3. Get Product by ID ==="
curl -X GET "${API_BASE_URL}/api/products/${PRODUCT_ID}" \
  -H "X-Correlation-ID: CORR-123456"

echo -e "\n\n=== 4. Full Update (PUT) ==="
curl -X PUT "${API_BASE_URL}/api/products/${PRODUCT_ID}" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: CORR-123456" \
  -d '{
    "name": "Super Gaming Laptop",
    "description": "RTX 4070 Gaming Laptop with 32GB RAM",
    "category": "Electronics",
    "price": 75000.00,
    "image_url": "https://example.com/laptop_updated.jpg"
  }'

echo -e "\n\n=== 5. Partial Update (PATCH) ==="
curl -X PATCH "${API_BASE_URL}/api/products/${PRODUCT_ID}" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: CORR-123456" \
  -d '{
    "price": 72000.00
  }'

echo -e "\n\n=== 6. Search Products by Category ==="
curl -X GET "${API_BASE_URL}/api/products/search?category=Electronics" \
  -H "X-Correlation-ID: CORR-123456"

echo -e "\n\n=== 7. Search Products with Filters ==="
curl -X GET "${API_BASE_URL}/api/products/search?category=Electronics&keyword=Laptop&min_price=50000&max_price=80000" \
  -H "X-Correlation-ID: CORR-123456"

echo -e "\n\n=== 8. Soft Delete Product ==="
curl -X DELETE "${API_BASE_URL}/api/products/${PRODUCT_ID}" \
  -H "X-Correlation-ID: CORR-123456"
