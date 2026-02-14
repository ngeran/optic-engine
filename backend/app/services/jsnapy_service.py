"""JSNAPy service wrapper for executing snapshot and check operations."""
import logging
from typing import Optional, Tuple
from pathlib import Path
from datetime import datetime

from fastapi import WebSocket

from ..core.config import settings
from ..core.exceptions import JSNAPyExecutionError, DeviceConnectionError
from ..services.config_generator import generate_snap_config
from ..services.websocket_manager import manager
from ..utils.subprocess_runner import execute_command_streaming

logger = logging.getLogger(__name__)


class JSNAPyService:
    """Service for interacting with JSNAPy."""

    def __init__(self):
        """Initialize the JSNAPy service."""
        self.jsnapy_cmd = "jsnapy"

    async def run_snapshot(
        self,
        snapshot_type: str,
  # "pre" or "post"
        device_ip: Optional[str] = None,
        username: Optional[str] = None,
        password: Optional[str] = None,
        test_file: Optional[str] = None,
        client_id: Optional[str] = None
    ) -> Tuple[str, int]:
        """
        Run a JSNAPy snapshot operation.

        Args:
            snapshot_type: Either "pre" or "post"
            device_ip: Optional device IP override
            username: Optional username override
            password: Optional password override
            test_file: Optional test file override
            client_id: Optional WebSocket client ID for real-time updates

        Returns:
            Tuple of (output, return_code)

        Raises:
            JSNAPyExecutionError: If snapshot fails
            DeviceConnectionError: If device connection fails
        """
        if snapshot_type not in ("pre", "post"):
            raise ValueError(f"Invalid snapshot_type: {snapshot_type}. Must be 'pre' or 'post'")

        try:
            # Generate config from parameters
            config_path = generate_snap_config(
                device_ip=device_ip,
                username=username,
                password=password,
                test_file=test_file
            )

            # Build command - use shell to cd into testfiles first
            command = [
                "sh", "-c",
                f"cd /app/testfiles && {self.jsnapy_cmd} --snap {snapshot_type} -f {str(config_path)}"
            ]

            # Define WebSocket callback for streaming
            async def ws_callback(line: str):
                if client_id:
                    await manager.send_log(client_id, line)

            # Execute command (already cd'd into /app/testfiles)
            output, return_code = await execute_command_streaming(
                command=command,
                websocket_callback=ws_callback if client_id else None
            )

            # Check for common error patterns
            if return_code != 0:
                if "Permission denied" in output or "Authentication failed" in output:
                    raise DeviceConnectionError(
                        f"Authentication failed for device {device_ip or settings.jnos_device_ip}"
                    )
                elif "Connection refused" in output or "Host unreachable" in output:
                    raise DeviceConnectionError(
                        f"Cannot connect to device {device_ip or settings.jnos_device_ip}"
                    )
                else:
                    raise JSNAPyExecutionError(
                        f"Snapshot {snapshot_type} failed",
                        return_code=return_code
                    )

            return output, return_code

        except (DeviceConnectionError, JSNAPyExecutionError):
            raise
        except Exception as e:
            logger.error(f"Unexpected error running snapshot: {e}")
            raise JSNAPyExecutionError(f"Snapshot failed: {str(e)}")

    async def run_check(
        self,
        device_ip: Optional[str] = None,
        username: Optional[str] = None,
        password: Optional[str] = None,
        test_file: Optional[str] = None,
        client_id: Optional[str] = None
    ) -> Tuple[str, int]:
        """
        Run a JSNAPy check operation (compare pre/post snapshots).

        Args:
            device_ip: Optional device IP override
            username: Optional username override
            password: Optional password override
            test_file: Optional test file override
            client_id: Optional WebSocket client ID for real-time updates

        Returns:
            Tuple of (output, return_code)

        Raises:
            JSNAPyExecutionError: If check fails
            DeviceConnectionError: If device connection fails
        """
        try:
            # Generate config from parameters
            config_path = generate_snap_config(
                device_ip=device_ip,
                username=username,
                password=password,
                test_file=test_file
            )

            # Build command - use --snapcheck which automatically finds pre/post snapshots
            command = [
                "sh", "-c",
                f"cd /app/testfiles && {self.jsnapy_cmd} --snapcheck -f {str(config_path)}"
            ]

            # Define WebSocket callback for streaming
            async def ws_callback(line: str):
                if client_id:
                    await manager.send_log(client_id, line)

            # Execute command (already cd'd into /app/testfiles)
            output, return_code = await execute_command_streaming(
                command=command,
                websocket_callback=ws_callback if client_id else None
            )

            # Check for errors
            if return_code != 0:
                # Note: JSNAPy returns non-zero when tests fail, not when execution fails
                # We still want to return the output so the UI can show PASS/FAIL results
                logger.warning(f"JSNAPy check returned code {return_code}")

            return output, return_code

        except Exception as e:
            logger.error(f"Unexpected error running check: {e}")
            raise JSNAPyExecutionError(f"Check failed: {str(e)}")


# Global service instance
jsnapy_service = JSNAPyService()
