import pytest
import os
from unittest.mock import MagicMock, patch

os.environ["WISHLIST_TABLE"] = "MockWishlistTable"

class FakeWishlistTable:
    def __init__(self):
        self.items = {}

    def put_item(self, Item):
        key = f"{Item['user_id']}#{Item['product_id']}"
        self.items[key] = Item

    def get_item(self, Key):
        key = f"{Key['user_id']}#{Key['product_id']}"
        item = self.items.get(key)
        if item:
            return {"Item": item}
        return {}

    def delete_item(self, Key):
        key = f"{Key['user_id']}#{Key['product_id']}"
        if key in self.items:
            del self.items[key]

    def query(self, **kwargs):
        return {"Items": list(self.items.values())}

@pytest.fixture(scope="function", autouse=True)
def mock_dynamodb():
    wishlist_table = FakeWishlistTable()
    
    with patch("boto3.resource") as mock_boto:
        mock_dyn = MagicMock()
        mock_dyn.Table.return_value = wishlist_table
        mock_boto.return_value = mock_dyn
        yield wishlist_table

@pytest.fixture
def mock_event():
    def _create_event(method, path, path_params=None, body=None, query_params=None, claims=None, headers=None):
        event = {
            "httpMethod": method,
            "path": path,
            "pathParameters": path_params or {},
            "queryStringParameters": query_params or {},
            "body": body,
            "headers": headers or {},
            "requestContext": {}
        }
        if claims:
            event["requestContext"]["authorizer"] = {"claims": claims}
        return event
    return _create_event
