from typing import Any, Dict, List, Optional, Tuple
import boto3
from botocore.exceptions import ClientError
from app.aws.dynamodb import get_inventory_table, get_processed_events_table
from app.models.inventory import Inventory
from app.errors import DatabaseError
from app.logger import logger

class InventoryRepository:
    def __init__(self):
        self.table = get_inventory_table()
        self.events_table = get_processed_events_table()

    def create_inventory(self, inventory: Inventory) -> None:
        """Puts a new inventory record into the table."""
        try:
            self.table.put_item(
                Item=inventory.to_dict(),
                ConditionExpression="attribute_not_exists(product_id)"
            )
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise e
            logger.error(f"Failed to create inventory in DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during inventory creation: {str(e)}")

    def get_inventory(self, product_id: str) -> Optional[Inventory]:
        """Retrieves stock information for a product."""
        try:
            response = self.table.get_item(Key={"product_id": product_id})
            item = response.get("Item")
            if not item:
                return None
            return Inventory.from_dict(item)
        except ClientError as e:
            logger.error(f"Failed to get inventory from DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during inventory retrieval: {str(e)}")

    def list_inventory(self) -> List[Inventory]:
        """Scans the inventory table to list all stock items."""
        try:
            response = self.table.scan()
            items = response.get("Items", [])
            return [Inventory.from_dict(item) for item in items]
        except ClientError as e:
            logger.error(f"Failed to list inventory from DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during inventory listing: {str(e)}")

    def list_inventory_paginated(self, limit: Optional[int] = None, start_key: Optional[dict] = None) -> Tuple[List[Inventory], Optional[dict]]:
        """Scans inventory table with optional DynamoDB pagination."""
        try:
            kwargs = {}
            if limit is not None:
                kwargs["Limit"] = limit
            if start_key is not None:
                kwargs["ExclusiveStartKey"] = start_key
            response = self.table.scan(**kwargs)
            items = response.get("Items", [])
            next_key = response.get("LastEvaluatedKey")  # None if last page
            return [Inventory.from_dict(item) for item in items], next_key
        except ClientError as e:
            logger.error(f"Failed to paginated list inventory from DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during paginated inventory listing: {str(e)}")

    def update_stock(self, product_id: str, stock: int, updated_at: str) -> None:
        """Updates absolute stock level if the new stock is >= currently reserved stock."""
        try:
            self.table.update_item(
                Key={"product_id": product_id},
                UpdateExpression="SET stock = :stock, updated_at = :updated_at",
                ConditionExpression="attribute_exists(product_id) AND :stock >= reserved",
                ExpressionAttributeValues={
                    ":stock": stock,
                    ":updated_at": updated_at
                }
            )
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise e
            logger.error(f"Failed to update stock in DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during stock update: {str(e)}")

    def reserve_stock(self, product_id: str, quantity: int, updated_at: str) -> None:
        """Atomically reserves stock using optimistic concurrency control with retries."""
        print("Inventory Repository Version 2")
        max_retries = 3
        for attempt in range(max_retries + 1):
            inventory = self.get_inventory(product_id)
            if not inventory:
                raise ClientError(
                    {
                        "Error": {
                            "Code": "ConditionalCheckFailedException",
                            "Message": f"Inventory record for product {product_id} not found"
                        }
                    },
                    "UpdateItem"
                )

            if inventory.available < quantity:
                raise ClientError(
                    {
                        "Error": {
                            "Code": "ConditionalCheckFailedException",
                            "Message": "Insufficient stock available to satisfy reservation"
                        }
                    },
                    "UpdateItem"
                )

            try:
                self.table.update_item(
                    Key={"product_id": product_id},
                    UpdateExpression="SET reserved = reserved + :qty, updated_at = :updated_at",
                    ConditionExpression="attribute_exists(product_id) AND reserved = :current_reserved",
                    ExpressionAttributeValues={
                        ":qty": quantity,
                        ":current_reserved": inventory.reserved,
                        ":updated_at": updated_at
                    }
                )
                # Success!
                return
            except ClientError as e:
                if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                    # If this is the last attempt, or if inventory no longer exists, raise exception
                    if attempt == max_retries or not self.inventory_exists(product_id):
                        raise e
                    logger.info(f"Concurrency conflict during stock reservation for product {product_id}. Retrying (attempt {attempt + 1}/{max_retries})...")
                    import time
                    time.sleep(0.05 * (attempt + 1))  # simple incremental backoff
                    continue
                logger.error(f"Failed to reserve stock in DynamoDB: {str(e)}")
                raise DatabaseError(f"Database error during stock reservation: {str(e)}")

    def release_stock(self, product_id: str, quantity: int, updated_at: str) -> None:
        """Atomically releases reserved stock back to available stock. Ensures reserved >= quantity."""
        try:
            self.table.update_item(
                Key={"product_id": product_id},
                UpdateExpression="SET reserved = reserved - :qty, updated_at = :updated_at",
                ConditionExpression="attribute_exists(product_id) AND reserved >= :qty",
                ExpressionAttributeValues={
                    ":qty": quantity,
                    ":updated_at": updated_at
                }
            )
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise e
            logger.error(f"Failed to release stock in DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during stock release: {str(e)}")

    def deduct_stock(self, product_id: str, quantity: int, updated_at: str) -> None:
        """Atomically deducts stock on successful payment (decreases stock & reserved)."""
        try:
            self.table.update_item(
                Key={"product_id": product_id},
                UpdateExpression="SET stock = stock - :qty, reserved = reserved - :qty, updated_at = :updated_at",
                ConditionExpression="attribute_exists(product_id) AND stock >= :qty AND reserved >= :qty",
                ExpressionAttributeValues={
                    ":qty": quantity,
                    ":updated_at": updated_at
                }
            )
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise e
            logger.error(f"Failed to deduct stock in DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during stock deduction: {str(e)}")

    def admin_deduct_stock(self, product_id: str, quantity: int, updated_at: str) -> None:
        """Atomically deducts stock administratively (decreases total stock without touching reserved)."""
        max_retries = 3
        for attempt in range(max_retries + 1):
            inventory = self.get_inventory(product_id)
            if not inventory:
                raise ClientError(
                    {
                        "Error": {
                            "Code": "ConditionalCheckFailedException",
                            "Message": f"Inventory record for product {product_id} not found"
                        }
                    },
                    "UpdateItem"
                )

            if (inventory.stock - quantity) < inventory.reserved:
                raise ClientError(
                    {
                        "Error": {
                            "Code": "ConditionalCheckFailedException",
                            "Message": "Cannot deduct stock below reserved amount"
                        }
                    },
                    "UpdateItem"
                )

            try:
                self.table.update_item(
                    Key={"product_id": product_id},
                    UpdateExpression="SET stock = stock - :qty, updated_at = :updated_at",
                    ConditionExpression="attribute_exists(product_id) AND stock = :current_stock",
                    ExpressionAttributeValues={
                        ":qty": quantity,
                        ":current_stock": inventory.stock,
                        ":updated_at": updated_at
                    }
                )
                return
            except ClientError as e:
                if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                    if attempt == max_retries or not self.inventory_exists(product_id):
                        raise e
                    logger.info(f"Concurrency conflict during admin deduct for product {product_id}. Retrying (attempt {attempt + 1}/{max_retries})...")
                    import time
                    time.sleep(0.05 * (attempt + 1))
                    continue
                logger.error(f"Failed to administratively deduct stock in DynamoDB: {str(e)}")
                raise DatabaseError(f"Database error during administrative stock deduction: {str(e)}")

    def restore_stock(self, product_id: str, quantity: int, updated_at: str) -> None:
        """Atomically restores stock after cancellations (increases stock level)."""
        try:
            self.table.update_item(
                Key={"product_id": product_id},
                UpdateExpression="SET stock = stock + :qty, updated_at = :updated_at",
                ConditionExpression="attribute_exists(product_id)",
                ExpressionAttributeValues={
                    ":qty": quantity,
                    ":updated_at": updated_at
                }
            )
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise e
            logger.error(f"Failed to restore stock in DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during stock restoration: {str(e)}")

    def inventory_exists(self, product_id: str) -> bool:
        """Checks if inventory record exists."""
        try:
            response = self.table.get_item(
                Key={"product_id": product_id},
                ProjectionExpression="product_id"
            )
            return "Item" in response
        except ClientError as e:
            logger.error(f"Failed to check inventory existence in DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error checking inventory existence: {str(e)}")

    # --- Idempotency helpers on ProcessedEvents table ---

    def is_event_processed(self, event_id: str) -> bool:
        """Checks if the event was already processed."""
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
        """Registers the event_id as processed to prevent double execution."""
        try:
            self.events_table.put_item(
                Item={
                    "event_id": event_id,
                    "event_name": event_name,
                    "processed_at": processed_at
                },
                # Enforce idempotency check at DynamoDB level as well
                ConditionExpression="attribute_not_exists(event_id)"
            )
        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            if error_code == "ConditionalCheckFailedException":
                raise e
            if error_code == "ResourceNotFoundException":
                logger.warning("Processed events table not found. Skipping idempotency mark.")
                return
            logger.error(f"Failed to save processed event ID to DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error saving processed event: {str(e)}")
