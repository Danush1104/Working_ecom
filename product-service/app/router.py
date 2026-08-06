import re
from typing import Any, Callable, Dict, Tuple, Optional
from app.handlers import (
    create_product,
    get_product,
    update_product,
    delete_product,
    list_products,
    search_products,
    create_category,
    get_categories,
    update_category,
    delete_category,
    create_admin
)
from app.errors import NotFoundError

# Compile regex patterns for routing calls
ROUTE_PATTERNS = [
    # Categories
    ("GET", re.compile(r"^/api/categories/?$"), get_categories.handle),
    ("POST", re.compile(r"^/api/categories/?$"), create_category.handle),
    ("PATCH", re.compile(r"^/api/categories/(?P<category_id>[^/]+)/?$"), update_category.handle),
    ("DELETE", re.compile(r"^/api/categories/(?P<category_id>[^/]+)/?$"), delete_category.handle),
    # Admin
    ("POST", re.compile(r"^/api/admin/create-admin/?$"), create_admin.handle),
    
    # Products
    ("GET", re.compile(r"^/api/products/search/?$"), search_products.handle),
    ("POST", re.compile(r"^/api/products/?$"), create_product.handle),
    ("GET", re.compile(r"^/api/products/?$"), list_products.handle),
    ("GET", re.compile(r"^/api/products/(?P<product_id>[^/]+)/?$"), get_product.handle),
    ("PUT", re.compile(r"^/api/products/(?P<product_id>[^/]+)/?$"), update_product.handle_put),
    ("PATCH", re.compile(r"^/api/products/(?P<product_id>[^/]+)/?$"), update_product.handle_patch),
    ("DELETE", re.compile(r"^/api/products/(?P<product_id>[^/]+)/?$"), delete_product.handle),
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
