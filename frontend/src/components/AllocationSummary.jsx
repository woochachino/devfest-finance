// AllocationSummary Component - Shows total allocation with sector-colored progress bar

import { useGame } from '../context/GameContext';
import { sectorColors } from './StockSlider';

// Sector color lookup for stocks (matches k2ThinkApi data)
const stockSectors = {
    // Round 1 - AI Boom
    NVDA: 'Semiconductors', AMD: 'Semiconductors', INTC: 'Semiconductors',
    MSFT: 'Technology', GOOGL: 'Technology', IBM: 'Technology',
    SNAP: 'Social Media', DIS: 'Entertainment', MRNA: 'Biotechnology',
    // Round 2 - Banking Crisis
    JPM: 'Banking', WFC: 'Banking', KRE: 'Banking ETF',
    SCHW: 'Financial Services', GLD: 'Commodities',
    AAPL: 'Technology', PFE: 'Pharmaceuticals',
    VNO: 'Real Estate', COIN: 'Cryptocurrency',
    // Round 3 - Inflation
    XOM: 'Energy', DVN: 'Energy',
    META: 'Technology', AMZN: 'Technology',
    COST: 'Consumer Retail', WMT: 'Consumer Retail', TGT: 'Consumer Retail',
    LMT: 'Defense', TSLA: 'Automotive',
    SPY: 'Index Fund',
};

export default function AllocationSummary() {
    const { getTotalAllocation, balance, allocations, getCurrentRoundData } = useGame();

    const total = getTotalAllocation();
    const isComplete = total === 100;
    const isOverAllocated = total > 100;

    // Get allocations with their sectors for the progress bar
    const roundData = getCurrentRoundData();
    const allocationSegments = roundData?.stocks
        ?.filter(stock => allocations[stock.ticker] > 0)
        ?.map(stock => ({
            ticker: stock.ticker,
            allocation: allocations[stock.ticker],
            sector: stockSectors[stock.ticker] || 'Unknown',
            color: sectorColors[stockSectors[stock.ticker]]?.primary || '#94a3b8'
        })) || [];

    // Calculate cumulative positions for the gradient
    let cumulative = 0;
    const gradientStops = allocationSegments.flatMap(seg => {
        const start = cumulative;
        cumulative += seg.allocation;
        return [
            `${seg.color} ${start}%`,
            `${seg.color} ${cumulative}%`
        ];
    });

    // Add remaining space in gray
    if (cumulative < 100) {
        gradientStops.push(`rgb(51, 65, 85) ${cumulative}%`);
        gradientStops.push(`rgb(51, 65, 85) 100%`);
    }

    const progressGradient = gradientStops.length > 0
        ? `linear-gradient(to right, ${gradientStops.join(', ')})`
        : 'rgb(51, 65, 85)';

    return (
        <div className={`rounded-xl p-5 transition-all duration-300 min-h-[180px] ${isComplete
            ? 'bg-gradient-to-br from-emerald-500/10 to-slate-900/50 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
            : isOverAllocated
                ? 'bg-gradient-to-br from-red-500/10 to-slate-900/50 border border-red-500/40'
                : 'bg-slate-900/50 border border-slate-700/50'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isComplete
                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                            : 'bg-slate-800/50 border border-slate-700/50'
                        }`}>
                        {isComplete ? (
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Portfolio Mix</h3>
                        <div className="text-xs text-slate-500">{allocationSegments.length} positions</div>
                    </div>
                </div>
                <div className={`text-3xl font-bold tabular-nums ${isComplete ? 'text-emerald-400' : isOverAllocated ? 'text-red-400' : 'text-white'
                    }`}>
                    {total}%
                </div>
            </div>

            {/* Sector-colored Progress Bar */}
            <div className="mb-4">
                <div
                    className="h-4 rounded-full overflow-hidden shadow-inner"
                    style={{
                        background: progressGradient,
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                    }}
                />
            </div>

            {/* Sector Legend - Fixed height area */}
            <div className="min-h-[52px]">
                {allocationSegments.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {allocationSegments.map(seg => (
                            <div
                                key={seg.ticker}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/20 border border-slate-700/50"
                            >
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: seg.color }}
                                />
                                <span className="text-[10px] font-bold text-slate-300">{seg.ticker}</span>
                                <span className="text-[10px] text-slate-500">{seg.allocation}%</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-xs text-slate-600">Select stocks to allocate your portfolio</div>
                )}

                {/* Status messages */}
                {isComplete && (
                    <div className="mt-2 flex items-center gap-2 text-emerald-400 text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Ready to execute!
                    </div>
                )}
            </div>
        </div>
    );
}
