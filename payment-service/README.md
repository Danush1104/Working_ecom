# Payment Service Microservice

A production-quality serverless Payment Service built with Python for AWS Lambda and API Gateway. It coordinates creation (initiation), processing, and refunds of payment transactions, communicating updates to the Order Service webhook.

## Features
- **AWS Lambda & API Gateway Native**: Fully compatible with AWS serverless architecture.
- **No Native/Compiled Dependencies**: Packageable by simply zipping the folder.
- **DynamoDB Backed**: Stores payment transactions indexed by payment ID, with a secondary index (`order_id-index`) for order queries.
- **RESTful Endpoints**:
  - `POST /api/payments` - Initiate a payment.
  - `PATCH /api/payments/{payment_id}/process` - Process a pending payment transaction (updates state and calls Order Service webhook).
  - `PATCH /api/payments/{payment_id}/refund` - Refund a successful transaction.
  - `GET /api/payments/{payment_id}` - Retrieve details of a payment.
  - `GET /api/payments/order/{order_id}` - Retrieve all payments for an order.
  - `GET /health` - Health check.

## Environment Variables
- `AWS_REGION` (default: `ap-southeast-1`)
- `PAYMENT_TABLE` (default: `Payments`)
- `ORDER_SERVICE_URL` - Base URL of the Order Service.
- `LOG_LEVEL` (default: `INFO`)

## Package for Deployment
Run the following commands inside `payment-service/` to package the microservice for Lambda:

```bash
# 1. Install dependencies to the root folder
pip install -r requirements.txt -t .

# 2. Package everything into a ZIP file
zip -r payment-service.zip app requirements.txt
```
Then upload `payment-service.zip` directly to your AWS Lambda function and set the handler to `app.lambda_handler.lambda_handler`.
