import uuid
from datetime import datetime, timezone

def generate_id(prefix: str) -> str:
    """
    Generates a chronologically sortable ID prefix (if prefix is ORD) or standard UUID.
    For prefix ORD: ORD-YYYYMMDDHHMMSSffffff-uuid_hex
    For others: prefix-uuid_hex
    """
    uuid_hex = uuid.uuid4().hex
    if prefix.upper() == "ORD":
        now_str = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f")
        return f"ORD-{now_str}-{uuid_hex[:16]}"
    
    if prefix.endswith("-"):
        return f"{prefix}{uuid_hex}"
    return f"{prefix}-{uuid_hex}"
