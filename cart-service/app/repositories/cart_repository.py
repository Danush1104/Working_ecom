from typing import List, Optional, Tuple
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key
from app.aws.dynamodb import get_cart_table
from app.models.cart import CartItem
from app.errors import DatabaseError
from app.logger import logger

class CartRepository:
    def __init__(self):
        self.table = get_cart_table()

    def get_cart_item(self, user_id: str, product_id: str) -> Optional[CartItem]:
        """Retrieves a single cart item by user_id and product_id."""
        try:
            response = self.table.get_item(
                Key={"user_id": user_id, "product_id": product_id},
                ConsistentRead=True
            )
            item = response.get("Item")
            if not item:
                return None
            return CartItem.from_dict(item)
        except ClientError as e:
            logger.error(f"Failed to get cart item from DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during cart item retrieval: {str(e)}")

    def get_cart_items(self, user_id: str) -> List[CartItem]:
        """Retrieves all cart items for a specific user."""
        try:
            response = self.table.query(
                KeyConditionExpression=Key("user_id").eq(user_id),
                ConsistentRead=True
            )
            items = response.get("Items", [])
            return [CartItem.from_dict(item) for item in items]
        except ClientError as e:
            logger.error(f"Failed to query cart items from DynamoDB for user {user_id}: {str(e)}")
            raise DatabaseError(f"Database error during cart retrieval: {str(e)}")

    def save_cart_item(self, cart_item: CartItem) -> None:
        """Saves (creates or updates) a cart item."""
        try:
            self.table.put_item(Item=cart_item.to_dict())
        except ClientError as e:
            logger.error(f"Failed to save cart item in DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during saving cart item: {str(e)}")

    def delete_cart_item(self, user_id: str, product_id: str) -> None:
        """Deletes a single cart item."""
        try:
            self.table.delete_item(
                Key={"user_id": user_id, "product_id": product_id}
            )
        except ClientError as e:
            logger.error(f"Failed to delete cart item from DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during cart item deletion: {str(e)}")

    def scan_all_items(self) -> List[CartItem]:
        """Scans the entire Cart table to retrieve all items across all users."""
        try:
            response = self.table.scan()
            items = response.get("Items", []) or []
            return [CartItem.from_dict(item) for item in items]
        except ClientError as e:
            logger.error(f"Failed to scan cart table: {str(e)}")
            raise DatabaseError(f"Database error during cart scan: {str(e)}")

    def scan_all_items_paginated(self, limit: Optional[int] = None, start_key: Optional[dict] = None) -> Tuple[List[CartItem], Optional[dict]]:
        """Scans cart table with optional DynamoDB pagination."""
        try:
            kwargs = {}
            if limit is not None:
                kwargs["Limit"] = limit
            if start_key is not None:
                kwargs["ExclusiveStartKey"] = start_key
            response = self.table.scan(**kwargs)
            items = response.get("Items", []) or []
            next_key = response.get("LastEvaluatedKey")  # None if last page
            return [CartItem.from_dict(item) for item in items], next_key
        except ClientError as e:
            logger.error(f"Failed to paginated scan cart table: {str(e)}")
            raise DatabaseError(f"Database error during paginated cart scan: {str(e)}")
