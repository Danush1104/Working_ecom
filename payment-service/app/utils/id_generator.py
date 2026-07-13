import uuid
from datetime import datetime, timezone

def generate_id(prefix: str) -> str:
    """
    Generates a chronologically sortable ID prefix (if prefix is PAY) or standard UUID.
    For prefix PAY: PAY-YYYYMMDDHHMMSSffffff-uuid_hex
    For others: prefix-uuid_hex
    """
    uuid_hex = uuid.uuid4().hex
    if prefix.upper() == "PAY":
        now_str = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f")
        return f"PAY-{now_str}-{uuid_hex[:16]}"
    
    if prefix.endswith("-"):
        return f"{prefix}{uuid_hex}"
    return f"{prefix}-{uuid_hex}"
