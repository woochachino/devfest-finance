// GlobalLeaderboard - Shows mock global rankings with user's best score

import { useState } from 'react';
import { Trophy, Medal, Award, Globe } from 'lucide-react';
import { getBestScore, getLeaderboard } from './Leaderboard';

// Mock global competitors (realistic finance-themed names)
const MOCK_COMPETITORS = [
    { name: "Warren B.", score: 17200, mode: "chill", date: "2026-02-06" },
    { name: "Ray D.", score: 15890, mode: "panic", date: "2026-02-05" },
    { name: "Catherine W.", score: 13420, mode: "chill", date: "2026-02-07" },
    { name: "Michael B.", score: 11500, mode: "panic", date: "2026-02-04" },
    { name: "Peter L.", score: 9800, mode: "chill", date: "2026-02-03" },
];

export default function GlobalLeaderboard() {
    const [selectedMode, setSelectedMode] = useState('all'); // 'all', 'panic', 'chill'

    // Get user's local leaderboard history
    const userLeaderboard = getLeaderboard();

    // Find user's best score for each mode logic
    // We need to find the best score for the CURRENTLY selected filter
    let userBestForMode = null;

    if (selectedMode === 'all') {
        // For 'all', just take the absolute best score if it exists
        const best = getBestScore();
        if (best) {
            // Find the entry that corresponds to this score to get the date/mode
            // or just use the score and generic info if needed, but better to match
            const entry = userLeaderboard.find(e => e.score === best);
            userBestForMode = entry;
        }
    } else {
        // Filter user runs by mode and sort by score
        const modeRuns = userLeaderboard.filter(e => e.mode === selectedMode);
        modeRuns.sort((a, b) => b.score - a.score);
        if (modeRuns.length > 0) {
            userBestForMode = modeRuns[0];
        }
    }

    // Build leaderboard based on selected mode
    let leaderboard = [...MOCK_COMPETITORS];

    // Filter mock competitors by mode if not 'all'
    if (selectedMode !== 'all') {
        leaderboard = leaderboard.filter(entry => entry.mode === selectedMode);
    }

    // Add user's best score (if one exists for this mode)
    if (userBestForMode) {
        leaderboard.push({
            name: "YOU",
            score: userBestForMode.score,
            mode: userBestForMode.mode,
            date: userBestForMode.date.split('T')[0], // Handle ISO string
            isUser: true
        });
    }

    // Sort by score descending
    leaderboard.sort((a, b) => b.score - a.score);

    // Keep top 6
    leaderboard = leaderboard.slice(0, 6);

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

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-full">
            {/* Header with Mode Tabs */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/80">
                <div className="flex flex-col gap-3">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-400" />
                        <span>GLOBAL LEADERBOARD</span>
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

            {/* Leaderboard Entries */}
            <div className="divide-y divide-slate-800 flex-1">
                {leaderboard.length > 0 ? (
                    leaderboard.map((entry, index) => {
                        const rank = index + 1;
                        const isUser = entry.isUser;
                        const roi = ((entry.score - 10000) / 10000 * 100).toFixed(1);

                        return (
                            <div
                                key={index}
                                className={`p-4 transition-colors ${isUser
                                        ? 'bg-amber-500/10 border-l-2 border-amber-500'
                                        : 'hover:bg-slate-800/50'
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    {/* Left: Rank & Name */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-8 flex items-center justify-center">
                                            {getRankIcon(rank)}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`font-bold ${isUser ? 'text-amber-400' : 'text-white'}`}>
                                                {entry.name}
                                                {isUser && (
                                                    <span className="ml-2 text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
                                                        YOU
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
                                        <div className={`font-mono text-lg font-bold ${isUser ? 'text-amber-400' : 'text-emerald-400'
                                            }`}>
                                            ${entry.score.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {roi >= 0 ? '+' : ''}{roi}% ROI
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-8 text-center text-slate-500 text-sm">
                        No entries for this mode yet.
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-900/80 border-t border-slate-800 mt-auto">
                <div className="text-[10px] text-slate-600 uppercase tracking-widest text-center">
                    Live Rankings • Updated Real-Time
                </div>
            </div>
        </div>
    );
}
