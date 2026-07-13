from typing import Any, Dict
from app.services.order_service import OrderService
from app.utils.helpers import parse_json_body
from app.response import success_response

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for POST /api/orders.
    Creates a new e-commerce order from the user's cart.
    """
    body = parse_json_body(event)
    
    service = OrderService()
    order_data = service.checkout(body)
    
    return success_response(
        message="Order created successfully",
        data=order_data,
        status_code=201
    )
