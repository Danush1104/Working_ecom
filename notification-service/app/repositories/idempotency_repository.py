import boto3
from botocore.exceptions import ClientError
from app.config import Config
from app.logger import logger
from app.errors import InternalServerError

class IdempotencyRepository:
    def __init__(self):
        dynamodb = boto3.resource("dynamodb", region_name=Config.AWS_REGION)
        self.table = dynamodb.Table(Config.PROCESSED_EVENTS_TABLE)
        
    def is_event_processed(self, event_id: str) -> bool:
        try:
            response = self.table.get_item(Key={"event_id": event_id})
            return "Item" in response
        except ClientError as e:
            logger.error(f"Failed to get item from idempotency table: {str(e)}")
            raise InternalServerError(f"Database error during idempotency get: {str(e)}")
            
    def mark_event_processed(self, event_id: str, event_name: str, processed_at: str) -> bool:
        """
        Attempts to insert the idempotency record. 
        Returns True if successful.
        Returns False if the record already exists (event already processed).
        """
        try:
            self.table.put_item(
                Item={
                    "event_id": event_id,
                    "event_name": event_name,
                    "processed_at": processed_at
                },
                ConditionExpression="attribute_not_exists(event_id)"
            )
            return True
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                return False
            logger.error(f"Failed to write to idempotency table: {str(e)}")
            raise InternalServerError(f"Database error during idempotency write: {str(e)}")
