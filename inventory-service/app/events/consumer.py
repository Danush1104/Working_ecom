import json
from typing import Any, Dict
from app.services.inventory_service import InventoryService
from app.repositories.inventory_repository import InventoryRepository
from app.utils.date_utils import get_utc_timestamp
from app.logger import logger, update_log_context

def consume_sqs_events(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Consumes batch of events from SQS.
    Processes PaymentCompleted, PaymentFailed, and OrderCancelled.
    Enforces event-level idempotency via ProcessedEvents table.
    """
    records = event.get("Records", [])
    logger.info(f"Received SQS event batch containing {len(records)} records.")
    
    repository = InventoryRepository()
    service = InventoryService()
    batch_item_failures = []

    for record in records:
        message_id = record.get("messageId")
        body_str = record.get("body", "")
        
        try:
            # Parse SQS message body
            body = json.loads(body_str)
            event_id = body.get("event_id")
            event_name = body.get("event_name")
            payload = body.get("payload", {})
            
            # Update logging context
            update_log_context(event_id=event_id)
            logger.info(f"Processing event: {event_name} (Message ID: {message_id}, Event ID: {event_id})")

            # 1. Enforce Idempotency
            if not event_id:
                logger.error("Event payload missing 'event_id'. Skipping record.")
                continue

            if repository.is_event_processed(event_id):
                logger.warning(f"Event ID {event_id} has already been processed. Skipping.")
                continue

            # 2. Route Event Handlers
            if event_name == "PaymentCompleted":
                _handle_payment_completed(payload, service)
            elif event_name == "PaymentFailed":
                _handle_payment_failed(payload, service)
            elif event_name == "OrderCancelled":
                _handle_order_cancelled(payload, service)
            else:
                logger.warning(f"Unsupported event name received: {event_name}. Ignoring.")

            # 3. Mark Event Processed (only on success)
            repository.mark_event_processed(
                event_id=event_id,
                event_name=event_name,
                processed_at=get_utc_timestamp()
            )
            logger.info(f"Successfully processed and recorded event ID: {event_id}")

        except Exception as e:
            logger.error(f"Failed to process SQS record {message_id}: {str(e)}", exc_info=True)
            # Standard AWS Lambda SQS batch failure reporting
            batch_item_failures.append({"itemIdentifier": message_id})

    # Return failures to SQS to retry only failed messages in the batch
    return {
        "batchItemFailures": batch_item_failures
    }


def _handle_payment_completed(payload: Dict[str, Any], service: InventoryService) -> None:
    """Deducts stock for all items in the completed payment."""
    items = payload.get("items", [])
    order_id = payload.get("order_id")
    logger.info(f"Processing PaymentCompleted for order {order_id} - Deducting stock...")
    
    for item in items:
        product_id = item["product_id"]
        quantity = int(item["quantity"])
        service.deduct_stock(product_id, quantity)


def _handle_payment_failed(payload: Dict[str, Any], service: InventoryService) -> None:
    """Releases stock reservation for all items in the failed payment."""
    items = payload.get("items", [])
    order_id = payload.get("order_id")
    logger.info(f"Processing PaymentFailed for order {order_id} - Releasing reservations...")
    
    for item in items:
        product_id = item["product_id"]
        quantity = int(item["quantity"])
        service.release_stock(product_id, quantity)


def _handle_order_cancelled(payload: Dict[str, Any], service: InventoryService) -> None:
    """Restores stock for all items in the cancelled order."""
    items = payload.get("items", [])
    order_id = payload.get("order_id")
    logger.info(f"Processing OrderCancelled for order {order_id} - Restoring stock...")
    
    for item in items:
        product_id = item["product_id"]
        quantity = int(item["quantity"])
        service.restore_stock(product_id, quantity)
