from typing import Any, Dict
from app.services.payment_service import PaymentService
from app.response import success_response
from app.errors import ValidationError
from app.utils.auth import require_admin

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    require_admin(event)
    """
    Handler for POST /api/payments/{payment_id}/simulate-success.
    Simulates a successful payment callback from a mock payment gateway.
    """
    path_params = event.get("pathParameters") or {}
    payment_id = path_params.get("payment_id")
    
    if not payment_id:
        raise ValidationError("Payment ID is required in path parameters", "INVALID_REQUEST")
        
    service = PaymentService()
    # Reusing the existing process_payment logic
    payment_data = service.process_payment(payment_id, {"payment_status": "SUCCESS"})
    
    return success_response(
        message="Payment success simulated successfully",
        data=payment_data
    )
