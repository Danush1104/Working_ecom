from typing import Any, Dict
from app.errors import UnauthorizedError, ForbiddenError
from app.logger import logger
import json

def get_user_claims(event: Dict[str, Any]) -> Dict[str, Any]:
    req_context = event.get("requestContext", {})
    logger.info(f"DEBUG auth.py: requestContext: {req_context}")
    logger.info(f"DEBUG auth.py: requestContext.keys(): {list(req_context.keys())}")
    
    authorizer = req_context.get("authorizer", {})
    logger.info(f"DEBUG auth.py: authorizer: {authorizer}")
    if isinstance(authorizer, dict):
        logger.info(f"DEBUG auth.py: authorizer.keys(): {list(authorizer.keys())}")
    
    # Support HTTP API v2 format
    if isinstance(authorizer, dict) and "jwt" in authorizer and "claims" in authorizer["jwt"]:
        return authorizer["jwt"]["claims"]
        
    # Support REST API format
    return authorizer.get("claims", {}) if isinstance(authorizer, dict) else {}

def get_user_id(event: Dict[str, Any]) -> str:
    claims = get_user_claims(event)
    user_id = claims.get("sub")
    if not user_id:
        raise UnauthorizedError("User is not authenticated")
    return user_id

def get_user_groups(event: Dict[str, Any]) -> list:
    claims = get_user_claims(event)
    groups = claims.get("cognito:groups")
    if not groups:
        return []
    
    if isinstance(groups, str):
        if groups.startswith("["):
            try:
                groups = json.loads(groups)
            except:
                groups = [g.strip() for g in groups.strip("[]").split(",") if g.strip()]
        else:
            groups = [g.strip() for g in groups.split(",") if g.strip()]
            
    if isinstance(groups, list):
        return groups
    return []

def require_admin(event: Dict[str, Any]) -> None:
    groups = get_user_groups(event)
    claims = get_user_claims(event)
    custom_role = str(claims.get("custom:role", "")).upper()
    if "ADMIN" not in groups and custom_role != "ADMIN":
        raise ForbiddenError("Admin access required")

def require_user_or_admin(event: Dict[str, Any]) -> None:
    groups = get_user_groups(event)
    claims = get_user_claims(event)
    custom_role = str(claims.get("custom:role", "")).upper()
    if "USER" not in groups and "ADMIN" not in groups and custom_role not in ["USER", "ADMIN"]:
        raise ForbiddenError("User or Admin access required")

def require_self_or_admin(event: Dict[str, Any], target_user_id: str) -> None:
    groups = get_user_groups(event)
    claims = get_user_claims(event)
    custom_role = str(claims.get("custom:role", "")).upper()
    if "ADMIN" in groups or custom_role == "ADMIN":
        return
    user_id_sub = claims.get("sub")
    cognito_username = claims.get("cognito:username")
    if target_user_id != user_id_sub and target_user_id != cognito_username:
        raise ForbiddenError("Access denied to another user's resource")
