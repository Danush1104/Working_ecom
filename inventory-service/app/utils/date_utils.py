from datetime import datetime, timezone

def get_utc_timestamp() -> str:
    """Returns current UTC timestamp in ISO 8601 format with Z suffix."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
