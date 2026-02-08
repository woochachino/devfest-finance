"""
Multiplayer API routes and WebSocket endpoint.
"""

import uuid
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from typing import Dict

from app.room_manager import room_manager
from app.websocket import manager as ws_manager

router = APIRouter(prefix="/api/multiplayer")


# ── Request schemas ────────────────────────────────────────────────

class CreateRoomRequest(BaseModel):
    display_name: str

class JoinRoomRequest(BaseModel):
    room_code: str
    display_name: str

class StartGameRequest(BaseModel):
    player_id: str

class SubmitAllocationRequest(BaseModel):
    player_id: str
    allocations: Dict[str, float]


# ── POST /api/multiplayer/create-room ──────────────────────────────

@router.post("/create-room")
async def create_room(req: CreateRoomRequest):
    player_id = str(uuid.uuid4())
    room = room_manager.create_room(player_id, req.display_name)
    return {
        "room_code": room.room_code,
        "player_id": player_id,
        "host_id": room.host_id,
    }


# ── POST /api/multiplayer/join-room ────────────────────────────────

@router.post("/join-room")
async def join_room(req: JoinRoomRequest):
    player_id = str(uuid.uuid4())
    room = room_manager.join_room(req.room_code.upper(), player_id, req.display_name)

    if not room:
        raise HTTPException(status_code=404, detail="Room not found or game already started")

    # Broadcast player joined
    await ws_manager.broadcast_to_room(room.room_code, {
        "type": "player_joined",
        "payload": {
            "player_id": player_id,
            "display_name": req.display_name,
            "players": room_manager.get_players_list(room),
        },
    })

    return {
        "room_code": room.room_code,
        "player_id": player_id,
        "host_id": room.host_id,
        "players": room_manager.get_players_list(room),
    }


# ── POST /api/multiplayer/{room_code}/start ────────────────────────

@router.post("/{room_code}/start")
async def start_game(room_code: str, req: StartGameRequest):
    room = room_manager.rooms.get(room_code)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if req.player_id != room.host_id:
        raise HTTPException(status_code=403, detail="Only host can start game")
    if len(room.players) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 players")

    room.game_started = True
    room_manager.start_round(room)

    await ws_manager.broadcast_to_room(room_code, {
        "type": "round_start",
        "payload": {
            "current_round": room.current_round,
            "timer_duration": room.timer_duration,
        },
    })

    # Start timer task — auto-end round when time expires
    asyncio.create_task(_round_timer(room_code))

    return {"status": "started"}


# ── POST /api/multiplayer/{room_code}/submit ───────────────────────

@router.post("/{room_code}/submit")
async def submit_allocation(room_code: str, req: SubmitAllocationRequest):
    room = room_manager.rooms.get(room_code)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if not room.round_active:
        raise HTTPException(status_code=400, detail="Round not active")

    room_manager.submit_allocation(room, req.player_id, req.allocations)

    # Broadcast submission count
    submitted_count = sum(1 for p in room.players.values() if p.submitted)
    await ws_manager.broadcast_to_room(room_code, {
        "type": "player_submitted",
        "payload": {
            "player_id": req.player_id,
            "submitted_count": submitted_count,
            "total_players": len(room.players),
        },
    })

    # If all submitted, end round early
    if room_manager.all_submitted(room):
        await _end_round_and_advance(room_code)

    return {"status": "submitted"}


# ── Timer and round management ─────────────────────────────────────

async def _round_timer(room_code: str):
    """Server-side timer. Ends round when time expires."""
    room = room_manager.rooms.get(room_code)
    if not room:
        return

    await asyncio.sleep(room.timer_duration)

    # Only end if round is still active (not already ended by all-submit)
    if room.round_active:
        await _end_round_and_advance(room_code)


async def _end_round_and_advance(room_code: str):
    """End current round, show scoreboard, then advance or complete."""
    room = room_manager.rooms.get(room_code)
    if not room or not room.round_active:
        return

    room_manager.end_round(room)
    leaderboard = room_manager.get_leaderboard(room)

    # Broadcast round end with scoreboard
    await ws_manager.broadcast_to_room(room_code, {
        "type": "round_end",
        "payload": {
            "round": room.current_round,
            "leaderboard": leaderboard,
        },
    })

    # Wait for scoreboard display
    await asyncio.sleep(8)

    # Advance or complete
    has_more = room_manager.advance_round(room)

    if has_more:
        room_manager.start_round(room)
        await ws_manager.broadcast_to_room(room_code, {
            "type": "round_start",
            "payload": {
                "current_round": room.current_round,
                "timer_duration": room.timer_duration,
            },
        })
        asyncio.create_task(_round_timer(room_code))
    else:
        await ws_manager.broadcast_to_room(room_code, {
            "type": "game_complete",
            "payload": {
                "final_leaderboard": leaderboard,
            },
        })


# ── WebSocket endpoint ─────────────────────────────────────────────

@router.websocket("/ws/{room_code}/{player_id}")
async def websocket_endpoint(websocket: WebSocket, room_code: str, player_id: str):
    room = room_manager.rooms.get(room_code)
    if not room or player_id not in room.players:
        await websocket.close(code=4001, reason="Invalid room or player")
        return

    await ws_manager.connect(websocket, room_code)
    try:
        while True:
            # Keep connection alive, handle pings
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, room_code)
        room_manager.leave_room(room_code, player_id)

        # Broadcast player left (if room still exists)
        if room_code in room_manager.rooms:
            room = room_manager.rooms[room_code]
            await ws_manager.broadcast_to_room(room_code, {
                "type": "player_left",
                "payload": {
                    "player_id": player_id,
                    "players": room_manager.get_players_list(room),
                    "host_id": room.host_id,
                },
            })
