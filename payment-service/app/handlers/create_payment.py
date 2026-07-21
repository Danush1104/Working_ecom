from typing import Any, Dict
from app.services.payment_service import PaymentService
from app.utils.helpers import parse_json_body
from app.response import success_response
from app.utils.auth import get_user_id

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for POST /api/payments.
    Initiates a new payment transaction.
    """
    body = parse_json_body(event)
    body["user_id"] = get_user_id(event)
    
    auth_header = event.get("headers", {}).get("authorization") or event.get("headers", {}).get("Authorization")
    
    service = PaymentService()
    payment_data = service.create_payment(body, authorization_header=auth_header)
    
    return success_response(
        message="Payment transaction initiated successfully",
        data=payment_data,
        status_code=201
    )
