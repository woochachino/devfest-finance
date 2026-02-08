// MultiplayerCompletePage - Final standings after all 5 rounds

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayer } from '../context/MultiplayerContext';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function MultiplayerCompletePage() {
    const { leaderboard, playerId, resetMultiplayer, roomCode } = useMultiplayer();
    const navigate = useNavigate();

    // Redirect if no data
    useEffect(() => {
        if (!roomCode && leaderboard.length === 0) navigate('/');
    }, [roomCode, leaderboard, navigate]);

    const winner = leaderboard[0];
    const myRank = leaderboard.findIndex(e => e.player_id === playerId) + 1;

    const handleExit = () => {
        resetMultiplayer();
        navigate('/');
    };

    const handlePlayAgain = () => {
        resetMultiplayer();
        navigate('/multiplayer');
    };

    return (
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            {/* Confetti-like decorative elements */}
            <div className="absolute top-20 left-20 w-4 h-4 bg-amber-500/30 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute top-32 right-32 w-3 h-3 bg-purple-500/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-40 left-40 w-5 h-5 bg-emerald-500/20 rounded-full animate-bounce" style={{ animationDelay: '0.8s' }}></div>

            <div className="max-w-2xl w-full z-10">
                {/* Winner Banner */}
                <div className="text-center mb-10">
                    <div className="text-7xl mb-4">🏆</div>
                    <h1 className="text-5xl font-black text-white tracking-tight mb-3">
                        GAME COMPLETE
                    </h1>
                    {winner && (
                        <div className="text-2xl font-bold">
                            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                                {winner.display_name} wins with {winner.total_score} points!
                            </span>
                        </div>
                    )}
                    {myRank > 0 && (
                        <p className="text-slate-400 text-sm mt-2">
                            You finished #{myRank} out of {leaderboard.length} players
                        </p>
                    )}
                </div>

                {/* Final Standings */}
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Final Standings</h2>
                    </div>

                    <div className="divide-y divide-slate-800/50">
                        {leaderboard.map((entry, idx) => {
                            const isMe = entry.player_id === playerId;
                            return (
                                <div
                                    key={entry.player_id}
                                    className={`flex items-center gap-4 px-6 py-5 transition-all ${
                                        isMe ? 'bg-purple-500/10 border-l-2 border-l-purple-500' : ''
                                    } ${idx === 0 ? 'bg-amber-500/5' : ''}`}
                                >
                                    {/* Rank */}
                                    <div className="w-12 text-center">
                                        {idx < 3 ? (
                                            <span className="text-3xl">{MEDALS[idx]}</span>
                                        ) : (
                                            <span className="text-xl font-bold text-slate-500">#{idx + 1}</span>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <div className="flex-1">
                                        <div className={`font-bold text-lg ${isMe ? 'text-purple-300' : 'text-white'}`}>
                                            {entry.display_name}
                                            {isMe && <span className="text-xs text-slate-500 ml-2">(You)</span>}
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="text-right">
                                        <div className={`text-3xl font-bold font-mono ${
                                            idx === 0 ? 'text-amber-400' : 'text-white'
                                        }`}>
                                            {entry.total_score}
                                        </div>
                                        <div className="text-[10px] text-slate-500 uppercase">Points</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={handlePlayAgain}
                        className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-500 hover:to-violet-500 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:scale-[1.02]"
                    >
                        Play Again
                    </button>
                    <button
                        onClick={handleExit}
                        className="w-full py-3 rounded-xl font-medium text-slate-500 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700 transition-colors"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        </div>
    );
}
