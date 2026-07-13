from decimal import Decimal
from typing import Any, Dict, List, Optional
import boto3
from botocore.exceptions import ClientError
from app.aws.dynamodb import get_products_table
from app.models.product import Product
from app.errors import DatabaseError
from app.logger import logger

class ProductRepository:
    def __init__(self):
        self.table = get_products_table()

    def create_product(self, product: Product) -> None:
        """Puts a new product item into the DynamoDB table."""
        try:
            # We can use a condition expression to prevent overwriting existing products
            self.table.put_item(
                Item=product.to_dict(),
                ConditionExpression="attribute_not_exists(product_id)"
            )
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                # Let service layer raise ConflictError
                raise e
            logger.error(f"Failed to create product in DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during product creation: {str(e)}")

    def get_product(self, product_id: str) -> Optional[Product]:
        """Retrieves a product by its ID."""
        try:
            response = self.table.get_item(Key={"product_id": product_id})
            item = response.get("Item")
            if not item:
                return None
            return Product.from_dict(item)
        except ClientError as e:
            logger.error(f"Failed to get product from DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during product retrieval: {str(e)}")

    def list_products(self) -> List[Product]:
        """Scans the table to list all active products."""
        try:
            # Filters inactive products
            response = self.table.scan(
                FilterExpression="is_active = :active",
                ExpressionAttributeValues={":active": True}
            )
            items = response.get("Items", [])
            return [Product.from_dict(item) for item in items]
        except ClientError as e:
            logger.error(f"Failed to list products from DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during product listing: {str(e)}")

    def update_product(self, product_id: str, update_fields: Dict[str, Any]) -> None:
        """Updates specific fields of an existing product."""
        if not update_fields:
            return

        update_expression_parts = []
        expression_attribute_names = {}
        expression_attribute_values = {}

        for k, v in update_fields.items():
            # Use placeholder names/values to avoid reserved word conflicts
            name_placeholder = f"#attr_{k}"
            val_placeholder = f":val_{k}"
            update_expression_parts.append(f"{name_placeholder} = {val_placeholder}")
            expression_attribute_names[name_placeholder] = k
            expression_attribute_values[val_placeholder] = v

        update_expression = "SET " + ", ".join(update_expression_parts)

        try:
            self.table.update_item(
                Key={"product_id": product_id},
                UpdateExpression=update_expression,
                ExpressionAttributeNames=expression_attribute_names,
                ExpressionAttributeValues=expression_attribute_values,
                ConditionExpression="attribute_exists(product_id)"
            )
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise e
            logger.error(f"Failed to update product in DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during product update: {str(e)}")

    def delete_product(self, product_id: str, updated_at: str) -> None:
        """Soft deletes a product by setting is_active to False."""
        try:
            self.table.update_item(
                Key={"product_id": product_id},
                UpdateExpression="SET is_active = :inactive, updated_at = :updated_at",
                ExpressionAttributeValues={":inactive": False, ":updated_at": updated_at},
                ConditionExpression="attribute_exists(product_id)"
            )
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise e
            logger.error(f"Failed to soft-delete product in DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during product soft-deletion: {str(e)}")

    def product_exists(self, product_id: str) -> bool:
        """Checks if a product exists in the table (including inactive ones)."""
        try:
            response = self.table.get_item(
                Key={"product_id": product_id},
                ProjectionExpression="product_id"
            )
            return "Item" in response
        except ClientError as e:
            logger.error(f"Failed to check product existence in DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error checking product existence: {str(e)}")

    def search_products(
        self,
        category: Optional[str] = None,
        keyword: Optional[str] = None,
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None
    ) -> List[Product]:
        """Searches products with GSI queries (by category) or Scans (if no category)."""
        filter_expressions = ["is_active = :active"]
        expression_attribute_names = {}
        expression_attribute_values = {":active": True}

        # Add price filters
        if min_price is not None:
            filter_expressions.append("price >= :min_price")
            expression_attribute_values[":min_price"] = min_price
        if max_price is not None:
            filter_expressions.append("price <= :max_price")
            expression_attribute_values[":max_price"] = max_price

        # Add keyword filter (case-insensitive substring match contains() is somewhat basic, but matches spec)
        if keyword:
            filter_expressions.append("(contains(#name, :keyword) OR contains(#desc, :keyword))")
            expression_attribute_names["#name"] = "name"
            expression_attribute_names["#desc"] = "description"
            expression_attribute_values[":keyword"] = keyword

        filter_expression_str = " AND ".join(filter_expressions)

        try:
            if category:
                # Query category-index GSI
                query_kwargs = {
                    "IndexName": "category-index",
                    "KeyConditionExpression": "category = :category",
                    "FilterExpression": filter_expression_str,
                    "ExpressionAttributeValues": {
                        **expression_attribute_values,
                        ":category": category
                    }
                }
                if expression_attribute_names:
                    query_kwargs["ExpressionAttributeNames"] = expression_attribute_names
                
                response = self.table.query(**query_kwargs)
            else:
                # Scan table (since category partition key is missing)
                scan_kwargs = {
                    "FilterExpression": filter_expression_str,
                    "ExpressionAttributeValues": expression_attribute_values
                }
                if expression_attribute_names:
                    scan_kwargs["ExpressionAttributeNames"] = expression_attribute_names
                
                response = self.table.scan(**scan_kwargs)

            items = response.get("Items", [])
            return [Product.from_dict(item) for item in items]

        except ClientError as e:
            logger.error(f"Failed to search products in DynamoDB: {str(e)}")
            raise DatabaseError(f"Database error during product search: {str(e)}")
