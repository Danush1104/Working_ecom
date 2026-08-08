from typing import Any, Dict
from app.services.order_service import OrderService
from app.utils.helpers import parse_json_body
from app.response import success_response
from app.errors import ValidationError
from app.utils.auth import require_admin

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for PATCH /api/orders/{user_id}/{order_id}/delivery.
    Updates the delivery status of an order. Admin only.
    """
    require_admin(event)

    path_params = event.get("pathParameters") or {}
    user_id = path_params.get("user_id")
    order_id = path_params.get("order_id")
    
    if not user_id or not order_id:
        raise ValidationError("User ID and Order ID are required in path parameters", "INVALID_REQUEST")
        
    body = parse_json_body(event)
    new_status = body.get("delivery_status")
    if not new_status:
        raise ValidationError("delivery_status is required in request body", "INVALID_REQUEST")
    
    service = OrderService()
    order_data = service.update_delivery_status(user_id, order_id, new_status)
    
    return success_response(
        message="Order delivery status updated successfully",
        data=order_data
    )
