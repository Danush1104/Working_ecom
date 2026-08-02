import pytest
import json
from app.handlers import (
    checkout,
    get_user_orders,
    get_order,
    cancel_order,
    update_payment
)

def test_checkout_handler(mock_dynamodb_and_sns, mock_event):
    evt = mock_event("POST", "/api/orders/checkout", body=json.dumps({
        "payment_method": "CARD",
        "customer_email": "test@example.com"
    }), claims={"sub": "USER1"})
    
    res = checkout.handle(evt, {})
    assert res["statusCode"] == 201
    
    body = json.loads(res["body"])["data"]
    assert body["order_status"] == "PENDING"
    assert body["payment_status"] == "PENDING"
    assert body["total_amount"] == 100.0

def test_get_user_orders_handler(mock_dynamodb_and_sns, mock_event):
    evt = mock_event("POST", "/api/orders/checkout", body=json.dumps({
        "payment_method": "CARD",
        "customer_email": "test@example.com"
    }), claims={"sub": "USER1"})
    checkout.handle(evt, {})
    
    get_evt = mock_event("GET", "/api/orders/USER1", path_params={"user_id": "USER1"}, claims={"sub": "USER1"})
    res = get_user_orders.handle(get_evt, {})
    assert res["statusCode"] == 200
    
    body = json.loads(res["body"])["data"]
    assert len(body) == 1

def test_get_order_handler(mock_dynamodb_and_sns, mock_event):
    evt = mock_event("POST", "/api/orders/checkout", body=json.dumps({
        "payment_method": "CARD",
        "customer_email": "test@example.com"
    }), claims={"sub": "USER1"})
    res = checkout.handle(evt, {})
    order_id = json.loads(res["body"])["data"]["order_id"]
    
    get_evt = mock_event("GET", f"/api/orders/USER1/{order_id}", path_params={"user_id": "USER1", "order_id": order_id}, claims={"sub": "USER1"})
    res = get_order.handle(get_evt, {})
    assert res["statusCode"] == 200

def test_cancel_order_handler(mock_dynamodb_and_sns, mock_event):
    evt = mock_event("POST", "/api/orders/checkout", body=json.dumps({
        "payment_method": "CARD",
        "customer_email": "test@example.com"
    }), claims={"sub": "USER1"})
    res = checkout.handle(evt, {})
    order_id = json.loads(res["body"])["data"]["order_id"]
    
    del_evt = mock_event("DELETE", f"/api/orders/USER1/{order_id}", path_params={"user_id": "USER1", "order_id": order_id}, claims={"sub": "USER1"})
    res = cancel_order.handle(del_evt, {})
    assert res["statusCode"] == 200

def test_update_payment_handler(mock_dynamodb_and_sns, mock_event):
    evt = mock_event("POST", "/api/orders/checkout", body=json.dumps({
        "payment_method": "CARD",
        "customer_email": "test@example.com"
    }), claims={"sub": "USER1"})
    res = checkout.handle(evt, {})
    order_id = json.loads(res["body"])["data"]["order_id"]
    
    upd_evt = mock_event("PATCH", f"/internal/orders/USER1/{order_id}/payment", path_params={"user_id": "USER1", "order_id": order_id}, body=json.dumps({
        "payment_status": "SUCCESS",
        "payment_id": "PAY-123"
    }), claims={"sub": "USER1"})
    # Setting the internal secret
    upd_evt["headers"] = {"x-internal-secret": "default-internal-secret-123"}
    res = update_payment.handle(upd_evt, {})
    assert res["statusCode"] == 200

