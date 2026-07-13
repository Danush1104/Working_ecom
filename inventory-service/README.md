# Inventory Service

The Inventory Service manages stock levels and reservations for products.

## Directory Structure

```
inventory-service/
├── app/
│   ├── handlers/
│   │   ├── create_inventory.py
│   │   ├── deduct_stock.py
│   │   ├── get_inventory.py
│   │   ├── list_inventory.py
│   │   ├── release_stock.py
│   │   ├── reserve_stock.py
│   │   ├── restore_stock.py
│   │   └── update_stock.py
│   ├── services/
│   │   └── inventory_service.py
│   ├── repositories/
│   │   └── inventory_repository.py
│   ├── models/
│   │   └── inventory.py
│   ├── validators/
│   │   └── inventory_validator.py
│   ├── aws/
│   │   ├── dynamodb.py
│   │   └── sqs.py
│   ├── events/
│   │   ├── consumer.py
│   │   ├── events.py
│   │   └── publisher.py
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

- `AWS_REGION` (e.g. `us-east-1`)
- `INVENTORY_TABLE` (default: `Inventory`)
- `PROCESSED_EVENTS_TABLE` (default: `ProcessedEvents`)
- `PRODUCT_SERVICE_URL` (to verify products exist)
- `LOG_LEVEL` (default: `INFO`)

## Endpoints

- `POST /api/inventory` - Initialize stock
- `GET /api/inventory/{product_id}` - Get stock details (calculates `available = stock - reserved`)
- `GET /api/inventory` - List all inventory items
- `PATCH /api/inventory/{product_id}/stock` - Adjust absolute stock
- `PATCH /api/inventory/reserve` - Reserve items (increases `reserved` atomically)
- `PATCH /api/inventory/release` - Release reservation (decreases `reserved` atomically)
- `PATCH /api/inventory/deduct` - Deduct stock (decreases `stock` & `reserved` atomically)
- `PATCH /api/inventory/restore` - Restore stock (increases `stock` atomically)

## SQS Event Consumers

Listens on the SQS queue mapping to `inventory-events`:
- `PaymentCompleted` -> Deducts stock (`stock -= quantity, reserved -= quantity` atomically).
- `PaymentFailed` -> Releases stock reservation (`reserved -= quantity` atomically).
- `OrderCancelled` -> Restores stock (`stock += quantity` atomically).
