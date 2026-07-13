import boto3
from app.config import Config

# Global variable to reuse DynamoDB resource across invocations
_dynamodb_resource = None

def get_dynamodb_resource():
    """Returns a boto3 DynamoDB resource instance (singleton)."""
    global _dynamodb_resource
    if _dynamodb_resource is None:
        _dynamodb_resource = boto3.resource("dynamodb", region_name=Config.AWS_REGION)
    return _dynamodb_resource


def get_payment_table():
    """Returns the Payments DynamoDB Table client."""
    db = get_dynamodb_resource()
    return db.Table(Config.PAYMENT_TABLE)
