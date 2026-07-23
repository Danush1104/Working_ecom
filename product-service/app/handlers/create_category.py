import json
from typing import Any, Dict
from app.services.category_service import CategoryService
from app.response import build_response
from app.errors import ValidationError
from app.utils.auth import require_admin

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    require_admin(event)
    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        raise ValidationError("Invalid JSON payload", "INVALID_JSON")

    name = body.get("name")
    if not name or not str(name).strip():
        raise ValidationError("Category name is required", "MISSING_NAME")

    description = body.get("description", "")
    
    service = CategoryService()
    category = service.create_category(name=name, description=description)
    
    return build_response(201, {
        "success": True,
        "message": "Category created successfully",
        "data": category.to_dict()
    })
