"""
WebSocket connection manager for multiplayer rooms.
"""

from fastapi import WebSocket
from typing import Dict, Set


class ConnectionManager:
    def __init__(self):
        # room_code -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_code: str):
        await websocket.accept()
        if room_code not in self.active_connections:
            self.active_connections[room_code] = set()
        self.active_connections[room_code].add(websocket)

    def disconnect(self, websocket: WebSocket, room_code: str):
        if room_code in self.active_connections:
            self.active_connections[room_code].discard(websocket)
            if not self.active_connections[room_code]:
                del self.active_connections[room_code]

    async def broadcast_to_room(self, room_code: str, message: dict):
        if room_code not in self.active_connections:
            return
        disconnected = []
        for ws in self.active_connections[room_code]:
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(ws)
        for ws in disconnected:
            self.disconnect(ws, room_code)


manager = ConnectionManager()
