"""Device-related Pydantic schemas."""
from pydantic import BaseModel, Field, IPvAnyAddress
from typing import Optional


class DeviceCreate(BaseModel):
    """Schema for creating a device."""

    device: IPvAnyAddress = Field(..., description="Device IP address")
    username: str = Field(..., min_length=1, description="SSH username")
    password: str = Field(..., min_length=1, description="SSH password")


class DeviceResponse(BaseModel):
    """Schema for device response."""

    device: str
    username: str
    # Password never returned in responses


class DeviceOverride(BaseModel):
    """Schema for optional device override in requests."""

    device: Optional[IPvAnyAddress] = None
    username: Optional[str] = None
    password: Optional[str] = None
