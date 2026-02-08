"""
In-memory room management for multiplayer games.
Rooms are ephemeral — no DB persistence needed.
"""

import random
import string
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from typing import Dict, List, Optional

# Stock returns per round (mirrors frontend gameData.js)
# Used for server-side score calculation so players can't cheat
ROUND_STOCK_RETURNS: Dict[int, Dict[str, float]] = {
    1: {  # AI Boom Divergence (May-Jun 2023)
        "NVDA": 30.8, "AMD": 23.5, "MSFT": 7.2,
        "GOOGL": 12.1, "INTC": -3.8, "SNAP": -16.2,
        "IBM": 1.5, "DIS": -8.4, "MRNA": -7.1,
        "SPY": 4.2,
    },
    2: {  # Banking Crisis (Mar-Apr 2023)
        "JPM": 7.5, "SCHW": -28.4, "KRE": -18.2,
        "GLD": 9.8, "AAPL": 5.2, "PFE": -2.1,
        "WFC": -10.3, "VNO": -12.5, "COIN": -5.8,
        "SPY": 2.5,
    },
    3: {  # Inflation Regime Change (May-Jun 2022)
        "XOM": 15.3, "DVN": 22.1, "META": -12.8,
        "AMZN": -8.5, "COST": -16.2, "LMT": 4.7,
        "TSLA": -11.3, "WMT": -17.4, "TGT": -29.1,
        "SPY": -1.2,
    },
    4: {  # ZIRP Unwind (Jan-Mar 2022)
        "NFLX": -37.8, "META": -34.5, "PYPL": -28.6,
        "JPM": 8.2, "XLE": 39.2, "PG": 4.8,
        "T": 6.3, "SPY": -4.6, "ARKK": -41.2,
        "TSLA": -11.5,
    },
    5: {  # Nvidia Singularity (Nov 2023-Jan 2024)
        "NVDA": 64.2, "SMCI": 95.3, "ARM": 48.7,
        "MSFT": 18.4, "GOOGL": 15.2, "INTC": -8.3,
        "AAPL": 11.2, "SPY": 8.9, "PLTR": 52.8,
        "CVNA": -18.2,
    },
}


@dataclass
class Player:
    player_id: str
    display_name: str
    allocations: Dict[str, float] = field(default_factory=dict)
    submitted: bool = False
    round_score: int = 0
    round_return: float = 0.0
    total_score: int = 0


@dataclass
class MultiplayerRoom:
    room_code: str
    host_id: str
    players: Dict[str, Player] = field(default_factory=dict)
    current_round: int = 1
    max_rounds: int = 5
    game_started: bool = False
    round_active: bool = False
    timer_duration: int = 30
    created_at: datetime = field(default_factory=datetime.utcnow)


class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, MultiplayerRoom] = {}

    def generate_room_code(self) -> str:
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if code not in self.rooms:
                return code

    def create_room(self, host_id: str, host_name: str) -> MultiplayerRoom:
        code = self.generate_room_code()
        room = MultiplayerRoom(room_code=code, host_id=host_id)
        room.players[host_id] = Player(player_id=host_id, display_name=host_name)
        self.rooms[code] = room
        return room

    def join_room(self, room_code: str, player_id: str, display_name: str) -> Optional[MultiplayerRoom]:
        room = self.rooms.get(room_code)
        if not room or room.game_started:
            return None
        if len(room.players) >= 8:
            return None
        room.players[player_id] = Player(player_id=player_id, display_name=display_name)
        return room

    def leave_room(self, room_code: str, player_id: str):
        room = self.rooms.get(room_code)
        if not room:
            return
        room.players.pop(player_id, None)
        if player_id == room.host_id:
            if room.players:
                room.host_id = next(iter(room.players))
            else:
                del self.rooms[room_code]

    def start_round(self, room: MultiplayerRoom):
        room.round_active = True
        for player in room.players.values():
            player.allocations = {}
            player.submitted = False
            player.round_score = 0
            player.round_return = 0.0

    def submit_allocation(self, room: MultiplayerRoom, player_id: str, allocations: Dict[str, float]):
        player = room.players.get(player_id)
        if player and room.round_active:
            player.allocations = allocations
            player.submitted = True

    def all_submitted(self, room: MultiplayerRoom) -> bool:
        return all(p.submitted for p in room.players.values())

    def calculate_round_scores(self, room: MultiplayerRoom):
        """Calculate scores for all players based on their allocations vs actual returns."""
        round_returns = ROUND_STOCK_RETURNS.get(room.current_round, {})
        if not round_returns:
            return

        # Calculate optimal return (max 50% per stock, greedy allocation)
        sorted_returns = sorted(round_returns.values(), reverse=True)
        optimal_return = 0.0
        remaining = 100.0
        for ret in sorted_returns:
            alloc = min(50.0, remaining)
            if alloc <= 0:
                break
            optimal_return += (alloc / 100.0) * ret
            remaining -= alloc

        for player in room.players.values():
            # Calculate weighted return
            player_return = 0.0
            for ticker, alloc_pct in player.allocations.items():
                ret = round_returns.get(ticker, 0.0)
                player_return += (alloc_pct / 100.0) * ret

            player.round_return = round(player_return, 2)

            # Score 0-100 based on proximity to optimal
            if optimal_return <= 0:
                score = 100 if player_return >= 0 else max(0, int(50 + player_return))
            elif player_return >= optimal_return:
                score = 100
            elif player_return <= 0:
                score = max(0, int(25 + (player_return / optimal_return) * 25))
            else:
                score = max(0, min(100, int((player_return / optimal_return) * 100)))

            player.round_score = score
            player.total_score += score

    def end_round(self, room: MultiplayerRoom):
        self.calculate_round_scores(room)
        room.round_active = False

    def advance_round(self, room: MultiplayerRoom) -> bool:
        """Advance to next round. Returns True if there are more rounds."""
        room.current_round += 1
        return room.current_round <= room.max_rounds

    def get_leaderboard(self, room: MultiplayerRoom) -> List[Dict]:
        sorted_players = sorted(
            room.players.values(),
            key=lambda p: p.total_score,
            reverse=True,
        )
        return [
            {
                "rank": idx + 1,
                "player_id": p.player_id,
                "display_name": p.display_name,
                "round_score": p.round_score,
                "round_return": p.round_return,
                "total_score": p.total_score,
            }
            for idx, p in enumerate(sorted_players)
        ]

    def get_players_list(self, room: MultiplayerRoom) -> List[Dict]:
        return [
            {"player_id": p.player_id, "display_name": p.display_name}
            for p in room.players.values()
        ]

    def cleanup_old_rooms(self, max_age_hours: int = 24):
        now = datetime.utcnow()
        to_delete = [
            code for code, room in self.rooms.items()
            if (now - room.created_at) > timedelta(hours=max_age_hours)
        ]
        for code in to_delete:
            del self.rooms[code]


room_manager = RoomManager()
