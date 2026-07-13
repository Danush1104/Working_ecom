from dataclasses import dataclass, asdict
from decimal import Decimal
from typing import Any, Dict, List, Optional

@dataclass
class OrderItemSnapshot:
    product_id: str
    product_name: str
    price: Decimal
    quantity: int
    subtotal: Decimal

    def to_dict(self) -> Dict[str, Any]:
        """Converts to a dictionary."""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "OrderItemSnapshot":
        """Creates an instance from a dictionary."""
        price = data.get("price")
        subtotal = data.get("subtotal")
        if price is not None and not isinstance(price, Decimal):
            price = Decimal(str(price))
        if subtotal is not None and not isinstance(subtotal, Decimal):
            subtotal = Decimal(str(subtotal))
        return cls(
            product_id=data["product_id"],
            product_name=data["product_name"],
            price=price,  # type: ignore
            quantity=int(data["quantity"]),
            subtotal=subtotal  # type: ignore
        )


@dataclass
class Order:
    order_id: str
    user_id: str
    items: List[OrderItemSnapshot]
    total_amount: Decimal
    order_status: str
    payment_status: str
    payment_method: str
    customer_email: str
    created_at: str
    updated_at: str
    payment_id: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Converts the Order instance to a dictionary for DynamoDB storage."""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Order":
        """Creates an Order instance from a DynamoDB dictionary."""
        total_amount = data.get("total_amount")
        if total_amount is not None and not isinstance(total_amount, Decimal):
            total_amount = Decimal(str(total_amount))
            
        items_data = data.get("items", []) or []
        items = [OrderItemSnapshot.from_dict(item) for item in items_data]
            
        return cls(
            order_id=data["order_id"],
            user_id=data["user_id"],
            items=items,
            total_amount=total_amount,  # type: ignore
            order_status=data["order_status"],
            payment_status=data["payment_status"],
            payment_method=data["payment_method"],
            customer_email=data.get("customer_email", ""),
            created_at=data["created_at"],
            updated_at=data["updated_at"],
            payment_id=data.get("payment_id")
        )
