class AppError(Exception):
    def __init__(self, message: str, error_code: str):
        super().__init__(message)
        self.message = message
        self.error_code = error_code

class InternalServerError(AppError):
    def __init__(self, message: str, error_code: str = "INTERNAL_SERVER_ERROR"):
        super().__init__(message, error_code)
