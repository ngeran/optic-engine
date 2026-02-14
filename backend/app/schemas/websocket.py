"""WebSocket message schemas."""
from pydantic import BaseModel, Field
from typing import Optional, Any, Literal, Dict
from datetime import datetime


class WSMessage(BaseModel):
    """Base WebSocket message."""

    type: str = Field(..., description="Message type")
    data: str = Field(..., description="Message data/payload")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class WSConnected(WSMessage):
    """WebSocket connected message."""

    type: Literal["connected"] = "connected"


class WSLog(WSMessage):
    """WebSocket log message."""

    type: Literal["log"] = "log"


class WSStatus(WSMessage):
    """WebSocket status update message."""

    type: Literal["status"] = "status"


class WSComplete(WSMessage):
    """WebSocket operation complete message."""

    type: Literal["complete"] = "complete"


class WSError(WSMessage):
    """WebSocket error message."""

    type: Literal["error"] = "error"


class WSProgress(WSMessage):
    """WebSocket progress update message."""

    type: Literal["progress"] = "progress"
    data: Dict[str, Any]  # Override to allow dict data


# Client -> Server messages
class ClientSnapshotRequest(BaseModel):
    """Client request for snapshot operation."""

    action: Literal["snapshot"]
    task_type: Literal["pre", "post"]
    device: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None


class ClientCheckRequest(BaseModel):
    """Client request for check operation."""

    action: Literal["check"]
    device: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None


class ClientCancelRequest(BaseModel):
    """Client request to cancel operation."""

    action: Literal["cancel"]
    execution_id: Optional[str] = None
