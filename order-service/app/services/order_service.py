import os
from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple
import time
import json
import boto3
from app.config import Config
from app.models.order import Order, OrderItemSnapshot
from app.repositories.order_repository import OrderRepository
from app.validators import order_validator
from app.utils.date_utils import get_utc_timestamp
from app.utils.id_generator import generate_id
from app.utils.http_client import HttpClient
from app.errors import NotFoundError, ValidationError, ConflictError, InternalServerError
from app.constants import (
    ERROR_ORDER_NOT_FOUND,
    ERROR_ORDER_ALREADY_CANCELLED,
    ERROR_DUPLICATE_PAYMENT,
    ERROR_INVALID_TOTAL,
    ERROR_EMPTY_CART,
    ERROR_INTERNAL_SERVER_ERROR,
    ERROR_INVALID_REQUEST,
)
from app.logger import logger

class OrderService:
    def __init__(self):
        self.repository = OrderRepository()

    def checkout(self, data: Dict[str, Any], authorization_header: Optional[str] = None) -> Dict[str, Any]:
        """
        Processes checkout of the user's cart, creating a pending order.
        """
        # 1. Validate payload inputs
        order_validator.validate_checkout_input(data)
        
        user_id = data["user_id"]
        payment_method = data["payment_method"]
        customer_email = data["customer_email"]
        
        # 2. Fetch user's cart
        cart_url = f"{Config.CART_SERVICE_URL}/{user_id}"
        try:
            logger.info(f"Fetching cart for user {user_id}...")
            response = HttpClient.request("GET", cart_url, headers={"Authorization": authorization_header} if authorization_header else None, timeout=3.0)
            cart_resp = response.json()
            cart_data = cart_resp.get("data", {})
        except NotFoundError:
            raise ValidationError("Cart is empty", ERROR_EMPTY_CART)
        except Exception as e:
            logger.error(f"Failed to retrieve user cart: {str(e)}")
            raise InternalServerError(f"Cart service communication failure: {str(e)}")

        cart_items = cart_data.get("items", [])
        if not cart_items:
            raise ValidationError("Cart is empty", ERROR_EMPTY_CART)

        # 3. Resolve items & fetch latest product details
        order_items = []
        total_amount = Decimal("0.0")

        for item in cart_items:
            product_id = item["product_id"]
            quantity = int(item["quantity"])
            
            # Fetch latest product details
            product_url = f"{Config.PRODUCT_SERVICE_URL}/{product_id}"
            try:
                prod_response = HttpClient.request("GET", product_url, headers={"Authorization": authorization_header} if authorization_header else None, timeout=3.0)
                product_data = prod_response.json().get("data", {})
            except Exception as e:
                logger.error(f"Failed to fetch product details for {product_id}: {str(e)}")
                raise InternalServerError(f"Product service communication failure: {str(e)}")

            price_val = product_data.get("price")
            price = Decimal(str(price_val)) if price_val is not None else Decimal("0.0")
            subtotal = price * quantity
            total_amount += subtotal

            order_items.append(
                OrderItemSnapshot(
                    product_id=product_id,
                    product_name=product_data.get("name", "Unknown Product"),
                    price=price,
                    quantity=quantity,
                    subtotal=subtotal
                )
            )

        # 4. Validate total amount
        if total_amount <= 0:
            raise ValidationError("Total amount must be greater than zero", ERROR_INVALID_TOTAL)

        # 5. Create the Order
        now = get_utc_timestamp()
        order_id = generate_id("ORD")
        
        order = Order(
            order_id=order_id,
            user_id=user_id,
            items=order_items,
            total_amount=total_amount,
            order_status="PENDING",
            payment_status="PENDING",
            payment_method=payment_method,
            customer_email=customer_email,
            created_at=now,
            updated_at=now
        )

        # 6. Save order to DynamoDB
        self.repository.save_order(order)
        logger.info(f"Order created successfully: user_id={user_id}, order_id={order_id}")

        # 7. Clear cart WITHOUT releasing stock (reservation must remain intact for payment).
        #    Improvement 7: retry once on failure before falling back to warning-only.
        #    Checkout must never fail after order creation — cart clear is best-effort.
        clear_cart_url = f"{Config.CART_SERVICE_URL.replace('/api/cart', '')}/internal/cart/{user_id}?releaseInventory=false"
        cart_cleared = False
        for attempt in range(1, 3):  # two attempts total
            try:
                logger.info(f"Clearing cart for user {user_id} without releasing stock (attempt {attempt})...")
                secret = os.getenv("INTERNAL_WEBHOOK_SECRET", "default-internal-secret-123")
                HttpClient.request("DELETE", clear_cart_url, headers={"x-internal-secret": secret}, timeout=3.0)
                cart_cleared = True
                break
            except Exception as e:
                logger.warning(
                    f"Cart clear attempt {attempt} failed for user {user_id}: {str(e)}. "
                    f"{'Retrying in 500ms...' if attempt == 1 else 'Giving up \u2014 cart items may still appear but order is saved.'}"
                )
                if attempt == 1:
                    time.sleep(0.5)

        if not cart_cleared:
            logger.warning(
                f"Cart for user {user_id} could not be cleared after 2 attempts. "
                f"Order {order_id} is valid. Cart will appear stale until next action on it."
            )

        return order.to_dict()

    def get_user_orders(self, user_id: str) -> List[Dict[str, Any]]:
        """Retrieves all orders belonging to a user, sorted descending."""
        order_validator.validate_user_id(user_id)
        orders = self.repository.get_user_orders(user_id)
        return [order.to_dict() for order in orders]

    def get_order(self, user_id: str, order_id: str) -> Dict[str, Any]:
        """Retrieves a single order by ID."""
        order_validator.validate_user_id(user_id)
        order_validator.validate_order_id(order_id)
        
        order = self.repository.get_order(user_id, order_id)
        if not order:
            raise NotFoundError(f"Order with ID {order_id} not found", ERROR_ORDER_NOT_FOUND)
            
        return order.to_dict()

    def cancel_order(self, user_id: str, order_id: str) -> Dict[str, Any]:
        """
        Cancels a PENDING order and releases its stock reservation.

        Bug fixed: Previously allowed cancellation of PROCESSING orders (post-payment-success),
        which would call /release on inventory even though the reservation had already been
        consumed by /deduct. This corrupted inventory by releasing stock that was never reserved.

        Correct rules:
        - PENDING:     reservation exists → call /release → cancel.
        - PROCESSING+: payment already succeeded, stock already deducted → reject cancellation.
        - CANCELLED:   already cancelled → reject as duplicate.
        - COMPLETED/REFUNDED: terminal states → reject cancellation.
        """
        order_validator.validate_user_id(user_id)
        order_validator.validate_order_id(order_id)

        order = self.repository.get_order(user_id, order_id)
        if not order:
            raise NotFoundError(f"Order with ID {order_id} not found", ERROR_ORDER_NOT_FOUND)

        # Prevent duplicate cancellation
        if order.order_status == "CANCELLED":
            raise ConflictError(f"Order {order_id} is already cancelled", ERROR_ORDER_ALREADY_CANCELLED)

        # Only PENDING orders can be cancelled — reservation still exists at this point.
        # PROCESSING means payment succeeded and stock was already deducted (reserved=0),
        # so calling /release would corrupt inventory. Use refund flow for PROCESSING+.
        if order.order_status != "PENDING":
            raise ValidationError(
                f"Order cannot be cancelled in state '{order.order_status}'. "
                f"Only PENDING orders can be cancelled.",
                ERROR_INVALID_REQUEST
            )

        # Release stock reservation in Inventory Service (reservation → available)
        release_url = f"{Config.INVENTORY_SERVICE_URL.replace('/api/inventory', '/internal/inventory')}/release"
        for item in order.items:
            try:
                logger.info(f"Releasing reserved stock for product {item.product_id} (qty={item.quantity})...")
                HttpClient.request(
                    "PATCH",
                    release_url,
                    json_data={"product_id": item.product_id, "quantity": item.quantity},
                    timeout=3.0
                )
            except Exception as e:
                logger.error(f"Failed to release stock for product {item.product_id} during cancellation: {str(e)}")
                raise InternalServerError(f"Failed to release inventory: {str(e)}")

        # Transition status
        order.order_status = "CANCELLED"
        order.payment_status = "FAILED"
        order.updated_at = get_utc_timestamp()
        self.repository.save_order(order)
        logger.info(f"Order cancelled: order_id={order_id}, user_id={user_id}")

        return order.to_dict()

    def update_payment(self, user_id: str, order_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Updates the payment status of an order (triggered by payment webhook).

        Bug fixed (idempotency):
        Previously, if the Payment Service timed out waiting for this webhook response,
        it would retry the webhook. On the second call, the order's payment_status was
        still PENDING (because save_order never completed on the first attempt), so the
        duplicate-payment guard was bypassed, and /deduct was called a second time.
        The second /deduct failed because reserved=0 after the first successful deduction.

        Fix: Before deducting inventory, check danush_processed_events_table using
        payment_id as the idempotency key. If already processed, skip deduction and
        proceed directly to state updates. The event is only recorded AFTER all
        inventory deductions succeed, ensuring at-most-once deduction semantics.

        Operation ordering (safe sequence for SUCCESS):
        1. Check idempotency key (payment_id)
        2. Deduct inventory (all items)
        3. Mark payment_id in danush_processed_events_table
        4. Save order state
        If step 4 crashes, a retry will find the idempotency key, skip deduction,
        and re-apply the order state update — consistent and correct.
        """
        order_validator.validate_user_id(user_id)
        order_validator.validate_order_id(order_id)
        order_validator.validate_payment_update(data)
        
        new_payment_status = data["payment_status"]
        payment_id = data.get("payment_id")

        order = self.repository.get_order(user_id, order_id)
        if not order:
            raise NotFoundError(f"Order with ID {order_id} not found", ERROR_ORDER_NOT_FOUND)

        # Prevent duplicate successful payments
        if order.payment_status == "SUCCESS" and new_payment_status == "SUCCESS":
            raise ConflictError("Payment has already been processed successfully", ERROR_DUPLICATE_PAYMENT)

        # Validate state transition rules
        order_validator.validate_payment_transition(order.payment_status, new_payment_status)

        # Apply webhook changes
        if new_payment_status == "SUCCESS":
            # Store payment identifier on order
            if payment_id:
                order.payment_id = payment_id

            # --- Idempotency check (fixes double-deduction on timeout retry) ---
            # Use payment_id as the idempotency key to ensure inventory is deducted exactly once.
            already_deducted = False
            if payment_id and self.repository.is_event_processed(payment_id):
                logger.warning(
                    f"Payment {payment_id} already processed (idempotency check). "
                    f"Skipping inventory deduction."
                )
                already_deducted = True

            if not already_deducted:
                # Deduct inventory stock (converts reservation → consumption)
                deduct_url = f"{Config.INVENTORY_SERVICE_URL.replace('/api/inventory', '/internal/inventory')}/deduct"
                for item in order.items:
                    try:
                        logger.info(f"Deducting stock for product {item.product_id} (qty={item.quantity})...")
                        HttpClient.request(
                            "PATCH",
                            deduct_url,
                            json_data={"product_id": item.product_id, "quantity": item.quantity},
                            timeout=10.0  # Increased from 3.0 — inventory call can be slow on cold start
                        )
                    except Exception as e:
                        logger.error(f"Failed to deduct stock for product {item.product_id}: {str(e)}")
                        raise InternalServerError(f"Failed to deduct inventory stock: {str(e)}")

                # Record idempotency key AFTER all deductions succeed.
                # This ensures: if deduction fails, no key is written, so the next retry
                # will attempt deduction again (correct). If deduction succeeds but
                # save_order below fails, the next retry finds the key, skips deduction,
                # and re-saves the order state (correct).
                if payment_id:
                    self.repository.mark_event_processed(
                        event_id=payment_id,
                        event_name="inventory_deducted",
                        processed_at=get_utc_timestamp()
                    )

            order.order_status = "PROCESSING"
            order.payment_status = "SUCCESS"

        elif new_payment_status == "FAILED":
            # Release inventory reservation back to available stock
            release_url = f"{Config.INVENTORY_SERVICE_URL.replace('/api/inventory', '/internal/inventory')}/release"
            for item in order.items:
                try:
                    logger.info(f"Releasing stock for product {item.product_id} (qty={item.quantity})...")
                    HttpClient.request(
                        "PATCH",
                        release_url,
                        json_data={"product_id": item.product_id, "quantity": item.quantity},
                        timeout=10.0
                    )
                except Exception as e:
                    logger.error(f"Failed to release stock for product {item.product_id}: {str(e)}")
                    raise InternalServerError(f"Failed to release inventory reservation: {str(e)}")

            order.order_status = "CANCELLED"
            order.payment_status = "FAILED"

        elif new_payment_status == "REFUNDED":
            # Restore inventory stock (increases stock, does NOT touch reserved).
            # reserved=0 at this point because payment was SUCCESS and /deduct already ran.
            if order.payment_status == "SUCCESS":
                restore_url = f"{Config.INVENTORY_SERVICE_URL.replace('/api/inventory', '/internal/inventory')}/restore"
                for item in order.items:
                    try:
                        logger.info(f"Restoring refunded stock for product {item.product_id} (qty={item.quantity})...")
                        HttpClient.request(
                            "PATCH",
                            restore_url,
                            json_data={"product_id": item.product_id, "quantity": item.quantity},
                            timeout=10.0
                        )
                    except Exception as e:
                        logger.error(f"Failed to restore stock for product {item.product_id}: {str(e)}")
                        raise InternalServerError(f"Failed to restore inventory stock: {str(e)}")

            order.order_status = "REFUNDED"
            order.payment_status = "REFUNDED"

        order.updated_at = get_utc_timestamp()
        self.repository.save_order(order)
        logger.info(f"Order payment status updated: order_id={order_id}, payment_status={new_payment_status}")

        if new_payment_status == "SUCCESS":
            if not Config.SNS_TOPIC_ARN:
                logger.error("SNS_TOPIC_ARN is empty or not set in Config! Skipping SNS publishing block.")
            else:
                try:
                    logger.info(f"[RUNTIME AUDIT] Preparing to publish to SNS. Region: {Config.AWS_REGION}, TopicArn: {Config.SNS_TOPIC_ARN}")
                    
                    # IAM ASSUMPTION: The Order Service Lambda execution role MUST have
                    # 'sns:Publish' permissions for the Config.SNS_TOPIC_ARN topic.
                    sns = boto3.client("sns", region_name=Config.AWS_REGION)
                    event_payload = {
                        "event_type": "ORDER_PAYMENT_SUCCESS",
                        "order_id": order.order_id,
                        "payment_id": payment_id or order.payment_id,
                        "user_id": order.user_id,
                        "customer_email": order.customer_email,
                        "total_amount": float(order.total_amount),
                        "payment_method": order.payment_method,
                        "order_status": order.order_status,
                        "timestamp": get_utc_timestamp()
                    }
                    payload_json = json.dumps(event_payload)
                    logger.info(f"[RUNTIME AUDIT] Payload: {payload_json}")
                    
                    response = sns.publish(
                        TopicArn=Config.SNS_TOPIC_ARN,
                        Message=payload_json
                    )
                    
                    logger.info(f"[RUNTIME AUDIT] Publish Response: {response}")
                    logger.info(f"[RUNTIME AUDIT] Published ORDER_PAYMENT_SUCCESS event. MessageId: {response.get('MessageId')}")
                except Exception as e:
                    logger.exception(f"[RUNTIME AUDIT] Exception during SNS publish: {str(e)}")

        return order.to_dict()

    def get_all_orders(self, limit: Optional[int] = None, start_key: Optional[dict] = None) -> Tuple[List[Dict[str, Any]], Optional[dict]]:
        """
        Retrieves orders across all users with optional DynamoDB pagination.
        When limit is None, all records are returned (backward compatible).
        Returns (orders_list, next_page_key_dict_or_None).
        """
        orders, next_key = self.repository.scan_all_orders_paginated(limit=limit, start_key=start_key)
        # Sort in memory descending only on full scan (no limit); paginated results respect DynamoDB scan order
        if limit is None:
            orders.sort(key=lambda o: o.created_at, reverse=True)
        return [order.to_dict() for order in orders], next_key
