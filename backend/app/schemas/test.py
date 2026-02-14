"""Test-related Pydantic schemas."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TestRequest(BaseModel):
    """Schema for test execution request."""

    device: Optional[str] = Field(None, description="Device IP override")
    username: Optional[str] = Field(None, description="Username override")
    password: Optional[str] = Field(None, description="Password override")
    test_file: Optional[str] = Field(None, description="Test file to run")


class TestResponse(BaseModel):
    """Schema for test execution response."""

    status: str = Field(..., description="Operation status: success or error")
    message: str = Field(..., description="Human-readable message")
    data: Optional[str] = Field(None, description="Test results output")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TestResult:
    """Internal test result representation."""

    def __init__(self, total: int = 0, passed: int = 0, failed: int = 0):
        self.total = total
        self.passed = passed
        self.failed = failed

    @property
    def success_rate(self) -> float:
        """Calculate success rate as percentage."""
        if self.total == 0:
            return 0.0
        return (self.passed / self.total) * 100
