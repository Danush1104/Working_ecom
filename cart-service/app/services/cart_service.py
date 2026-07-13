from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple
from app.config import Config
from app.models.cart import CartItem
from app.repositories.cart_repository import CartRepository
from app.validators import cart_validator
from app.utils.date_utils import get_utc_timestamp
from app.utils.http_client import HttpClient
from app.errors import AppError, NotFoundError, ValidationError, ConflictError, InternalServerError
from app.constants import (
    ERROR_PRODUCT_NOT_FOUND,
    ERROR_CART_ITEM_NOT_FOUND,
    ERROR_OUT_OF_STOCK,
    ERROR_INTERNAL_SERVER_ERROR
)
from app.logger import logger

class CartService:
    def __init__(self):
        self.repository = CartRepository()

    def add_item(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Adds a product to the user's cart.
        Verifies product existence, reserves inventory, and updates/inserts cart item.
        """
        # 1. Validate payload
        cart_validator.validate_cart_item_input(data)
        
        user_id = data["user_id"]
        product_id = data["product_id"]
        quantity = int(data["quantity"])
        
        # 2. Verify product existence via Product Service
        product_url = f"{Config.PRODUCT_SERVICE_URL}/{product_id}"
        try:
            logger.info(f"Verifying product {product_id} existence in Product Service...")
            HttpClient.request("GET", product_url, timeout=3.0)
        except NotFoundError:
            raise NotFoundError(
                f"Product {product_id} does not exist in Product Service",
                ERROR_PRODUCT_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Product verification failed: {str(e)}")
            raise InternalServerError(
                f"Could not verify product existence: {str(e)}",
                ERROR_INTERNAL_SERVER_ERROR
            )

        # 3. Check if product already exists in cart to decide reservation quantity
        existing_item = self.repository.get_cart_item(user_id, product_id)
        
        # 3.5 Verify inventory availability
        inventory_url = f"{Config.INVENTORY_SERVICE_URL}/{product_id}"
        logger.info(f"Checking inventory at URL: {inventory_url}")
        try:
            inv_response = HttpClient.request("GET", inventory_url, timeout=3.0)
            logger.info(f"Inventory Service HTTP Status: {inv_response.status_code}")
            logger.info(f"Inventory Service Raw Response: {inv_response.text}")
            
            inv_data = inv_response.json().get("data", {})
            if isinstance(inv_data, list):
                if not inv_data:
                    raise ConflictError("Out of stock.", ERROR_OUT_OF_STOCK)
                inventory_obj = inv_data[0]
            else:
                inventory_obj = inv_data
                
            available = int(inventory_obj.get("available", 0))
            logger.info(f"Parsed available stock: {available}, Requested quantity: {quantity}")
            
            if quantity > available:
                logger.warning(f"Requested quantity {quantity} exceeds available stock {available} for product {product_id}")
                raise ConflictError("Out of stock.", ERROR_OUT_OF_STOCK)
        except AppError as e:
            if isinstance(e, NotFoundError):
                raise ConflictError("Out of stock.", ERROR_OUT_OF_STOCK)
            raise
        except Exception as e:
            logger.error(f"Inventory validation failed for product {product_id}: {str(e)}")
            raise InternalServerError(
                f"Could not verify inventory: {str(e)}",
                ERROR_INTERNAL_SERVER_ERROR
            )
        
        # 4. Reserve stock via Inventory Service
        reserve_url = f"{Config.INVENTORY_SERVICE_URL}/reserve"
        try:
            logger.info(f"Reserving {quantity} stock for product {product_id}...")
            HttpClient.request(
                "PATCH", 
                reserve_url, 
                json_data={"product_id": product_id, "quantity": quantity},
                timeout=3.0
            )
        except Exception as e:
            logger.warning(f"Stock reservation failed for product {product_id}: {str(e)}")
            raise ConflictError(
                "Out of stock.",
                ERROR_OUT_OF_STOCK
            )

        # 5. Save or update item in DynamoDB
        now = get_utc_timestamp()
        if existing_item:
            new_quantity = existing_item.quantity + quantity
            existing_item.quantity = new_quantity
            existing_item.updated_at = now
            self.repository.save_cart_item(existing_item)
            logger.info(f"Updated cart item quantity: user_id={user_id}, product_id={product_id}, new_quantity={new_quantity}")
            return existing_item.to_dict()
        else:
            new_item = CartItem(
                user_id=user_id,
                product_id=product_id,
                quantity=quantity,
                created_at=now,
                updated_at=now
            )
            self.repository.save_cart_item(new_item)
            logger.info(f"Created new cart item: user_id={user_id}, product_id={product_id}, quantity={quantity}")
            return new_item.to_dict()

    def get_cart(self, user_id: str) -> Dict[str, Any]:
        """
        Retrieves all items in the user's cart and enriches them with Product Service data.
        Calculates subtotal and grand_total.
        """
        cart_validator.validate_user_id(user_id)
        
        # 1. Read all cart items from DynamoDB
        cart_items = self.repository.get_cart_items(user_id)
        
        # 2. Enrich items with latest Product Service details
        enriched_items = []
        grand_total = Decimal("0.0")
        
        for item in cart_items:
            product_url = f"{Config.PRODUCT_SERVICE_URL}/{item.product_id}"
            try:
                logger.info(f"Fetching latest product details for {item.product_id}...")
                response = HttpClient.request("GET", product_url, timeout=3.0)
                product_data = response.json().get("data", {})
                
                # Fetch price safely
                price_val = product_data.get("price")
                price = Decimal(str(price_val)) if price_val is not None else Decimal("0.0")
                subtotal = price * item.quantity
                grand_total += subtotal
                
                enriched_items.append({
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "name": product_data.get("name", ""),
                    "price": price,
                    "category": product_data.get("category", ""),
                    "description": product_data.get("description", ""),
                    "subtotal": subtotal,
                    "created_at": item.created_at,
                    "updated_at": item.updated_at
                })
            except NotFoundError:
                # If product no longer exists in Product Service, log and skip (graceful recovery)
                logger.warning(f"Product {item.product_id} in user {user_id}'s cart is missing from Product Service. Skipping.")
                continue
            except Exception as e:
                logger.error(f"Failed to fetch product details for {item.product_id}: {str(e)}")
                raise InternalServerError(
                    f"Failed to retrieve latest product details: {str(e)}",
                    ERROR_INTERNAL_SERVER_ERROR
                )

        return {
            "user_id": user_id,
            "items": enriched_items,
            "grand_total": grand_total
        }

    def update_quantity(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Updates the quantity of a product in the cart.
        Only reserves/releases the difference.
        """
        cart_validator.validate_cart_item_input(data)
        
        user_id = data["user_id"]
        product_id = data["product_id"]
        new_quantity = int(data["quantity"])
        
        # 1. Fetch current cart item
        existing_item = self.repository.get_cart_item(user_id, product_id)
        if not existing_item:
            raise NotFoundError(
                f"Product {product_id} is not in user {user_id}'s cart",
                ERROR_CART_ITEM_NOT_FOUND
            )
            
        old_quantity = existing_item.quantity
        
        # 2. Check the difference
        if new_quantity > old_quantity:
            diff = new_quantity - old_quantity
            
            # Verify product exists in Product Service before reserving more
            product_url = f"{Config.PRODUCT_SERVICE_URL}/{product_id}"
            try:
                HttpClient.request("GET", product_url, timeout=3.0)
            except NotFoundError:
                raise NotFoundError(
                    f"Product {product_id} does not exist in Product Service",
                    ERROR_PRODUCT_NOT_FOUND
                )
            except Exception as e:
                raise InternalServerError(f"Product verification failed: {str(e)}", ERROR_INTERNAL_SERVER_ERROR)

            # Verify inventory availability for additional quantity
            inventory_url = f"{Config.INVENTORY_SERVICE_URL}/{product_id}"
            logger.info(f"Checking inventory at URL: {inventory_url}")
            try:
                inv_response = HttpClient.request("GET", inventory_url, timeout=3.0)
                logger.info(f"Inventory Service HTTP Status: {inv_response.status_code}")
                logger.info(f"Inventory Service Raw Response: {inv_response.text}")
                
                inv_data = inv_response.json().get("data", {})
                if isinstance(inv_data, list):
                    if not inv_data:
                        raise ConflictError("Out of stock.", ERROR_OUT_OF_STOCK)
                    inventory_obj = inv_data[0]
                else:
                    inventory_obj = inv_data
                    
                available = int(inventory_obj.get("available", 0))
                logger.info(f"Parsed available stock: {available}, Requested additional quantity: {diff}")
                
                if diff > available:
                    logger.warning(f"Requested additional quantity {diff} exceeds available stock {available} for product {product_id}")
                    raise ConflictError("Out of stock.", ERROR_OUT_OF_STOCK)
            except AppError as e:
                if isinstance(e, NotFoundError):
                    raise ConflictError("Out of stock.", ERROR_OUT_OF_STOCK)
                raise
            except Exception as e:
                logger.error(f"Inventory validation failed for product {product_id}: {str(e)}")
                raise InternalServerError(
                    f"Could not verify inventory: {str(e)}",
                    ERROR_INTERNAL_SERVER_ERROR
                )

            # Reserve additional quantity
            reserve_url = f"{Config.INVENTORY_SERVICE_URL}/reserve"
            try:
                logger.info(f"Reserving additional {diff} stock for product {product_id}...")
                HttpClient.request(
                    "PATCH", 
                    reserve_url, 
                    json_data={"product_id": product_id, "quantity": diff},
                    timeout=3.0
                )
            except Exception as e:
                logger.warning(f"Failed to reserve additional stock for {product_id}: {str(e)}")
                raise ConflictError(
                    "Out of stock.",
                    ERROR_OUT_OF_STOCK
                )
                
        elif new_quantity < old_quantity:
            diff = old_quantity - new_quantity
            
            # Release difference in quantity
            release_url = f"{Config.INVENTORY_SERVICE_URL}/release"
            try:
                logger.info(f"Releasing {diff} stock for product {product_id}...")
                HttpClient.request(
                    "PATCH", 
                    release_url, 
                    json_data={"product_id": product_id, "quantity": diff},
                    timeout=3.0
                )
            except Exception as e:
                logger.error(f"Failed to release inventory during quantity reduction: {str(e)}")
                # We can choose to log and proceed, but raising ensures consistency
                raise InternalServerError(
                    f"Failed to release inventory: {str(e)}",
                    ERROR_INTERNAL_SERVER_ERROR
                )

        # 3. Save new quantity
        existing_item.quantity = new_quantity
        existing_item.updated_at = get_utc_timestamp()
        self.repository.save_cart_item(existing_item)
        logger.info(f"Updated quantity to {new_quantity} for user={user_id}, product={product_id}")
        
        return existing_item.to_dict()

    def remove_item(self, user_id: str, product_id: str) -> None:
        """
        Removes a single product from the user's cart and releases its reserved inventory.
        """
        cart_validator.validate_user_id(user_id)
        cart_validator.validate_product_id(product_id)
        
        # 1. Fetch item to find quantity
        existing_item = self.repository.get_cart_item(user_id, product_id)
        if not existing_item:
            raise NotFoundError(
                f"Product {product_id} is not in user {user_id}'s cart",
                ERROR_CART_ITEM_NOT_FOUND
            )
            
        # 2. Release inventory
        release_url = f"{Config.INVENTORY_SERVICE_URL}/release"
        try:
            logger.info(f"Releasing {existing_item.quantity} stock for product {product_id}...")
            HttpClient.request(
                "PATCH", 
                release_url, 
                json_data={"product_id": product_id, "quantity": existing_item.quantity},
                timeout=3.0
            )
        except (NotFoundError, ValidationError) as e:
            logger.warning(
                f"Inventory release returned warning: {str(e)}. Proceeding to delete cart item to prevent stuck state."
            )
        except Exception as e:
            logger.error(f"Failed to release inventory: {str(e)}")
            raise InternalServerError(
                f"Failed to release inventory: {str(e)}",
                ERROR_INTERNAL_SERVER_ERROR
            )

        # 3. Delete from DB
        self.repository.delete_cart_item(user_id, product_id)
        logger.info(f"Removed item from cart: user_id={user_id}, product_id={product_id}")

    def clear_cart(self, user_id: str) -> None:
        """
        Clears the user's entire cart, releasing all reserved inventory.
        """
        cart_validator.validate_user_id(user_id)
        
        # 1. Read all cart items
        cart_items = self.repository.get_cart_items(user_id)
        
        # 2. Loop through every cart item, release reservation, delete item
        for item in cart_items:
            # Release inventory
            release_url = f"{Config.INVENTORY_SERVICE_URL}/release"
            try:
                logger.info(f"Releasing {item.quantity} stock for product {item.product_id}...")
                HttpClient.request(
                    "PATCH", 
                    release_url, 
                    json_data={"product_id": item.product_id, "quantity": item.quantity},
                    timeout=3.0
                )
            except Exception as e:
                logger.error(f"Failed to release inventory for product {item.product_id} while clearing cart: {str(e)}")
                # Continue clearing other items
            
            # Delete item
            self.repository.delete_cart_item(user_id, item.product_id)
            
        logger.info(f"Cleared cart for user: {user_id}")

    def internal_clear_cart(self, user_id: str, release_inventory: bool) -> None:
        """
        Internal clear cart endpoint.
        If release_inventory is True, releases reserved inventory.
        If release_inventory is False, only deletes cart items.
        """
        cart_validator.validate_user_id(user_id)
        
        # 1. Read all cart items
        cart_items = self.repository.get_cart_items(user_id)
        
        # 2. Loop through and delete
        for item in cart_items:
            if release_inventory:
                release_url = f"{Config.INVENTORY_SERVICE_URL}/release"
                try:
                    logger.info(f"Internal release {item.quantity} stock for product {item.product_id}...")
                    HttpClient.request(
                        "PATCH", 
                        release_url, 
                        json_data={"product_id": item.product_id, "quantity": item.quantity},
                        timeout=3.0
                    )
                except Exception as e:
                    logger.error(f"Failed to release inventory for product {item.product_id} during internal clear: {str(e)}")
            
            # Delete item
            self.repository.delete_cart_item(user_id, item.product_id)
            
        logger.info(f"Internally cleared cart for user: {user_id} (releaseInventory={release_inventory})")

    def get_all_carts(self, limit: Optional[int] = None, start_key: Optional[dict] = None) -> Tuple[List[Dict[str, Any]], Optional[dict]]:
        """
        Retrieves all carts across all users with optional DynamoDB pagination.
        Returns (list_of_user_cart_dicts, next_page_key_dict_or_None).
        """
        # 1. Scan cart items with optional pagination
        all_items, next_key = self.repository.scan_all_items_paginated(limit=limit, start_key=start_key)
        
        # Group items by user_id
        user_carts = {}
        for item in all_items:
            user_carts.setdefault(item.user_id, []).append(item)
            
        # Get unique product IDs
        unique_product_ids = {item.product_id for item in all_items}
        
        # 2. Bulk fetch product details (cache locally for this request)
        product_cache = {}
        for prod_id in unique_product_ids:
            product_url = f"{Config.PRODUCT_SERVICE_URL}/{prod_id}"
            try:
                response = HttpClient.request("GET", product_url, timeout=3.0)
                product_cache[prod_id] = response.json().get("data", {})
            except Exception as e:
                logger.warning(f"Failed to fetch details for product {prod_id}: {str(e)}")
                product_cache[prod_id] = {}

        # 3. Assemble response grouped by user
        result = []
        for user_id, items in user_carts.items():
            enriched_items = []
            grand_total = Decimal("0.0")
            for item in items:
                prod_data = product_cache.get(item.product_id, {})
                price_val = prod_data.get("price")
                price = Decimal(str(price_val)) if price_val is not None else Decimal("0.0")
                subtotal = price * item.quantity
                grand_total += subtotal
                
                enriched_items.append({
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "name": prod_data.get("name", "Unknown Product"),
                    "price": price,
                    "category": prod_data.get("category", ""),
                    "description": prod_data.get("description", ""),
                    "subtotal": subtotal,
                    "created_at": item.created_at,
                    "updated_at": item.updated_at
                })
            result.append({
                "user_id": user_id,
                "items": enriched_items,
                "grand_total": grand_total
            })
            
        return result, next_key
