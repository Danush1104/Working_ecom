import pytest
from app.services.cart_service import CartService

def test_add_item(mock_dynamodb):
    service = CartService()
    cart = service.add_item({"user_id": "USER1", "product_id": "PROD-123", "quantity": 2})
    assert cart["user_id"] == "USER1"
    assert cart["product_id"] == "PROD-123"
    assert cart["quantity"] == 2

def test_get_cart(mock_dynamodb):
    service = CartService()
    service.add_item({"user_id": "USER1", "product_id": "PROD-123", "quantity": 2})
    cart_resp = service.get_cart("USER1")
    assert len(cart_resp["items"]) == 1

def test_update_item(mock_dynamodb):
    service = CartService()
    service.add_item({"user_id": "USER1", "product_id": "PROD-123", "quantity": 2})
    service.update_quantity({"user_id": "USER1", "product_id": "PROD-123", "quantity": 5})
    cart_resp = service.get_cart("USER1")
    assert cart_resp["items"][0]["quantity"] == 5

def test_remove_item(mock_dynamodb):
    service = CartService()
    service.add_item({"user_id": "USER1", "product_id": "PROD-123", "quantity": 2})
    service.remove_item("USER1", "PROD-123")
    cart_resp = service.get_cart("USER1")
    assert len(cart_resp["items"]) == 0

def test_clear_cart(mock_dynamodb):
    service = CartService()
    service.add_item({"user_id": "USER1", "product_id": "PROD-123", "quantity": 2})
    service.clear_cart("USER1")
    cart_resp = service.get_cart("USER1")
    assert len(cart_resp["items"]) == 0
