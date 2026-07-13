# Order Service Microservice

A production-quality serverless Order Service built with Python for AWS Lambda and API Gateway. It coordinates order creation (checkout), cancellation, and payment status updates with the Cart, Product, Inventory, and Payment services.

## Features
- **AWS Lambda & API Gateway Native**: Fully compatible with AWS serverless architecture.
- **No Native/Compiled Dependencies**: Packageable by simply zipping the folder.
- **DynamoDB Backed**: Stores orders chronologically using sort keys and descending alphabetical order query keys.
- **RESTful Endpoints**:
  - `POST /api/orders` - Check out the user's cart (creates pending order and clears cart).
  - `GET /api/orders/{user_id}` - Retrieve user's orders sorted newest first.
  - `GET /api/orders/{user_id}/{order_id}` - Retrieve a single order.
  - `PATCH /api/orders/{user_id}/{order_id}/cancel` - Cancel a pending/processing order (releases reserved stock).
  - `PATCH /internal/orders/{user_id}/{order_id}/payment` - Process payment webhook updates (Success, Failed, Refunded status transitions).
  - `GET /health` - Raw health endpoint check.

## Environment Variables
- `AWS_REGION` (default: `ap-southeast-1`)
- `ORDER_TABLE` (default: `Orders`)
- `PRODUCT_SERVICE_URL` - Base URL of the Product Service.
- `CART_SERVICE_URL` - Base URL of the Cart Service.
- `INVENTORY_SERVICE_URL` - Base URL of the Inventory Service.
- `PAYMENT_SERVICE_URL` - Base URL of the Payment Service.
- `LOG_LEVEL` (default: `INFO`)

## Package for Deployment
Run the following commands inside `order-service/` to package the microservice for Lambda:

```bash
# 1. Install dependencies to the root folder
pip install -r requirements.txt -t .

# 2. Package everything into a ZIP file
zip -r order-service.zip app requirements.txt
```
Then upload `order-service.zip` directly to your AWS Lambda function and set the handler to `app.lambda_handler.lambda_handler`.
