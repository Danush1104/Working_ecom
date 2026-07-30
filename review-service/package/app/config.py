import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class Config:
    AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-1")
    CART_TABLE = os.getenv("CART_TABLE", "Cart")
    PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "")
    INVENTORY_SERVICE_URL = os.getenv("INVENTORY_SERVICE_URL", "")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    SERVICE_NAME = "Cart_service"
