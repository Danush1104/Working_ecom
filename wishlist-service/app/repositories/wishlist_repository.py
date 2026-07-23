import os
import boto3
from botocore.exceptions import ClientError
from typing import List, Optional
from app.models.wishlist import WishlistItem
from app.logger import get_logger
from boto3.dynamodb.conditions import Key

logger = get_logger(__name__)

from app.config import Config

class WishlistRepository:
    def __init__(self):
        self.table_name = Config.WISHLIST_TABLE
        self.dynamodb = boto3.resource('dynamodb')
        self.table = self.dynamodb.Table(self.table_name)

    def add_item(self, item: WishlistItem) -> None:
        try:
            self.table.put_item(Item=item.to_dict())
            logger.info(f"Added product {item.product_id} to user {item.user_id} wishlist")
        except ClientError as e:
            logger.error(f"Error adding to wishlist: {e}")
            raise e

    def remove_item(self, user_id: str, product_id: str) -> None:
        try:
            self.table.delete_item(
                Key={
                    "user_id": user_id,
                    "product_id": product_id
                }
            )
            logger.info(f"Removed product {product_id} from user {user_id} wishlist")
        except ClientError as e:
            logger.error(f"Error removing from wishlist: {e}")
            raise e

    def get_user_wishlist(self, user_id: str) -> List[WishlistItem]:
        try:
            response = self.table.query(
                KeyConditionExpression=Key('user_id').eq(user_id)
            )
            items = response.get('Items', [])
            return [WishlistItem.from_dict(item) for item in items]
        except ClientError as e:
            logger.error(f"Error getting user wishlist: {e}")
            raise e

    def get_item(self, user_id: str, product_id: str) -> Optional[WishlistItem]:
        try:
            response = self.table.get_item(
                Key={
                    "user_id": user_id,
                    "product_id": product_id
                }
            )
            item = response.get('Item')
            if item:
                return WishlistItem.from_dict(item)
            return None
        except ClientError as e:
            logger.error(f"Error getting wishlist item: {e}")
            raise e
