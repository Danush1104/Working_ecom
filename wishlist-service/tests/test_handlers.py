import pytest
import json
import app.router
from app.services.wishlist_service import WishlistService
from app.router import handle_request

def test_add_wishlist_handler(mock_dynamodb, mock_event):
    app.router.wishlist_service = WishlistService()
    evt = mock_event("POST", "/api/wishlist", body=json.dumps({
        "product_id": "PROD-123"
    }), claims={"sub": "USER1"})
    
    res = handle_request(evt, {})
    assert res["statusCode"] == 201

def test_get_user_wishlist_handler(mock_dynamodb, mock_event):
    app.router.wishlist_service = WishlistService()
    add_evt = mock_event("POST", "/api/wishlist", body=json.dumps({
        "product_id": "PROD-123"
    }), claims={"sub": "USER1"})
    handle_request(add_evt, {})
    
    get_evt = mock_event("GET", "/api/wishlist/USER1", path_params={"user_id": "USER1"}, claims={"sub": "USER1"})
    res = handle_request(get_evt, {})
    assert res["statusCode"] == 200
    body = json.loads(res["body"])["data"]
    assert len(body) == 1

def test_delete_wishlist_handler(mock_dynamodb, mock_event):
    app.router.wishlist_service = WishlistService()
    add_evt = mock_event("POST", "/api/wishlist", body=json.dumps({
        "product_id": "PROD-123"
    }), claims={"sub": "USER1"})
    handle_request(add_evt, {})
    
    del_evt = mock_event("DELETE", "/api/wishlist/USER1/PROD-123", path_params={"user_id": "USER1", "product_id": "PROD-123"}, claims={"sub": "USER1"})
    res = handle_request(del_evt, {})
    assert res["statusCode"] == 200

