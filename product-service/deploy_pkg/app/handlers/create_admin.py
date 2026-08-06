import json
import os
import boto3
from typing import Any, Dict
from app.utils.auth import require_admin
from app.utils.helpers import parse_json_body
from app.errors import ValidationError, DatabaseError
from app.response import build_response
from app.logger import logger

def handle(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    # Ensure caller is an admin
    require_admin(event)
    
    body = parse_json_body(event)
    email = body.get("email")
    password = body.get("password")
    name = body.get("name")
    
    if not email or not password:
        raise ValidationError("Email and password are required")
        
    user_pool_id = os.environ.get("USER_POOL_ID", "ap-southeast-1_YFOpMiVLd")
    client = boto3.client("cognito-idp", region_name="ap-southeast-1")
    
    try:
        # Create user
        client.admin_create_user(
            UserPoolId=user_pool_id,
            Username=email,
            UserAttributes=[
                {"Name": "email", "Value": email},
                {"Name": "email_verified", "Value": "true"},
                {"Name": "name", "Value": name or "Admin"},
                {"Name": "custom:role", "Value": "ADMIN"}
            ],
            TemporaryPassword=password,
            MessageAction="SUPPRESS" # Admin will communicate password out of band, or require password change
        )
        
        # Set permanent password (so they don't have to change it on first login unless desired)
        client.admin_set_user_password(
            UserPoolId=user_pool_id,
            Username=email,
            Password=password,
            Permanent=True
        )
        
        # Add to Admin group
        try:
            client.admin_add_user_to_group(
                UserPoolId=user_pool_id,
                Username=email,
                GroupName="ADMIN"
            )
        except client.exceptions.ResourceNotFoundException:
            logger.warning("ADMIN group does not exist in Cognito, skipping group assignment")
            pass
            
        return build_response(201, {
            "success": True,
            "message": "Admin user created successfully",
            "data": {"email": email}
        })
        
    except client.exceptions.UsernameExistsException:
        raise ValidationError("A user with this email already exists")
    except Exception as e:
        logger.error(f"Failed to create admin in Cognito: {str(e)}")
        raise DatabaseError(f"Failed to create admin: {str(e)}")
