// LeaderboardPage - Standalone page to view rankings

import { useNavigate } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard';
import GlobalLeaderboard from '../components/GlobalLeaderboard';

export default function LeaderboardPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans selection:bg-amber-500/30">
            {/* Navbar Placeholder - specific for this page if needed, or reused */}
            <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 group"
                    >
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-900 font-bold text-lg group-hover:scale-105 transition-transform">
                            M
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            <span className="text-white">MARKET</span>
                            <span className="text-amber-400">MIND</span>
                        </span>
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Global Rankings
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        See how you stack up against the best traders in the world.
                        Track your progress and aim for the top.
                    </p>
                </div>

                {/* Leaderboards Grid */}
                <div className="grid md:grid-cols-2 gap-8 animate-slide-up">
                    {/* Left Column: Global */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                                Global Competition
                            </h2>
                        </div>
                        <GlobalLeaderboard />
                    </div>

                    {/* Right Column: Local */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                                Personal History
                            </h2>
                        </div>
                        <Leaderboard />
                    </div>
                </div>
            </div>

            <footer className="text-center text-slate-600 text-xs py-12">
                MARKETMIND TERMINAL • LEADERBOARD SYSTEM V1.0
            </footer>
        </div>
    );
}
