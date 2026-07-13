import boto3
from app.config import Config

_sqs_client = None

def get_sqs_client():
    global _sqs_client
    if _sqs_client is None:
        _sqs_client = boto3.client("sqs", region_name=Config.AWS_REGION)
    return _sqs_client
