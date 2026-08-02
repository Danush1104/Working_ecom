import pytest
import json
from app.handlers import (
    create_inventory,
    get_inventory,
    list_inventory,
    update_stock,
    reserve_stock,
    release_stock,
    deduct_stock,
    restore_stock
)

def test_create_inventory_handler(mock_dynamodb, mock_event):
    event = mock_event(
        method="POST",
        path="/api/inventory",
        body=json.dumps({"product_id": "PROD-12345", "stock": 150}),
        claims={"custom:role": "admin"}
    )
    
    response = create_inventory.handle(event, {})
    assert response["statusCode"] == 201

def test_get_inventory_handler(mock_dynamodb, mock_event):
    create_evt = mock_event("POST", "/api/inventory", body=json.dumps({"product_id": "PROD-12345", "stock": 50}), claims={"custom:role": "admin"})
    create_inventory.handle(create_evt, {})
    
    get_evt = mock_event("GET", "/api/inventory/PROD-12345", path_params={"product_id": "PROD-12345"}, claims={"custom:role": "admin"})
    response = get_inventory.handle(get_evt, {})
    assert response["statusCode"] == 200

def test_list_inventory_handler(mock_dynamodb, mock_event):
    list_evt = mock_event("GET", "/api/inventory", claims={"custom:role": "admin"})
    response = list_inventory.handle(list_evt, {})
    assert response["statusCode"] == 200

def test_update_stock_handler(mock_dynamodb, mock_event):
    create_evt = mock_event("POST", "/api/inventory", body=json.dumps({"product_id": "PROD-12345", "stock": 50}), claims={"custom:role": "admin"})
    create_inventory.handle(create_evt, {})
    
    upd_evt = mock_event("PATCH", "/api/inventory/PROD-12345/stock", path_params={"product_id": "PROD-12345"}, body=json.dumps({"stock": 75}), claims={"custom:role": "admin"})
    response = update_stock.handle(upd_evt, {})
    assert response["statusCode"] == 200

def test_reserve_stock_handler(mock_dynamodb, mock_event):
    create_evt = mock_event("POST", "/api/inventory", body=json.dumps({"product_id": "PROD-12345", "stock": 50}), claims={"custom:role": "admin"})
    create_inventory.handle(create_evt, {})
    
    res_evt = mock_event("PATCH", "/internal/inventory/reserve", body=json.dumps({"product_id": "PROD-12345", "quantity": 10}), claims={"custom:role": "admin"})
    response = reserve_stock.handle(res_evt, {})
    assert response["statusCode"] == 200

def test_release_stock_handler(mock_dynamodb, mock_event):
    create_evt = mock_event("POST", "/api/inventory", body=json.dumps({"product_id": "PROD-12345", "stock": 50}), claims={"custom:role": "admin"})
    create_inventory.handle(create_evt, {})
    
    res_evt = mock_event("PATCH", "/internal/inventory/reserve", body=json.dumps({"product_id": "PROD-12345", "quantity": 10}), claims={"custom:role": "admin"})
    reserve_stock.handle(res_evt, {})
    
    rel_evt = mock_event("PATCH", "/internal/inventory/release", body=json.dumps({"product_id": "PROD-12345", "quantity": 5}), claims={"custom:role": "admin"})
    response = release_stock.handle(rel_evt, {})
    assert response["statusCode"] == 200

def test_deduct_stock_handler(mock_dynamodb, mock_event):
    create_evt = mock_event("POST", "/api/inventory", body=json.dumps({"product_id": "PROD-12345", "stock": 50}), claims={"custom:role": "admin"})
    create_inventory.handle(create_evt, {})
    
    res_evt = mock_event("PATCH", "/internal/inventory/reserve", body=json.dumps({"product_id": "PROD-12345", "quantity": 10}), claims={"custom:role": "admin"})
    reserve_stock.handle(res_evt, {})
    
    ded_evt = mock_event("PATCH", "/internal/inventory/deduct", body=json.dumps({"product_id": "PROD-12345", "quantity": 10}), claims={"custom:role": "admin"})
    response = deduct_stock.handle(ded_evt, {})
    assert response["statusCode"] == 200
