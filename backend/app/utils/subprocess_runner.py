"""Subprocess runner utility for executing commands with real-time streaming."""
import asyncio
from typing import AsyncIterator, Optional, Tuple
import logging

logger = logging.getLogger(__name__)


async def execute_command_streaming(
    command: list[str],
    websocket_callback: Optional[callable] = None,
    cwd: Optional[str] = None
) -> Tuple[str, int]:
    """
    Execute a command and stream output line by line.

    Args:
        command: Command and arguments as list
        websocket_callback: Optional async callback for each line of output
        cwd: Optional working directory

    Returns:
        Tuple of (full_output, return_code)
    """
    logger.info(f"Executing command: {' '.join(command)}")

    process = await asyncio.create_subprocess_exec(
        *command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
        cwd=cwd
    )

    output_lines = []

    async for line in process.stdout:
        decoded_line = line.decode().rstrip('\n\r')
        output_lines.append(decoded_line)
        logger.debug(f"Output: {decoded_line}")

        # Send to WebSocket if callback provided
        if websocket_callback:
            try:
                await websocket_callback(decoded_line)
            except Exception as e:
                logger.error(f"Error in WebSocket callback: {e}")

    await process.wait()

    full_output = "\n".join(output_lines)
    logger.info(f"Command completed with return code: {process.returncode}")

    return full_output, process.returncode
