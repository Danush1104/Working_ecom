from typing import Any, Dict
from app.services.category_service import CategoryService
from app.response import build_response

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    # Public endpoint
    service = CategoryService()
    categories = service.list_categories()
    
    return build_response(200, {
        "success": True,
        "message": "Categories retrieved successfully",
        "data": [c.to_dict() for c in categories]
    })
