import pytest
from app.services.product_service import ProductService
from app.errors import NotFoundError, ValidationError, ConflictError

def test_create_product(mock_dynamodb):
    service = ProductService()
    data = {
        "name": "Test Product",
        "description": "Test Description",
        "category": "Electronics",
        "price": 100.50
    }
    
    product = service.create_product(data)
    assert product["product_id"].startswith("PROD")
    assert product["name"] == "Test Product"
    assert product["price"] == 100.50
    assert product["is_active"] is True
    
    # Test Duplicate ID
    data["product_id"] = product["product_id"]
    with pytest.raises(ConflictError):
        service.create_product(data)

def test_get_product(mock_dynamodb):
    service = ProductService()
    product = service.create_product({
        "name": "Test Get",
        "description": "Desc",
        "category": "Books",
        "price": 20.0
    })
    
    fetched = service.get_product(product["product_id"])
    assert fetched["product_id"] == product["product_id"]
    
    with pytest.raises(NotFoundError):
        service.get_product("INVALID_ID")

def test_list_products(mock_dynamodb):
    service = ProductService()
    service.create_product({"name": "P1", "description": "D1", "category": "C1", "price": 10})
    service.create_product({"name": "P2", "description": "D2", "category": "C2", "price": 20})
    
    products = service.list_products()
    assert len(products) >= 2

def test_update_product(mock_dynamodb):
    service = ProductService()
    product = service.create_product({
        "name": "Old Name",
        "description": "Old Desc",
        "category": "Toys",
        "price": 10.0
    })
    
    updated = service.update_product(product["product_id"], {
        "name": "New Name",
        "description": "New Desc",
        "category": "Toys",
        "price": 15.0
    })
    
    assert updated["name"] == "New Name"
    assert updated["price"] == 15.0
    
def test_delete_product(mock_dynamodb):
    service = ProductService()
    product = service.create_product({
        "name": "Delete Me",
        "description": "Desc",
        "category": "Misc",
        "price": 5.0
    })
    
    service.delete_product(product["product_id"])
    
    with pytest.raises(NotFoundError):
        service.get_product(product["product_id"])
