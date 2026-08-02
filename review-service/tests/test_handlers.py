import pytest
import json
import app.router
from app.services.review_service import ReviewService
from app.router import handle_request

def test_add_review_handler(mock_dynamodb_and_http, mock_event):
    app.router.review_service = ReviewService()
    evt = mock_event("POST", "/api/reviews", body=json.dumps({
        "product_id": "PROD-123",
        "rating": 5,
        "review": "Excellent!"
    }), claims={"sub": "USER1"})
    
    res = handle_request(evt, {})
    assert res["statusCode"] == 201

def test_get_product_reviews_handler(mock_dynamodb_and_http, mock_event):
    app.router.review_service = ReviewService()
    add_evt = mock_event("POST", "/api/reviews", body=json.dumps({
        "product_id": "PROD-123",
        "rating": 5,
        "review": "Excellent!"
    }), claims={"sub": "USER1"})
    handle_request(add_evt, {})
    
    get_evt = mock_event("GET", "/api/reviews/product/PROD-123", path_params={"product_id": "PROD-123"})
    res = handle_request(get_evt, {})
    assert res["statusCode"] == 200
    body = json.loads(res["body"])["data"]
    assert len(body) == 1

def test_update_review_handler(mock_dynamodb_and_http, mock_event):
    app.router.review_service = ReviewService()
    add_evt = mock_event("POST", "/api/reviews", body=json.dumps({
        "product_id": "PROD-123",
        "rating": 5,
        "review": "Excellent!"
    }), claims={"sub": "USER1"})
    res = handle_request(add_evt, {})
    review_id = json.loads(res["body"])["data"]["review_id"]
    
    upd_evt = mock_event("PUT", f"/api/reviews/{review_id}", body=json.dumps({
        "product_id": "PROD-123",
        "rating": 4,
        "review": "Good!"
    }), claims={"sub": "USER1"})
    res = handle_request(upd_evt, {})
    assert res["statusCode"] == 200

def test_delete_review_handler(mock_dynamodb_and_http, mock_event):
    app.router.review_service = ReviewService()
    add_evt = mock_event("POST", "/api/reviews", body=json.dumps({
        "product_id": "PROD-123",
        "rating": 5,
        "review": "Excellent!"
    }), claims={"sub": "USER1"})
    res = handle_request(add_evt, {})
    review_id = json.loads(res["body"])["data"]["review_id"]
    
    del_evt = mock_event("DELETE", f"/api/reviews/{review_id}", query_params={"product_id": "PROD-123"}, claims={"sub": "USER1"})
    res = handle_request(del_evt, {})
    assert res["statusCode"] == 200

