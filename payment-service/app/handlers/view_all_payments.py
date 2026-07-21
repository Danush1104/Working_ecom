import json
import base64
from typing import Any, Dict
from app.services.payment_service import PaymentService
from app.response import success_response, build_response
from app.utils.auth import require_admin
from app.logger import logger

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    require_admin(event)
    """
    Handler for GET /api/payments/all.
    Retrieves all payment transactions across all orders, sorted chronologically descending.
    Supports optional pagination via ?limit=<int>&start_key=<base64-encoded-key> query parameters.
    """
    service = PaymentService()

    query_params = event.get("queryStringParameters") or {}

    limit_str = query_params.get("limit")
    if limit_str is not None and limit_str.isnumeric():
        limit = int(limit_str)
    else:
        limit = None

    start_key_str = query_params.get("start_key")
    if start_key_str is not None:
        try:
            start_key = json.loads(base64.b64decode(start_key_str.encode()).decode())
        except Exception:
            logger.warning("Failed to decode start_key query parameter; ignoring it.")
            start_key = None
    else:
        start_key = None

    payments, next_key = service.get_all_payments(limit=limit, start_key=start_key)

    if next_key is not None:
        next_page_key = base64.b64encode(json.dumps(next_key).encode()).decode()
    else:
        next_page_key = None

    return build_response(200, {
        "success": True,
        "message": "All payments retrieved successfully",
        "data": payments,
        "next_page_key": next_page_key
    })
