import uuid

def generate_id(prefix: str) -> str:
    """
    Generates a readable ID with a prefix and a 32-character UUID v4 without hyphens.
    Example: CART-797df779493949f5a894bd96c7df332f
    """
    # Remove hyphens from UUID
    uuid_hex = uuid.uuid4().hex
    # Ensure correct format
    if prefix.endswith("-"):
        return f"{prefix}{uuid_hex}"
    return f"{prefix}-{uuid_hex}"
