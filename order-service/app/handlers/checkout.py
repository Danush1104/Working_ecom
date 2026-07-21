from typing import Any, Dict
from app.services.order_service import OrderService
from app.utils.helpers import parse_json_body
from app.response import success_response
from app.utils.auth import get_user_id

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for POST /api/orders.
    Creates a new e-commerce order from the user's cart.
    """
    body = parse_json_body(event)
    body["user_id"] = get_user_id(event)

    auth_header = event.get("headers", {}).get("authorization") or event.get("headers", {}).get("Authorization")
    
    service = OrderService()
    order_data = service.checkout(body, authorization_header=auth_header)
    
    return success_response(
        message="Order created successfully",
        data=order_data,
        status_code=201
    )
