import pytest
from app.services.order_service import OrderService

def test_checkout(mock_dynamodb_and_sns):
    service = OrderService()
    data = {
        "user_id": "USER1",
        "payment_method": "CARD",
        "customer_email": "test@example.com"
    }
    order = service.checkout(data)
    assert order["order_status"] == "PENDING"
    assert order["payment_status"] == "PENDING"
    assert order["total_amount"] == 100.0
    assert len(order["items"]) == 1

def test_get_order(mock_dynamodb_and_sns):
    service = OrderService()
    data = {
        "user_id": "USER1",
        "payment_method": "CARD",
        "customer_email": "test@example.com"
    }
    order = service.checkout(data)
    
    fetched = service.get_order("USER1", order["order_id"])
    assert fetched["order_id"] == order["order_id"]

def test_get_user_orders(mock_dynamodb_and_sns):
    service = OrderService()
    data = {
        "user_id": "USER1",
        "payment_method": "CARD",
        "customer_email": "test@example.com"
    }
    service.checkout(data)
    service.checkout(data)
    
    orders = service.get_user_orders("USER1")
    assert len(orders) == 2

def test_cancel_order(mock_dynamodb_and_sns):
    service = OrderService()
    data = {
        "user_id": "USER1",
        "payment_method": "CARD",
        "customer_email": "test@example.com"
    }
    order = service.checkout(data)
    
    cancelled = service.cancel_order("USER1", order["order_id"])
    assert cancelled["order_status"] == "CANCELLED"
    assert cancelled["payment_status"] == "FAILED"

def test_update_payment(mock_dynamodb_and_sns):
    service = OrderService()
    data = {
        "user_id": "USER1",
        "payment_method": "CARD",
        "customer_email": "test@example.com"
    }
    order = service.checkout(data)
    
    updated = service.update_payment(
        "USER1", 
        order["order_id"], 
        {"payment_status": "SUCCESS", "payment_id": "PAY-123"}
    )
    assert updated["order_status"] == "PROCESSING"
    assert updated["payment_status"] == "SUCCESS"
    assert updated["payment_id"] == "PAY-123"
    assert updated.get("delivery_status") == "ORDER_CONFIRMED"

def test_update_delivery_status(mock_dynamodb_and_sns):
    from app.errors import ConflictError
    service = OrderService()
    data = {
        "user_id": "USER1",
        "payment_method": "CARD",
        "customer_email": "test@example.com"
    }
    order = service.checkout(data)
    
    # 1. Reject transition if PENDING
    with pytest.raises(ConflictError):
        service.update_delivery_status("USER1", order["order_id"], "SHIPPED")

    # 2. Pay successfully (moves to ORDER_CONFIRMED)
    service.update_payment(
        "USER1", 
        order["order_id"], 
        {"payment_status": "SUCCESS", "payment_id": "PAY-123"}
    )

    # 3. Reject skip to DELIVERED
    with pytest.raises(ConflictError):
        service.update_delivery_status("USER1", order["order_id"], "DELIVERED")

    # 4. Valid transition to SHIPPED
    updated = service.update_delivery_status("USER1", order["order_id"], "SHIPPED")
    assert updated["delivery_status"] == "SHIPPED"

    # 5. Reject backwards transition
    with pytest.raises(ConflictError):
        service.update_delivery_status("USER1", order["order_id"], "ORDER_CONFIRMED")

    # 6. Valid transition to DELIVERED
    final = service.update_delivery_status("USER1", order["order_id"], "DELIVERED")
    assert final["delivery_status"] == "DELIVERED"
