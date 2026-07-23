import os
from dotenv import load_dotenv

# Load .env file for local development
load_dotenv()

class Config:
    AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-1")
    WISHLIST_TABLE = os.getenv("WISHLIST_TABLE", "danush_wishlist_table")
    PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    SERVICE_NAME = "Wishlist_service"
