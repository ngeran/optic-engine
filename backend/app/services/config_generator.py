"""Config generator for JSNAPy snap_config.yaml."""
from pathlib import Path
from typing import Optional
import logging
from pydantic import IPvAnyAddress

from ..core.config import settings
from ..core.exceptions import ConfigurationError

logger = logging.getLogger(__name__)


def generate_snap_config(
    device_ip: Optional[str] = None,
    username: Optional[str] = None,
    password: Optional[str] = None,
    test_file: Optional[str] = None
) -> Path:
    """
    Generate snap_config.yaml dynamically from parameters or environment variables.

    Args:
        device_ip: Optional device IP override
        username: Optional username override
        password: Optional password override
        test_file: Optional test file override

    Returns:
        Path to generated config file

    Raises:
        ConfigurationError: If config generation fails
    """
    # Use provided values or fall back to settings
    device = device_ip or settings.jnos_device_ip
    user = username or settings.jnos_username
    passwd = password or settings.jnos_password
    test = test_file or settings.jnos_test_file

    # Validate required values
    if not all([device, user, passwd, test]):
        raise ConfigurationError(
            "Missing required configuration: device_ip, username, password, or test_file"
        )

    # Build config dict
    config = {
        "hosts": [
            {
                "device": str(device),
                "username": user,
                "passwd": passwd
            }
        ],
        "tests": [test]
    }

    # Write to config file
    config_path = Path(settings.config_dir) / "snap_config.yaml"

    try:
        config_path.parent.mkdir(parents=True, exist_ok=True)

        import yaml
        with open(config_path, "w") as f:
            yaml.dump(config, f, default_flow_style=False)

        logger.info(f"Generated snap_config.yaml: device={device}, test={test}")
        return config_path

    except Exception as e:
        logger.error(f"Error generating snap_config.yaml: {e}")
        raise ConfigurationError(f"Failed to generate config: {e}")


def get_config_path() -> Path:
    """
    Get the path to snap_config.yaml.

    Returns:
        Path to snap_config.yaml
    """
    return Path(settings.config_dir) / "snap_config.yaml"


def get_test_file_path(test_file: str) -> Path:
    """
    Get the full path to a test file.

    Args:
        test_file: Test file name

    Returns:
        Full path to test file
    """
    return Path(settings.testfiles_dir) / test_file


def list_test_files() -> list[str]:
    """
    List all available test files.

    Returns:
        List of test file names
    """
    testfiles_dir = Path(settings.testfiles_dir)

    if not testfiles_dir.exists():
        logger.warning(f"Testfiles directory not found: {testfiles_dir}")
        return []

    return [
        f.name for f in testfiles_dir.glob("*.yml")
        if f.is_file() and not f.name.startswith("_")
    ]
