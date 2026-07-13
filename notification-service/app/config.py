import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class Config:
    AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-1")
    PROCESSED_EVENTS_TABLE = os.getenv("PROCESSED_EVENTS_TABLE", "danush_processed_events_table")
    SENDER_EMAIL = os.getenv("SENDER_EMAIL", "noreply@example.com")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    SERVICE_NAME = "Notification_service"
    
    # SMTP Configuration (Replacing SES)
    SMTP_HOST = os.getenv("SMTP_HOST", "localhost")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
