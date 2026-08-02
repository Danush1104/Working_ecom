import pytest
import os
from unittest.mock import MagicMock, patch

class FakeCartTable:
    def __init__(self):
        self.items = {}

    def put_item(self, Item):
        key = (Item["user_id"], Item["product_id"])
        self.items[key] = Item

    def get_item(self, Key, ConsistentRead=False):
        key = (Key["user_id"], Key["product_id"])
        item = self.items.get(key)
        if item:
            return {"Item": item}
        return {}

    def delete_item(self, Key):
        key = (Key["user_id"], Key["product_id"])
        if key in self.items:
            del self.items[key]

    def query(self, KeyConditionExpression, ConsistentRead=False):
        # We can extract the user_id by stringifying or evaluating
        user_id = "USER1" # Just hardcode for tests, we only test with USER1
        res = []
        for k, v in self.items.items():
            if k[0] == user_id:
                res.append(v)
        return {"Items": res}
        
    def scan(self, **kwargs):
        return {"Items": list(self.items.values())}

@pytest.fixture(scope="function", autouse=True)
def mock_dynamodb():
    cart_table = FakeCartTable()
    
    with patch("app.repositories.cart_repository.get_cart_table", return_value=cart_table):
        with patch("app.services.cart_service.HttpClient.request") as mock_http:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "data": {
                    "product_id": "PROD-123", 
                    "price": "100.0", 
                    "name": "Test Product",
                    "available": 100
                }
            }
            mock_http.return_value = mock_response
            yield cart_table

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
