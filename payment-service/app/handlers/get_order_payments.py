from typing import Any, Dict
from app.services.payment_service import PaymentService
from app.response import success_response
from app.errors import ValidationError

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for GET /api/payments/order/{order_id}.
    Retrieves all payments associated with an order ID.
    """
    path_params = event.get("pathParameters") or {}
    order_id = path_params.get("order_id")
    
    if not order_id:
        raise ValidationError("Order ID is required in path parameters", "INVALID_REQUEST")
        
    service = PaymentService()
    payments = service.get_order_payments(order_id)
    
    return success_response(
        message="Order payments retrieved successfully",
        data=payments
    )
