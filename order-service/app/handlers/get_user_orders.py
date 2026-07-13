from typing import Any, Dict
from app.services.order_service import OrderService
from app.response import success_response
from app.errors import ValidationError

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for GET /api/orders/{user_id}.
    Retrieves all orders belonging to a user (sorted newest first).
    """
    path_params = event.get("pathParameters") or {}
    user_id = path_params.get("user_id")
    
    if not user_id:
        raise ValidationError("User ID is required in path parameters", "INVALID_REQUEST")
        
    service = OrderService()
    orders = service.get_user_orders(user_id)
    
    return success_response(
        message="User orders retrieved successfully",
        data=orders
    )
