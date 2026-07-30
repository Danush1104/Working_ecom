import os
from typing import Any, Dict
from app.services.order_service import OrderService
from app.utils.helpers import parse_json_body
from app.response import success_response
from app.errors import ValidationError

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for PATCH /internal/orders/{user_id}/{order_id}/payment.
    Webhook receiver that updates the payment status of an order.
    """
    headers = event.get("headers") or {}
    secret = headers.get("x-internal-secret") or headers.get("X-Internal-Secret")
    INTERNAL_SECRET = os.getenv("INTERNAL_WEBHOOK_SECRET", "default-internal-secret-123")
    if not secret or secret != INTERNAL_SECRET:
        raise ValidationError("Unauthorized internal call", "UNAUTHORIZED")

    path_params = event.get("pathParameters") or {}
    user_id = path_params.get("user_id")
    order_id = path_params.get("order_id")
    
    if not user_id or not order_id:
        raise ValidationError("User ID and Order ID are required in path parameters", "INVALID_REQUEST")
        
    body = parse_json_body(event)
    
    service = OrderService()
    order_data = service.update_payment(user_id, order_id, body)
    
    return success_response(
        message="Order payment status updated successfully",
        data=order_data
    )
