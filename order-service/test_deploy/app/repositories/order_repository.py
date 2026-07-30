from typing import List, Optional, Tuple
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key
from app.aws.dynamodb import get_order_table, get_processed_events_table
from app.models.order import Order
from app.errors import DatabaseError
from app.logger import logger

class OrderRepository:
    def __init__(self):
        self.table = get_order_table()
        self.events_table = get_processed_events_table()

    def save_order(self, order: Order) -> None:
        """Saves (creates or updates) an order item in DynamoDB."""
        try:
            self.table.put_item(Item=order.to_dict())
        except ClientError as e:
            logger.error(f"Failed to save order in DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during saving order: {str(e)}")

    def get_order(self, user_id: str, order_id: str) -> Optional[Order]:
        """Retrieves a single order by user_id and order_id."""
        try:
            response = self.table.get_item(
                Key={"user_id": user_id, "order_id": order_id}
            )
            item = response.get("Item")
            if not item:
                return None
            return Order.from_dict(item)
        except ClientError as e:
            logger.error(f"Failed to get order from DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during order retrieval: {str(e)}")

    def get_user_orders(self, user_id: str) -> List[Order]:
        """
        Retrieves all orders for a specific user.
        Uses ScanIndexForward=False to fetch newest orders first.
        """
        try:
            # Sort Key is order_id. Since we prefix with ORD-YYYYMMDDHHMMSS,
            # ScanIndexForward=False naturally sorts chronologically descending.
            response = self.table.query(
                KeyConditionExpression=Key("user_id").eq(user_id),
                ScanIndexForward=False
            )
            items = response.get("Items", []) or []
            orders = [Order.from_dict(item) for item in items]
            
            # Fallback sort in memory to ensure perfect chronological sorting in all cases
            orders.sort(key=lambda x: x.created_at, reverse=True)
            return orders
        except ClientError as e:
            logger.error(f"Failed to query orders for user {user_id}: {str(e)}")
            raise DatabaseError(f"Database error during user orders retrieval: {str(e)}")

    def scan_all_orders(self) -> List[Order]:
        """Scans the entire Orders table to retrieve all orders across all users."""
        try:
            response = self.table.scan()
            items = response.get("Items", []) or []
            return [Order.from_dict(item) for item in items]
        except ClientError as e:
            logger.error(f"Failed to scan orders table: {str(e)}")
            raise DatabaseError(f"Database error during orders scan: {str(e)}")

    def scan_all_orders_paginated(self, limit: Optional[int] = None, start_key: Optional[dict] = None) -> Tuple[List[Order], Optional[dict]]:
        """Scans orders table with optional DynamoDB pagination."""
        try:
            kwargs = {}
            if limit is not None:
                kwargs["Limit"] = limit
            if start_key is not None:
                kwargs["ExclusiveStartKey"] = start_key
            response = self.table.scan(**kwargs)
            items = response.get("Items", []) or []
            next_key = response.get("LastEvaluatedKey")  # None if last page
            return [Order.from_dict(item) for item in items], next_key
        except ClientError as e:
            logger.error(f"Failed to paginated scan orders table: {str(e)}")
            raise DatabaseError(f"Database error during paginated orders scan: {str(e)}")

    # --- Idempotency helpers on danush_processed_events_table ---

    def is_event_processed(self, event_id: str) -> bool:
        """Checks if the event (e.g. payment_id) was already fully processed."""
        try:
            response = self.events_table.get_item(
                Key={"event_id": event_id},
                ProjectionExpression="event_id"
            )
            return "Item" in response
        except ClientError as e:
            if e.response["Error"]["Code"] == "ResourceNotFoundException":
                logger.warning("Processed events table not found. Skipping idempotency check.")
                return False
            logger.error(f"Failed to query processed event from DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error reading processed events: {str(e)}")

    def mark_event_processed(self, event_id: str, event_name: str, processed_at: str) -> None:
        """Records event_id as processed to prevent duplicate side-effects on retry."""
        try:
            self.events_table.put_item(
                Item={
                    "event_id": event_id,
                    "event_name": event_name,
                    "processed_at": processed_at
                },
                # If the record already exists (race condition), do not overwrite it
                ConditionExpression="attribute_not_exists(event_id)"
            )
        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            if error_code == "ConditionalCheckFailedException":
                # Another concurrent request already marked this event processed — safe to ignore
                logger.warning(f"Event {event_id} already marked processed (concurrent write). Ignoring.")
                return
            if error_code == "ResourceNotFoundException":
                logger.warning("Processed events table not found. Skipping idempotency mark.")
                return
            logger.error(f"Failed to save processed event ID to DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error saving processed event: {str(e)}")
