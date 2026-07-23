import os
import requests
from typing import List, Dict, Any
from app.models.review import Review
from app.repositories.review_repository import ReviewRepository
from app.errors import NotFoundError, ValidationError, ForbiddenError
from app.logger import get_logger

logger = get_logger(__name__)

class ReviewService:
    def __init__(self):
        self.repo = ReviewRepository()
        self.order_api_url = os.environ.get("ORDER_SERVICE_URL", "https://qj1y5ztjwb.execute-api.ap-southeast-1.amazonaws.com/inv/api/orders")

    def _verify_purchase(self, user_id: str, product_id: str, auth_header: str) -> bool:
        """
        Calls Order Service to check if user has a PAID/COMPLETED order 
        with SUCCESS payment for this product_id.
        """
        try:
            headers = {"Authorization": auth_header}
            res = requests.get(f"{self.order_api_url}/{user_id}", headers=headers, timeout=5)
            if res.status_code != 200:
                logger.error(f"Failed to fetch orders for user {user_id}: {res.status_code}")
                return False
                
            orders = res.json()
            for order in orders:
                if order.get("order_status") == "DELIVERED":
                    items = order.get("items", [])
                    for item in items:
                        if item.get("product_id") == product_id:
                            return True
            return False
        except Exception as e:
            logger.error(f"Error validating purchase: {e}")
            return False

    def add_review(self, user_id: str, product_id: str, rating: int, review_text: str, auth_header: str) -> Review:
        if not user_id or not product_id or not rating:
            raise ValidationError("User ID, Product ID, and rating are required")
        
        if not (1 <= int(rating) <= 5):
            raise ValidationError("Rating must be between 1 and 5")
            
        # Check if user already reviewed
        existing_reviews = self.repo.get_product_reviews(product_id)
        if any(r.user_id == user_id for r in existing_reviews):
            raise ForbiddenError("You have already reviewed this product")

        # Verify purchase
        verified = self._verify_purchase(user_id, product_id, auth_header)
        if not verified:
            raise ForbiddenError("You must have a completed purchase of this product to leave a review")

        review = Review.from_dict({
            "product_id": product_id,
            "user_id": user_id,
            "rating": rating,
            "review": review_text,
            "verified_purchase": verified
        })
        self.repo.add_review(review)
        return review

    def get_product_reviews(self, product_id: str) -> List[Review]:
        return self.repo.get_product_reviews(product_id)

    def delete_review(self, product_id: str, review_id: str, user_id: str, is_admin: bool = False) -> None:
        review = self.repo.get_review(product_id, review_id)
        if not review:
            raise NotFoundError("Review not found")
            
        if not is_admin and review.user_id != user_id:
            raise ForbiddenError("Not authorized to delete this review")
            
        self.repo.delete_review(product_id, review_id)

    def get_all_reviews(self) -> List[Review]:
        return self.repo.get_all_reviews()
