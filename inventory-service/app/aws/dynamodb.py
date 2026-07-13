import boto3
from app.config import Config

_dynamodb_resource = None

def get_dynamodb_resource():
    global _dynamodb_resource
    if _dynamodb_resource is None:
        _dynamodb_resource = boto3.resource("dynamodb", region_name=Config.AWS_REGION)
    return _dynamodb_resource


def get_inventory_table():
    db = get_dynamodb_resource()
    return db.Table(Config.INVENTORY_TABLE)


def get_processed_events_table():
    db = get_dynamodb_resource()
    return db.Table(Config.PROCESSED_EVENTS_TABLE)
