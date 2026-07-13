import json
import uuid
from typing import Any, Dict, Optional
from app.errors import ValidationError

def extract_request_id(event: Dict[str, Any]) -> str:
    """Extracts a request ID from API Gateway event context or generates a new one."""
    request_context = event.get("requestContext", {})
    # Look for standard API Gateway request ID
    lambda_request_id = request_context.get("requestId")
    if lambda_request_id:
        return str(lambda_request_id)
    return str(uuid.uuid4().hex)


def extract_correlation_id(event: Dict[str, Any]) -> str:
    """Extracts correlation ID from custom headers or generates a new one."""
    headers = event.get("headers", {}) or {}
    # Check common headers case insensitively
    for header_name in ["x-correlation-id", "X-Correlation-Id", "X-Correlation-ID"]:
        if header_name in headers:
            return headers[header_name]
    return str(uuid.uuid4().hex)


def parse_json_body(event: Dict[str, Any]) -> Dict[str, Any]:
    """Safely parses JSON body from API Gateway event."""
    body = event.get("body")
    if not body:
        raise ValidationError("Request body is missing", "INVALID_REQUEST")
    
    # Handle base64 encoded bodies if applicable
    if event.get("isBase64Encoded", False):
        import base64
        try:
            body = base64.b64decode(body).decode("utf-8")
        except Exception as e:
            raise ValidationError(f"Failed to decode base64 body: {str(e)}", "INVALID_REQUEST")
            
    try:
        data = json.loads(body)
        if not isinstance(data, dict):
            raise ValidationError("JSON body must be an object", "INVALID_REQUEST")
        return data
    except json.JSONDecodeError as e:
        raise ValidationError(f"Invalid JSON format: {str(e)}", "INVALID_REQUEST")
