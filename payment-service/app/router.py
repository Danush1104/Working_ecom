import re
from typing import Any, Callable, Dict, Tuple
from app.handlers import (
    create_payment,
    process_payment,
    refund_payment,
    get_payment,
    get_order_payments,
    health,
    view_all_payments,
    simulate_success,
    simulate_failure
)
from app.errors import NotFoundError

# Compile regex patterns for routing.
ROUTE_PATTERNS = [
    ("GET", re.compile(r"^/health/?$"), health.handle),
    ("POST", re.compile(r"^/api/payments/?$"), create_payment.handle),
    ("POST", re.compile(r"^/api/payments/(?P<payment_id>[^/]+)/simulate-success/?$"), simulate_success.handle),
    ("POST", re.compile(r"^/api/payments/(?P<payment_id>[^/]+)/simulate-failure/?$"), simulate_failure.handle),
    ("PATCH", re.compile(r"^/api/payments/(?P<payment_id>[^/]+)/process/?$"), process_payment.handle),
    ("PATCH", re.compile(r"^/api/payments/(?P<payment_id>[^/]+)/refund/?$"), refund_payment.handle),
    ("GET", re.compile(r"^/api/payments/order/(?P<order_id>[^/]+)/?$"), get_order_payments.handle),
    ("GET", re.compile(r"^/api/payments/all/?$"), view_all_payments.handle),
    ("GET", re.compile(r"^/api/payments/(?P<payment_id>[^/]+)/?$"), get_payment.handle),
]

def route_request(method: str, path: str) -> Tuple[Callable[[Dict[str, Any], Any], Dict[str, Any]], Dict[str, str]]:
    """
    Matches the HTTP method and request path against route patterns.
    Returns the handler function and any extracted path parameters.
    Raises NotFoundError if no route matches.
    """
    # Clean the path by removing trailing slash if not root
    if path != "/" and path.endswith("/"):
        path = path[:-1]

    for route_method, pattern, handler in ROUTE_PATTERNS:
        if route_method == method:
            match = pattern.match(path)
            if match:
                path_params = match.groupdict()
                return handler, path_params
                
    raise NotFoundError(f"Route '{method} {path}' not found", "ROUTE_NOT_FOUND")
