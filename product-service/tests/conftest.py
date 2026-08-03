import pytest
import os
from unittest.mock import MagicMock, patch

class FakeDynamoDBTable:
    def __init__(self, key_name="product_id"):
        self.items = {}
        self.key_name = key_name

    def put_item(self, Item, ConditionExpression=None):
        key = Item[self.key_name]
        if ConditionExpression == "attribute_not_exists(product_id)" and key in self.items:
            from botocore.exceptions import ClientError
            raise ClientError({"Error": {"Code": "ConditionalCheckFailedException"}}, "PutItem")
        self.items[key] = Item

    def get_item(self, Key, ProjectionExpression=None):
        key = Key[self.key_name]
        item = self.items.get(key)
        if item:
            return {"Item": item}
        return {}

    def update_item(self, Key, UpdateExpression, ExpressionAttributeValues=None, ExpressionAttributeNames=None, ConditionExpression=None):
        key = Key[self.key_name]
        
        # Condition check mock
        if ConditionExpression and "attribute_exists" in ConditionExpression and key not in self.items:
             from botocore.exceptions import ClientError
             raise ClientError({"Error": {"Code": "ConditionalCheckFailedException"}}, "UpdateItem")
             
        item = self.items.get(key, {})
        # Very rudimentary expression parsing for testing
        if "SET is_active = :inactive" in UpdateExpression:
             item["is_active"] = ExpressionAttributeValues.get(":inactive")
        else:
             # Just map values directly for basic tests
             for k, v in ExpressionAttributeValues.items():
                 if k.startswith(":val_"):
                     field_name = k.replace(":val_", "")
                     item[field_name] = v
                 elif k == ":inactive":
                     item["is_active"] = v
        self.items[key] = item

    def scan(self, FilterExpression=None, ExpressionAttributeValues=None, ExpressionAttributeNames=None):
        # Return all active items
        res = []
        for v in self.items.values():
            if v.get("is_active"):
                res.append(v)
        return {"Items": res}
        
    def query(self, IndexName=None, KeyConditionExpression=None, ExpressionAttributeValues=None, FilterExpression=None, ExpressionAttributeNames=None):
        # Basic mock for GSI query
        res = []
        cat = ExpressionAttributeValues.get(":category")
        for v in self.items.values():
            if v.get("category") == cat and v.get("is_active"):
                res.append(v)
        return {"Items": res}

@pytest.fixture(scope="function", autouse=True)
def mock_dynamodb():
    fake_table = FakeDynamoDBTable()
    with patch("app.repositories.product_repository.get_products_table", return_value=fake_table):
        with patch("app.services.product_service.CategoryService"): # Mock category service to avoid side effects
            yield fake_table

@pytest.fixture
def mock_event():
    def _create_event(method, path, path_params=None, body=None, query_params=None, claims=None):
        event = {
            "httpMethod": method,
            "path": path,
            "pathParameters": path_params or {},
            "queryStringParameters": query_params or {},
            "body": body,
            "requestContext": {}
        }
        if claims:
            event["requestContext"]["authorizer"] = {"claims": claims}
        return event
    return _create_event
