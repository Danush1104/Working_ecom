from typing import Any, Dict
from app.errors import ValidationError

def validate_cart_item_input(data: Dict[str, Any]) -> None:
    """Validates core input for adding/updating cart items."""
    required_fields = ["user_id", "product_id", "quantity"]
    
    # Check for missing or null required fields
    for field in required_fields: 
        if field not in data or data[field] is None:
            raise ValidationError(f"Field '{field}' is required and cannot be null", "INVALID_REQUEST")
            
    # Validate user_id
    user_id = data["user_id"]
    if not isinstance(user_id, str) or not user_id.strip():
        raise ValidationError("User ID is required and must be a non-empty string", "INVALID_REQUEST")

    # Validate product_id
    product_id = data["product_id"]
    if not isinstance(product_id, str) or not product_id.strip():
        raise ValidationError("Product ID is required and must be a non-empty string", "INVALID_REQUEST")

    # Validate quantity
    quantity = data["quantity"]
    # Ensure quantity is a strict integer (isinstance(True, int) is True, so we must exclude bools)
    if isinstance(quantity, bool) or not isinstance(quantity, int):
        raise ValidationError("Quantity must be an integer", "INVALID_REQUEST")
        
    if quantity <= 0:
        raise ValidationError("Quantity must be greater than zero", "INVALID_REQUEST")


def validate_user_id(user_id: str) -> None:
    """Validates user_id parameter in path or query."""
    if not user_id or not isinstance(user_id, str) or not user_id.strip():
        raise ValidationError("User ID is required and must be a non-empty string", "INVALID_REQUEST")


def validate_product_id(product_id: str) -> None:
    """Validates product_id parameter in path or query."""
    if not product_id or not isinstance(product_id, str) or not product_id.strip():
        raise ValidationError("Product ID is required and must be a non-empty string", "INVALID_REQUEST")
