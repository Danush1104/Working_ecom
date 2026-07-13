from decimal import Decimal, InvalidOperation
from typing import Any, Dict
from app.errors import ValidationError

def _validate_common_fields(data: Dict[str, Any]) -> None:
    """Helper to validate core product fields present in creation or updates."""
    # Validate name
    if "name" in data:
        name = data["name"]
        if not isinstance(name, str) or not name.strip():
            raise ValidationError("Product name is required and must be a non-empty string", "INVALID_PRODUCT_NAME")
        if len(name) > 200:
            raise ValidationError("Product name must be 200 characters or less", "INVALID_PRODUCT_NAME")

    # Validate description
    if "description" in data:
        description = data["description"]
        if not isinstance(description, str) or not description.strip():
            raise ValidationError("Description is required and must be a non-empty string", "INVALID_REQUEST")

    # Validate category
    if "category" in data:
        category = data["category"]
        if not isinstance(category, str) or not category.strip():
            raise ValidationError("Category is required and must be a non-empty string", "INVALID_CATEGORY")

    # Validate price
    if "price" in data:
        price_val = data["price"]
        if price_val is None:
            raise ValidationError("Price cannot be null", "INVALID_PRICE")
            
        try:
            price = Decimal(str(price_val))
        except (InvalidOperation, ValueError, TypeError):
            raise ValidationError("Price must be a valid number", "INVALID_PRICE")
            
        if price <= 0:
            raise ValidationError("Price must be greater than zero", "INVALID_PRICE")


def validate_create_product(data: Dict[str, Any]) -> None:
    """Validates data for creating a new product."""
    required_fields = ["product_id", "name", "description", "category", "price"]
    
    # Check for missing or null required fields
    for field in required_fields:
        if field not in data or data[field] is None:
            raise ValidationError(f"Field '{field}' is required and cannot be null", "INVALID_REQUEST")
            
    # Validate product_id format
    product_id = data["product_id"]
    if not isinstance(product_id, str) or not product_id.startswith("PROD-") or len(product_id) < 6:
        raise ValidationError("Product ID must start with 'PROD-' followed by a valid UUID hex string", "INVALID_REQUEST")

    _validate_common_fields(data)


def validate_update_product(data: Dict[str, Any]) -> None:
    """Validates data for updating an existing product fully (PUT)."""
    required_fields = ["name", "description", "category", "price"]
    
    # Check for missing or null required fields
    for field in required_fields:
        if field not in data or data[field] is None:
            raise ValidationError(f"Field '{field}' is required and cannot be null", "INVALID_REQUEST")
            
    _validate_common_fields(data)


def validate_patch_product(data: Dict[str, Any]) -> None:
    """Validates data for partially updating a product (PATCH)."""
    if not data:
        raise ValidationError("Request body cannot be empty for partial updates", "INVALID_REQUEST")
        
    # Check that at least one updateable field is present
    allowed_fields = {"name", "description", "category", "price", "image_url"}
    if not any(field in data for field in allowed_fields):
        raise ValidationError("At least one updateable field must be provided", "INVALID_REQUEST")
        
    # Ensure client is not attempting to change product_id
    if "product_id" in data:
        raise ValidationError("Product ID is immutable and cannot be updated", "INVALID_REQUEST")
        
    _validate_common_fields(data)
