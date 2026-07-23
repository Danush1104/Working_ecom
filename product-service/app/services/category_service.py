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

    def create_category(self, name: str, description: str = "") -> Category:
        category = Category(name=name, description=description)
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
            "Audio", "PC & Accessories", "Mobiles", "Home Appliances", 
            "Gaming", "Cameras", "Laptops", "Wearables", 
            "Beauty Products", "Electronics"
        ]
        
        added_new = False
        for cat_name in default_categories:
            if cat_name not in existing_names:
                try:
                    self.create_category(name=cat_name, description=f"Default category: {cat_name}")
                    added_new = True
                except ConflictError:
                    pass
        
        if added_new:
            categories = self.category_repo.list_categories()
                
        return categories
    def update_category(self, category_id: str, updates: Dict[str, Any]) -> Category:
        self.get_category(category_id)  # Validate exists
        
        valid_fields = ["name", "description"]
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
