// MultiplayerWaitingPage - Waiting room with room code, player list, and start button

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayer } from '../context/MultiplayerContext';

export default function MultiplayerWaitingPage() {
    const {
        roomCode, players, isHost, hostId, playerId,
        startGame, resetMultiplayer, phase,
    } = useMultiplayer();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState('');

    // Navigate when game starts (non-host gets round_start via WebSocket)
    useEffect(() => {
        if (phase === 'playing') {
            navigate('/multiplayer/play');
        }
    }, [phase, navigate]);

    // Redirect if no room
    useEffect(() => {
        if (!roomCode) navigate('/multiplayer');
    }, [roomCode, navigate]);

    const copyCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleStart = async () => {
        setStarting(true);
        setError('');
        try {
            await startGame();
        } catch (err) {
            setError(err.message || 'Failed to start');
            setStarting(false);
        }
    };

    const handleLeave = () => {
        resetMultiplayer();
        navigate('/multiplayer');
    };

    return (
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <div className="max-w-lg w-full z-10">
                {/* Room Code */}
                <div className="text-center mb-8">
                    <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Room Code</div>
                    <div
                        onClick={copyCode}
                        className="inline-flex items-center gap-4 px-8 py-4 bg-slate-900/80 border border-slate-700 rounded-xl cursor-pointer hover:border-purple-500/50 transition-colors group"
                    >
                        <span className="text-5xl font-mono font-black tracking-[0.3em] bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                            {roomCode}
                        </span>
                        <span className="text-xs text-slate-500 group-hover:text-purple-400 transition-colors">
                            {copied ? '✓ Copied' : 'Click to copy'}
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-3">Share this code with friends to join</p>
                </div>

                {/* Players */}
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            Players ({players.length}/8)
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs text-slate-500">Waiting</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {players.map((player, idx) => (
                            <div
                                key={player.player_id}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                    player.player_id === playerId
                                        ? 'bg-purple-500/10 border border-purple-500/30'
                                        : 'bg-slate-800/50 border border-slate-700/50'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    idx === 0 ? 'bg-purple-500/30 text-purple-300' :
                                    idx === 1 ? 'bg-blue-500/30 text-blue-300' :
                                    idx === 2 ? 'bg-emerald-500/30 text-emerald-300' :
                                    'bg-slate-700 text-slate-400'
                                }`}>
                                    {idx + 1}
                                </div>
                                <span className="text-white font-medium flex-1">{player.display_name}</span>
                                {player.player_id === hostId && (
                                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase rounded-full border border-amber-500/30">
                                        Host
                                    </span>
                                )}
                                {player.player_id === playerId && (
                                    <span className="text-xs text-slate-500">(You)</span>
                                )}
                            </div>
                        ))}

                        {/* Empty slots */}
                        {Array.from({ length: Math.max(0, 2 - players.length) }).map((_, i) => (
                            <div key={`empty-${i}`} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/20 border border-dashed border-slate-700/30">
                                <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center">
                                    <span className="text-slate-600 text-xs">?</span>
                                </div>
                                <span className="text-slate-600 text-sm">Waiting for player...</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

                <div className="space-y-3">
                    {isHost ? (
                        <button
                            onClick={handleStart}
                            disabled={players.length < 2 || starting}
                            className={`w-full py-4 rounded-xl font-bold text-lg uppercase tracking-widest transition-all duration-300 ${
                                players.length >= 2
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02]'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            {starting ? 'Starting...' : players.length < 2 ? 'Need 2+ Players' : 'Start Game'}
                        </button>
                    ) : (
                        <div className="text-center py-4 text-slate-400 text-sm">
                            <div className="inline-flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                Waiting for host to start...
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleLeave}
                        className="w-full py-3 rounded-xl font-medium text-slate-500 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700 transition-colors"
                    >
                        Leave Room
                    </button>
                </div>

                {/* Game info */}
                <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between text-xs font-mono text-slate-600">
                    <span>5 ROUNDS • 30s EACH</span>
                    <span>MULTIPLAYER MODE</span>
                </div>
            </div>
        </div>
    );
}
