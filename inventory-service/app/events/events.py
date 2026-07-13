import json
from typing import Any, Dict
from app.utils.id_generator import generate_id
from app.utils.date_utils import get_utc_timestamp

def create_event(event_name: str, source_service: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """Helper to wrap a payload inside a standard event structure."""
    return {
        "event_id": generate_id("EVT"),
        "event_name": event_name,
        "timestamp": get_utc_timestamp(),
        "source_service": source_service,
        "version": "1.0",
        "payload": payload
    }
