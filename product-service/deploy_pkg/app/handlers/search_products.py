from typing import Any, Dict
from app.services.product_service import ProductService
from app.response import success_response
def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for GET /api/products/search.
    Searches products by category, keyword, and price ranges.
    """
    query_params = event.get("queryStringParameters") or {}
    
    category = query_params.get("category")
    keyword = query_params.get("keyword")
    min_price = query_params.get("min_price")
    max_price = query_params.get("max_price")
    include_inactive = query_params.get("include_inactive", "").lower() == "true"
    
    service = ProductService()
    products = service.search_products(
        category=category,
        keyword=keyword,
        min_price=min_price,
        max_price=max_price,
        include_inactive=include_inactive
    )
    
    return success_response(
        message="Products retrieved successfully",
        data=products
    )
