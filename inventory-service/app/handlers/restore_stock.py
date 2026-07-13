from typing import Any, Dict
from app.services.inventory_service import InventoryService
from app.validators import inventory_validator
from app.utils.helpers import parse_json_body
from app.response import success_response

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for PATCH /api/inventory/restore.
    Restores stock level (increases total stock).
    """
    body = parse_json_body(event)
    inventory_validator.validate_quantity_change(body)
    
    product_id = body["product_id"]
    quantity = int(body["quantity"])
    
    service = InventoryService()
    inventory_data = service.restore_stock(product_id, quantity)
    
    return success_response(
        message="Stock restored successfully",
        data=inventory_data
    )
