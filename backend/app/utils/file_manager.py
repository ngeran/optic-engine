"""File manager utility for file operations."""
import os
import yaml
from pathlib import Path
from typing import Any
import logging

logger = logging.getLogger(__name__)


def read_yaml(file_path: str) -> dict[str, Any]:
    """Read YAML file and return as dict."""
    try:
        with open(file_path, 'r') as f:
            return yaml.safe_load(f) or {}
    except FileNotFoundError:
        logger.error(f"File not found: {file_path}")
        return {}
    except yaml.YAMLError as e:
        logger.error(f"Error parsing YAML {file_path}: {e}")
        return {}


def write_yaml(file_path: str, data: dict[str, Any]) -> bool:
    """Write dict to YAML file."""
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w') as f:
            yaml.dump(data, f, default_flow_style=False)
        logger.info(f"Wrote YAML file: {file_path}")
        return True
    except Exception as e:
        logger.error(f"Error writing YAML {file_path}: {e}")
        return False


def list_files(directory: str, pattern: str = "*") -> list[str]:
    """List files in directory matching pattern."""
    try:
        path = Path(directory)
        return [str(f) for f in path.glob(pattern) if f.is_file()]
    except Exception as e:
        logger.error(f"Error listing files in {directory}: {e}")
        return []


def ensure_directory(directory: str) -> bool:
    """Ensure directory exists, create if not."""
    try:
        Path(directory).mkdir(parents=True, exist_ok=True)
        return True
    except Exception as e:
        logger.error(f"Error creating directory {directory}: {e}")
        return False
