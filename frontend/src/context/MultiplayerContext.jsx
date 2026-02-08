// MultiplayerContext - State management for multiplayer games
// Isolated from solo GameContext. Handles WebSocket, room state, and round progression.

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { gameData } from '../data/gameData';

const MultiplayerContext = createContext(null);

// API base URL - scrub trailing slash
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Railway backend base for WebSocket (Vercel rewrites only work for HTTP, not WS)
const WS_BACKEND = (import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Get WebSocket URL from API base or current host
const getWsUrl = (code, pid) => {
    if (WS_BACKEND) {
        // Production: convert https://xxx to wss://xxx
        const wsProtocol = WS_BACKEND.startsWith('https') ? 'wss:' : 'ws:';
        const host = WS_BACKEND.replace(/^https?:\/\//, '');
        return `${wsProtocol}//${host}/api/multiplayer/ws/${code}/${pid}`;
    }
    // Dev: use current hostname with port 8000
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.hostname}:8000/api/multiplayer/ws/${code}/${pid}`;
};

export function MultiplayerProvider({ children }) {
    const [roomCode, setRoomCode] = useState(null);
    const [playerId, setPlayerId] = useState(null);
    const [displayName, setDisplayName] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [players, setPlayers] = useState([]);
    const [hostId, setHostId] = useState(null);
    const [currentRound, setCurrentRound] = useState(1);
    const [gameStarted, setGameStarted] = useState(false);
    const [roundActive, setRoundActive] = useState(false);
    const [timerDuration, setTimerDuration] = useState(30);
    const [allocations, setAllocations] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [submittedCount, setSubmittedCount] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const [phase, setPhase] = useState('idle'); // idle | waiting | playing | scoreboard | complete
    const [error, setError] = useState(null);

    const wsRef = useRef(null);
    const reconnectRef = useRef(null);

    // WebSocket connection
    const connectWebSocket = useCallback((code, pid) => {
        if (wsRef.current) {
            wsRef.current.close();
        }

        const wsUrl = getWsUrl(code, pid);
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('WebSocket connected');
            if (reconnectRef.current) {
                clearTimeout(reconnectRef.current);
                reconnectRef.current = null;
            }
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            handleMessage(message);
        };

        ws.onerror = (err) => {
            console.error('WebSocket error:', err);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        wsRef.current = ws;
    }, []);

    const handleMessage = useCallback((message) => {
        const { type, payload } = message;

        switch (type) {
            case 'player_joined':
                setPlayers(payload.players);
                break;

            case 'player_left':
                setPlayers(payload.players);
                if (payload.host_id) {
                    setHostId(payload.host_id);
                }
                break;

            case 'round_start':
                setCurrentRound(payload.current_round);
                setTimerDuration(payload.timer_duration);
                setRoundActive(true);
                setSubmitted(false);
                setSubmittedCount(0);
                setAllocations({});
                setPhase('playing');
                break;

            case 'player_submitted':
                setSubmittedCount(payload.submitted_count);
                break;

            case 'round_end':
                setRoundActive(false);
                setLeaderboard(payload.leaderboard);
                setPhase('scoreboard');
                break;

            case 'game_complete':
                setLeaderboard(payload.final_leaderboard);
                setPhase('complete');
                break;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (wsRef.current) wsRef.current.close();
            if (reconnectRef.current) clearTimeout(reconnectRef.current);
        };
    }, []);

    // API calls
    const createRoom = async (name) => {
        setError(null);
        const response = await fetch(`${API_BASE}/api/multiplayer/create-room`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ display_name: name }),
        });
        if (!response.ok) throw new Error('Failed to create room');
        const data = await response.json();

        setRoomCode(data.room_code);
        setPlayerId(data.player_id);
        setDisplayName(name);
        setIsHost(true);
        setHostId(data.host_id);
        setPlayers([{ player_id: data.player_id, display_name: name }]);
        setPhase('waiting');

        connectWebSocket(data.room_code, data.player_id);
        return data.room_code;
    };

    const joinRoom = async (code, name) => {
        setError(null);
        const response = await fetch(`${API_BASE}/api/multiplayer/join-room`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room_code: code.toUpperCase(), display_name: name }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: 'Failed to join room' }));
            throw new Error(err.detail || 'Failed to join room');
        }

        const data = await response.json();

        setRoomCode(data.room_code);
        setPlayerId(data.player_id);
        setDisplayName(name);
        setIsHost(data.player_id === data.host_id);
        setHostId(data.host_id);
        setPlayers(data.players);
        setPhase('waiting');

        connectWebSocket(data.room_code, data.player_id);
    };

    const startGame = async () => {
        const response = await fetch(`${API_BASE}/api/multiplayer/${roomCode}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player_id: playerId }),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || 'Failed to start game');
        }
    };

    const submitAllocations = async () => {
        if (submitted) return;
        const response = await fetch(`${API_BASE}/api/multiplayer/${roomCode}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player_id: playerId, allocations }),
        });
        if (response.ok) {
            setSubmitted(true);
        }
    };

    const setStockAllocation = useCallback((ticker, percentage) => {
        setAllocations(prev => ({ ...prev, [ticker]: percentage }));
    }, []);

    const getTotalAllocation = useCallback(() => {
        return Object.values(allocations).reduce((sum, val) => sum + val, 0);
    }, [allocations]);

    const getCurrentRoundData = useCallback(() => {
        // gameData.rounds is 0-indexed, currentRound is 1-indexed
        return gameData.rounds[currentRound - 1] || null;
    }, [currentRound]);

    const resetMultiplayer = useCallback(() => {
        if (wsRef.current) wsRef.current.close();
        setRoomCode(null);
        setPlayerId(null);
        setDisplayName('');
        setIsHost(false);
        setHostId(null);
        setPlayers([]);
        setCurrentRound(1);
        setGameStarted(false);
        setRoundActive(false);
        setAllocations({});
        setSubmitted(false);
        setSubmittedCount(0);
        setLeaderboard([]);
        setPhase('idle');
        setError(null);
    }, []);

    const value = {
        roomCode, playerId, displayName, isHost, hostId,
        players, currentRound, gameStarted, roundActive,
        timerDuration, allocations, submitted, submittedCount,
        leaderboard, phase, error,
        createRoom, joinRoom, startGame, submitAllocations,
        setStockAllocation, getTotalAllocation, getCurrentRoundData,
        resetMultiplayer,
    };

    return (
        <MultiplayerContext.Provider value={value}>
            {children}
        </MultiplayerContext.Provider>
    );
}

export function useMultiplayer() {
    const context = useContext(MultiplayerContext);
    if (!context) {
        throw new Error('useMultiplayer must be used within MultiplayerProvider');
    }
    return context;
}
