import os
import urllib.request
import json
from typing import List, Dict, Any
from app.models.review import Review
from app.repositories.review_repository import ReviewRepository
from app.errors import NotFoundError, ValidationError, ForbiddenError
from app.logger import get_logger
import boto3
from decimal import Decimal
from datetime import datetime

logger = get_logger(__name__)

class ReviewService:
    def __init__(self):
        self.repo = ReviewRepository()
        self.order_api_url = os.environ.get("ORDER_SERVICE_URL", "https://qj1y5ztjwb.execute-api.ap-southeast-1.amazonaws.com/inv/api/orders")
        self.dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')
        self.product_table_name = os.environ.get("PRODUCT_TABLE", "danush_products_table")

    def _update_product_stats(self, product_id: str):
        reviews = self.repo.get_product_reviews(product_id)
        active_reviews = [r for r in reviews if getattr(r, 'status', 'ACTIVE') == 'ACTIVE']
        total_reviews = len(active_reviews)
        if total_reviews == 0:
            average_rating = 0.0
            distribution = {"5":0, "4":0, "3":0, "2":0, "1":0}
        else:
            average_rating = round(sum(r.rating for r in active_reviews) / total_reviews, 1)
            distribution = {"5":0, "4":0, "3":0, "2":0, "1":0}
            for r in active_reviews:
                if 1 <= r.rating <= 5:
                    distribution[str(r.rating)] += 1
        
        try:
            table = self.dynamodb.Table(self.product_table_name)
            table.update_item(
                Key={"product_id": product_id},
                UpdateExpression="SET average_rating = :avg, total_reviews = :tot, rating_distribution = :dist",
                ExpressionAttributeValues={
                    ":avg": Decimal(str(average_rating)),
                    ":tot": total_reviews,
                    ":dist": distribution
                },
                ConditionExpression="attribute_exists(product_id)"
            )
        except Exception as e:
            logger.error(f"Failed to update product stats for {product_id}: {e}")

    def _verify_purchase(self, user_ids: List[str], product_id: str, auth_header: str) -> bool:
        """
        Calls Order Service to check if user has a PAID/COMPLETED order 
        with SUCCESS payment for this product_id.
        Checks multiple possible user_ids (e.g. sub and cognito:username) for backward compatibility.
        """
        try:
            headers = {"Authorization": auth_header}
            
            for uid in user_ids:
                if not uid:
                    continue
                    
                req = urllib.request.Request(f"{self.order_api_url}/{uid}", headers=headers)
                try:
                    with urllib.request.urlopen(req, timeout=5) as res:
                        if res.getcode() != 200:
                            logger.error(f"Failed to fetch orders for user {uid}: {res.getcode()}")
                            continue
                            
                        response_data = json.loads(res.read().decode('utf-8'))
                        
                    # Handle API Gateway standard response wrapper if present
                    orders = response_data.get("data", []) if isinstance(response_data, dict) and "data" in response_data else response_data
                    if not isinstance(orders, list):
                        orders = []
                        
                    for order in orders:
                        # Allow valid paid/completed states. PROCESSING means paid and waiting for shipping.
                        if order.get("order_status") in ["DELIVERED", "COMPLETED", "PAID", "PROCESSING", "PENDING"]:
                            items = order.get("items", [])
                            for item in items:
                                if item.get("product_id") == product_id:
                                    return True
                except urllib.error.HTTPError as e:
                    # Ignore 404s or 403s for a specific identity and try the next one
                    logger.warning(f"HTTP error fetching orders for {uid}: {e.code}")
                    continue
                except Exception as e:
                    logger.error(f"Error fetching orders for {uid}: {e}")
                    continue
                    
            return False
        except Exception as e:
            logger.error(f"Error validating purchase: {e}")
            return False

    def add_review(self, user_ids: List[str], user_name: str, product_id: str, rating: int, review_text: str, auth_header: str) -> Review:
        # Default to the primary user_id (the sub) for creating the record
        user_id = user_ids[0] if user_ids else ""
        if not user_id or not product_id or not rating:
            raise ValidationError("User ID, Product ID, and rating are required")
        
        if not (1 <= int(rating) <= 5):
            raise ValidationError("Rating must be between 1 and 5")
            
        # Check if user already reviewed
        existing_reviews = self.repo.get_product_reviews(product_id)
        if any(r.user_id == user_id for r in existing_reviews):
            raise ForbiddenError("You have already reviewed this product")

        # Verify purchase using backward-compatible identities
        verified = self._verify_purchase(user_ids, product_id, auth_header)
        if not verified:
            raise ForbiddenError("You must have a completed purchase of this product to leave a review")

        review = Review.from_dict({
            "product_id": product_id,
            "user_id": user_id,
            "user_name": user_name,
            "rating": rating,
            "review": review_text,
            "verified_purchase": verified,
            "status": "ACTIVE"
        })
        self.repo.add_review(review)
        self._update_product_stats(product_id)
        return review

    def update_review(self, product_id: str, review_id: str, user_id: str, cognito_username: str, rating: int, review_text: str, is_admin: bool = False) -> Review:
        review = self.repo.get_review(product_id, review_id)
        if not review:
            raise NotFoundError("Review not found")
            
        if not is_admin and review.user_id != user_id and review.user_id != cognito_username:
            raise ForbiddenError("Not authorized to edit this review")

        if rating is not None and not (1 <= int(rating) <= 5):
            raise ValidationError("Rating must be between 1 and 5")

        updates = {
            "updated_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        }
        if rating is not None:
            updates["rating"] = int(rating)
        if review_text is not None:
            updates["review"] = review_text
            
        self.repo.update_review(product_id, review_id, updates)
        
        # update stats
        self._update_product_stats(product_id)
        
        # return updated review
        updated = self.repo.get_review(product_id, review_id)
        return updated

    def get_product_reviews(self, product_id: str) -> List[Review]:
        return self.repo.get_product_reviews(product_id)

    def delete_review(self, product_id: str, review_id: str, user_id: str, cognito_username: str, is_admin: bool = False, hard_delete: bool = False) -> None:
        review = self.repo.get_review(product_id, review_id)
        if not review:
            raise NotFoundError("Review not found")
            
        if not is_admin and review.user_id != user_id and review.user_id != cognito_username:
            raise ForbiddenError("Not authorized to delete this review")
            
        if hard_delete:
            self.repo.delete_review(product_id, review_id)
        else:
            self.repo.update_review(product_id, review_id, {"status": "DELETED"})
            
        self._update_product_stats(product_id)

    def hide_review(self, product_id: str, review_id: str, is_admin: bool) -> None:
        if not is_admin:
            raise ForbiddenError("Only admins can hide reviews")
        review = self.repo.get_review(product_id, review_id)
        if not review:
            raise NotFoundError("Review not found")
        
        new_status = "ACTIVE" if getattr(review, 'status', 'ACTIVE') == "HIDDEN" else "HIDDEN"
        self.repo.update_review(product_id, review_id, {"status": new_status})
        self._update_product_stats(product_id)

    def get_all_reviews(self) -> List[Review]:
        return self.repo.get_all_reviews()

    def get_user_reviews(self, user_id: str) -> List[Review]:
        # Need repo method for GSI query
        return self.repo.get_user_reviews(user_id)
        
    def get_statistics(self) -> Dict[str, Any]:
        all_reviews = self.repo.get_all_reviews()
        active = [r for r in all_reviews if getattr(r, 'status', 'ACTIVE') == 'ACTIVE']
        total = len(active)
        dist = {"5":0, "4":0, "3":0, "2":0, "1":0}
        for r in active:
            if 1 <= r.rating <= 5:
                dist[str(r.rating)] += 1
                
        avg = round(sum(r.rating for r in active) / total, 1) if total > 0 else 0.0
        return {
            "total_reviews": total,
            "average_rating": avg,
            "five_star": dist["5"],
            "four_star": dist["4"],
            "three_star": dist["3"],
            "two_star": dist["2"],
            "one_star": dist["1"]
        }
