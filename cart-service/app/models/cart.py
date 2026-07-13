from dataclasses import dataclass, asdict
from typing import Any, Dict

@dataclass
class CartItem:
    user_id: str
    product_id: str
    quantity: int
    created_at: str
    updated_at: str

    def to_dict(self) -> Dict[str, Any]:
        """Converts the CartItem instance to a dictionary for DynamoDB storage."""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "CartItem":
        """Creates a CartItem instance from a DynamoDB dictionary."""
        return cls(
            user_id=data["user_id"],
            product_id=data["product_id"],
            quantity=int(data["quantity"]),
            created_at=data["created_at"],
            updated_at=data["updated_at"]
        )
