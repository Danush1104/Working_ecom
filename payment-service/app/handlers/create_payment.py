from typing import Any, Dict
from app.services.payment_service import PaymentService
from app.utils.helpers import parse_json_body
from app.response import success_response

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for POST /api/payments.
    Initiates a new payment transaction.
    """
    body = parse_json_body(event)
    
    service = PaymentService()
    payment_data = service.create_payment(body)
    
    return success_response(
        message="Payment transaction initiated successfully",
        data=payment_data,
        status_code=201
    )
