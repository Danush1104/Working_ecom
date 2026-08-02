import pytest
from app.services.notification_service import NotificationService
from app.repositories.idempotency_repository import IdempotencyRepository

def test_process_sns_event(mock_dynamodb_and_smtp):
    service = NotificationService()
    
    # Process the first time
    service.process_sns_event({
        "event_type": "ORDER_PAYMENT_SUCCESS",
        "payment_id": "PAY-123",
        "order_id": "ORD-123",
        "customer_email": "test@test.com",
        "total_amount": 100,
        "payment_method": "CREDIT_CARD",
        "order_status": "PAID"
    })
    
    # Idempotency check: should be marked as processed
    repo = IdempotencyRepository()
    is_new = repo.mark_event_processed("notification_success_PAY-123", "ORDER_PAYMENT_SUCCESS", "2026")
    assert is_new is False

def test_process_sns_event_invalid_type():
    service = NotificationService()
    # Should ignore quietly
    service.process_sns_event({"event_type": "SOMETHING_ELSE"})

def test_process_sns_event_missing_fields():
    service = NotificationService()
    with pytest.raises(ValueError):
        service.process_sns_event({
            "event_type": "ORDER_PAYMENT_SUCCESS",
            "payment_id": "PAY-123"
        })

