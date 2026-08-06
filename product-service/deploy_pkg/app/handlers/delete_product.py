from typing import Any, Dict
from app.services.product_service import ProductService
from app.errors import ValidationError
from app.response import success_response
from app.utils.auth import require_admin

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    require_admin(event)
    """
    Handler for DELETE /api/products/{product_id}.
    Soft deletes a product by setting is_active to False.
    """
    path_parameters = event.get("pathParameters") or {}
    product_id = path_parameters.get("product_id")
    
    if not product_id:
        raise ValidationError("Product ID path parameter is required", "INVALID_REQUEST")
        
    service = ProductService()
    service.delete_product(product_id)
    
    return success_response(
        message="Product deleted successfully"
    )
