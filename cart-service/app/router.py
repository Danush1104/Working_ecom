import re
from typing import Any, Callable, Dict, Tuple
from app.handlers import (
    add_item,
    view_cart,
    update_quantity,
    remove_item,
    clear_cart,
    internal_clear_cart,
    view_all_carts,
    health
)
from app.errors import NotFoundError

ROUTE_PATTERNS = [
    ("GET", re.compile(r"^/health/?$"), health.handle),
    ("POST", re.compile(r"^/api/cart/?$"), add_item.handle),
    ("PATCH", re.compile(r"^/api/cart/?$"), update_quantity.handle),
    ("GET", re.compile(r"^/api/cart/all/?$"), view_all_carts.handle),
    ("GET", re.compile(r"^/api/cart/(?P<user_id>[^/]+)/?$"), view_cart.handle),
    ("DELETE", re.compile(r"^/api/cart/(?P<user_id>[^/]+)/(?P<product_id>[^/]+)/?$"), remove_item.handle),
    ("DELETE", re.compile(r"^/api/cart/(?P<user_id>[^/]+)/?$"), clear_cart.handle),
    ("DELETE", re.compile(r"^/internal/cart/(?P<user_id>[^/]+)/?$"), internal_clear_cart.handle),
]

def route_request(method: str, path: str) -> Tuple[Callable[[Dict[str, Any], Any], Dict[str, Any]], Dict[str, str]]:
    if path != "/" and path.endswith("/"):
        path = path[:-1]
    for route_method, pattern, handler in ROUTE_PATTERNS:
        if route_method == method:
            match = pattern.match(path)
            if match:
                path_params = match.groupdict()
                return handler, path_params
    raise NotFoundError(f"Route '{method} {path}' not found", "ROUTE_NOT_FOUND")
