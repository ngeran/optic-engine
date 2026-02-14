"""Snapshot-related Pydantic schemas."""
from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime


class SnapshotRequest(BaseModel):
    """Schema for snapshot request."""

    device: Optional[str] = Field(None, description="Device IP override")
    username: Optional[str] = Field(None, description="Username override")
    password: Optional[str] = Field(None, description="Password override")
    test_file: Optional[str] = Field(None, description="Test file to use")


class SnapshotResponse(BaseModel):
    """Schema for snapshot response."""

    status: str = Field(..., description="Operation status: success or error")
    message: str = Field(..., description="Human-readable message")
    data: Optional[str] = Field(None, description="Optional additional data")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class CheckResponse(BaseModel):
    """Schema for check/test execution response."""

    status: str = Field(..., description="Operation status: success or error")
    message: str = Field(..., description="Human-readable message")
    data: Optional[str] = Field(None, description="Test results output")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
