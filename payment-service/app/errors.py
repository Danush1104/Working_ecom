class AppError(Exception):
    """Base exception class for application errors."""
    def __init__(self, message: str, error_code: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.status_code = status_code


class ValidationError(AppError):
    """Raised when request validation fails."""
    def __init__(self, message: str, error_code: str = "VALIDATION_FAILED"):
        super().__init__(message, error_code, 400)


class NotFoundError(AppError):
    """Raised when a resource is not found."""
    def __init__(self, message: str, error_code: str = "NOT_FOUND"):
        super().__init__(message, error_code, 404)


class ConflictError(AppError):
    """Raised when there is a resource conflict (e.g. duplicate key, already cancelled)."""
    def __init__(self, message: str, error_code: str = "CONFLICT"):
        super().__init__(message, error_code, 409)


class DatabaseError(AppError):
    """Raised when a database operation fails."""
    def __init__(self, message: str, error_code: str = "DATABASE_ERROR"):
        super().__init__(message, error_code, 500)


class InternalServerError(AppError):
    """Raised for unexpected internal server errors."""
    def __init__(self, message: str, error_code: str = "INTERNAL_SERVER_ERROR"):
        super().__init__(message, error_code, 500)
