import uuid
from typing import Dict, Any, Optional
from datetime import datetime

class Category:
    def __init__(
        self,
        name: str,
        category_id: Optional[str] = None,
        description: Optional[str] = None,
        is_active: bool = True,
        created_at: Optional[str] = None,
        updated_at: Optional[str] = None,
    ):
        self.category_id = category_id or f"CAT-{uuid.uuid4().hex}"
        self.name = name
        self.description = description or ""
        self.is_active = is_active
        self.created_at = created_at or datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        self.updated_at = updated_at or self.created_at

    def to_dict(self) -> Dict[str, Any]:
        return {
            "product_id": self.category_id,  # Stored in product_id PK of danush_products_table
            "entity_type": "CATEGORY",
            "name": self.name,
            "description": self.description,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> "Category":
        return Category(
            category_id=data.get("product_id"),
            name=data.get("name", ""),
            description=data.get("description", ""),
            is_active=data.get("is_active", True),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at")
        )
