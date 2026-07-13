from dataclasses import dataclass, asdict
from typing import Any, Dict

@dataclass
class Inventory:
    product_id: str
    stock: int
    reserved: int
    updated_at: str

    @property
    def available(self) -> int:
        """Dynamically calculates the available stock."""
        return self.stock - self.reserved

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["available"] = self.available
        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Inventory":
        return cls(
            product_id=data["product_id"],
            stock=int(data.get("stock", 0)),
            reserved=int(data.get("reserved", 0)),
            updated_at=data["updated_at"]
        )
