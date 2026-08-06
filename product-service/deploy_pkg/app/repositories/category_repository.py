from typing import Any, Dict, List, Optional
from botocore.exceptions import ClientError
from app.aws.dynamodb import get_products_table
from app.models.category import Category
from app.errors import DatabaseError
from app.logger import logger

class CategoryRepository:
    def __init__(self):
        self.table = get_products_table()

    def create_category(self, category: Category) -> None:
        try:
            self.table.put_item(
                Item=category.to_dict(),
                ConditionExpression="attribute_not_exists(product_id)"
            )
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise e
            logger.error(f"Failed to create category: {str(e)}")
            raise DatabaseError(f"Database error during category creation: {str(e)}")

    def get_category(self, category_id: str) -> Optional[Category]:
        try:
            response = self.table.get_item(Key={"product_id": category_id})
            item = response.get("Item")
            if not item or item.get("entity_type") != "CATEGORY":
                return None
            return Category.from_dict(item)
        except ClientError as e:
            logger.error(f"Failed to get category: {str(e)}")
            raise DatabaseError(f"Database error during category retrieval: {str(e)}")

    def list_categories(self) -> List[Category]:
        try:
            # We must use scan because entity_type is not a partition key
            response = self.table.scan(
                FilterExpression="entity_type = :etype AND is_active = :active",
                ExpressionAttributeValues={":etype": "CATEGORY", ":active": True}
            )
            items = response.get("Items", [])
            return [Category.from_dict(item) for item in items]
        except ClientError as e:
            logger.error(f"Failed to list categories: {str(e)}")
            raise DatabaseError(f"Database error during category listing: {str(e)}")

    def update_category(self, category_id: str, update_fields: Dict[str, Any]) -> None:
        if not update_fields:
            return

        update_expression_parts = []
        expression_attribute_names = {}
        expression_attribute_values = {}

        for k, v in update_fields.items():
            name_placeholder = f"#attr_{k}"
            val_placeholder = f":val_{k}"
            update_expression_parts.append(f"{name_placeholder} = {val_placeholder}")
            expression_attribute_names[name_placeholder] = k
            expression_attribute_values[val_placeholder] = v

        update_expression = "SET " + ", ".join(update_expression_parts)
        expression_attribute_values[":is_active_condition"] = True
        expression_attribute_values[":etype"] = "CATEGORY"

        try:
            self.table.update_item(
                Key={"product_id": category_id},
                UpdateExpression=update_expression,
                ExpressionAttributeNames=expression_attribute_names,
                ExpressionAttributeValues=expression_attribute_values,
                ConditionExpression="attribute_exists(product_id) AND is_active = :is_active_condition AND entity_type = :etype"
            )
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise e
            logger.error(f"Failed to update category: {str(e)}")
            raise DatabaseError(f"Database error during category update: {str(e)}")

    def delete_category(self, category_id: str, updated_at: str) -> None:
        try:
            self.table.update_item(
                Key={"product_id": category_id},
                UpdateExpression="SET is_active = :inactive, updated_at = :updated_at",
                ExpressionAttributeValues={":inactive": False, ":updated_at": updated_at, ":etype": "CATEGORY"},
                ConditionExpression="attribute_exists(product_id) AND entity_type = :etype"
            )
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise e
            logger.error(f"Failed to delete category: {str(e)}")
            raise DatabaseError(f"Database error during category deletion: {str(e)}")

    def update_product_count(self, category_id: str, increment: int) -> None:
        try:
            self.table.update_item(
                Key={"product_id": category_id},
                UpdateExpression="ADD product_count :inc",
                ExpressionAttributeValues={":inc": increment, ":etype": "CATEGORY"},
                ConditionExpression="attribute_exists(product_id) AND entity_type = :etype"
            )
        except ClientError as e:
            logger.error(f"Failed to update product count: {str(e)}")
            raise DatabaseError(f"Database error during product count update: {str(e)}")
