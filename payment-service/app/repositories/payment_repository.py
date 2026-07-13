from typing import List, Optional, Tuple
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key, Attr
from app.aws.dynamodb import get_payment_table
from app.models.payment import Payment
from app.errors import DatabaseError
from app.logger import logger

class PaymentRepository:
    def __init__(self):
        self.table = get_payment_table()

    def save_payment(self, payment: Payment) -> None:
        """Saves (creates or updates) a payment transaction in DynamoDB."""
        try:
            self.table.put_item(Item=payment.to_dict())
        except ClientError as e:
            logger.error(f"Failed to save payment in DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during saving payment: {str(e)}")

    def get_payment(self, payment_id: str) -> Optional[Payment]:
        """Retrieves a single payment transaction by payment_id."""
        try:
            response = self.table.get_item(Key={"payment_id": payment_id})
            item = response.get("Item")
            if not item:
                return None
            return Payment.from_dict(item)
        except ClientError as e:
            logger.error(f"Failed to get payment from DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during payment retrieval: {str(e)}")

    def get_payments_by_order(self, order_id: str) -> List[Payment]:
        """
        Queries the order_id-index GSI to find all payments for a specific order.
        """
        try:
            response = self.table.query(
                IndexName="order_id-index",
                KeyConditionExpression=Key("order_id").eq(order_id)
            )
            items = response.get("Items", []) or []
            return [Payment.from_dict(item) for item in items]
        except ClientError as e:
            logger.error(f"Failed to query payments GSI for order {order_id}: {str(e)}")
            raise DatabaseError(f"Database error during querying payments by order: {str(e)}")

    def get_pending_payments_for_order(self, order_id: str) -> List[Payment]:
        try:
            response = self.table.query(
                IndexName="order_id-index",
                KeyConditionExpression=Key("order_id").eq(order_id),
                FilterExpression=Attr("payment_status").eq("PENDING")
            )
            items = response.get("Items", []) or []
            return [Payment.from_dict(item) for item in items]
        except ClientError as e:
            logger.error(f"Failed to query pending payments GSI for order {order_id}: {str(e)}")
            raise DatabaseError(f"Database error during querying pending payments by order: {str(e)}")

    def scan_all_payments_paginated(self, limit: Optional[int] = None, start_key: Optional[dict] = None) -> Tuple[List[Payment], Optional[dict]]:
        try:
            kwargs = {}
            if limit is not None:
                kwargs["Limit"] = limit
            if start_key is not None:
                kwargs["ExclusiveStartKey"] = start_key
            response = self.table.scan(**kwargs)
            items = response.get("Items", []) or []
            next_key = response.get("LastEvaluatedKey")
            return ([Payment.from_dict(item) for item in items], next_key)
        except ClientError as e:
            logger.error(f"Failed to scan payments table (paginated): {str(e)}")
            raise DatabaseError(f"Database error during payments scan: {str(e)}")

    def scan_all_payments(self) -> List[Payment]:
        """Scans the entire Payments table to retrieve all transactions."""
        try:
            response = self.table.scan()
            items = response.get("Items", []) or []
            return [Payment.from_dict(item) for item in items]
        except ClientError as e:
            logger.error(f"Failed to scan payments table: {str(e)}")
            raise DatabaseError(f"Database error during payments scan: {str(e)}")
