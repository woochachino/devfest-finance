// PortfolioPage - Split screen with articles and stock allocation

import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import ArticleCard from '../components/ArticleCard';
import StockSlider from '../components/StockSlider';
import AllocationSummary from '../components/AllocationSummary';
import Timer from '../components/Timer';

export default function PortfolioPage() {
    const {
        currentRound,
        balance,
        getCurrentRoundData,
        getTotalAllocation,
        lockInPortfolio,
        gameMode,
        allocations,
        setStockAllocation
    } = useGame();

    const navigate = useNavigate();
    const roundData = getCurrentRoundData();
    const totalAllocation = getTotalAllocation();
    const isComplete = totalAllocation === 100;

    const handleLockIn = () => {
        lockInPortfolio();
        navigate('/results');
    };

    // Auto-lock when timer hits 0 in Panic Mode
    const handleTimeUp = () => {
        // Force normalization or just accept as is?
        // Brief says: 
        // < 100%: Remainder to cash (0% return) - logic handles this naturally as untracked %
        // > 100%: Normalize to 100%

        if (totalAllocation > 100) {
            // Simple normalization
            const factor = 100 / totalAllocation;
            roundData.stocks.forEach(stock => {
                const current = allocations[stock.ticker] || 0;
                setStockAllocation(stock.ticker, Math.floor(current * factor));
            });
        }

        // Brief delay to show "Time's Up" feeling?
        // For now, immediate lock
        handleLockIn();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Panic Mode Timer */}
            {gameMode === 'panic' && (
                <Timer duration={30} onTimeUp={handleTimeUp} />
            )}

            {/* Header */}
            <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="px-3 py-1 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 text-sm font-medium">
                                Round {currentRound}/3
                            </div>
                            <div>
                                {/* Mystery Year: Hide specific title/year */}
                                <h1 className="text-lg font-bold text-white">Mystery Scenario #{currentRound}</h1>
                                <p className="text-sm text-slate-400">Time: Unknown Market Cycle</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-400">Portfolio Value</div>
                            <div className="text-xl font-bold text-white tabular-nums">
                                ${balance.toLocaleString('en-US')}
                            </div>
                        </div>
                    </div>
                    {/* Navigation Buttons for Portfolio */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <button
                            onClick={() => navigate('/intro')}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            ← Back
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content - Split Screen */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid lg:grid-cols-5 gap-6">
                    {/* Left Panel - Articles (40%) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="sticky top-24">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="text-xl">📰</span>
                                Market News & Sentiment
                            </h2>
                            <p className="text-sm text-slate-400 mb-4">
                                These are real historical posts. Can you identify the market cycle?
                            </p>

                            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                                {roundData.articles.map((article) => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Portfolio Builder (60%) */}
                    <div className="lg:col-span-3 space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="text-xl">💼</span>
                                Build Your Portfolio
                            </h2>
                            <p className="text-sm text-slate-400 mb-4">
                                Allocate your ${balance.toLocaleString('en-US')} across these assets. You must allocate exactly 100%.
                            </p>

                            {/* Allocation Summary */}
                            <AllocationSummary />
                        </div>

                        {/* Stock Sliders */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {roundData.stocks.map((stock) => (
                                <StockSlider key={stock.ticker} stock={stock} />
                            ))}
                        </div>

                        {/* Lock In Button */}
                        <div className="sticky bottom-6 pt-4">
                            <button
                                onClick={handleLockIn}
                                disabled={!isComplete}
                                className={`btn-primary w-full text-lg py-4 flex items-center justify-center gap-2 ${!isComplete ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isComplete ? (
                                    <>
                                        <span>🔒</span>
                                        <span>Lock In Portfolio</span>
                                    </>
                                ) : (
                                    <>
                                        <span>⚠️</span>
                                        <span>Allocate exactly 100% to continue</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
