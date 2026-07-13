from typing import Any, Dict
from app.services.cart_service import CartService
from app.response import success_response
from app.errors import ValidationError

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for GET /api/cart/{user_id}.
    Retrieves the user's cart containing enriched product details and totals.
    """
    path_params = event.get("pathParameters") or {}
    user_id = path_params.get("user_id")
    
    if not user_id:
        raise ValidationError("User ID is required", "INVALID_REQUEST")
        
    service = CartService()
    cart_data = service.get_cart(user_id)
    
    return success_response(
        message="Cart retrieved successfully",
        data=cart_data
    )
