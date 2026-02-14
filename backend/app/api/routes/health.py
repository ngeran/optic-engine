"""Health check endpoints."""
from fastapi import APIRouter
from datetime import datetime
from pydantic import BaseModel

from ....core.config import settings

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str
    timestamp: datetime


class InfoResponse(BaseModel):
    """API info response schema."""

    name: str
    version: str
    status: str


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.

    Returns:
        HealthResponse with status and timestamp
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow()
    )


@router.get("/", response_model=InfoResponse)
async def api_info() -> InfoResponse:
    """
    Root endpoint with API information.

    Returns:
        InfoResponse with API name, version, and status
    """
    return InfoResponse(
        name=settings.api_title,
        version=settings.api_version,
        status="running"
    )
