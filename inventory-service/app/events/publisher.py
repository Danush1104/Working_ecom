import json
from typing import Any, Dict
from botocore.exceptions import ClientError
from app.aws.sqs import get_sqs_client
from app.logger import logger
from app.errors import DatabaseError

def publish_event(queue_url: str, event: Dict[str, Any]) -> None:
    """Publishes a structured event message to an SQS queue."""
    sqs = get_sqs_client()
    event_id = event.get("event_id")
    event_name = event.get("event_name")
    
    try:
        logger.info(f"Publishing SQS event: {event_name} (ID: {event_id}) to {queue_url}")
        sqs.send_message(
            QueueUrl=queue_url,
            MessageBody=json.dumps(event)
        )
        logger.info(f"Successfully published SQS event: {event_name} (ID: {event_id})")
    except ClientError as e:
        logger.error(f"Failed to publish SQS event {event_name}: {str(e)}")
        raise DatabaseError(f"Failed to publish event to SQS: {str(e)}")
