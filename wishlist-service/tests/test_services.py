import pytest
from app.services.wishlist_service import WishlistService
from app.errors import NotFoundError

def test_add_to_wishlist(mock_dynamodb):
    service = WishlistService()
    item = service.add_to_wishlist("USER1", "PROD-123")
    assert item.user_id == "USER1"
    assert item.product_id == "PROD-123"

def test_get_user_wishlist(mock_dynamodb):
    service = WishlistService()
    service.add_to_wishlist("USER1", "PROD-123")
    service.add_to_wishlist("USER1", "PROD-456")
    
    items = service.get_user_wishlist("USER1")
    assert len(items) == 2

def test_remove_from_wishlist(mock_dynamodb):
    service = WishlistService()
    service.add_to_wishlist("USER1", "PROD-123")
    
    service.remove_from_wishlist("USER1", "PROD-123")
    items = service.get_user_wishlist("USER1")
    assert len(items) == 0

def test_remove_from_wishlist_not_found(mock_dynamodb):
    service = WishlistService()
    with pytest.raises(NotFoundError):
        service.remove_from_wishlist("USER1", "PROD-123")

