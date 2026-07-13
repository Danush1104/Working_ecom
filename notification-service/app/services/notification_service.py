from datetime import datetime
from app.aws.smtp import SMTPClient
from app.repositories.idempotency_repository import IdempotencyRepository
from app.logger import logger

class NotificationService:
    def __init__(self):
        self.smtp_client = SMTPClient()
        self.idempotency_repo = IdempotencyRepository()
        
    def process_sns_event(self, event_data: dict) -> None:
        event_type = event_data.get("event_type")
        if event_type != "ORDER_PAYMENT_SUCCESS":
            logger.info(f"Ignoring unsupported event type: {event_type}")
            return
            
        payment_id = event_data.get("payment_id")
        order_id = event_data.get("order_id")
        recipient = event_data.get("customer_email")
        
        if not payment_id or not order_id or not recipient:
            logger.error("Missing required fields (payment_id, order_id, customer_email) in event payload.")
            raise ValueError("Invalid event payload format")
            
        # Idempotency key
        idempotency_key = f"notification_success_{payment_id}"
        
        # 1. Claim idempotency first (Atomic Lock)
        now = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        is_new = self.idempotency_repo.mark_event_processed(
            event_id=idempotency_key,
            event_name=event_type,
            processed_at=now
        )
        
        if not is_new:
            logger.warning(f"Notification already processed for payment {payment_id}. Skipping.")
            return
            
        # Format email
        subject = f"Payment Successful - Order {order_id}"
        body_text = f"""Hello,

Your payment has been received successfully.

Order ID: {order_id}
Payment ID: {payment_id}
Amount: {event_data.get('total_amount')}
Payment Method: {event_data.get('payment_method')}
Order Status: {event_data.get('order_status')}
Timestamp: {event_data.get('timestamp')}

Thank you for shopping with us.
"""

        try:
            # 2. Send the email using SMTP
            self.smtp_client.send_email(
                recipient=recipient,
                subject=subject,
                body_text=body_text
            )
            
            logger.info(f"Successfully processed notification for order {order_id}")
            
        except Exception as e:
            logger.error(f"Failed to process notification for {payment_id}: {str(e)}")
            # Raising exception ensures SQS returns the message to the queue (and eventually DLQ)
            # Note: A DLQ/manual retry strategy is required because the idempotency lock is already held.
            raise
