import pytest
from app.services.review_service import ReviewService

def test_add_review(mock_dynamodb_and_http):
    service = ReviewService()
    review = service.add_review(
        user_ids=["USER1"], 
        user_name="Test User", 
        product_id="PROD-123", 
        rating=5, 
        review_text="Great!", 
        auth_header="Bearer token"
    )
    assert review.product_id == "PROD-123"
    assert review.rating == 5
    assert review.review == "Great!"

def test_get_product_reviews(mock_dynamodb_and_http):
    service = ReviewService()
    service.add_review(["USER1"], "Test", "PROD-123", 5, "Great!", "token")
    
    reviews = service.get_product_reviews("PROD-123")
    assert len(reviews) == 1

def test_update_review(mock_dynamodb_and_http):
    service = ReviewService()
    rev = service.add_review(["USER1"], "Test", "PROD-123", 5, "Great!", "token")
    
    updated = service.update_review("PROD-123", rev.review_id, "USER1", "", 4, "Good")
    assert updated.rating == 4
    assert updated.review == "Good"

def test_delete_review(mock_dynamodb_and_http):
    service = ReviewService()
    rev = service.add_review(["USER1"], "Test", "PROD-123", 5, "Great!", "token")
    
    service.delete_review("PROD-123", rev.review_id, "USER1", "", hard_delete=True)
    reviews = service.get_product_reviews("PROD-123")
    assert len(reviews) == 0

def test_get_statistics(mock_dynamodb_and_http):
    service = ReviewService()
    service.add_review(["USER1"], "Test", "PROD-123", 5, "Great!", "token")
    
    stats = service.get_statistics()
    assert stats["total_reviews"] == 1
    assert stats["average_rating"] == 5.0
    assert stats["five_star"] == 1
