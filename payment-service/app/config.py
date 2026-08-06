import os
from dotenv import load_dotenv

# Load .env files for local development
load_dotenv()
 
class Config:
    AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-1")
    PAYMENT_TABLE = os.getenv("PAYMENT_TABLE", "Payments")
    ORDER_SERVICE_URL = os.getenv("ORDER_SERVICE_URL", "")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    SERVICE_NAME = "Payment_service"
