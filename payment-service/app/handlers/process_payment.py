from typing import Any, Dict
from app.services.payment_service import PaymentService
from app.utils.helpers import parse_json_body
from app.response import success_response
from app.errors import ValidationError

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for PATCH /api/payments/{payment_id}/process.
    Updates the payment status of a transaction.
    """
    path_params = event.get("pathParameters") or {}
    payment_id = path_params.get("payment_id")
    
    if not payment_id:
        raise ValidationError("Payment ID is required in path parameters", "INVALID_REQUEST")
        
    body = parse_json_body(event)
    
    service = PaymentService()
    payment_data = service.process_payment(payment_id, body)
    
    return success_response(
        message="Payment transaction processed successfully",
        data=payment_data
    )
