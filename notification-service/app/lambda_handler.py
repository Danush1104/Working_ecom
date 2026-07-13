import json
from typing import Any, Dict
from app.services.notification_service import NotificationService
from app.logger import logger, update_log_context, clear_log_context

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda entry point for SQS triggers.
    
    IAM ASSUMPTION: This Lambda only requires SQS execution permissions
    (e.g., sqs:ReceiveMessage, sqs:DeleteMessage, sqs:GetQueueAttributes).
    Because SES was replaced with SMTP, no SES permissions (ses:SendEmail) are required.
    """
    clear_log_context()
    request_id = context.aws_request_id if hasattr(context, "aws_request_id") else "unknown"
    update_log_context(lambda_request_id=request_id)
    
    logger.info(f"Received SQS event with {len(event.get('Records', []))} records.")
    
    service = NotificationService()
    
    # Process SQS records
    for record in event.get("Records", []):
        try:
            message_id = record.get("messageId")
            update_log_context(event_id=message_id)
            
            body = record.get("body")
            if not body:
                logger.error("SQS record missing 'body'.")
                continue
                
            try:
                sns_message = json.loads(body)
            except json.JSONDecodeError:
                logger.error("SQS body is not valid JSON.")
                continue
                
            if not isinstance(sns_message, dict):
                logger.error("SQS body is not a JSON object.")
                continue
            
            # SQS payload wraps the SNS payload inside 'Message'
            if "Message" in sns_message:
                try:
                    payload = json.loads(sns_message["Message"])
                except json.JSONDecodeError:
                    logger.error("SNS Message is not valid JSON.")
                    continue
                    
                if not isinstance(payload, dict):
                    logger.error("SNS Message is not a JSON object.")
                    continue
            else:
                payload = sns_message
                
            update_log_context(
                order_id=payload.get("order_id"),
                payment_id=payload.get("payment_id")
            )
            
            logger.info("Processing notification event...")
            service.process_sns_event(payload)
            
        except Exception as e:
            logger.error(f"Failed to process SQS record: {str(e)}")
            # Raising exception ensures SQS returns the message to the queue (and eventually DLQ)
            raise
            
    return {"statusCode": 200, "body": json.dumps({"message": "Successfully processed SQS records"})}
