import json
import base64
from typing import Any, Dict
from app.services.cart_service import CartService
from app.response import build_response
from app.utils.auth import require_admin

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    require_admin(event)

    auth_header = event.get("headers", {}).get("authorization") or event.get("headers", {}).get("Authorization")
    service = CartService()

    query_params = event.get("queryStringParameters") or {}

    limit_str = query_params.get("limit")
    if limit_str is not None:
        try:
            limit = int(limit_str)
        except (ValueError, TypeError):
            limit = None
    else:
        limit = None

    start_key_str = query_params.get("start_key")
    if start_key_str is not None:
        try:
            start_key = json.loads(base64.b64decode(start_key_str.encode()).decode())
        except Exception:
            start_key = None
    else:
        start_key = None

    all_carts, next_key = service.get_all_carts(limit=limit, start_key=start_key, authorization_header=auth_header)

    if next_key is not None:
        next_page_key = base64.b64encode(json.dumps(next_key).encode()).decode()
    else:
        next_page_key = None

    return build_response(200, {
        "success": True,
        "message": "All carts retrieved successfully",
        "data": all_carts,
        "next_page_key": next_page_key
    })
