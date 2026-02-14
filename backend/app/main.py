"""Main FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .core.config import settings
from .core.logging import setup_logging
from .api.routes import health, snapshots, tests, testfiles, websocket, devices

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info(f"Starting {settings.api_title} v{settings.api_version}")
    logger.info(f"JSNAPy config path: {settings.jsnapy_config_path}")
    logger.info(f"Config directory: {settings.config_dir}")
    logger.info(f"Snapshots directory: {settings.snapshots_dir}")
    logger.info(f"Test files directory: {settings.testfiles_dir}")

    yield

    # Shutdown
    logger.info("Shutting down application")


# Create FastAPI application
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router)
app.include_router(snapshots.router)
app.include_router(tests.router)
app.include_router(testfiles.router)
app.include_router(websocket.router)
app.include_router(devices.router)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.api_title,
        "version": settings.api_version,
        "status": "running",
        "docs": "/docs",
        "websocket": "/ws/snapshot"
    }
