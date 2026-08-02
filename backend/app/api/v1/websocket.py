import json
from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import structlog

logger = structlog.get_logger(__name__)

router = APIRouter(tags=["WebSockets"])


class ConnectionManager:
    """Manages active WebSocket client connections for real-time agent updates."""

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, project_id: str, websocket: WebSocket):
        await websocket.accept()
        if project_id not in self.active_connections:
            self.active_connections[project_id] = []
        self.active_connections[project_id].append(websocket)
        logger.info("websocket_connected", project_id=project_id)

    def disconnect(self, project_id: str, websocket: WebSocket):
        if project_id in self.active_connections:
            if websocket in self.active_connections[project_id]:
                self.active_connections[project_id].remove(websocket)
            if not self.active_connections[project_id]:
                del self.active_connections[project_id]
        logger.info("websocket_disconnected", project_id=project_id)

    async def broadcast(self, project_id: str, message: dict):
        if project_id in self.active_connections:
            dead_sockets = []
            for connection in self.active_connections[project_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    dead_sockets.append(connection)

            for dead in dead_sockets:
                self.disconnect(project_id, dead)


ws_manager = ConnectionManager()


@router.websocket("/ws/projects/{project_id}")
async def project_websocket_endpoint(websocket: WebSocket, project_id: str):
    await ws_manager.connect(project_id, websocket)
    try:
        while True:
            # Receive ping / client messages if any
            data = await websocket.receive_text()
            await websocket.send_json({"event": "pong", "payload": data})
    except WebSocketDisconnect:
        ws_manager.disconnect(project_id, websocket)
