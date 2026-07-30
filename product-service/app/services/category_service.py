from datetime import datetime
from typing import Dict, Any, List
from app.models.category import Category
from app.repositories.category_repository import CategoryRepository
from app.repositories.product_repository import ProductRepository
from app.errors import NotFoundError, ConflictError

class CategoryService:
    def __init__(self):
        self.category_repo = CategoryRepository()
        self.product_repo = ProductRepository()

    def create_category(self, name: str, description: str = "", icon_url: str = "", banner_url: str = "", display_order: int = 0, featured: bool = False) -> Category:
        category = Category(
            name=name, 
            description=description,
            icon_url=icon_url,
            banner_url=banner_url,
            display_order=display_order,
            featured=featured
        )
        try:
            self.category_repo.create_category(category)
            return category
        except Exception as e:
            if type(e).__name__ == "ConditionalCheckFailedException":
                raise ConflictError("Category already exists")
            raise e

    def get_category(self, category_id: str) -> Category:
        category = self.category_repo.get_category(category_id)
        if not category or not category.is_active:
            raise NotFoundError("Category not found", "CATEGORY_NOT_FOUND")
        return category

    def list_categories(self) -> List[Category]:
        categories = self.category_repo.list_categories()
        existing_names = {c.name for c in categories}
        
        default_categories = [
            {"name": "Audio", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Audio"},
            {"name": "PC & Accessories", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=PC"},
            {"name": "Mobiles", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Mobiles"},
            {"name": "Home Appliances", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Home"},
            {"name": "Gaming", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Gaming"},
            {"name": "Cameras", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Camera"},
            {"name": "Laptops", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Laptops"},
            {"name": "Wearables", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Watch"},
            {"name": "Beauty Products", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Beauty"},
            {"name": "Electronics", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Tech"}
        ]
        
        added_new = False
        for idx, cat in enumerate(default_categories):
            if cat["name"] not in existing_names:
                try:
                    self.create_category(
                        name=cat["name"], 
                        description=f"Default category: {cat['name']}",
                        icon_url=cat["icon"],
                        display_order=idx + 1
                    )
                    added_new = True
                except ConflictError:
                    pass
        
        if added_new:
            categories = self.category_repo.list_categories()
                
        return categories
    def update_category(self, category_id: str, updates: Dict[str, Any]) -> Category:
        self.get_category(category_id)  # Validate exists
        
        valid_fields = ["name", "description", "icon_url", "banner_url", "display_order", "featured"]
        update_fields = {k: v for k, v in updates.items() if k in valid_fields}
        
        if update_fields:
            update_fields["updated_at"] = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
            try:
                self.category_repo.update_category(category_id, update_fields)
            except Exception as e:
                if type(e).__name__ == "ConditionalCheckFailedException":
                    raise NotFoundError("Category not found or inactive", "CATEGORY_NOT_FOUND")
                raise e

        return self.get_category(category_id)

    def delete_category(self, category_id: str) -> None:
        category = self.get_category(category_id)
        
        # Check if products exist in this category
        products = self.product_repo.search_products(category=category.name)
        if products:
            raise ConflictError("Cannot delete category because it is assigned to existing products.")

        updated_at = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        try:
            self.category_repo.delete_category(category_id, updated_at)
        except Exception as e:
            if type(e).__name__ == "ConditionalCheckFailedException":
                raise NotFoundError("Category not found or already inactive", "CATEGORY_NOT_FOUND")
            raise e

    def adjust_product_count_by_name(self, category_name: str, increment: int) -> None:
        """Finds the category by name and updates its product_count atomically."""
        if not category_name or increment == 0:
            return
            
        categories = self.category_repo.list_categories()
        matching = [c for c in categories if c.name.lower() == category_name.lower()]
        if matching:
            try:
                self.category_repo.update_product_count(matching[0].category_id, increment)
            except Exception as e:
                pass # Fail silently as it's a background denormalized count
