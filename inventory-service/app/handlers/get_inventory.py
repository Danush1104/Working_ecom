from typing import Any, Dict
from app.services.inventory_service import InventoryService
from app.errors import ValidationError
from app.response import success_response

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
