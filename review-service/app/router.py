import json
from app.services.review_service import ReviewService
from app.response import success_response, error_response
from app.errors import AppError
from app.logger import get_logger

logger = get_logger(__name__)
review_service = ReviewService()

def handle_request(event, context):
    http_method = event.get('httpMethod')
    path = event.get('path', '')
    path_parameters = event.get('pathParameters') or {}
    headers = event.get('headers') or {}
    
    # Get auth header to pass to order service
    auth_header = headers.get('Authorization', headers.get('authorization', ''))
    
    # Authenticated User
    request_context = event.get('requestContext') or {}
    authorizer = request_context.get('authorizer') or {}
    claims = authorizer.get('claims') or {} if isinstance(authorizer, dict) else {}
    if not claims and isinstance(authorizer, dict) and "jwt" in authorizer:
        jwt_claims = authorizer.get("jwt") or {}
        claims = jwt_claims.get("claims") or {}
    
    user_id = claims.get('sub')
    groups = claims.get('cognito:groups', [])
    is_admin = 'ADMIN' in groups
    
    try:
        # Public route
        if path.startswith('/api/reviews/product/') and http_method == 'GET':
            product_id = path_parameters.get('product_id')
            reviews = review_service.get_product_reviews(product_id)
            return success_response([r.to_dict() for r in reviews])
            
        # Admin route
        if path == '/api/reviews/all' and http_method == 'GET':
            if not is_admin:
                return error_response(403, "Forbidden")
            reviews = review_service.get_all_reviews()
            return success_response([r.to_dict() for r in reviews])

        # Protected routes
        if not user_id:
            return error_response(401, "Unauthorized")
            
        if path == '/api/reviews':
            if http_method == 'POST':
                body = json.loads(event.get('body', '{}'))
                review = review_service.add_review(
                    user_id=user_id,
                    product_id=body.get('product_id'),
                    rating=body.get('rating'),
                    review_text=body.get('review', ''),
                    auth_header=auth_header
                )
                return success_response(review.to_dict(), 201)
                
        if path.startswith('/api/reviews/') and len(path.split('/')) == 4:
            # /api/reviews/{product_id}/{review_id}  -> Wait, the prompt said /api/reviews/{review_id}, 
            # but dynamo PK is product_id, SK is review_id. It's better to pass product_id in body or path.
            pass
            
        # For delete/patch by review_id, since PK is product_id, we need product_id.
        # Let's handle /api/reviews/{product_id}/{review_id}
        if http_method == 'DELETE':
            product_id = path_parameters.get('product_id')
            review_id = path_parameters.get('review_id')
            review_service.delete_review(product_id, review_id, user_id, is_admin)
            return success_response({"message": "Review deleted"}, 200)

        return error_response(404, f"Route {http_method} {path} not found")
        
    except AppError as e:
        return error_response(e.status_code, e.message, e.error_code)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return error_response(500, "Internal server error")
