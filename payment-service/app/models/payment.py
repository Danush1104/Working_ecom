from dataclasses import dataclass, asdict
from decimal import Decimal
from typing import Any, Dict

@dataclass
class Payment:
    payment_id: str
    order_id: str
    user_id: str
    amount: Decimal
    payment_method: str
    payment_status: str
    created_at: str
    updated_at: str
    customer_username: str | None = None
    customer_email: str | None = None

    def to_dict(self) -> Dict[str, Any]:
        """Converts the Payment instance to a dictionary for DynamoDB storage."""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Payment":
        """Creates a Payment instance from a DynamoDB dictionary."""
        amount = data.get("amount")
        if amount is not None and not isinstance(amount, Decimal):
            amount = Decimal(str(amount))
            
        return cls(
            payment_id=data["payment_id"],
            order_id=data["order_id"],
            user_id=data["user_id"],
            amount=amount,  # type: ignore
            payment_method=data["payment_method"],
            payment_status=data["payment_status"],
            created_at=data["created_at"],
            updated_at=data["updated_at"],
            customer_username=data.get("customer_username"),
            customer_email=data.get("customer_email")
        )
