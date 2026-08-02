import pytest
import json
from app.handlers import (
    add_item,
    view_cart,
    update_quantity,
    remove_item,
    clear_cart
)

def test_add_item_handler(mock_dynamodb, mock_event):
    evt = mock_event("POST", "/api/cart/items", body=json.dumps({"product_id": "PROD-123", "quantity": 2}), claims={"sub": "USER1"})
    res = add_item.handle(evt, {})
    assert res["statusCode"] == 200

def test_get_cart_handler(mock_dynamodb, mock_event):
    evt = mock_event("POST", "/api/cart/items", body=json.dumps({"product_id": "PROD-123", "quantity": 2}), claims={"sub": "USER1"})
    add_item.handle(evt, {})
    
    get_evt = mock_event("GET", "/api/cart/USER1", path_params={"user_id": "USER1"}, claims={"sub": "USER1"})
    res = view_cart.handle(get_evt, {})
    assert res["statusCode"] == 200
    assert len(json.loads(res["body"])["data"]["items"]) == 1

def test_update_item_handler(mock_dynamodb, mock_event):
    evt = mock_event("POST", "/api/cart/items", body=json.dumps({"product_id": "PROD-123", "quantity": 2}), claims={"sub": "USER1"})
    add_item.handle(evt, {})
    
    upd_evt = mock_event("PATCH", "/api/cart/items/PROD-123", path_params={"product_id": "PROD-123"}, body=json.dumps({"product_id": "PROD-123", "quantity": 5}), claims={"sub": "USER1"})
    res = update_quantity.handle(upd_evt, {})
    assert res["statusCode"] == 200

def test_remove_item_handler(mock_dynamodb, mock_event):
    evt = mock_event("POST", "/api/cart/items", body=json.dumps({"product_id": "PROD-123", "quantity": 2}), claims={"sub": "USER1"})
    add_item.handle(evt, {})
    
    rm_evt = mock_event("DELETE", "/api/cart/USER1/PROD-123", path_params={"user_id": "USER1", "product_id": "PROD-123"}, claims={"sub": "USER1"})
    res = remove_item.handle(rm_evt, {})
    assert res["statusCode"] == 200

def test_clear_cart_handler(mock_dynamodb, mock_event):
    evt = mock_event("POST", "/api/cart/items", body=json.dumps({"product_id": "PROD-123", "quantity": 2}), claims={"sub": "USER1"})
    add_item.handle(evt, {})
    
    clr_evt = mock_event("DELETE", "/api/cart/USER1", path_params={"user_id": "USER1"}, claims={"sub": "USER1"})
    res = clear_cart.handle(clr_evt, {})
    assert res["statusCode"] == 200
