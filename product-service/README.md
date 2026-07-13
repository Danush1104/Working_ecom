# Product Service

The Product Service is responsible for managing the product catalog of the e-commerce system. It acts as the single source of truth for product information.

## Directory Structure

```
product-service/
├── app/
│   ├── handlers/
│   │   ├── create_product.py
│   │   ├── delete_product.py
│   │   ├── get_product.py
│   │   ├── list_products.py
│   │   ├── search_products.py
│   │   └── update_product.py
│   ├── services/
│   │   └── product_service.py
│   ├── repositories/
│   │   └── product_repository.py
│   ├── models/
│   │   └── product.py
│   ├── validators/
│   │   └── product_validator.py
│   ├── aws/
│   │   └── dynamodb.py
│   ├── utils/
│   │   ├── date_utils.py
│   │   ├── helpers.py
│   │   ├── http_client.py
│   │   └── id_generator.py
│   ├── config.py
│   ├── constants.py
│   ├── errors.py
│   ├── logger.py
│   ├── response.py
│   ├── router.py
│   └── lambda_handler.py
├── requirements.txt
└── README.md
```

## Environment Variables

- `AWS_REGION` (e.g., `us-east-1`)
- `PRODUCT_TABLE` (default: `Products`)
- `LOG_LEVEL` (default: `INFO`)

## Endpoints

- `POST /api/products` - Create Product
- `GET /api/products` - Get All Active Products
- `GET /api/products/{id}` - Get Product by ID
- `PUT /api/products/{id}` - Update Product (Full)
- `PATCH /api/products/{id}` - Partial Update Product
- `DELETE /api/products/{id}` - Soft Delete Product (Set `is_active=False`)
- `GET /api/products/search` - Search Products by Category, Keyword, Min/Max Price

## Local/Lambda Deployment

1. Install dependencies:
   ```bash
   pip install -r requirements.txt -t .
   ```
2. Zip the folder and upload to AWS Lambda.
3. Set environment variables.
