import pytest
import json
from app.handlers import (
    create_product,
    get_product,
    list_products,
    update_product,
    delete_product
)

def test_create_product_handler(mock_dynamodb, mock_event):
    event = mock_event(
        method="POST",
        path="/api/products",
        body=json.dumps({
            "name": "Handler Product",
            "description": "Handler Desc",
            "category": "Electronics",
            "price": 200.0
        }),
        claims={"custom:role": "admin"}
    )
    
    response = create_product.handle(event, {})
    assert response["statusCode"] == 201
    
    body = json.loads(response["body"])
    assert body["data"]["name"] == "Handler Product"
    
def test_list_products_handler(mock_dynamodb, mock_event):
    # First create a product via handler to ensure it exists
    event = mock_event(
        method="POST",
        path="/api/products",
        body=json.dumps({
            "name": "List Product",
            "description": "List Desc",
            "category": "Electronics",
            "price": 50.0
        }),
        claims={"custom:role": "admin"}
    )
    create_product.handle(event, {})
    
    list_event = mock_event("GET", "/api/products")
    response = list_products.handle(list_event, {})
    assert response["statusCode"] == 200
    
    body = json.loads(response["body"])
    assert len(body["data"]) > 0

def test_get_product_handler(mock_dynamodb, mock_event):
    # Create product
    create_evt = mock_event(
        method="POST",
        path="/api/products",
        body=json.dumps({
            "name": "Get Product",
            "description": "Get Desc",
            "category": "Books",
            "price": 10.0
        }),
        claims={"custom:role": "admin"}
    )
    res = create_product.handle(create_evt, {})
    prod_id = json.loads(res["body"])["data"]["product_id"]
    
    # Get product
    get_evt = mock_event("GET", f"/api/products/{prod_id}", path_params={"product_id": prod_id})
    response = get_product.handle(get_evt, {})
    assert response["statusCode"] == 200
    
    body = json.loads(response["body"])
    assert body["data"]["product_id"] == prod_id

def test_delete_product_handler(mock_dynamodb, mock_event):
    create_evt = mock_event(
        method="POST",
        path="/api/products",
        body=json.dumps({
            "name": "Del Product",
            "description": "Del Desc",
            "category": "Books",
            "price": 10.0
        }),
        claims={"custom:role": "admin"}
    )
    res = create_product.handle(create_evt, {})
    prod_id = json.loads(res["body"])["data"]["product_id"]
    
    del_evt = mock_event("DELETE", f"/api/products/{prod_id}", path_params={"product_id": prod_id}, claims={"custom:role": "admin"})
    del_response = delete_product.handle(del_evt, {})
    assert del_response["statusCode"] == 200
    
    get_evt = mock_event("GET", f"/api/products/{prod_id}", path_params={"product_id": prod_id})
    from app.errors import NotFoundError
    with pytest.raises(NotFoundError):
        get_product.handle(get_evt, {})
