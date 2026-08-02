import pytest
import os
from unittest.mock import MagicMock, patch
from botocore.exceptions import ClientError

os.environ["PROCESSED_EVENTS_TABLE"] = "MockProcessedEventsTable"
os.environ["SMTP_HOST"] = "smtp.mailtrap.io"
os.environ["SMTP_PORT"] = "2525"
os.environ["SMTP_USERNAME"] = "test"
os.environ["SMTP_PASSWORD"] = "test"
os.environ["SENDER_EMAIL"] = "test@example.com"

class FakeProcessedEventsTable:
    def __init__(self):
        self.items = {}

    def put_item(self, Item, ConditionExpression=None):
        key = Item['event_id']
        if key in self.items:
            raise ClientError(
                {"Error": {"Code": "ConditionalCheckFailedException", "Message": "Conditional check failed"}},
                "PutItem"
            )
        self.items[key] = Item

@pytest.fixture(scope="function", autouse=True)
def mock_dynamodb_and_smtp():
    events_table = FakeProcessedEventsTable()
    
    with patch("boto3.resource") as mock_boto:
        mock_dyn = MagicMock()
        mock_dyn.Table.return_value = events_table
        mock_boto.return_value = mock_dyn
        
        with patch("app.aws.smtp.smtplib.SMTP") as mock_smtp:
            yield events_table

