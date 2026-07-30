from typing import Any, Dict
from app.services.order_service import OrderService
from app.response import success_response
from app.utils.auth import require_self_or_admin
from app.errors import ValidationError

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for PATCH /api/orders/{user_id}/{order_id}/cancel.
    Cancels a pending or processing order and releases the stock.
    """
    path_params = event.get("pathParameters") or {}
    user_id = path_params.get("user_id")
    order_id = path_params.get("order_id")
    
    if not user_id or not order_id:
        raise ValidationError("User ID and Order ID are required in path parameters", "INVALID_REQUEST")
        
    require_self_or_admin(event, user_id)
    service = OrderService()
    order_data = service.cancel_order(user_id, order_id)
    
    return success_response(
        message="Order cancelled successfully",
        data=order_data
    )
