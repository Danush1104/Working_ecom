import pytest
import os
from unittest.mock import MagicMock, patch

os.environ["ORDER_SERVICE_URL"] = "http://mock/orders"
os.environ["PRODUCT_TABLE"] = "MockProductTable"
os.environ["REVIEWS_TABLE"] = "MockReviewTable"

class FakeReviewTable:
    def __init__(self):
        self.items = {}

    def put_item(self, Item):
        key = f"{Item['product_id']}#{Item['review_id']}"
        self.items[key] = Item

    def get_item(self, Key):
        key = f"{Key['product_id']}#{Key['review_id']}"
        item = self.items.get(key)
        if item:
            return {"Item": item}
        return {}

    def update_item(self, Key, UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues, ConditionExpression=None):
        key = f"{Key['product_id']}#{Key['review_id']}"
        item = self.items.get(key)
        if not item:
            raise Exception("Item not found")
            
        for ek, ev in ExpressionAttributeValues.items():
            k = ek.replace(":", "")
            item[k] = ev

    def delete_item(self, Key):
        key = f"{Key['product_id']}#{Key['review_id']}"
        if key in self.items:
            del self.items[key]

    def query(self, **kwargs):
        res = []
        if "IndexName" in kwargs and kwargs["IndexName"] == "UserIndex":
            for v in self.items.values():
                if v.get("user_id") == "USER1":
                    res.append(v)
        else:
            for v in self.items.values():
                if v.get("product_id") == "PROD-123":
                    res.append(v)
        return {"Items": res}
        
    def scan(self, **kwargs):
        return {"Items": list(self.items.values())}

class FakeProductTable:
    def __init__(self):
        self.items = {"PROD-123": {"product_id": "PROD-123"}}
        
    def update_item(self, Key, UpdateExpression, ExpressionAttributeValues, ConditionExpression=None):
        pid = Key["product_id"]
        if pid in self.items:
            self.items[pid]["average_rating"] = ExpressionAttributeValues.get(":avg")
            self.items[pid]["total_reviews"] = ExpressionAttributeValues.get(":tot")

@pytest.fixture(scope="function", autouse=True)
def mock_dynamodb_and_http():
    review_table = FakeReviewTable()
    product_table = FakeProductTable()
    
    with patch("boto3.resource") as mock_boto:
        mock_dyn = MagicMock()
        
        def table_side_effect(name):
            if name == "MockReviewTable":
                return review_table
            elif name == "MockProductTable":
                return product_table
            return MagicMock()
            
        mock_dyn.Table.side_effect = table_side_effect
        mock_boto.return_value = mock_dyn
        
        with patch("app.services.review_service.urllib.request.urlopen") as mock_urlopen:
            mock_res = MagicMock()
            mock_res.getcode.return_value = 200
            mock_res.read.return_value = b'{"data": [{"order_status": "COMPLETED", "items": [{"product_id": "PROD-123"}]}]}'
            mock_urlopen.return_value.__enter__.return_value = mock_res
            
            yield review_table

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
