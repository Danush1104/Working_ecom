import pytest
from unittest.mock import MagicMock, patch

class FakeInventoryTable:
    def __init__(self):
        self.items = {}

    def put_item(self, Item, ConditionExpression=None):
        key = Item["product_id"]
        if ConditionExpression:
            if "attribute_not_exists" in str(ConditionExpression) and key in self.items:
                from botocore.exceptions import ClientError
                raise ClientError({"Error": {"Code": "ConditionalCheckFailedException"}}, "PutItem")
        self.items[key] = Item

    def get_item(self, Key, ConsistentRead=False):
        item = self.items.get(Key["product_id"])
        if item:
            return {"Item": item}
        return {}

    def update_item(self, Key, UpdateExpression, ExpressionAttributeValues, ConditionExpression=None, ReturnValues=None):
        key = Key["product_id"]
        if key not in self.items:
            if ConditionExpression:
                from botocore.exceptions import ClientError
                raise ClientError({"Error": {"Code": "ConditionalCheckFailedException"}}, "UpdateItem")
            self.items[key] = {"product_id": key, "stock": 0, "reserved": 0, "available": 0}
            
        item = self.items[key]
        
        # Parse UpdateExpression
        
        if ":stock" in ExpressionAttributeValues:
            # Setting stock directly (from update_stock)
            if "+ :stock" in UpdateExpression:
                item["stock"] += ExpressionAttributeValues[":stock"]
            elif "- :stock" in UpdateExpression:
                item["stock"] -= ExpressionAttributeValues[":stock"]
            else:
                item["stock"] = ExpressionAttributeValues[":stock"]
                
        if ":qty" in ExpressionAttributeValues:
            # Modifying reserved (from reserve_stock, release_stock) or both (deduct_stock)
            if "stock = stock - :qty" in UpdateExpression and "reserved = reserved - :qty" in UpdateExpression:
                item["stock"] -= ExpressionAttributeValues[":qty"]
                item["reserved"] -= ExpressionAttributeValues[":qty"]
            elif "reserved = reserved + :qty" in UpdateExpression:
                item["reserved"] += ExpressionAttributeValues[":qty"]
            elif "reserved = reserved - :qty" in UpdateExpression:
                item["reserved"] -= ExpressionAttributeValues[":qty"]
            elif "stock = stock - :qty" in UpdateExpression:
                item["stock"] -= ExpressionAttributeValues[":qty"]
            elif "stock = stock + :qty" in UpdateExpression:
                item["stock"] += ExpressionAttributeValues[":qty"]

        item["available"] = item.get("stock", 0) - item.get("reserved", 0)
        self.items[key] = item
        
        return {"Attributes": item}

    def scan(self, **kwargs):
        return {"Items": list(self.items.values())}

@pytest.fixture(scope="function", autouse=True)
def mock_dynamodb():
    inv_table = FakeInventoryTable()
    
    with patch("app.repositories.inventory_repository.get_inventory_table", return_value=inv_table):
        with patch("app.repositories.inventory_repository.get_processed_events_table"):
            with patch("app.services.inventory_service.HttpClient.request") as mock_http:
                mock_response = MagicMock()
                mock_response.status_code = 200
                mock_http.return_value = mock_response
                yield inv_table

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
