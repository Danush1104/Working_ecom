from typing import Any, Dict
from app.services.cart_service import CartService
from app.utils.helpers import parse_json_body
from app.response import success_response
from app.utils.auth import get_user_id

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for POST /api/cart.
    Adds a new item or increments quantity of an existing item in the cart.
    """
    body = parse_json_body(event)
    body["user_id"] = get_user_id(event)

    auth_header = event.get("headers", {}).get("authorization") or event.get("headers", {}).get("Authorization")
    
    service = CartService()
    cart_item = service.add_item(body, authorization_header=auth_header)
    
    return success_response(
        message="Item added to cart successfully",
        data=cart_item
    )
