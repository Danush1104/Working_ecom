import os
from dotenv import load_dotenv

# Load .env file for local development
load_dotenv()

class Config:
    AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-1")
    PRODUCT_TABLE = os.getenv("PRODUCT_TABLE", "danush_products_table")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    SERVICE_NAME = "Danush_product_service"
