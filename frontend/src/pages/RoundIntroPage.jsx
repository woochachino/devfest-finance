// RoundIntroPage - Shows round info, context, and start button with Mode Selection

import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

export default function RoundIntroPage() {
    const { currentRound, balance, getCurrentRoundData, startRound, resetGame, roundHistory, gameMode, setGameMode } = useGame();
    const navigate = useNavigate();
    const roundData = getCurrentRoundData();

    // Calculate performance from previous rounds
    const previousRoundReturn = roundHistory.length > 0
        ? ((balance - 10000) / 10000 * 100).toFixed(1)
        : null;

    const handleStart = (mode) => {
        // If mode passed (Round 1 selection), set it
        if (mode) {
            setGameMode(mode);
        }
        startRound();
        navigate('/portfolio');
    };

    const handleHome = () => {
        resetGame();
        navigate('/');
    };

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6 relative">

            {/* Navigation Buttons */}
            <div className="absolute top-6 left-6 z-10">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                </button>
            </div>

            <div className="absolute top-6 right-6 z-10">
                <button
                    onClick={handleHome}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                </button>
            </div>

            <div className="max-w-4xl w-full">
                {/* Round Badge */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 font-medium mb-4">
                        <span className="text-lg">🎮</span>
                        Round {currentRound} of 3
                    </div>

                    {/* Balance Display */}
                    <div className="glass-card p-6 mb-6 max-w-lg mx-auto">
                        <div className="text-sm text-slate-400 mb-1">Your Portfolio Value</div>
                        <div className="text-4xl font-bold text-white tabular-nums">
                            ${balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        {previousRoundReturn && (
                            <div className={`text-sm mt-2 ${parseFloat(previousRoundReturn) >= 0 ? 'text-gain-400' : 'text-loss-400'}`}>
                                {parseFloat(previousRoundReturn) >= 0 ? '↑' : '↓'} {previousRoundReturn}% overall return
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Card */}
                <div className="glass-card p-8 animate-slide-up" style={{ animationDelay: '150ms' }}>
                    {/* Mystery Year Title */}
                    <div className="text-center mb-6">
                        <div className="text-6xl font-bold gradient-text mb-2">????</div>
                        <h1 className="text-2xl font-bold text-white">Mystery Market Scenario #{currentRound}</h1>
                        <div className="text-slate-400 mt-2">Time Period: Unknown</div>
                    </div>

                    {/* Context (Generic) */}
                    <div className="mb-8 text-center max-w-2xl mx-auto">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-center gap-2">
                            <span>🌍</span> Market Conditions
                        </h3>
                        <p className="text-slate-300 leading-relaxed">
                            Analyze the news and sentiment to figure out where we are in history. The market is shifting—can you spot the trend before the reveal?
                        </p>
                    </div>

                    {/* Mode Selection for Round 1 Only */}
                    {currentRound === 1 && !gameMode ? (
                        <div className="grid md:grid-cols-2 gap-6 mt-8">
                            {/* Chill Mode Card */}
                            <div className="group relative bg-slate-800/50 hover:bg-blue-900/20 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                                onClick={() => handleStart('chill')}>
                                <div>
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🧘</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Chill Mode</h3>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Take your time. Read carefully. Make thoughtful decisions without any pressure.
                                    </p>
                                    <ul className="text-sm text-slate-500 space-y-2 mb-6">
                                        <li className="flex items-center gap-2">✅ No Time Limit</li>
                                        <li className="flex items-center gap-2">✅ Unlimited Reading</li>
                                        <li className="flex items-center gap-2">✅ Learn at Your Pace</li>
                                    </ul>
                                </div>
                                <button className="w-full btn-secondary text-blue-300 border-blue-500/30 hover:bg-blue-500/10">
                                    Play Chill Mode
                                </button>
                            </div>

                            {/* Panic Mode Card */}
                            <div className="group relative bg-slate-800/50 hover:bg-red-900/20 border border-slate-700 hover:border-red-500/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                                onClick={() => handleStart('panic')}>
                                <div>
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Panic Mode</h3>
                                    <p className="text-slate-400 text-sm mb-4">
                                        30 seconds per round. Read fast. Decide faster. Experience real market pressure.
                                    </p>
                                    <ul className="text-sm text-slate-500 space-y-2 mb-6">
                                        <li className="flex items-center gap-2">⚠️ 30 Second Timer</li>
                                        <li className="flex items-center gap-2">⚠️ Auto-Lock at 0:00</li>
                                        <li className="flex items-center gap-2">⚠️ High Pressure Tests</li>
                                    </ul>
                                </div>
                                <button className="w-full btn-secondary text-red-300 border-red-500/30 hover:bg-red-500/10">
                                    Play Panic Mode
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Standard Start Button for Subsequent Rounds or if mode selected */
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => handleStart(gameMode)}
                                className={`btn-primary text-lg py-4 px-12 flex items-center justify-center gap-2 ${gameMode === 'panic' ? 'hover:shadow-red-500/20' : ''}`}
                            >
                                <span>Start Round {currentRound}</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-slate-500 text-sm animate-fade-in" style={{ animationDelay: '300ms' }}>
                    {gameMode === 'panic' ? (
                        <span className="text-red-400/60 font-medium">⚠️ Panic Mode Active: Good Luck!</span>
                    ) : (
                        <span>Powered by real historical data • Learn by doing</span>
                    )}
                </div>
            </div>
        </div>
    );
}
