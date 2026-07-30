import os
import boto3
from botocore.exceptions import ClientError
from typing import List, Optional
from app.models.review import Review
from app.logger import get_logger
from boto3.dynamodb.conditions import Key

logger = get_logger(__name__)

class ReviewRepository:
    def __init__(self):
        self.table_name = os.environ.get("REVIEWS_TABLE", "danush_reviews_table")
        self.dynamodb = boto3.resource('dynamodb')
        self.table = self.dynamodb.Table(self.table_name)

    def add_review(self, review: Review) -> None:
        try:
            self.table.put_item(Item=review.to_dict())
            logger.info(f"Added review {review.review_id} for product {review.product_id}")
        except ClientError as e:
            logger.error(f"Error adding review: {e}")
            raise e

    def get_review(self, product_id: str, review_id: str) -> Optional[Review]:
        try:
            response = self.table.get_item(
                Key={
                    "product_id": product_id,
                    "review_id": review_id
                }
            )
            item = response.get('Item')
            if item:
                return Review.from_dict(item)
            return None
        except ClientError as e:
            logger.error(f"Error getting review: {e}")
            raise e

    def update_review(self, product_id: str, review_id: str, updates: dict) -> None:
        try:
            update_expr = "SET " + ", ".join(f"#{k} = :{k}" for k in updates.keys())
            expr_names = {f"#{k}": k for k in updates.keys()}
            expr_values = {f":{k}": v for k, v in updates.items()}
            
            self.table.update_item(
                Key={
                    "product_id": product_id,
                    "review_id": review_id
                },
                UpdateExpression=update_expr,
                ExpressionAttributeNames=expr_names,
                ExpressionAttributeValues=expr_values
            )
        except ClientError as e:
            logger.error(f"Error updating review: {e}")
            raise e

    def delete_review(self, product_id: str, review_id: str) -> None:
        try:
            self.table.delete_item(
                Key={
                    "product_id": product_id,
                    "review_id": review_id
                }
            )
        except ClientError as e:
            logger.error(f"Error deleting review: {e}")
            raise e

    def get_product_reviews(self, product_id: str) -> List[Review]:
        try:
            response = self.table.query(
                KeyConditionExpression=Key('product_id').eq(product_id)
            )
            items = response.get('Items', [])
            return [Review.from_dict(item) for item in items]
        except ClientError as e:
            logger.error(f"Error getting product reviews: {e}")
            raise e

    def get_all_reviews(self) -> List[Review]:
        # For Admin
        try:
            response = self.table.scan()
            items = response.get('Items', [])
            return [Review.from_dict(item) for item in items]
        except ClientError as e:
            logger.error(f"Error getting all reviews: {e}")
            raise e

    def get_user_reviews(self, user_id: str) -> List[Review]:
        try:
            response = self.table.query(
                IndexName="UserIndex",
                KeyConditionExpression=Key('user_id').eq(user_id)
            )
            items = response.get('Items', [])
            return [Review.from_dict(item) for item in items]
        except ClientError as e:
            logger.error(f"Error getting user reviews: {e}")
            raise e
