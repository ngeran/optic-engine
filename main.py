"""Main entry point for uvicorn."""
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

from backend.app.main import app

__all__ = ["app"]
