"""Device-related Pydantic schemas."""
from pydantic import BaseModel, Field, IPvAnyAddress
from typing import Optional, List, Dict


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


class Device(BaseModel):
    """Schema for a device in inventory."""

    ip: str
    username: str
    password: str


class DeviceGroup(BaseModel):
    """Schema for a device group (e.g., MX, EX, QFX)."""

    name: str
    devices: List[Device]


class InventoryFileCreate(BaseModel):
    """Schema for creating an inventory file."""

    filename: str = Field(..., min_length=1, description="Inventory filename")
    content: str = Field(..., description="YAML content")


class InventoryFile(BaseModel):
    """Schema for inventory file response."""

    name: str
    path: str
    size: int
    created_at: str
    modified_at: str


class InventoryContent(BaseModel):
    """Schema for inventory content response."""

    filename: str
    groups: Dict[str, List[Dict]]
