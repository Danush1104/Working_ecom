from typing import Any, Dict
from app.services.product_service import ProductService
from app.response import success_response
def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for GET /api/products.
    Lists all active products.
    """
    query_params = event.get("queryStringParameters") or {}
    include_inactive = query_params.get("include_inactive", "").lower() == "true"
    
    service = ProductService()
    products = service.list_products(include_inactive=include_inactive)
    
    return success_response(
        message="Products retrieved successfully",
        data=products,
        headers={
            "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
        }
    )
