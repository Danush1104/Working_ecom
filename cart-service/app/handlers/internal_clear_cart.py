import os
from typing import Any, Dict
from app.services.cart_service import CartService
from app.response import success_response
from app.errors import ValidationError

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for DELETE /internal/cart/{user_id}.
    Clears the entire cart for a user. Optionally releases reservations.
    """
    headers = event.get("headers") or {}
    secret = headers.get("x-internal-secret") or headers.get("X-Internal-Secret")
    INTERNAL_SECRET = os.getenv("INTERNAL_WEBHOOK_SECRET", "default-internal-secret-123")
    if not secret or secret != INTERNAL_SECRET:
        raise ValidationError("Unauthorized internal call", "UNAUTHORIZED")

    path_params = event.get("pathParameters") or {}
    user_id = path_params.get("user_id")
    
    if not user_id:
        raise ValidationError("User ID is required", "INVALID_REQUEST")
        
    query_params = event.get("queryStringParameters") or {}
    # Defaults to false as specified
    release_inventory_str = query_params.get("releaseInventory", "false")
    release_inventory = release_inventory_str.lower() == "true"
    
    service = CartService()
    service.internal_clear_cart(user_id, release_inventory)
    
    return success_response(
        message="Internal cart clear completed successfully"
    )
