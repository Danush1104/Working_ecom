import time
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, List, Optional
from botocore.exceptions import ClientError
from app.models.product import Product
from app.repositories.product_repository import ProductRepository
from app.validators import product_validator
from app.utils.date_utils import get_utc_timestamp
from app.utils.id_generator import generate_id
from app.errors import NotFoundError, ConflictError, ValidationError
from app.constants import (
    ERROR_PRODUCT_ALREADY_EXISTS,
    ERROR_PRODUCT_NOT_FOUND
)
from app.logger import logger

class ProductService:
    def __init__(self):
        self.repository = ProductRepository()

    def create_product(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates input, generates timestamps/IDs, and creates a product.
        """
        # If product_id is not provided, generate one
        if "product_id" not in data or not data["product_id"]:
            data["product_id"] = generate_id("PROD")

        # Validate the incoming data
        product_validator.validate_create_product(data)

        product_id = data["product_id"]
        now = get_utc_timestamp()
        
        product = Product(
            product_id=product_id,
            name=data["name"].strip(),
            description=data["description"].strip(),
            category=data["category"].strip(),
            price=Decimal(str(data["price"])),
            is_active=True,
            created_at=now,
            updated_at=now,
            image_url=data.get("image_url"),
            is_featured=bool(data.get("is_featured", False))
        )

        try:
            self.repository.create_product(product)
            logger.info(f"Product created: product_id={product_id}, price={product.price}")
            return product.to_dict()
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise ConflictError(
                    f"Product with ID {product_id} already exists", 
                    ERROR_PRODUCT_ALREADY_EXISTS
                )
            raise

    def get_product(self, product_id: str) -> Dict[str, Any]:
        """Retrieves a product by ID. Raises NotFoundError if inactive or missing."""
        product = self.repository.get_product(product_id)
        if not product or not product.is_active:
            raise NotFoundError(f"Product with ID {product_id} not found", ERROR_PRODUCT_NOT_FOUND)
        return product.to_dict()

    def list_products(self) -> List[Dict[str, Any]]:
        """Lists all active products."""
        products = self.repository.list_products()
        return [p.to_dict() for p in products]

    def update_product(self, product_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Performs a full update (PUT) of product details."""
        product_validator.validate_update_product(data)

        # Confirm existence
        existing = self.repository.get_product(product_id)
        if not existing or not existing.is_active:
            raise NotFoundError(f"Product with ID {product_id} not found", ERROR_PRODUCT_NOT_FOUND)

        now = get_utc_timestamp()
        update_fields = {
            "name": data["name"].strip(),
            "description": data["description"].strip(),
            "category": data["category"].strip(),
            "price": Decimal(str(data["price"])),
            "updated_at": now
        }
        if "image_url" in data:
            update_fields["image_url"] = data["image_url"]
        if "is_featured" in data:
            update_fields["is_featured"] = bool(data["is_featured"])

        try:
            self.repository.update_product(product_id, update_fields)
            logger.info(f"Product updated fully: product_id={product_id}")
            # Retrieve updated item to return
            updated_product = self.repository.get_product(product_id)
            return updated_product.to_dict() if updated_product else {}
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise NotFoundError(f"Product with ID {product_id} not found", ERROR_PRODUCT_NOT_FOUND)
            raise

    def patch_product(self, product_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Performs a partial update (PATCH) of product details."""
        product_validator.validate_patch_product(data)

        # Confirm existence
        existing = self.repository.get_product(product_id)
        if not existing or not existing.is_active:
            raise NotFoundError(f"Product with ID {product_id} not found", ERROR_PRODUCT_NOT_FOUND)

        now = get_utc_timestamp()
        update_fields = {"updated_at": now}

        if "name" in data:
            update_fields["name"] = data["name"].strip()
        if "description" in data:
            update_fields["description"] = data["description"].strip()
        if "category" in data:
            update_fields["category"] = data["category"].strip()
        if "price" in data:
            update_fields["price"] = Decimal(str(data["price"]))
        if "image_url" in data:
            update_fields["image_url"] = data["image_url"]
        if "is_featured" in data:
            update_fields["is_featured"] = bool(data["is_featured"])

        try:
            self.repository.update_product(product_id, update_fields)
            logger.info(f"Product updated partially: product_id={product_id}")
            updated_product = self.repository.get_product(product_id)
            return updated_product.to_dict() if updated_product else {}
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise NotFoundError(f"Product with ID {product_id} not found", ERROR_PRODUCT_NOT_FOUND)
            raise

    def delete_product(self, product_id: str) -> None:
        """Performs soft-delete on product."""
        existing = self.repository.get_product(product_id)
        if not existing or not existing.is_active:
            raise NotFoundError(f"Product with ID {product_id} not found", ERROR_PRODUCT_NOT_FOUND)
            
        now = get_utc_timestamp()
        try:
            self.repository.delete_product(product_id, now)
            logger.info(f"Product soft-deleted: product_id={product_id}")
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise NotFoundError(f"Product with ID {product_id} not found", ERROR_PRODUCT_NOT_FOUND)
            raise

    def search_products(
        self,
        category: Optional[str] = None,
        keyword: Optional[str] = None,
        min_price: Optional[str] = None,
        max_price: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Searches products with optional filters."""
        # Convert prices if specified
        min_p = None
        max_p = None
        
        try:
            if min_price:
                min_p = Decimal(min_price)
                if min_p < 0:
                    raise ValidationError("min_price cannot be negative", "INVALID_PRICE")
            if max_price:
                max_p = Decimal(max_price)
                if max_p < 0:
                    raise ValidationError("max_price cannot be negative", "INVALID_PRICE")
        except InvalidOperation:
            raise ValidationError("Price query parameters must be valid numbers", "INVALID_PRICE")

        products = self.repository.search_products(
            category=category,
            keyword=keyword,
            min_price=min_p,
            max_price=max_p
        )
        return [p.to_dict() for p in products]
