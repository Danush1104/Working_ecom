import os
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, List, Optional, Tuple
from app.config import Config
from app.models.payment import Payment
from app.repositories.payment_repository import PaymentRepository
from app.validators import payment_validator
from app.utils.date_utils import get_utc_timestamp
from app.utils.id_generator import generate_id
from app.utils.http_client import HttpClient
from app.errors import NotFoundError, ValidationError, ConflictError, InternalServerError
from app.constants import (
    ERROR_PAYMENT_NOT_FOUND,
    ERROR_DUPLICATE_PAYMENT,
    ERROR_DATABASE_ERROR,
    ERROR_INTERNAL_SERVER_ERROR
)
from app.logger import logger

class PaymentService:
    def __init__(self):
        self.repository = PaymentRepository()

    def create_payment(self, data: Dict[str, Any], authorization_header: Optional[str] = None) -> Dict[str, Any]:
        payment_validator.validate_create_payment(data)
        
        order_id = data["order_id"]
        user_id = data["user_id"]
        amount = Decimal(str(data["amount"]))

        # --- Improvement 2: Verify order exists + Improvement 1: Validate amount + Improvement 4: Verify owner + Improvement 5: Validate order state ---
        order_url = f"{Config.ORDER_SERVICE_URL}/{user_id}/{order_id}"
        try:
            logger.info(f"Fetching order {order_id} for payment validation...")
            req_headers = {"Authorization": authorization_header} if authorization_header else None
            order_response = HttpClient.request("GET", order_url, headers=req_headers, timeout=5.0)
            order_data = order_response.json().get("data", {})
        except NotFoundError:
            raise NotFoundError(
                f"Order {order_id} not found. Cannot create payment for a non-existent order.",
                "ORDER_NOT_FOUND"
            )
        except Exception as e:
            logger.error(f"Failed to fetch order {order_id} for payment validation: {str(e)}")
            raise InternalServerError(
                f"Could not verify order details: {str(e)}",
                ERROR_INTERNAL_SERVER_ERROR
            )

        # Improvement 4: Payment user_id must match the order's user_id
        if order_data.get("user_id") != user_id:
            raise ValidationError(
                "Payment user_id does not match the order owner.",
                "UNAUTHORIZED"
            )

        # Improvement 5: Only PENDING orders can receive a new payment
        order_status = order_data.get("order_status")
        if order_status != "PENDING":
            raise ValidationError(
                f"Payments can only be created for PENDING orders. Order is currently '{order_status}'.",
                "INVALID_ORDER_STATUS"
            )

        # Improvement 1: Payment amount must equal the order total
        order_total = order_data.get("total_amount")
        if order_total is not None:
            try:
                order_total_decimal = Decimal(str(order_total))
                if amount != order_total_decimal:
                    raise ValidationError(
                        f"Payment amount {amount} does not match order total {order_total_decimal}. "
                        f"Please use the exact order total.",
                        "AMOUNT_MISMATCH"
                    )
            except (InvalidOperation, ValueError, TypeError) as parse_err:
                logger.warning(f"Could not parse order total_amount for comparison: {order_total} — {parse_err}")

        # Improvement 3: Prevent duplicate PENDING payments for the same order
        existing_pending = self.repository.get_pending_payments_for_order(order_id)
        if existing_pending:
            existing_id = existing_pending[0].payment_id
            logger.warning(
                f"Duplicate PENDING payment blocked for order {order_id}. "
                f"Existing payment: {existing_id}"
            )
            raise ConflictError(
                f"A PENDING payment already exists for order {order_id}. "
                f"Use payment ID: {existing_id} or process/cancel it first.",
                "DUPLICATE_PENDING_PAYMENT"
            )

        # Extract payment method strictly from the Order (Single Source of Truth)
        payment_method = order_data.get("payment_method")
        if not payment_method:
            raise InternalServerError("Order does not have a payment method configured", ERROR_INTERNAL_SERVER_ERROR)

        now = get_utc_timestamp()
        payment_id = generate_id("PAY")
        
        payment = Payment(
            payment_id=payment_id,
            order_id=order_id,
            user_id=user_id,
            amount=amount,
            payment_method=payment_method,
            payment_status="PENDING",
            created_at=now,
            updated_at=now,
            customer_username=order_data.get("customer_username"),
            customer_email=order_data.get("customer_email")
        )
        
        self.repository.save_payment(payment)
        logger.info(f"Payment created: payment_id={payment_id}, order_id={order_id}, amount={amount}")
        
        return payment.to_dict()

    def process_payment(self, payment_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        payment_validator.validate_payment_id(payment_id)
        payment_validator.validate_process_payment(data)
        
        new_status = data["payment_status"]
        
        payment = self.repository.get_payment(payment_id)
        if not payment:
            raise NotFoundError(f"Payment transaction {payment_id} not found", ERROR_PAYMENT_NOT_FOUND)
            
        if payment.payment_status == "SUCCESS" and new_status == "SUCCESS":
            raise ConflictError("Payment has already been processed successfully", ERROR_DUPLICATE_PAYMENT)
            
        payment_validator.validate_payment_transition(payment.payment_status, new_status)
        
        order_webhook_url = f"{Config.ORDER_SERVICE_URL.replace('/api/orders', '')}/internal/orders/{payment.user_id}/{payment.order_id}/payment"
        webhook_body = {
            "payment_status": new_status,
            "payment_id": payment_id
        }
        
        try:
            logger.info(f"Notifying Order Service: {payment.order_id} -> status={new_status} (URL: {order_webhook_url})")
            secret = os.getenv("INTERNAL_WEBHOOK_SECRET", "default-internal-secret-123")
            HttpClient.request("PATCH", order_webhook_url, json_data=webhook_body, headers={"x-internal-secret": secret}, timeout=20.0)
        except ConflictError as e:
            if getattr(e, "error_code", "") == ERROR_DUPLICATE_PAYMENT:
                logger.warning(f"Order Service responded with DUPLICATE_PAYMENT for {payment.order_id}. "
                               f"This means the order was already successfully updated. Proceeding to mark payment as SUCCESS.")
            else:
                raise InternalServerError(f"Order Service returned ConflictError for URL '{order_webhook_url}': {str(e)}", ERROR_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Failed to update Order Service webhook at {order_webhook_url}: {str(e)}")
            raise InternalServerError(f"Order Service status propagation failed for URL '{order_webhook_url}': {str(e)}", ERROR_INTERNAL_SERVER_ERROR)

        payment.payment_status = new_status
        payment.updated_at = get_utc_timestamp()
        
        self.repository.save_payment(payment)
        logger.info(f"Payment transaction {payment_id} status updated to {new_status}")
        
        return payment.to_dict()

    def refund_payment(self, payment_id: str) -> Dict[str, Any]:
        payment_validator.validate_payment_id(payment_id)
        
        payment = self.repository.get_payment(payment_id)
        if not payment:
            raise NotFoundError(f"Payment transaction {payment_id} not found", ERROR_PAYMENT_NOT_FOUND)
            
        payment_validator.validate_payment_transition(payment.payment_status, "REFUNDED")
        
        order_webhook_url = f"{Config.ORDER_SERVICE_URL.replace('/api/orders', '')}/internal/orders/{payment.user_id}/{payment.order_id}/payment"
        webhook_body = {
            "payment_status": "REFUNDED",
            "payment_id": payment_id
        }
        
        try:
            logger.info(f"Notifying Order Service of Refund: {payment.order_id} (URL: {order_webhook_url})")
            secret = os.getenv("INTERNAL_WEBHOOK_SECRET", "default-internal-secret-123")
            HttpClient.request("PATCH", order_webhook_url, json_data=webhook_body, headers={"x-internal-secret": secret}, timeout=10.0)
        except Exception as e:
            logger.error(f"Failed to update Order Service webhook for refund at {order_webhook_url}: {str(e)}")
            raise InternalServerError(f"Order Service status propagation failed for refund URL '{order_webhook_url}': {str(e)}", ERROR_INTERNAL_SERVER_ERROR)

        payment.payment_status = "REFUNDED"
        payment.updated_at = get_utc_timestamp()
        
        self.repository.save_payment(payment)
        logger.info(f"Payment transaction {payment_id} refunded successfully")
        
        return payment.to_dict()

    def get_payment(self, payment_id: str) -> Dict[str, Any]:
        payment_validator.validate_payment_id(payment_id)
        
        payment = self.repository.get_payment(payment_id)
        if not payment:
            raise NotFoundError(f"Payment transaction {payment_id} not found", ERROR_PAYMENT_NOT_FOUND)
            
        return payment.to_dict()

    def get_order_payments(self, order_id: str) -> List[Dict[str, Any]]:
        payment_validator.validate_order_id(order_id)
        payments = self.repository.get_payments_by_order(order_id)
        return [payment.to_dict() for payment in payments]

    def get_all_payments(self, limit: Optional[int] = None, start_key: Optional[dict] = None) -> Tuple[List[Dict[str, Any]], Optional[dict]]:
        payments, next_key = self.repository.scan_all_payments_paginated(
            limit=limit, start_key=start_key
        )
        # Sort by created_at descending only when not paginating (full scan)
        # When paginating, DynamoDB scan order is preserved as-is
        if limit is None:
            payments.sort(key=lambda p: p.created_at, reverse=True)
        return [payment.to_dict() for payment in payments], next_key
