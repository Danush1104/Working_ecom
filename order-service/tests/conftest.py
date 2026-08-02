import pytest
import os
from unittest.mock import MagicMock, patch
from app.config import Config

Config.CART_SERVICE_URL = "http://mock/cart"
Config.PRODUCT_SERVICE_URL = "http://mock/product"
Config.INVENTORY_SERVICE_URL = "http://mock/inventory"
Config.SNS_TOPIC_ARN = "arn:aws:sns:ap-southeast-1:123456789012:MockTopic"

class FakeOrderTable:
    def __init__(self):
        self.items = {}

    def put_item(self, Item):
        self.items[Item["order_id"]] = Item

    def get_item(self, Key):
        item = self.items.get(Key["order_id"])
        if item:
            return {"Item": item}
        return {}

    def query(self, **kwargs):
        # Very hacky mock, we know the only query is by user_id
        res = []
        for v in self.items.values():
            if v.get("user_id") == "USER1":
                res.append(v)
        return {"Items": res}
        
    def scan(self, **kwargs):
        return {"Items": list(self.items.values())}

class FakeProcessedEventsTable:
    def __init__(self):
        self.items = {}
        
    def get_item(self, Key, ProjectionExpression=None):
        item = self.items.get(Key["event_id"])
        if item:
            return {"Item": item}
        return {}
        
    def put_item(self, Item, ConditionExpression=None):
        if ConditionExpression and "attribute_not_exists" in str(ConditionExpression):
            if Item["event_id"] in self.items:
                from botocore.exceptions import ClientError
                raise ClientError({"Error": {"Code": "ConditionalCheckFailedException"}}, "PutItem")
        self.items[Item["event_id"]] = Item

@pytest.fixture(scope="function", autouse=True)
def mock_dynamodb_and_sns():
    order_table = FakeOrderTable()
    events_table = FakeProcessedEventsTable()
    
    with patch("app.repositories.order_repository.get_order_table", return_value=order_table):
        with patch("app.repositories.order_repository.get_processed_events_table", return_value=events_table):
            with patch("app.services.order_service.HttpClient.request") as mock_http:
                def side_effect(method, url, **kwargs):
                    mock_resp = MagicMock()
                    mock_resp.status_code = 200
                    if "cart" in url.lower():
                        mock_resp.json.return_value = {
                            "data": {
                                "items": [
                                    {"product_id": "PROD-123", "quantity": 2}
                                ]
                            }
                        }
                    else:
                        mock_resp.json.return_value = {
                            "data": {
                                "id": "PROD-123",
                                "name": "Test Product",
                                "price": "50.0"
                            }
                        }
                    return mock_resp
                
                mock_http.side_effect = side_effect
                
                with patch("boto3.client") as mock_boto:
                    mock_sns = MagicMock()
                    mock_sns.publish.return_value = {"MessageId": "msg-123"}
                    mock_boto.return_value = mock_sns
                    yield order_table

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
