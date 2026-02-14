"""WebSocket connection manager for real-time updates."""
from fastapi import WebSocket
from typing import Dict, Optional, Union
import logging
from datetime import datetime

from ..schemas.websocket import (
    WSConnected,
    WSLog,
    WSStatus,
    WSComplete,
    WSError,
    WSProgress
)

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manage WebSocket connections and broadcasts."""

    def __init__(self):
        """Initialize the connection manager."""
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str) -> None:
        """
        Accept and register a new WebSocket connection.

        Args:
            websocket: The WebSocket connection
            client_id: Unique identifier for the client
        """
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"WebSocket connected: {client_id}")

        # Send connected message
        await self.send_message(
            client_id,
            WSConnected(
                type="connected",
                data=f"WebSocket connected",
                timestamp=datetime.utcnow()
            )
        )

    def disconnect(self, client_id: str) -> None:
        """
        Remove a WebSocket connection.

        Args:
            client_id: Client identifier to disconnect
        """
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"WebSocket disconnected: {client_id}")

    async def send_message(
        self,
        client_id: str,
        message: Union[WSConnected, WSLog, WSStatus, WSComplete, WSError, WSProgress]
    ) -> bool:
        """
        Send a message to a specific client.

        Args:
            client_id: Client identifier
            message: Message to send (WebSocket schema)

        Returns:
            True if sent successfully, False otherwise
        """
        if client_id not in self.active_connections:
            logger.warning(f"Client not connected: {client_id}")
            return False

        try:
            websocket = self.active_connections[client_id]
            await websocket.send_json(message.model_dump(mode="json"))
            return True
        except Exception as e:
            logger.error(f"Error sending message to {client_id}: {e}")
            # Remove broken connection
            self.disconnect(client_id)
            return False

    async def send_log(self, client_id: str, log_message: str) -> bool:
        """
        Send a log message to a client.

        Args:
            client_id: Client identifier
            log_message: Log message content

        Returns:
            True if sent successfully
        """
        return await self.send_message(
            client_id,
            WSLog(
                type="log",
                data=log_message,
                timestamp=datetime.utcnow()
            )
        )

    async def send_status(self, client_id: str, status_message: str) -> bool:
        """
        Send a status update to a client.

        Args:
            client_id: Client identifier
            status_message: Status message content

        Returns:
            True if sent successfully
        """
        return await self.send_message(
            client_id,
            WSStatus(
                type="status",
                data=status_message,
                timestamp=datetime.utcnow()
            )
        )

    async def send_complete(
        self,
        client_id: str,
        complete_message: str = "Process completed successfully"
    ) -> bool:
        """
        Send a completion message to a client.

        Args:
            client_id: Client identifier
            complete_message: Completion message content

        Returns:
            True if sent successfully
        """
        return await self.send_message(
            client_id,
            WSComplete(
                type="complete",
                data=complete_message,
                timestamp=datetime.utcnow()
            )
        )

    async def send_error(self, client_id: str, error_message: str) -> bool:
        """
        Send an error message to a client.

        Args:
            client_id: Client identifier
            error_message: Error message content

        Returns:
            True if sent successfully
        """
        return await self.send_message(
            client_id,
            WSError(
                type="error",
                data=error_message,
                timestamp=datetime.utcnow()
            )
        )

    async def broadcast(self, message: dict) -> None:
        """
        Broadcast a message to all connected clients.

        Args:
            message: Message dict to broadcast
        """
        disconnected = []
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to {client_id}: {e}")
                disconnected.append(client_id)

        # Clean up disconnected clients
        for client_id in disconnected:
            self.disconnect(client_id)

    def get_connection_count(self) -> int:
        """
        Get the number of active connections.

        Returns:
            Number of active WebSocket connections
        """
        return len(self.active_connections)


# Global connection manager instance
manager = ConnectionManager()
