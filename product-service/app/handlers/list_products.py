from typing import Any, Dict
from app.services.product_service import ProductService
from app.response import success_response
def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
