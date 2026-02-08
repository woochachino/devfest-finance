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
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Grid/Effect */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 opacity-50"></div>

            {/* Navigation Buttons */}
            <div className="absolute top-6 left-6 z-20">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-mono text-xs uppercase tracking-widest"
                >
                    <span className="text-lg">←</span> BACK
                </button>
            </div>

            <div className="absolute top-6 right-6 z-20">
                <button
                    onClick={handleHome}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-mono text-xs uppercase tracking-widest"
                >
                    ABORT SESSION <span className="text-lg">×</span>
                </button>
            </div>

            <div className="max-w-5xl w-full z-10 grid md:grid-cols-12 gap-8">

                {/* Left Column: Status & Stats */}
                <div className="md:col-span-4 space-y-4 animate-slide-right">
                    {/* Round Badge */}
                    <div className="bg-slate-900 border border-slate-700 p-6 relative overflow-hidden group hover:border-slate-500 transition-colors">
                        <div className="absolute top-0 right-0 p-2 opacity-10 text-9xl font-bold leading-none select-none transition-transform group-hover:scale-110 duration-500">
                            {currentRound}
                        </div>
                        <div className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-widest">Target Scenario</div>
                        <div className="text-4xl font-bold text-white mb-1">0{currentRound} <span className="text-lg text-slate-600 font-light">/ 03</span></div>
                        <div className="inline-block mt-2 px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-mono uppercase tracking-widest border border-emerald-500/20">
                            Status: Active
                        </div>
                    </div>

                    {/* Balance Display */}
                    <div className="bg-slate-900 border border-slate-700 p-6 group hover:border-amber-500/30 transition-colors">
                        <div className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-widest">Available Capital</div>
                        <div className="text-3xl font-mono-numbers text-white tracking-tight">
                            ${balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        {previousRoundReturn && (
                            <div className={`text-xs font-mono mt-3 pb-1 border-b ${parseFloat(previousRoundReturn) >= 0 ? 'text-emerald-400 border-emerald-500/30' : 'text-red-400 border-red-500/30'} inline-block`}>
                                {parseFloat(previousRoundReturn) >= 0 ? '▲' : '▼'} {previousRoundReturn}% Yield (Prev.)
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Briefing & Actions */}
                <div className="md:col-span-8">
                    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-8 md:p-10 relative animate-slide-up">
                        {/* Decorative Corner */}
                        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                            <div className="absolute top-0 right-0 w-full h-full bg-slate-800 rotate-45 transform translate-x-1/2 -translate-y-1/2"></div>
                        </div>

                        {/* Mystery Year Title */}
                        <div className="mb-8 border-b border-slate-800 pb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                <span className="text-xs font-mono text-amber-500 uppercase tracking-widest">Market Intelligence Brief</span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                                Mystery Scenario #{currentRound}
                            </h1>
                            <div className="font-mono text-slate-500 text-sm">{new Date().toLocaleDateString().toUpperCase()} // [REDACTED TIMEFRAME]</div>
                        </div>

                        {/* Context */}
                        <div className="mb-10 space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="w-4 h-[1px] bg-slate-600"></span>
                                    SITUATION REPORT
                                </h3>
                                <p className="text-slate-300 leading-relaxed text-lg font-light border-l-2 border-slate-700 pl-4">
                                    "Analyze the news and sentiment to figure out where we are in history. The market is shifting—can you spot the trend before the reveal?"
                                </p>
                            </div>
                        </div>

                        {/* Mode Selection or Start */}
                        {currentRound === 1 && !gameMode ? (
                            <div className="grid md:grid-cols-2 gap-4 mt-8">
                                {/* Chill Mode */}
                                <button onClick={() => handleStart('chill')} className="group text-left p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-blue-400 transition-all duration-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-mono text-blue-400 uppercase">Option A</span>
                                        <span className="text-slate-500 group-hover:text-blue-400">→</span>
                                    </div>
                                    <div className="font-bold text-white mb-1">Chill Mode</div>
                                    <div className="text-xs text-slate-400">Take your time. Analyze deeply.</div>
                                </button>

                                {/* Panic Mode */}
                                <button onClick={() => handleStart('panic')} className="group text-left p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-red-400 transition-all duration-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-mono text-red-400 uppercase">Option B</span>
                                        <span className="text-slate-500 group-hover:text-red-400">→</span>
                                    </div>
                                    <div className="font-bold text-white mb-1">Panic Mode</div>
                                    <div className="text-xs text-slate-400">30s limit. High pressure.</div>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleStart(gameMode)}
                                className="w-full group btn-primary flex items-center justify-between text-lg py-5 px-8 bg-white text-slate-900 hover:bg-slate-200 border-none"
                            >
                                <span className="font-bold tracking-tight">INITIATE TRADING SEQUENCE</span>
                                <span className="font-mono text-sm opacity-50 group-hover:translate-x-1 transition-transform">ENTER MARKET →</span>
                            </button>
                        )}

                        {/* Footer Info */}
                        <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center text-xs font-mono text-slate-600">
                            <span>SECURE CONNECTION</span>
                            <span>{gameMode === 'panic' ? '⚠️ HIGH VOLATILITY EXPECTED' : 'STANDARD PROTOCOL'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
