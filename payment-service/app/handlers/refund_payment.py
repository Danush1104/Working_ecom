from typing import Any, Dict
from app.services.payment_service import PaymentService
from app.response import success_response
from app.errors import ValidationError

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for PATCH /api/payments/{payment_id}/refund.
    Processes a refund for a transaction.
    """
    path_params = event.get("pathParameters") or {}
    payment_id = path_params.get("payment_id")
    
    if not payment_id:
        raise ValidationError("Payment ID is required in path parameters", "INVALID_REQUEST")
        
    service = PaymentService()
    payment_data = service.refund_payment(payment_id)
    
    return success_response(
        message="Payment refunded successfully",
        data=payment_data
    )
