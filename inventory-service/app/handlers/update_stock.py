from typing import Any, Dict
from app.services.inventory_service import InventoryService
from app.utils.helpers import parse_json_body
from app.errors import ValidationError
from app.response import success_response
from app.utils.auth import require_admin

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    require_admin(event)
    """
    Handler for PATCH /api/inventory/{product_id}/stock.
    Adjusts absolute stock level.
    """
    path_parameters = event.get("pathParameters") or {}
    product_id = path_parameters.get("product_id")
    
    if not product_id:
        raise ValidationError("Product ID path parameter is required", "INVALID_REQUEST")
        
    body = parse_json_body(event)
    service = InventoryService()
    inventory_data = service.update_stock(product_id, body)
    
    return success_response(
        message="Stock updated successfully",
        data=inventory_data
    )
