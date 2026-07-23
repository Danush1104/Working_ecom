import re
from typing import Any, Callable, Dict, Tuple
from app.handlers import (
    create_inventory,
    get_inventory,
    list_inventory,
    update_stock,
    reserve_stock,
    release_stock,
    deduct_stock,
    restore_stock,
    admin_inventory,
    health
)
from app.errors import NotFoundError

ROUTE_PATTERNS = [
    ("GET", re.compile(r"^/health/?$"), health.handle),
    ("PATCH", re.compile(r"^/internal/inventory/reserve/?$"), reserve_stock.handle),
    ("PATCH", re.compile(r"^/internal/inventory/release/?$"), release_stock.handle),
    ("PATCH", re.compile(r"^/internal/inventory/deduct/?$"), deduct_stock.handle),
    ("PATCH", re.compile(r"^/internal/inventory/restore/?$"), restore_stock.handle),
    ("POST", re.compile(r"^/api/inventory/?$"), create_inventory.handle),
    ("GET", re.compile(r"^/api/inventory/?$"), list_inventory.handle),
    ("GET", re.compile(r"^/api/inventory/(?P<product_id>[^/]+)/?$"), get_inventory.handle),
    ("PATCH", re.compile(r"^/api/inventory/(?P<product_id>[^/]+)/stock/?$"), update_stock.handle),
    ("PATCH", re.compile(r"^/api/inventory/(?P<product_id>[^/]+)/deduct/?$"), admin_inventory.handle_deduct),
    ("PATCH", re.compile(r"^/api/inventory/(?P<product_id>[^/]+)/restore/?$"), admin_inventory.handle_restore),
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
