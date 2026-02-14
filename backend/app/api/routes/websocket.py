"""WebSocket endpoint for real-time log streaming."""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Optional
import uuid

from ....services.websocket_manager import manager
from ....services.jsnapy_service import jsnapy_service
from ....schemas.websocket import ClientSnapshotRequest, ClientCheckRequest
from ....core.exceptions import OpticEngineException
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["websocket"])


@router.websocket("/snapshot")
async def websocket_snapshot_endpoint(websocket: WebSocket) -> None:
    """
    WebSocket endpoint for real-time snapshot and check operations.

    Client should connect and send JSON messages with action type:
    - {"action": "snapshot", "task_type": "pre"|"post", ...}
    - {"action": "check", ...}

    Server will stream log output in real-time.
    """
    # Generate unique client ID
    client_id = str(uuid.uuid4())

    # Accept connection
    await manager.connect(websocket, client_id)

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            action = data.get("action")

            try:
                if action == "snapshot":
                    # Handle snapshot operation
                    task_type = data.get("task_type")
                    if task_type not in ("pre", "post"):
                        await manager.send_error(client_id, f"Invalid task_type: {task_type}")
                        continue

                    # Send status update
                    device_ip = data.get("device")
                    await manager.send_status(
                        client_id,
                        f"Running {task_type.upper()} snapshot on {device_ip or 'default device'}"
                    )

                    # Run snapshot with streaming
                    await jsnapy_service.run_snapshot(
                        snapshot_type=task_type,
                        device_ip=data.get("device"),
                        username=data.get("username"),
                        password=data.get("password"),
                        test_file=data.get("test_file"),
                        client_id=client_id
                    )

                    # Send completion message
                    await manager.send_complete(
                        client_id,
                        f"{task_type.upper()} snapshot completed successfully"
                    )

                elif action == "check":
                    # Handle check operation
                    device_ip = data.get("device")
                    await manager.send_status(
                        client_id,
                        f"Running check on {device_ip or 'default device'}"
                    )

                    # Run check with streaming
                    output, return_code = await jsnapy_service.run_check(
                        device_ip=data.get("device"),
                        username=data.get("username"),
                        password=data.get("password"),
                        test_file=data.get("test_file"),
                        client_id=client_id
                    )

                    # Send completion message
                    message = "Check completed with failures" if return_code != 0 else "Check completed successfully"
                    await manager.send_complete(client_id, message)

                else:
                    await manager.send_error(client_id, f"Unknown action: {action}")

            except OpticEngineException as e:
                # Send error message to client
                await manager.send_error(client_id, e.message)
                logger.error(f"Error handling WebSocket message: {e}")

    except WebSocketDisconnect:
        manager.disconnect(client_id)
        logger.info(f"WebSocket disconnected: {client_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(client_id)
