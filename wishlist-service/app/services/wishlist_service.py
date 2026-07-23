from typing import List, Dict, Any
from app.models.wishlist import WishlistItem
from app.repositories.wishlist_repository import WishlistRepository
from app.errors import NotFoundError, ValidationError

class WishlistService:
    def __init__(self):
        self.repo = WishlistRepository()

    def add_to_wishlist(self, user_id: str, product_id: str) -> WishlistItem:
        if not user_id or not product_id:
            raise ValidationError("User ID and Product ID are required")
            
        existing = self.repo.get_item(user_id, product_id)
        if existing:
            return existing

        item = WishlistItem(
            user_id=user_id,
            product_id=product_id,
            created_at="" # will be auto set in from_dict / init
        )
        # Using from_dict to generate datetime properly
        item = WishlistItem.from_dict({"user_id": user_id, "product_id": product_id})
        self.repo.add_item(item)
        return item

    def remove_from_wishlist(self, user_id: str, product_id: str) -> None:
        if not user_id or not product_id:
            raise ValidationError("User ID and Product ID are required")
            
        existing = self.repo.get_item(user_id, product_id)
        if not existing:
            raise NotFoundError("Item not found in wishlist")
            
        self.repo.remove_item(user_id, product_id)

    def get_user_wishlist(self, user_id: str) -> List[WishlistItem]:
        if not user_id:
            raise ValidationError("User ID is required")
        return self.repo.get_user_wishlist(user_id)
