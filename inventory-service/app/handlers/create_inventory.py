from typing import Any, Dict
from app.services.inventory_service import InventoryService
from app.utils.helpers import parse_json_body
from app.response import success_response

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for POST /api/inventory.
    Initializes product stock.
    """
    body = parse_json_body(event)
    service = InventoryService()
    inventory_data = service.create_inventory(body)
    
    return success_response(
        message="Inventory initialized successfully",
        data=inventory_data,
        status_code=201
    )
