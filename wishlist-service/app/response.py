import json
from decimal import Decimal
from typing import Any, Dict, Optional
from app.logger import update_log_context

class DecimalEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle Decimal types."""
    def default(self, obj: Any) -> Any:
        if isinstance(obj, Decimal):
            # Check if it has a fractional part, else convert to int
            if obj % 1 == 0:
                return int(obj)
            return float(obj)
        return super().default(obj)


def build_response(status_code: int, body_data: Dict[str, Any]) -> Dict[str, Any]:
    """Builds a standard API Gateway proxy response."""
    # Update log context with status code
    update_log_context(status_code=status_code)
    
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT"
        },
        "body": json.dumps(body_data, cls=DecimalEncoder)
    }


def success_response(message: str, data: Any = None, status_code: int = 200) -> Dict[str, Any]:
    """Helper to return a success response."""
    return build_response(
        status_code=status_code,
        body_data={
            "success": True,
            "message": message,
            "data": data if data is not None else {}
        }
    )


def failure_response(message: str, error_code: str, status_code: int = 400, data: Any = None) -> Dict[str, Any]:
    """Helper to return a failure response."""
    return build_response(
        status_code=status_code,
        body_data={
            "success": False,
            "message": message,
            "error_code": error_code,
            "data": data
        }
    )

def error_response(status_code: int, message: str, error_code: str = "ERROR", data: Any = None) -> Dict[str, Any]:
    """Alternative helper to return an error response, matching router's expected signature."""
    return failure_response(message=message, error_code=error_code, status_code=status_code, data=data)
