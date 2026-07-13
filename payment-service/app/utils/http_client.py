import time
import random
import requests
from typing import Any, Dict, Optional
from app.logger import logger, get_log_context
from app.errors import ValidationError, NotFoundError, ConflictError, InternalServerError, AppError

class HttpClient:
    @staticmethod
    def request(
        method: str,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        json_data: Optional[Any] = None,
        params: Optional[Dict[str, Any]] = None,
        timeout: float = 5.0,
        max_retries: int = 3,
        backoff_factor: float = 0.5
    ) -> requests.Response:
        if headers is None:
            headers = {}
        
        # Propagate Correlation ID to downstream services
        ctx = get_log_context()
        correlation_id = ctx.get("correlation_id")
        if correlation_id:
            if not any(k.lower() == "x-correlation-id" for k in headers):
                headers["X-Correlation-ID"] = correlation_id

        if json_data is not None and "Content-Type" not in headers:
            headers["Content-Type"] = "application/json"

        last_exception = None
        
        for attempt in range(1, max_retries + 2):
            start_time = time.perf_counter()
            try:
                logger.info(
                    f"Outbound HTTP Request started: {method} {url} (Attempt {attempt}/{max_retries + 1})"
                )
                
                # Outbound request
                response = requests.request(
                    method=method,
                    url=url,
                    headers=headers,
                    json=json_data,
                    params=params,
                    timeout=timeout
                )
                
                duration_ms = (time.perf_counter() - start_time) * 1000
                logger.info(
                    f"Outbound HTTP Request finished: {method} {url} - Status: {response.status_code}",
                    extra={"extra_fields": {"duration_ms": duration_ms, "http_status": response.status_code}}
                )

                if 500 <= response.status_code < 600:
                    logger.warning(
                        f"Outbound HTTP Request received server error {response.status_code} from {url}."
                    )
                else:
                    HttpClient._handle_http_errors(response)
                    return response

            except requests.RequestException as e:
                duration_ms = (time.perf_counter() - start_time) * 1000
                logger.error(
                    f"Outbound HTTP Request failed with RequestException: {str(e)}",
                    extra={"extra_fields": {"duration_ms": duration_ms, "error": str(e)}}
                )
                last_exception = e
                
            if attempt <= max_retries:
                sleep_time = (backoff_factor * (2 ** (attempt - 1))) + random.uniform(0, 0.1)
                logger.info(f"Retrying in {sleep_time:.2f} seconds...")
                time.sleep(sleep_time)

        if last_exception:
            raise InternalServerError(f"Outbound HTTP client request failed: {str(last_exception)}")
        else:
            raise InternalServerError("Outbound HTTP client request failed with server error after retries.")

    @staticmethod
    def _handle_http_errors(response: requests.Response) -> None:
        if response.status_code < 400:
            return

        try:
            body = response.json()
            message = body.get("message", response.text)
            error_code = body.get("error_code", "HTTP_ERROR")
        except Exception:
            message = response.text
            error_code = "HTTP_ERROR"

        if response.status_code == 400:
            raise ValidationError(message, error_code)
        elif response.status_code == 404:
            raise NotFoundError(message, error_code)
        elif response.status_code == 409:
            raise ConflictError(message, error_code)
        else:
            raise AppError(message, error_code, response.status_code)
