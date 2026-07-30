from dataclasses import dataclass, asdict
from datetime import datetime
import uuid

@dataclass
class Review:
    product_id: str
    review_id: str
    user_id: str
    user_name: str
    rating: int
    review: str
    created_at: str
    updated_at: str
    verified_purchase: bool
    status: str = "ACTIVE"

    def to_dict(self):
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            product_id=data.get("product_id", ""),
            review_id=data.get("review_id", str(uuid.uuid4())),
            user_id=data.get("user_id", ""),
            user_name=data.get("user_name", "Anonymous"),
            rating=int(data.get("rating", 0)),
            review=data.get("review", ""),
            created_at=data.get("created_at", datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")),
            updated_at=data.get("updated_at", datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")),
            verified_purchase=bool(data.get("verified_purchase", False)),
            status=data.get("status", "ACTIVE")
        )
