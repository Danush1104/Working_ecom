import time
from typing import Any, Dict
from app.router import route_request
from app.response import failure_response
from app.errors import AppError
from app.logger import logger, update_log_context, clear_log_context
from app.utils.helpers import extract_request_id, extract_correlation_id

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main entry point for AWS Lambda invocations.
    """
    start_time = time.perf_counter()
    clear_log_context()
    
    # 1. Check if SQS Event (for consistency across services)
    if "Records" in event:
        update_log_context(
            lambda_request_id=getattr(context, "aws_request_id", None)
        )
        logger.warning("Cart Service received SQS event, which is not expected for this service.")
        return {
            "batchItemFailures": []
        }

    # 2. Extract standard API Gateway properties
    http_method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    
    # API Gateway request ID
    request_id = extract_request_id(event)
    # Correlation ID (passed across service boundaries)
    correlation_id = extract_correlation_id(event)
    # Lambda execution request ID
    lambda_request_id = getattr(context, "aws_request_id", None)

    # Initialize log context
    update_log_context(
        correlation_id=correlation_id,
        request_id=request_id,
        lambda_request_id=lambda_request_id,
        http_method=http_method,
        path=path
    )

    logger.info(f"Incoming Request: {http_method} {path}")

    try:
        # 3. Route request and extract path params
        handler_fn, path_params = route_request(http_method, path)
        
        # Merge path parameters into the event object for the handler to access
        if "pathParameters" not in event or event["pathParameters"] is None:
            event["pathParameters"] = {}
        event["pathParameters"].update(path_params)

        # 4. Call handler
        response = handler_fn(event, context)
        
        # 5. Measure and log execution duration
        duration_ms = (time.perf_counter() - start_time) * 1000
        update_log_context(execution_time_ms=duration_ms)
        logger.info(f"Request Completed: {http_method} {path} - Status: {response.get('statusCode')}")
        
        return response

    except AppError as e:
        duration_ms = (time.perf_counter() - start_time) * 1000
        update_log_context(execution_time_ms=duration_ms)
        
        # Log application specific errors at WARN level
        logger.warning(
            f"Application Error: {http_method} {path} - Code: {e.error_code} - Msg: {e.message}"
        )
        return failure_response(
            message=e.message,
            error_code=e.error_code,
            status_code=e.status_code
        )
        
    except Exception as e:
        duration_ms = (time.perf_counter() - start_time) * 1000
        update_log_context(execution_time_ms=duration_ms)
        
        # Log unexpected errors at ERROR level with stack trace
        logger.error(
            f"Internal System Error: {http_method} {path} - Err: {str(e)}",
            exc_info=True
        )
        return failure_response(
            message="An unexpected server error occurred",
            error_code="INTERNAL_SERVER_ERROR",
            status_code=500
        )
