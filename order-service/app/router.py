import re
from typing import Any, Callable, Dict, Tuple
from app.handlers import (
    checkout,
    get_user_orders,
    get_order,
    cancel_order,
    update_payment,
    health,
    view_all_orders
)
from app.errors import NotFoundError

# Compile regex patterns for routing.
# Order is important: more specific patterns (e.g. 2 path parameters) should precede less specific ones.
ROUTE_PATTERNS = [
    ("GET", re.compile(r"^/health/?$"), health.handle),
    ("POST", re.compile(r"^/api/orders/?$"), checkout.handle),
    ("PATCH", re.compile(r"^/api/orders/(?P<user_id>[^/]+)/(?P<order_id>[^/]+)/cancel/?$"), cancel_order.handle),
    ("PATCH", re.compile(r"^/internal/orders/(?P<user_id>[^/]+)/(?P<order_id>[^/]+)/payment/?$"), update_payment.handle),
    ("GET", re.compile(r"^/api/orders/all/?$"), view_all_orders.handle),
    ("GET", re.compile(r"^/api/orders/(?P<user_id>[^/]+)/(?P<order_id>[^/]+)/?$"), get_order.handle),
    ("GET", re.compile(r"^/api/orders/(?P<user_id>[^/]+)/?$"), get_user_orders.handle),
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
