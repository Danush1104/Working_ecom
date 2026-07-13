from typing import Any, Dict
from app.services.cart_service import CartService
from app.response import success_response
from app.errors import ValidationError

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for DELETE /api/cart/{user_id}.
    Clears the entire cart for a user and releases all reservations.
    """
    path_params = event.get("pathParameters") or {}
    user_id = path_params.get("user_id")
    
    if not user_id:
        raise ValidationError("User ID is required", "INVALID_REQUEST")
        
    service = CartService()
    service.clear_cart(user_id)
    
    return success_response(
        message="Cart cleared successfully"
    )
