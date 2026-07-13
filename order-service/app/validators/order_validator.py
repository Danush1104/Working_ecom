from typing import Any, Dict
from app.errors import ValidationError

# CANONICAL PAYMENT METHODS — must stay in sync with payment-service/app/validators/payment_validator.py
# Any changes here MUST be reflected in the payment service validator and vice versa.
SUPPORTED_PAYMENT_METHODS = {"CARD", "UPI", "NET_BANKING", "COD"}
SUPPORTED_PAYMENT_STATUSES = {"SUCCESS", "FAILED", "REFUNDED"}

def validate_checkout_input(data: Dict[str, Any]) -> None:
    """Validates checkout request payload."""
    required_fields = ["user_id", "payment_method", "customer_email"]
    
    for field in required_fields:
        if field not in data or data[field] is None:
            raise ValidationError(f"Field '{field}' is required and cannot be null", "INVALID_REQUEST")
            
    user_id = data["user_id"]
    if not isinstance(user_id, str) or not user_id.strip():
        raise ValidationError("User ID must be a non-empty string", "INVALID_REQUEST")
        
    payment_method = data["payment_method"]
    if not isinstance(payment_method, str) or payment_method not in SUPPORTED_PAYMENT_METHODS:
        raise ValidationError(
            f"Payment method '{payment_method}' is not supported. Supported: {list(SUPPORTED_PAYMENT_METHODS)}",
            "INVALID_REQUEST"
        )
        
    customer_email = data["customer_email"]
    if not isinstance(customer_email, str) or not customer_email.strip() or "@" not in customer_email:
        raise ValidationError("Customer email must be a valid email string", "INVALID_REQUEST")


def validate_payment_update(data: Dict[str, Any]) -> None:
    """Validates payment webhook status payload."""
    if "payment_status" not in data or data["payment_status"] is None:
        raise ValidationError("Field 'payment_status' is required and cannot be null", "INVALID_REQUEST")
        
    payment_status = data["payment_status"]
    if payment_status not in SUPPORTED_PAYMENT_STATUSES:
        raise ValidationError(
            f"Payment status '{payment_status}' is not supported. Supported: {list(SUPPORTED_PAYMENT_STATUSES)}",
            "INVALID_REQUEST"
        )


def validate_payment_transition(current_status: str, new_status: str) -> None:
    """Validates payment status transitions."""
    allowed = {
        "PENDING": {"SUCCESS", "FAILED"},
        "SUCCESS": {"REFUNDED"}
    }
    
    # Check if the transition is allowed
    if current_status not in allowed or new_status not in allowed[current_status]:
        raise ValidationError(
            f"Invalid payment status transition from {current_status} to {new_status}",
            "INVALID_STATUS_TRANSITION"
        )


def validate_user_id(user_id: str) -> None:
    """Validates user_id path parameter."""
    if not user_id or not isinstance(user_id, str) or not user_id.strip():
        raise ValidationError("User ID is required and must be a non-empty string", "INVALID_REQUEST")


def validate_order_id(order_id: str) -> None:
    """Validates order_id path parameter."""
    if not order_id or not isinstance(order_id, str) or not order_id.strip():
        raise ValidationError("Order ID is required and must be a non-empty string", "INVALID_REQUEST")
