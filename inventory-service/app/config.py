import os
from dotenv import load_dotenv

# Load .env file for local development
load_dotenv()

class Config:
    AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-1")
    INVENTORY_TABLE = os.getenv("INVENTORY_TABLE", "danush_inventory")
    PROCESSED_EVENTS_TABLE = os.getenv("PROCESSED_EVENTS_TABLE", "danush_processed_events_table")
    PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:8000")  # fallback url
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    SERVICE_NAME = "Danush_inventory_service"
