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
        <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans selection:bg-amber-500/30">
            {/* Panic Mode Timer */}
            {gameMode === 'panic' && (
                <div className="fixed top-0 left-0 w-full h-1 z-50">
                    <Timer duration={30} onTimeUp={handleTimeUp} />
                </div>
            )}

            {/* Terminal Header */}
            <header className="sticky top-0 z-40 bg-[#0b0f19] border-b border-slate-800">
                <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${gameMode === 'panic' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                            <span className="font-mono text-xs text-slate-400 uppercase tracking-widest">
                                {gameMode === 'panic' ? 'LIVE TRADING' : 'MARKET OPEN'}
                            </span>
                        </div>
                        <div className="h-4 w-[1px] bg-slate-800"></div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-amber-500 text-sm font-bold">SCENARIO 0{currentRound}</span>
                            <span className="text-slate-600 text-xs uppercase tracking-wider">// MYSTERY CYCLE</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Net Liq Value</div>
                            <div className="font-mono-numbers text-lg text-white font-bold tracking-tight">
                                ${balance.toLocaleString('en-US')}
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/intro')}
                            className="text-xs font-mono text-slate-500 hover:text-white uppercase tracking-widest border border-slate-800 hover:border-slate-600 px-3 py-1 rounded"
                        >
                            Abort
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-3.5rem)]">

                {/* Left Panel: News Wire (40%) */}
                <div className="lg:col-span-5 flex flex-col h-full overflow-hidden bg-slate-900/50 border border-slate-800 rounded-sm">
                    <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="text-lg">NEWS</span> WIRES
                        </h2>
                        <span className="text-[10px] font-mono text-slate-600">LIVE FEED • {roundData.articles.length} ITEMS</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {roundData.articles.map((article) => (
                            <div key={article.id} className="group transition-all duration-200 hover:bg-slate-800/50 rounded-sm">
                                <ArticleCard article={article} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Order Entry (60%) */}
                <div className="lg:col-span-7 flex flex-col h-full bg-slate-900/30 border border-slate-800 rounded-sm">
                    <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="text-lg">ORDER</span> ENTRY
                        </h2>
                        <span className="text-[10px] font-mono text-slate-600">ALLOCATION REQUIRED: 100%</span>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                        {/* Allocation Visualization */}
                        <div className="mb-8 p-4 bg-slate-900 border border-slate-800 rounded-sm">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs text-slate-500 uppercase tracking-widest">Portfolio Exposure</span>
                                <span className={`font-mono-numbers text-sm font-bold ${isComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {totalAllocation}% / 100%
                                </span>
                            </div>
                            <AllocationSummary />
                        </div>

                        {/* Order Tickets (Sliders) */}
                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                            {roundData.stocks.map((stock) => (
                                <div key={stock.ticker} className="bg-slate-900 border border-slate-800 p-4 hover:border-slate-600 transition-colors">
                                    <StockSlider stock={stock} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Execution Footer */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900/80">
                        <div className="flex items-center justify-between gap-4">
                            <div className="text-xs text-slate-500 max-w-md">
                                {isComplete ?
                                    <span className="text-emerald-500 flex items-center gap-2">
                                        ✓ PORTFOLIO BALANCED. READY FOR EXECUTION.
                                    </span>
                                    :
                                    <span className="text-amber-500 flex items-center gap-2 animate-pulse">
                                        ⚠ IMBALANCED PORTFOLIO. ADJUST EXPECTATIONS.
                                    </span>
                                }
                            </div>

                            <button
                                onClick={handleLockIn}
                                disabled={!isComplete}
                                className={`
                                    px-8 py-4 font-bold tracking-widest uppercase text-sm transition-all duration-200
                                    ${isComplete
                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 hover:scale-[1.02]'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}
                                `}
                            >
                                {isComplete ? 'EXECUTE ORDER' : 'AWAITING INPUT'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
