import json
from app.services.wishlist_service import WishlistService
from app.response import success_response, error_response
from app.errors import AppError, NotFoundError, ValidationError
from app.logger import get_logger

logger = get_logger(__name__)
wishlist_service = WishlistService()

def handle_request(event, context):
    http_method = event.get('httpMethod')
    path = event.get('path', '')
    path_parameters = event.get('pathParameters') or {}
    
    logger.info(f"Handling {http_method} request for {path}")
    
    # Authenticated User ID from API Gateway Authorizer
    authorizer = event.get('requestContext', {}).get('authorizer', {})
    claims = authorizer.get('claims', {}) if isinstance(authorizer, dict) else {}
    if not claims and isinstance(authorizer, dict) and "jwt" in authorizer:
        claims = authorizer.get("jwt", {}).get("claims", {})
    
    user_id = claims.get('sub')
    if not user_id:
        return error_response(401, "Unauthorized", "UNAUTHORIZED")
    
    try:
        if path.startswith('/api/wishlist'):
            # GET /api/wishlist/{user_id}
            if http_method == 'GET':
                target_user = path_parameters.get('user_id')
                if not target_user:
                    target_user = user_id
                # Enforce users can only see their own wishlist
                if target_user != user_id:
                    return error_response(403, "Forbidden", "FORBIDDEN")
                    
                items = wishlist_service.get_user_wishlist(target_user)
                return success_response("Wishlist retrieved successfully", [item.to_dict() for item in items])
            
            # POST /api/wishlist
            elif http_method == 'POST':
                body = json.loads(event.get('body', '{}'))
                product_id = body.get('product_id')
                
                item = wishlist_service.add_to_wishlist(user_id, product_id)
                return success_response("Added to wishlist", item.to_dict(), 201)
            
            # DELETE /api/wishlist/{user_id}/{product_id}
            elif http_method == 'DELETE':
                target_user = path_parameters.get('user_id')
                product_id = path_parameters.get('product_id')
                
                if target_user != user_id:
                    return error_response(403, "Forbidden", "FORBIDDEN")
                    
                wishlist_service.remove_from_wishlist(target_user, product_id)
                return success_response({"message": "Removed from wishlist"}, 200)

        return error_response(404, f"Route {http_method} {path} not found")
        
    except AppError as e:
        return error_response(e.status_code, e.message, e.error_code)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return error_response(500, "Internal server error")
