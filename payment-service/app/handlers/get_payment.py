from typing import Any, Dict
from app.services.payment_service import PaymentService
from app.response import success_response
from app.errors import ValidationError

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for GET /api/payments/{payment_id}.
    Retrieves a single payment transaction by ID.
    """
    path_params = event.get("pathParameters") or {}
    payment_id = path_params.get("payment_id")
    
    if not payment_id:
        raise ValidationError("Payment ID is required in path parameters", "INVALID_REQUEST")
        
    service = PaymentService()
    payment_data = service.get_payment(payment_id)
    
    return success_response(
        message="Payment transaction retrieved successfully",
        data=payment_data
    )
