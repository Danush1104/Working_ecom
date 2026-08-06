from typing import Any, Dict
from app.services.product_service import ProductService
from app.utils.helpers import parse_json_body
from app.response import success_response
from app.utils.auth import require_admin

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    
    require_admin(event)
    """
    Handler for POST /api/products.
    Creates a new product.
    """
    # Parse body
    body = parse_json_body(event)
    
    # Call service layer
    service = ProductService()
    product_data = service.create_product(body)
    
    # Return success response
    return success_response(
        message="Product created successfully",
        data=product_data,
        status_code=201
    )
