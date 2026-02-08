// Leaderboard - Tracks user's best scores across all game attempts

import { useState } from 'react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

// Get leaderboard from localStorage
export function getLeaderboard() {
    const saved = localStorage.getItem('marketmind_leaderboard');
    return saved ? JSON.parse(saved) : [];
}

// Save a new score to the leaderboard
export function saveScore(score, mode) {
    const leaderboard = getLeaderboard();
    const newEntry = {
        score: Math.round(score),
        mode: mode || 'chill',
        date: new Date().toISOString(),
        roi: ((score - 10000) / 10000 * 100).toFixed(1)
    };

    leaderboard.push(newEntry);
    // Sort by score descending and keep top 6
    leaderboard.sort((a, b) => b.score - a.score);
    const top6 = leaderboard.slice(0, 6);

    localStorage.setItem('marketmind_leaderboard', JSON.stringify(top6));
    return top6;
}

// Get the user's best score ever
export function getBestScore() {
    const leaderboard = getLeaderboard();
    return leaderboard.length > 0 ? leaderboard[0].score : null;
}

export default function Leaderboard({ currentScore = null, currentMode = "chill" }) {
    const [selectedMode, setSelectedMode] = useState('all'); // 'all', 'panic', 'chill'
    const fullLeaderboard = getLeaderboard();

    // Check if current score is a new entry (for highlighting)
    const isNewHighScore = currentScore && fullLeaderboard.length > 0 && currentScore >= fullLeaderboard[0].score;

    // Filter leaderboard based on selected mode
    let displayLeaderboard = [...fullLeaderboard];
    if (selectedMode !== 'all') {
        displayLeaderboard = displayLeaderboard.filter(entry => entry.mode === selectedMode);
    }

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-5 h-5 text-amber-400" />;
            case 2:
                return <Medal className="w-5 h-5 text-slate-300" />;
            case 3:
                return <Award className="w-5 h-5 text-orange-600" />;
            default:
                return <span className="text-slate-600 font-mono text-sm">#{rank}</span>;
        }
    };

    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (fullLeaderboard.length === 0) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 text-center h-full flex flex-col items-center justify-center">
                <TrendingUp className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No Scores Yet</h3>
                <p className="text-slate-500 text-sm">Complete a game to see your scores here!</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-full">
            {/* Header with Mode Tabs */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/80">
                <div className="flex flex-col gap-3">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>YOUR BEST RUNS</span>
                    </h2>

                    {/* Mode Filter Buttons */}
                    <div className="flex bg-slate-800/50 p-1 rounded-lg self-start">
                        <button
                            onClick={() => setSelectedMode('all')}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded transition-all ${selectedMode === 'all'
                                    ? 'bg-slate-600 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setSelectedMode('panic')}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded transition-all ${selectedMode === 'panic'
                                    ? 'bg-red-500/80 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-red-400'
                                }`}
                        >
                            Panic
                        </button>
                        <button
                            onClick={() => setSelectedMode('chill')}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded transition-all ${selectedMode === 'chill'
                                    ? 'bg-blue-500/80 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-blue-400'
                                }`}
                        >
                            Chill
                        </button>
                    </div>
                </div>
            </div>

            {/* New High Score Banner */}
            {isNewHighScore && selectedMode === 'all' && (
                <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 text-center">
                    <span className="text-amber-400 font-bold text-sm">🎉 NEW HIGH SCORE!</span>
                </div>
            )}

            {/* Leaderboard Entries */}
            <div className="divide-y divide-slate-800 flex-1">
                {displayLeaderboard.length > 0 ? (
                    displayLeaderboard.map((entry, index) => {
                        const rank = index + 1;
                        const isCurrentRun = currentScore && entry.score === Math.round(currentScore) &&
                            new Date(entry.date).toDateString() === new Date().toDateString();

                        return (
                            <div
                                key={index}
                                className={`p-4 transition-colors ${isCurrentRun
                                    ? 'bg-amber-500/10 border-l-2 border-amber-500'
                                    : 'hover:bg-slate-800/50'
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    {/* Left: Rank */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-8 flex items-center justify-center">
                                            {getRankIcon(rank)}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`font-bold ${isCurrentRun ? 'text-amber-400' : 'text-white'}`}>
                                                Run #{fullLeaderboard.findIndex(e => e === entry) + 1}
                                                {isCurrentRun && (
                                                    <span className="ml-2 text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
                                                        THIS RUN
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                <span className={`uppercase font-mono ${entry.mode === 'panic' ? 'text-red-400' : 'text-blue-400'
                                                    }`}>
                                                    {entry.mode}
                                                </span>
                                                <span>•</span>
                                                <span>{formatDate(entry.date)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Score */}
                                    <div className="text-right">
                                        <div className={`font-mono text-lg font-bold ${isCurrentRun ? 'text-amber-400' : 'text-emerald-400'
                                            }`}>
                                            ${entry.score.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {entry.roi >= 0 ? '+' : ''}{entry.roi}% ROI
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-8 text-center text-slate-500 text-sm">
                        No scores for this mode yet.
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-900/80 border-t border-slate-800 mt-auto">
                <div className="text-[10px] text-slate-600 uppercase tracking-widest text-center">
                    Top 6 All-Time Runs • Saved Locally
                </div>
            </div>
        </div>
    );
}
