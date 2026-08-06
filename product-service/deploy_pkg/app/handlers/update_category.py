import json
from typing import Any, Dict
from app.services.category_service import CategoryService
from app.response import build_response
from app.errors import ValidationError
from app.utils.auth import require_admin

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    require_admin(event)
    
    path_params = event.get("pathParameters", {})
    category_id = path_params.get("category_id")
    if not category_id:
        raise ValidationError("category_id is required", "MISSING_ID")
        
    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        raise ValidationError("Invalid JSON payload", "INVALID_JSON")

    service = CategoryService()
    category = service.update_category(category_id, body)
    
    return build_response(200, {
        "success": True,
        "message": "Category updated successfully",
        "data": category.to_dict()
    })
