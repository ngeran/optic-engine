"""Custom exceptions for Optic Engine."""


class OpticEngineException(Exception):
    """Base exception for Optic Engine errors."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class DeviceConnectionError(OpticEngineException):
    """Raised when connection to device fails."""

    def __init__(self, message: str):
        super().__init__(message, status_code=503)


class JSNAPyExecutionError(OpticEngineException):
    """Raised when JSNAPy command fails."""

    def __init__(self, message: str, return_code: int = None):
        full_message = f"JSNAPy execution failed"
        if return_code:
            full_message += f" (exit code: {return_code})"
        full_message += f": {message}"
        super().__init__(full_message, status_code=500)


class ConfigurationError(OpticEngineException):
    """Raised when configuration is invalid."""

    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class FileNotFoundError(OpticEngineException):
    """Raised when a required file is not found."""

    def __init__(self, file_path: str):
        super().__init__(f"File not found: {file_path}", status_code=404)
