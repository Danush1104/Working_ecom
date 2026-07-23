from dataclasses import dataclass, asdict
from datetime import datetime

@dataclass
class WishlistItem:
    user_id: str
    product_id: str
    created_at: str

    def to_dict(self):
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            user_id=data.get("user_id", ""),
            product_id=data.get("product_id", ""),
            created_at=data.get("created_at", datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"))
        )
