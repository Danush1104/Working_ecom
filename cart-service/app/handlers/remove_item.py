from typing import Any, Dict
from app.services.cart_service import CartService
from app.response import success_response
from app.errors import ValidationError

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for DELETE /api/cart/{user_id}/{product_id}.
    Removes a single product from the user's cart and releases reserved stock.
    """
    path_params = event.get("pathParameters") or {}
    user_id = path_params.get("user_id")
    product_id = path_params.get("product_id")
    
    if not user_id or not product_id:
        raise ValidationError("User ID and Product ID are required in path parameters", "INVALID_REQUEST")
        
    service = CartService()
    service.remove_item(user_id, product_id)
    
    return success_response(
        message="Product removed from cart successfully"
    )
