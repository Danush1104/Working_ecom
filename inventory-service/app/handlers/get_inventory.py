from typing import Any, Dict
from app.services.inventory_service import InventoryService
from app.errors import ValidationError
from app.response import success_response
from app.utils.auth import require_user_or_admin

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    require_user_or_admin(event)
    """
    Handler for GET /api/inventory/{product_id}.
    Retrieves stock information.
    """
    path_parameters = event.get("pathParameters") or {}
    product_id = path_parameters.get("product_id")
    
    if not product_id:
        raise ValidationError("Product ID path parameter is required", "INVALID_REQUEST")
        
    service = InventoryService()
    inventory_data = service.get_inventory(product_id)
    
    return success_response(
        message="Inventory retrieved successfully",
        data=inventory_data
    )
