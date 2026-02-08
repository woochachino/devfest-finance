// MultiplayerLobbyPage - Create or join a multiplayer room

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayer } from '../context/MultiplayerContext';

export default function MultiplayerLobbyPage() {
    const [mode, setMode] = useState(null); // 'create' | 'join'
    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { createRoom, joinRoom } = useMultiplayer();
    const navigate = useNavigate();

    const handleCreate = async () => {
        if (!name.trim()) { setError('Enter your name'); return; }
        setLoading(true);
        setError('');
        try {
            await createRoom(name.trim());
            navigate('/multiplayer/waiting');
        } catch (err) {
            setError(err.message || 'Failed to create room');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!name.trim()) { setError('Enter your name'); return; }
        if (roomCode.length < 6) { setError('Enter a 6-character room code'); return; }
        setLoading(true);
        setError('');
        try {
            await joinRoom(roomCode.toUpperCase(), name.trim());
            navigate('/multiplayer/waiting');
        } catch (err) {
            setError(err.message || 'Room not found or game already started');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-800 via-purple-500 to-purple-800 opacity-60"></div>

            {/* Back button */}
            <button
                onClick={() => mode ? setMode(null) : navigate('/')}
                className="absolute top-6 left-6 z-20 flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-mono text-xs uppercase tracking-widest"
            >
                <span className="text-lg">&larr;</span> {mode ? 'BACK' : 'HOME'}
            </button>

            <div className="max-w-md w-full z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="text-5xl mb-4">👥</div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                        <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">MULTIPLAYER</span>
                    </h1>
                    <p className="text-slate-400 text-sm">Compete with friends in real-time market challenges</p>
                </div>

                {!mode && (
                    <div className="space-y-4">
                        <button
                            onClick={() => setMode('create')}
                            className="w-full group relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-purple-900/40 to-slate-900/60 border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 hover:scale-[1.02]"
                        >
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-xl text-white mb-1">Create Room</div>
                                    <div className="text-xs text-slate-400">Host a game and invite friends</div>
                                </div>
                                <div className="text-3xl">🏠</div>
                            </div>
                        </button>

                        <button
                            onClick={() => setMode('join')}
                            className="w-full group relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-violet-900/40 to-slate-900/60 border border-violet-500/30 hover:border-violet-400/60 transition-all duration-300 hover:scale-[1.02]"
                        >
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-xl text-white mb-1">Join Room</div>
                                    <div className="text-xs text-slate-400">Enter a room code to join</div>
                                </div>
                                <div className="text-3xl">🔗</div>
                            </div>
                        </button>
                    </div>
                )}

                {mode === 'create' && (
                    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-8">
                        <h2 className="text-xl font-bold text-white mb-6">Create Room</h2>
                        <input
                            type="text"
                            placeholder="Your display name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={20}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 mb-4"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                        <button
                            onClick={handleCreate}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-colors"
                        >
                            {loading ? 'Creating...' : 'Create Room'}
                        </button>
                    </div>
                )}

                {mode === 'join' && (
                    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-8">
                        <h2 className="text-xl font-bold text-white mb-6">Join Room</h2>
                        <input
                            type="text"
                            placeholder="Your display name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={20}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 mb-4"
                        />
                        <input
                            type="text"
                            placeholder="Room Code (e.g. ABC123)"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                            maxLength={6}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 mb-4 font-mono text-center text-2xl tracking-[0.3em] uppercase"
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                        />
                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                        <button
                            onClick={handleJoin}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-colors"
                        >
                            {loading ? 'Joining...' : 'Join Room'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
