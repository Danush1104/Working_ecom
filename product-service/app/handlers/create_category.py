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
    icon_url = body.get("icon_url", "")
    banner_url = body.get("banner_url", "")
    display_order = int(body.get("display_order", 0))
    featured = bool(body.get("featured", False))
    
    service = CategoryService()
    category = service.create_category(
        name=name, 
        description=description,
        icon_url=icon_url,
        banner_url=banner_url,
        display_order=display_order,
        featured=featured
    )
    
    return build_response(201, {
        "success": True,
        "message": "Category created successfully",
        "data": category.to_dict()
    })
