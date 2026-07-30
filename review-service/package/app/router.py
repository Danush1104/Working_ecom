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
    cognito_username = claims.get('cognito:username')
    groups = claims.get('cognito:groups', [])
    is_admin = 'ADMIN' in groups
    
    try:
        # Public route
        if path.startswith('/api/reviews/product/') and http_method == 'GET':
            product_id = path_parameters.get('product_id')
            reviews = review_service.get_product_reviews(product_id)
            return success_response("Reviews fetched", [r.to_dict() for r in reviews])
            
        # Admin route and user route and stats route through /api/reviews/all
        if path == '/api/reviews/all' and http_method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            
            if 'statistics' in query_params:
                stats = review_service.get_statistics()
                return success_response("Statistics fetched", stats)
                
            if 'user_id' in query_params:
                target_user_id = query_params['user_id']
                if target_user_id != user_id and not is_admin:
                    return error_response(403, "Forbidden")
                reviews = review_service.get_user_reviews(target_user_id)
                return success_response("User reviews fetched", [r.to_dict() for r in reviews])
                
            # No admin check here, allow public access to active reviews
            # The frontend filters for active reviews, or we could filter here.
            # But the service fetches all, and we return all for now (the UI handles it).
            reviews = review_service.get_all_reviews()
            return success_response("All reviews fetched", [r.to_dict() for r in reviews])

        # Protected routes
        if not user_id:
            return error_response(401, "Unauthorized")
            
        if path == '/api/reviews' and http_method == 'POST':
            body = json.loads(event.get('body', '{}'))
            # Support user_name
            user_name = claims.get('name') or claims.get('email') or 'Anonymous'
            review = review_service.add_review(
                user_ids=[user_id, cognito_username],
                user_name=user_name,
                product_id=body.get('product_id'),
                rating=body.get('rating'),
                review_text=body.get('review', ''),
                auth_header=auth_header
            )
            return success_response("Review added", review.to_dict(), 201)
                
        if path.startswith('/api/reviews/') and len(path.split('/')) == 4:
            # We are here if path is /api/reviews/{review_id}
            parts = path.strip('/').split('/')
            review_id = parts[-1]
            query_params = event.get('queryStringParameters') or {}
            body = json.loads(event.get('body', '{}')) if event.get('body') else {}
            
            product_id = query_params.get('product_id') or body.get('product_id')
            if not product_id:
                return error_response(400, "product_id is required in query params or body")
            
            if http_method == 'PUT':
                review = review_service.update_review(
                    product_id=product_id,
                    review_id=review_id,
                    user_id=user_id,
                    cognito_username=cognito_username,
                    rating=body.get('rating'),
                    review_text=body.get('review'),
                    is_admin=is_admin
                )
                return success_response("Review updated", review.to_dict(), 200)
                
            if http_method == 'DELETE':
                review_service.delete_review(
                    product_id=product_id, 
                    review_id=review_id, 
                    user_id=user_id, 
                    cognito_username=cognito_username,
                    is_admin=is_admin,
                    hard_delete=False
                )
                return success_response("Review deleted", {}, 200)

            if http_method == 'PATCH': # for hide
                if body.get('action') == 'hide':
                    review_service.hide_review(product_id, review_id, is_admin)
                    return success_response("Review visibility toggled", {}, 200)

        return error_response(404, f"Route {http_method} {path} not found")
        
    except AppError as e:
        return error_response(e.status_code, e.message, e.error_code)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return error_response(500, "Internal server error")
