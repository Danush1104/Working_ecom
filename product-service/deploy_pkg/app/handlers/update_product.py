from typing import Any, Dict
from app.services.product_service import ProductService
from app.utils.helpers import parse_json_body
from app.errors import ValidationError
from app.response import success_response
from app.utils.auth import require_admin

def handle_put(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    require_admin(event)
    """
    Handler for PUT /api/products/{product_id}.
    Fully updates a product.
    """
    path_parameters = event.get("pathParameters") or {}
    product_id = path_parameters.get("product_id")
    
    if not product_id:
        raise ValidationError("Product ID path parameter is required", "INVALID_REQUEST")
        
    body = parse_json_body(event)
    service = ProductService()
    product_data = service.update_product(product_id, body)
    
    return success_response(
        message="Product updated successfully",
        data=product_data
    )


def handle_patch(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    require_admin(event)
    """
    Handler for PATCH /api/products/{product_id}.
    Partially updates a product.
    """
    path_parameters = event.get("pathParameters") or {}
    product_id = path_parameters.get("product_id")
    
    if not product_id:
        raise ValidationError("Product ID path parameter is required", "INVALID_REQUEST")
        
    body = parse_json_body(event)
    service = ProductService()
    product_data = service.patch_product(product_id, body)
    
    return success_response(
        message="Product updated successfully",
        data=product_data
    )
