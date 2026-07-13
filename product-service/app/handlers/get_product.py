from typing import Any, Dict
from app.services.product_service import ProductService
from app.errors import ValidationError
from app.response import success_response

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for GET /api/products/{product_id}.
    Retrieves a single product.
    """
    path_parameters = event.get("pathParameters") or {}
    product_id = path_parameters.get("product_id")
    
    if not product_id:
        raise ValidationError("Product ID path parameter is required", "INVALID_REQUEST")
        
    service = ProductService()
    product_data = service.get_product(product_id)
    
    return success_response(
        message="Product retrieved successfully",
        data=product_data
    )
