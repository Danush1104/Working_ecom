import json
import logging
import time
from contextvars import ContextVar
from typing import Any, Dict
from app.config import Config
 
# Context variables to store request-specific logging context
_log_context: ContextVar[Dict[str, Any]] = ContextVar("log_context", default={})

def clear_log_context() -> None:
    """Clears the logging context."""
    _log_context.set({})

def get_log_context() -> Dict[str, Any]:
    """Retrieves the current logging context."""
    return _log_context.get()

def update_log_context(**kwargs: Any) -> None:
    """Updates the current logging context with new key-value pairs."""
    ctx = _log_context.get().copy()
    ctx.update(kwargs)
    _log_context.set(ctx)

class StructuredJsonFormatter(logging.Formatter):
    """Custom formatter to format log records as structured JSON."""
    def format(self, record: logging.LogRecord) -> str:
        ctx = get_log_context()
        
        # Merge standard log fields with context fields
        log_data = {
            "timestamp": self.formatTime(record, self.datefmt) or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(record.created)),
            "service_name": Config.SERVICE_NAME,
            "level": record.levelname,
            "message": record.getMessage(),
            "correlation_id": ctx.get("correlation_id"),
            "request_id": ctx.get("request_id"),
            "lambda_request_id": ctx.get("lambda_request_id"),
            "event_id": ctx.get("event_id"),
            "http_method": ctx.get("http_method"),
            "path": ctx.get("path"),
            "status_code": ctx.get("status_code"),
            "execution_time_ms": ctx.get("execution_time_ms"),
        }
        
        # If there are additional details passed in the extra dict, add them
        if hasattr(record, "extra_fields"):
            log_data.update(record.extra_fields)  # type: ignore
            
        # Format exceptions if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_data)


# Configure and get the logger
logger = logging.getLogger(Config.SERVICE_NAME)
logger.propagate = False

# Avoid duplicate handlers if lambda reuses the execution context
if not logger.handlers:
    logger.setLevel(getattr(logging, Config.LOG_LEVEL.upper(), logging.INFO))
    stream_handler = logging.StreamHandler()
    formatter = StructuredJsonFormatter()
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)
