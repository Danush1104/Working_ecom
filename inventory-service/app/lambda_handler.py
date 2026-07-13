import time
from typing import Any, Dict
from app.router import route_request
from app.events.consumer import consume_sqs_events
from app.response import failure_response
from app.errors import AppError
from app.logger import logger, update_log_context, clear_log_context
from app.utils.helpers import extract_request_id, extract_correlation_id

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main entry point for AWS Lambda.
    Handles REST API Gateway routes and SQS consumers.
    """
    start_time = time.perf_counter()
    clear_log_context()
    
    # 1. Route SQS Event Triggers
    if "Records" in event:
        lambda_request_id = getattr(context, "aws_request_id", None)
        update_log_context(lambda_request_id=lambda_request_id)
        
        try:
            # SQS consumer manages its own logging contexts per record
            result = consume_sqs_events(event, context)
            return result
        except Exception as e:
            logger.error(f"Fatal exception during SQS batch processing: {str(e)}", exc_info=True)
            # Re-raise so SQS trigger retries the batch if not caught
            raise e

    # 2. Route REST API Gateway proxy requests
    http_method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    
    request_id = extract_request_id(event)
    correlation_id = extract_correlation_id(event)
    lambda_request_id = getattr(context, "aws_request_id", None)

    update_log_context(
        correlation_id=correlation_id,
        request_id=request_id,
        lambda_request_id=lambda_request_id,
        http_method=http_method,
        path=path
    )

    logger.info(f"Incoming Request: {http_method} {path}")

    try:
        handler_fn, path_params = route_request(http_method, path)
        
        if "pathParameters" not in event or event["pathParameters"] is None:
            event["pathParameters"] = {}
        event["pathParameters"].update(path_params)

        response = handler_fn(event, context)
        
        duration_ms = (time.perf_counter() - start_time) * 1000
        update_log_context(execution_time_ms=duration_ms)
        logger.info(f"Request Completed: {http_method} {path} - Status: {response.get('statusCode')}")
        
        return response

    except AppError as e:
        duration_ms = (time.perf_counter() - start_time) * 1000
        update_log_context(execution_time_ms=duration_ms)
        
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
        
        logger.error(
            f"Internal System Error: {http_method} {path} - Err: {str(e)}",
            exc_info=True
        )
        return failure_response(
            message="An unexpected server error occurred",
            error_code="INTERNAL_SERVER_ERROR",
            status_code=500
        )
