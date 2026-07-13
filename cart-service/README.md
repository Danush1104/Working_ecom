# Cart Service Microservice

A production-quality serverless Cart Service built with Python for AWS Lambda and API Gateway. It interacts with Product Service and Inventory Service to manage users' e-commerce carts with stock reservations.

## Features
- **AWS Lambda & API Gateway Native**: Fully compatible with AWS serverless architecture.
- **No Native/Compiled Dependencies**: Easily packageable by simply zipping the folder.
- **RESTful Endpoints**:
  - `POST /api/cart` - Add an item to the cart (checks product existence and reserves stock).
  - `GET /api/cart/{user_id}` - View enriched cart with latest prices/details and totals.
  - `PATCH /api/cart` - Adjust cart item quantities (reserves/releases difference only).
  - `DELETE /api/cart/{user_id}/{product_id}` - Remove a specific product from cart (releases stock).
  - `DELETE /api/cart/{user_id}` - Clear entire cart (releases all stock).
  - `DELETE /internal/cart/{user_id}` - Internal cart clear for order checkouts (can skip stock release).
- **Outbound HTTP Client**: Includes retries, exponential backoff, jitter, propagation of Correlation IDs, and custom error mapping.
- **Structured JSON Logging**: Request tracing with request/correlation/Lambda request IDs and execution time metrics.

## Project Structure
```
cart-service/
│
├── app/
│   ├── handlers/
│   │   ├── add_item.py
│   │   ├── view_cart.py
│   │   ├── update_quantity.py
│   │   ├── remove_item.py
│   │   ├── clear_cart.py
│   │   └── internal_clear_cart.py
│   │
│   ├── services/
│   │   └── cart_service.py
│   │
│   ├── repositories/
│   │   └── cart_repository.py
│   │
│   ├── validators/
│   │   └── cart_validator.py
│   │
│   ├── models/
│   │   └── cart.py
│   │
│   ├── aws/
│   │   └── dynamodb.py
│   │
│   ├── utils/
│   │   ├── helpers.py
│   │   ├── http_client.py
│   │   ├── date_utils.py
│   │   └── id_generator.py
│   │
│   ├── config.py
│   ├── constants.py
│   ├── errors.py
│   ├── logger.py
│   ├── response.py
│   ├── router.py
│   └── lambda_handler.py
│
├── requirements.txt
└── README.md
```

## DynamoDB Table Schema
- **Table Name**: `Cart` (configured via `CART_TABLE` env var).
- **Partition Key**: `user_id` (String)
- **Sort Key**: `product_id` (String)
- **Attributes**:
  - `user_id` (String)
  - `product_id` (String)
  - `quantity` (Number)
  - `created_at` (String)
  - `updated_at` (String)

## Environment Variables
- `AWS_REGION` (default: `ap-southeast-1`)
- `CART_TABLE` (default: `Cart`)
- `PRODUCT_SERVICE_URL` - Base URL of the Product Service (e.g., `http://product-service-alb-12345.amazonaws.com`).
- `INVENTORY_SERVICE_URL` - Base URL of the Inventory Service (e.g., `http://inventory-service-alb-12345.amazonaws.com`).
- `LOG_LEVEL` (default: `INFO`)

## Package for Deployment
Run the following commands inside `cart-service/` to prepare the deployment package:

```bash
# 1. Install dependencies to the root folder
pip install -r requirements.txt -t .

# 2. Package everything into a ZIP file (exclude standard dev artifacts if desired)
zip -r cart-service.zip app requirements.txt
```
Then upload the `cart-service.zip` directly to your AWS Lambda function and point the handler to `app.lambda_handler.lambda_handler`.
