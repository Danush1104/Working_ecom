from typing import Any, Dict
from app.services.product_service import ProductService
from app.response import success_response
from app.utils.auth import require_user_or_admin

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    require_user_or_admin(event)
    """
    Handler for GET /api/products.
    Lists all active products.
    """
    service = ProductService()
    products = service.list_products()
    
    return success_response(
        message="Products retrieved successfully",
        data=products
    )
