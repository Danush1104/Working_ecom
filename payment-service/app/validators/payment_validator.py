from typing import Any, Dict
from decimal import Decimal, InvalidOperation
from app.errors import ValidationError

# CANONICAL PAYMENT METHODS — must stay in sync with order-service/app/validators/order_validator.py
# Any changes here MUST be reflected in the order service validator and vice versa.
SUPPORTED_PAYMENT_METHODS = {"CARD", "UPI", "NET_BANKING", "COD"}
SUPPORTED_PROCESS_STATUSES = {"SUCCESS", "FAILED"}

def validate_create_payment(data: Dict[str, Any]) -> None:
    """Validates creation request payload."""
    required_fields = ["order_id", "amount"]
    # user_id is injected by auth handler
    
    for field in required_fields:
        if field not in data or data[field] is None:
            raise ValidationError(f"Field '{field}' is required and cannot be null", "INVALID_REQUEST")
            
    order_id = data["order_id"]
    if not isinstance(order_id, str) or not order_id.strip():
        raise ValidationError("Order ID must be a non-empty string", "INVALID_REQUEST")

    user_id = data["user_id"]
    if not isinstance(user_id, str) or not user_id.strip():
        raise ValidationError("User ID must be a non-empty string", "INVALID_REQUEST")
        
    # Validate amount
    amount_val = data["amount"]
    try:
        amount = Decimal(str(amount_val))
    except (InvalidOperation, ValueError, TypeError):
        raise ValidationError("Amount must be a valid number", "INVALID_AMOUNT")
        
    if amount <= 0:
        raise ValidationError("Amount must be greater than zero", "INVALID_AMOUNT")


def validate_process_payment(data: Dict[str, Any]) -> None:
    """Validates process status payload."""
    if "payment_status" not in data or data["payment_status"] is None:
        raise ValidationError("Field 'payment_status' is required and cannot be null", "INVALID_REQUEST")
        
    payment_status = data["payment_status"]
    if payment_status not in SUPPORTED_PROCESS_STATUSES:
        raise ValidationError(
            f"Process payment status '{payment_status}' is not supported. Supported: {list(SUPPORTED_PROCESS_STATUSES)}",
            "INVALID_REQUEST"
        )


def validate_payment_transition(current_status: str, new_status: str) -> None:
    """Validates payment status transitions."""
    allowed = {
        "PENDING": {"SUCCESS", "FAILED"},
        "SUCCESS": {"REFUNDED"}
    }
    
    if current_status not in allowed or new_status not in allowed[current_status]:
        raise ValidationError(
            f"Invalid payment status transition from {current_status} to {new_status}",
            "INVALID_STATUS_TRANSITION"
        )


def validate_payment_id(payment_id: str) -> None:
    """Validates payment_id path parameter."""
    if not payment_id or not isinstance(payment_id, str) or not payment_id.strip():
        raise ValidationError("Payment ID is required and must be a non-empty string", "INVALID_REQUEST")


def validate_order_id(order_id: str) -> None:
    """Validates order_id path parameter."""
    if not order_id or not isinstance(order_id, str) or not order_id.strip():
        raise ValidationError("Order ID is required and must be a non-empty string", "INVALID_REQUEST")
