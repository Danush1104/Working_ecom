from dataclasses import dataclass, asdict
from decimal import Decimal
from typing import Any, Dict, Optional

@dataclass
class Product:
    product_id: str
    name: str
    description: str
    category: str
    price: Decimal
    is_active: bool
    created_at: str
    updated_at: str
    image_url: Optional[str] = None
    is_featured: bool = False

    def to_dict(self) -> Dict[str, Any]:
        """Converts the Product instance to a dictionary for DynamoDB storage."""
        data = asdict(self)
        # Ensure Decimal type is preserved (asdict keeps it)
        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Product":
        """Creates a Product instance from a DynamoDB dictionary."""
        # Convert price string or float to Decimal if needed, though boto3 decimalizes it
        price = data.get("price")
        if price is not None and not isinstance(price, Decimal):
            price = Decimal(str(price))
            
        return cls(
            product_id=data["product_id"],
            name=data["name"],
            description=data["description"],
            category=data["category"],
            price=price,  # type: ignore
            is_active=bool(data.get("is_active", True)),
            created_at=data["created_at"],
            updated_at=data["updated_at"],
            image_url=data.get("image_url"),
            is_featured=bool(data.get("is_featured", False))
        )
