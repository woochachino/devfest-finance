// PortfolioPage - Split screen with articles and stock allocation

import { useGame } from '../context/GameContext';
import ArticleCard from '../components/ArticleCard';
import StockSlider from '../components/StockSlider';
import AllocationSummary from '../components/AllocationSummary';

export default function PortfolioPage() {
    const {
        currentRound,
        balance,
        getCurrentRoundData,
        getTotalAllocation,
        lockInPortfolio
    } = useGame();

    const roundData = getCurrentRoundData();
    const totalAllocation = getTotalAllocation();
    const isComplete = totalAllocation === 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="px-3 py-1 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 text-sm font-medium">
                                Round {currentRound}/3
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">{roundData.title}</h1>
                                <p className="text-sm text-slate-400">{roundData.period}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-400">Portfolio Value</div>
                            <div className="text-xl font-bold text-white tabular-nums">
                                ${balance.toLocaleString('en-US')}
                            </div>
                        </div>
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
                                These are real posts from {roundData.year}. What would you have believed?
                            </p>

                            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
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
                                onClick={lockInPortfolio}
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
