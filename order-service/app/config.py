import os
from dotenv import load_dotenv

# Load .env file for local development
load_dotenv()

class Config:
    AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-1")
    ORDER_TABLE = os.getenv("ORDER_TABLE", "Orders")
    PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "")
    CART_SERVICE_URL = os.getenv("CART_SERVICE_URL", "")
    INVENTORY_SERVICE_URL = os.getenv("INVENTORY_SERVICE_URL", "")
    PAYMENT_SERVICE_URL = os.getenv("PAYMENT_SERVICE_URL", "")
    # Shared idempotency table — must match existing DynamoDB table name
    PROCESSED_EVENTS_TABLE = os.getenv("PROCESSED_EVENTS_TABLE", "danush_processed_events_table")
    SNS_TOPIC_ARN = os.getenv("SNS_TOPIC_ARN", "")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    SERVICE_NAME = "Order_service"
