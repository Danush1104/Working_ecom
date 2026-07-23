from typing import Any, Dict
from app.services.inventory_service import InventoryService
from app.validators import inventory_validator
from app.utils.helpers import parse_json_body
from app.response import success_response
from app.utils.auth import require_admin
from app.errors import ValidationError

def handle_deduct(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    require_admin(event)
    body = parse_json_body(event)
    path_parameters = event.get("pathParameters") or {}
    product_id = path_parameters.get("product_id")
    
    if not product_id:
        raise ValidationError("Product ID path parameter is required", "INVALID_REQUEST")
    
    quantity = int(body.get("quantity", 0))
    if quantity <= 0:
        raise ValidationError("Quantity must be positive")
        
    service = InventoryService()
    inventory_data = service.admin_deduct_stock(product_id, quantity)
    
    return success_response(
        message="Stock deducted successfully",
        data=inventory_data
    )

def handle_restore(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    require_admin(event)
    body = parse_json_body(event)
    path_parameters = event.get("pathParameters") or {}
    product_id = path_parameters.get("product_id")
    
    if not product_id:
        raise ValidationError("Product ID path parameter is required", "INVALID_REQUEST")
    
    quantity = int(body.get("quantity", 0))
    if quantity <= 0:
        raise ValidationError("Quantity must be positive")
        
    service = InventoryService()
    # reuse the existing restore_stock which safely just adds to total stock
    inventory_data = service.restore_stock(product_id, quantity)
    
    return success_response(
        message="Stock restored successfully",
        data=inventory_data
    )
