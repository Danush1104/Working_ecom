from app.router import handle_request
from app.logger import get_logger

logger = get_logger(__name__)

def lambda_handler(event, context):
    logger.info("Received event")
    return handle_request(event, context)
