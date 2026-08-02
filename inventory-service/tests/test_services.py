import pytest
from botocore.exceptions import ClientError
from app.services.inventory_service import InventoryService
from app.errors import NotFoundError, ValidationError

def test_create_inventory(mock_dynamodb):
    service = InventoryService()
    inv = service.create_inventory({
        "product_id": "PROD-12345",
        "stock": 100
    })
    
    assert inv["product_id"] == "PROD-12345"
    assert inv["stock"] == 100
    assert inv["reserved"] == 0
    assert inv["available"] == 100

def test_update_stock(mock_dynamodb):
    service = InventoryService()
    service.create_inventory({"product_id": "PROD-12345", "stock": 10})
    
    service.update_stock("PROD-12345", {"stock": 20})
    inv = service.get_inventory("PROD-12345")
    assert inv["stock"] == 20

def test_reserve_stock(mock_dynamodb):
    service = InventoryService()
    service.create_inventory({"product_id": "PROD-12345", "stock": 50})
    
    service.reserve_stock("PROD-12345", 10)
    inv = service.get_inventory("PROD-12345")
    assert inv["stock"] == 50
    assert inv["reserved"] == 10
    assert inv["available"] == 40
    
    with pytest.raises(Exception):
        service.reserve_stock("PROD-12345", 100) # Insufficient stock

def test_release_stock(mock_dynamodb):
    service = InventoryService()
    service.create_inventory({"product_id": "PROD-12345", "stock": 50})
    service.reserve_stock("PROD-12345", 10)
    
    service.release_stock("PROD-12345", 5)
    inv = service.get_inventory("PROD-12345")
    assert inv["reserved"] == 5

def test_deduct_stock(mock_dynamodb):
    service = InventoryService()
    service.create_inventory({"product_id": "PROD-12345", "stock": 50})
    service.reserve_stock("PROD-12345", 10)
    
    service.deduct_stock("PROD-12345", 10)
    inv = service.get_inventory("PROD-12345")
    assert inv["stock"] == 40
    assert inv["reserved"] == 0
