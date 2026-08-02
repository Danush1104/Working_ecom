import pytest
import json
from app.lambda_handler import handler

def test_handler(mock_dynamodb_and_smtp):
    event = {
        "Records": [
            {
                "messageId": "MSG-1",
                "body": json.dumps({
                    "Message": json.dumps({
                        "event_type": "ORDER_PAYMENT_SUCCESS",
                        "payment_id": "PAY-123",
                        "order_id": "ORD-123",
                        "customer_email": "test@test.com"
                    })
                })
            }
        ]
    }
    
    res = handler(event, MagicMock())
    assert res["statusCode"] == 200

class MagicMock:
    pass
