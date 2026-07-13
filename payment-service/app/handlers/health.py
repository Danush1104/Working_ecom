from datetime import datetime, timezone
from typing import Any, Dict
from app.response import build_response

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler for GET /health.
    Returns the raw service health metrics.
    """
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    
    health_body = {
        "service": "payment-service",
        "status": "UP",
        "timestamp": timestamp
    }
    
    return build_response(
        status_code=200,
        body_data=health_body
    )
