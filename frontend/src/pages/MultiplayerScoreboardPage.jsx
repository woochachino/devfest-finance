// MultiplayerScoreboardPage - Between-round leaderboard display

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayer } from '../context/MultiplayerContext';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function MultiplayerScoreboardPage() {
    const { leaderboard, currentRound, phase, playerId } = useMultiplayer();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(8);

    // Navigate on phase changes
    useEffect(() => {
        if (phase === 'playing') navigate('/multiplayer/play');
        if (phase === 'complete') navigate('/multiplayer/complete');
    }, [phase, navigate]);

    // Visual countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // The round that just finished is currentRound - 1 (since advance_round increments it)
    // But if currentRound > 5, the game is complete and we shouldn't be here
    const finishedRound = currentRound - 1;

    return (
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <div className="max-w-xl w-full z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">📊</div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                        Round {finishedRound} Complete
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                        Next round in {countdown}s...
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Standings</h2>
                            <span className="text-[10px] font-mono text-slate-600">ROUND {finishedRound} OF 5</span>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-800/50">
                        {leaderboard.map((entry, idx) => {
                            const isMe = entry.player_id === playerId;
                            return (
                                <div
                                    key={entry.player_id}
                                    className={`flex items-center gap-4 px-6 py-4 transition-all ${
                                        isMe ? 'bg-purple-500/10' : ''
                                    } ${idx === 0 ? 'bg-amber-500/5' : ''}`}
                                >
                                    {/* Rank */}
                                    <div className="w-10 text-center">
                                        {idx < 3 ? (
                                            <span className="text-2xl">{MEDALS[idx]}</span>
                                        ) : (
                                            <span className="text-lg font-bold text-slate-500">#{idx + 1}</span>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <div className="flex-1">
                                        <div className={`font-bold ${isMe ? 'text-purple-300' : 'text-white'}`}>
                                            {entry.display_name} {isMe && <span className="text-xs text-slate-500">(You)</span>}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            This round: {entry.round_return >= 0 ? '+' : ''}{entry.round_return.toFixed(1)}% return
                                            &bull; {entry.round_score} pts
                                        </div>
                                    </div>

                                    {/* Total Score */}
                                    <div className="text-right">
                                        <div className="text-2xl font-bold font-mono text-white">{entry.total_score}</div>
                                        <div className="text-[10px] text-slate-500 uppercase">Total</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2 mt-8">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full transition-all ${
                                i < finishedRound
                                    ? 'bg-purple-500'
                                    : i === finishedRound
                                        ? 'bg-purple-500/50 animate-pulse'
                                        : 'bg-slate-700'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
