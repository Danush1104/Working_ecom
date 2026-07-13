from typing import Any, Dict
from app.services.cart_service import CartService
from app.utils.helpers import parse_json_body
from app.response import success_response

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for POST /api/cart.
    Adds a new item or increments quantity of an existing item in the cart.
    """
    body = parse_json_body(event)
    
    service = CartService()
    cart_item = service.add_item(body)
    
    return success_response(
        message="Item added to cart successfully",
        data=cart_item
    )
