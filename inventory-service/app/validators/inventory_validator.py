from typing import Any, Dict
from app.errors import ValidationError

def validate_create_inventory(data: Dict[str, Any]) -> None:
    """Validates the input for initializing inventory."""
    if "product_id" not in data or not data["product_id"]:
        raise ValidationError("Field 'product_id' is required", "INVALID_REQUEST")
        
    product_id = data["product_id"]
    if not isinstance(product_id, str) or not product_id.startswith("PROD-") or len(product_id) < 6:
        raise ValidationError("Product ID must be a valid ID starting with 'PROD-'", "INVALID_REQUEST")

    if "stock" not in data or data["stock"] is None:
        raise ValidationError("Field 'stock' is required", "INVALID_REQUEST")
        
    try:
        stock = int(data["stock"])
    except (ValueError, TypeError):
        raise ValidationError("Stock must be an integer", "INVALID_STOCK")
        
    if stock < 0:
        raise ValidationError("Stock level cannot be negative", "INVALID_STOCK")


def validate_update_stock(data: Dict[str, Any]) -> None:
    """Validates stock update adjustments (PATCH stock)."""
    if "stock" not in data or data["stock"] is None:
        raise ValidationError("Field 'stock' is required", "INVALID_REQUEST")
        
    try:
        stock = int(data["stock"])
    except (ValueError, TypeError):
        raise ValidationError("Stock must be an integer", "INVALID_STOCK")
        
    if stock < 0:
        raise ValidationError("Stock level cannot be negative", "INVALID_STOCK")


def validate_quantity_change(data: Dict[str, Any]) -> None:
    """Validates quantity parameters passed for reserve/release/deduct/restore requests."""
    if "quantity" not in data or data["quantity"] is None:
        raise ValidationError("Field 'quantity' is required", "INVALID_REQUEST")
        
    try:
        quantity = int(data["quantity"])
    except (ValueError, TypeError):
        raise ValidationError("Quantity must be an integer", "INVALID_QUANTITY")
        
    if quantity <= 0:
        raise ValidationError("Quantity must be greater than zero", "INVALID_QUANTITY")
        
    if "product_id" not in data or not data["product_id"]:
        raise ValidationError("Field 'product_id' is required", "INVALID_REQUEST")
