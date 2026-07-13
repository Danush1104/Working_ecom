from typing import Any, Dict
from app.services.cart_service import CartService
from app.utils.helpers import parse_json_body
from app.response import success_response

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for PATCH /api/cart.
    Updates the quantity of a product in the user's cart.
    """
    body = parse_json_body(event)
    
    service = CartService()
    cart_item = service.update_quantity(body)
    
    return success_response(
        message="Cart item quantity updated successfully",
        data=cart_item
    )
