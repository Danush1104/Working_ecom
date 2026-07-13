import json
import base64
from typing import Any, Dict
from app.services.order_service import OrderService
from app.response import build_response

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for GET /api/orders/all.
    Retrieves all orders across all users, sorted chronologically descending.
    Supports optional pagination via ?limit=N&start_key=<base64-encoded-key>.
    """
    service = OrderService()

    query_params = event.get("queryStringParameters") or {}

    # Parse optional limit
    limit_str = query_params.get("limit")
    if limit_str is not None:
        try:
            limit = int(limit_str)
        except (ValueError, TypeError):
            limit = None
    else:
        limit = None

    # Parse optional start_key (base64-encoded JSON)
    start_key_str = query_params.get("start_key")
    if start_key_str is not None:
        try:
            start_key = json.loads(base64.b64decode(start_key_str.encode()).decode())
        except Exception:
            start_key = None
    else:
        start_key = None

    orders, next_key = service.get_all_orders(limit=limit, start_key=start_key)

    if next_key is not None:
        next_page_key = base64.b64encode(json.dumps(next_key).encode()).decode()
    else:
        next_page_key = None

    return build_response(200, {
        "success": True,
        "message": "All orders retrieved successfully",
        "data": orders,
        "next_page_key": next_page_key
    })
