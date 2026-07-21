from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from botocore.exceptions import ClientError
from app.models.inventory import Inventory
from app.repositories.inventory_repository import InventoryRepository
from app.validators import inventory_validator
from app.utils.date_utils import get_utc_timestamp
from app.utils.http_client import HttpClient
from app.config import Config
from app.errors import NotFoundError, ValidationError, ConflictError, InternalServerError
from app.constants import (
    ERROR_PRODUCT_NOT_FOUND,
    ERROR_INVENTORY_NOT_FOUND,
    ERROR_INSUFFICIENT_STOCK,
    ERROR_INVALID_STOCK,
    ERROR_RELEASE_FAILED,
    ERROR_DEDUCTION_FAILED,
    ERROR_RESTORE_FAILED,
    ERROR_PRODUCT_SERVICE_ERROR
)
from app.logger import logger

class InventoryService:
    def __init__(self):
        self.repository = InventoryRepository()

    def create_inventory(self, data: Dict[str, Any], authorization_header: Optional[str] = None) -> Dict[str, Any]:
        """
        Validates input, checks product existence in Product Service, 
        and initializes inventory record in DynamoDB.
        """
        inventory_validator.validate_create_inventory(data)
        
        product_id = data["product_id"]
        stock = int(data["stock"])

        # REST call to verify product exists in Product Service
        product_url = f"{Config.PRODUCT_SERVICE_URL}/{product_id}"
        try:
            logger.info(f"Verifying product {product_id} existence in Product Service...")
            req_headers = {"Authorization": authorization_header} if authorization_header else None
            HttpClient.request("GET", product_url, headers=req_headers, timeout=3.0)
        except NotFoundError:
            raise NotFoundError(
                f"Product {product_id} does not exist in Product Service",
                ERROR_PRODUCT_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Product verification failed: {str(e)}")
            raise InternalServerError(
                f"Could not verify product existence: {str(e)}",
                ERROR_PRODUCT_SERVICE_ERROR
            )

        now = get_utc_timestamp()
        inventory = Inventory(
            product_id=product_id,
            stock=stock,
            reserved=0,
            updated_at=now
        )

        try:
            self.repository.create_inventory(inventory)
            logger.info(f"Inventory initialized: product_id={product_id}, stock={stock}")
            return inventory.to_dict()
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise ConflictError(
                    f"Inventory for product {product_id} already initialized",
                    "INVENTORY_ALREADY_EXISTS"
                )
            raise

    def get_inventory(self, product_id: str) -> Dict[str, Any]:
        """Retrieves inventory details for a product."""
        inventory = self.repository.get_inventory(product_id)
        if not inventory:
            raise NotFoundError(
                f"Inventory record for product {product_id} not found",
                ERROR_INVENTORY_NOT_FOUND
            )
        return inventory.to_dict()

    def list_inventory(self, limit: Optional[int] = None, start_key: Optional[dict] = None) -> Tuple[List[Dict[str, Any]], Optional[dict]]:
        """Lists all inventory records with optional DynamoDB pagination."""
        records, next_key = self.repository.list_inventory_paginated(limit=limit, start_key=start_key)
        return [r.to_dict() for r in records], next_key

    def update_stock(self, product_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Admin stock level adjustment."""
        inventory_validator.validate_update_stock(data)
        stock = int(data["stock"])
        now = get_utc_timestamp()

        try:
            self.repository.update_stock(product_id, stock, now)
            logger.info(f"Stock updated: product_id={product_id}, new_stock={stock}")
            
            # Fetch and return updated details
            updated = self.repository.get_inventory(product_id)
            return updated.to_dict() if updated else {}
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                # Check if it was because record doesn't exist, or reserved stock exceeds new level
                if not self.repository.inventory_exists(product_id):
                    raise NotFoundError(
                        f"Inventory record for product {product_id} not found",
                        ERROR_INVENTORY_NOT_FOUND
                    )
                raise ValidationError(
                    "New stock level cannot be less than currently reserved stock",
                    ERROR_INVALID_STOCK
                )
            raise

    def reserve_stock(self, product_id: str, quantity: int, event_id: Optional[str] = None) -> Dict[str, Any]:
        """Atomically reserves stock for a product."""
        if event_id and self.repository.is_event_processed(event_id):
            logger.info(f"Event {event_id} already processed. Skipping reserve_stock for product {product_id}.")
            updated = self.repository.get_inventory(product_id)
            return updated.to_dict() if updated else {}

        now = get_utc_timestamp()
        try:
            self.repository.reserve_stock(product_id, quantity, now)
            if event_id:
                try:
                    self.repository.mark_event_processed(event_id, f"RESERVE_{product_id}", now)
                except Exception as e:
                    logger.warning(f"Failed to record idempotency for event {event_id}: {str(e)}")
            logger.info(f"Reserved stock: product_id={product_id}, quantity={quantity}")
            
            updated = self.repository.get_inventory(product_id)
            return updated.to_dict() if updated else {}
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                if not self.repository.inventory_exists(product_id):
                    raise NotFoundError(
                        f"Inventory record for product {product_id} not found",
                        ERROR_INVENTORY_NOT_FOUND
                    )
                raise ValidationError(
                    "Insufficient stock available to satisfy reservation",
                    ERROR_INSUFFICIENT_STOCK
                )
            raise

    def release_stock(self, product_id: str, quantity: int, event_id: Optional[str] = None) -> Dict[str, Any]:
        """Atomically releases reserved stock. Self-heals if release quantity exceeds reserved stock."""
        if event_id and self.repository.is_event_processed(event_id):
            logger.info(f"Event {event_id} already processed. Skipping release_stock for product {product_id}.")
            updated = self.repository.get_inventory(product_id)
            return updated.to_dict() if updated else {}

        now = get_utc_timestamp()
        try:
            self.repository.release_stock(product_id, quantity, now)
            if event_id:
                try:
                    self.repository.mark_event_processed(event_id, f"RELEASE_{product_id}", now)
                except Exception as e:
                    logger.warning(f"Failed to record idempotency for event {event_id}: {str(e)}")
            logger.info(f"Released stock: product_id={product_id}, quantity={quantity}")
            
            updated = self.repository.get_inventory(product_id)
            return updated.to_dict() if updated else {}
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                inventory = self.repository.get_inventory(product_id)
                if not inventory:
                    raise NotFoundError(
                        f"Inventory record for product {product_id} not found",
                        ERROR_INVENTORY_NOT_FOUND
                    )
                
                # Self-healing: if quantity to release is greater than reserved,
                # release whatever is currently reserved.
                if inventory.reserved > 0:
                    logger.warning(
                        f"Attempted to release {quantity} stock, but only {inventory.reserved} was reserved. "
                        f"Releasing all reserved stock ({inventory.reserved}) for product {product_id}."
                    )
                    try:
                        self.repository.release_stock(product_id, inventory.reserved, now)
                        updated = self.repository.get_inventory(product_id)
                        return updated.to_dict() if updated else {}
                    except ClientError:
                        # Fall through if concurrency conflict occurs
                        pass
                else:
                    # If reserved is already 0, we are already in the desired state.
                    # Just return success with current state.
                    logger.info(f"Attempted to release {quantity} stock for product {product_id}, but reserved stock is already 0.")
                    return inventory.to_dict()

                raise ValidationError(
                    "Cannot release more stock than currently reserved level",
                    ERROR_RELEASE_FAILED
                )
            raise

    def deduct_stock(self, product_id: str, quantity: int, event_id: Optional[str] = None) -> Dict[str, Any]:
        """Atomically deducts stock from inventory (reduces both stock & reserved)."""
        if event_id and self.repository.is_event_processed(event_id):
            logger.info(f"Event {event_id} already processed. Skipping deduct_stock for product {product_id}.")
            updated = self.repository.get_inventory(product_id)
            return updated.to_dict() if updated else {}

        now = get_utc_timestamp()
        try:
            self.repository.deduct_stock(product_id, quantity, now)
            if event_id:
                try:
                    self.repository.mark_event_processed(event_id, f"DEDUCT_{product_id}", now)
                except Exception as e:
                    logger.warning(f"Failed to record idempotency for event {event_id}: {str(e)}")
            logger.info(f"Deducted stock: product_id={product_id}, quantity={quantity}")
            
            updated = self.repository.get_inventory(product_id)
            return updated.to_dict() if updated else {}
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                if not self.repository.inventory_exists(product_id):
                    raise NotFoundError(
                        f"Inventory record for product {product_id} not found",
                        ERROR_INVENTORY_NOT_FOUND
                    )
                raise ValidationError(
                    "Cannot deduct stock: stock level or reservation level too low",
                    ERROR_DEDUCTION_FAILED
                )
            raise

    def restore_stock(self, product_id: str, quantity: int, event_id: Optional[str] = None) -> Dict[str, Any]:
        """Atomically restores stock level (increases stock)."""
        if event_id and self.repository.is_event_processed(event_id):
            logger.info(f"Event {event_id} already processed. Skipping restore_stock for product {product_id}.")
            updated = self.repository.get_inventory(product_id)
            return updated.to_dict() if updated else {}

        now = get_utc_timestamp()
        try:
            self.repository.restore_stock(product_id, quantity, now)
            if event_id:
                try:
                    self.repository.mark_event_processed(event_id, f"RESTORE_{product_id}", now)
                except Exception as e:
                    logger.warning(f"Failed to record idempotency for event {event_id}: {str(e)}")
            logger.info(f"Restored stock: product_id={product_id}, quantity={quantity}")
            
            updated = self.repository.get_inventory(product_id)
            return updated.to_dict() if updated else {}
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise NotFoundError(
                    f"Inventory record for product {product_id} not found",
                    ERROR_INVENTORY_NOT_FOUND
                )
            raise
