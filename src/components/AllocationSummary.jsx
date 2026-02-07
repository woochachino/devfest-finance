// AllocationSummary Component - Shows total allocation with progress bar

import { useGame } from '../context/GameContext';

export default function AllocationSummary() {
    const { getTotalAllocation, balance, allocations } = useGame();

    const total = getTotalAllocation();
    const isComplete = total === 100;
    const isOverAllocated = total > 100;
    const cashRemaining = ((100 - total) / 100) * balance;

    // Count how many stocks have allocations
    const allocatedStocks = Object.values(allocations).filter(v => v > 0).length;

    return (
        <div className={`glass-card p-5 transition-all duration-300 ${isComplete ? 'border-gain-500/50 bg-gain-500/5' :
                isOverAllocated ? 'border-loss-500/50 bg-loss-500/5' :
                    'border-primary-500/30'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Portfolio Allocation</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${isComplete ? 'bg-gain-500/20 text-gain-400' :
                        isOverAllocated ? 'bg-loss-500/20 text-loss-400' :
                            'bg-slate-700 text-slate-300'
                    }`}>
                    {allocatedStocks} stocks selected
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${isComplete ? 'bg-gradient-to-r from-gain-500 to-gain-400' :
                                isOverAllocated ? 'bg-gradient-to-r from-loss-500 to-loss-400' :
                                    'bg-gradient-to-r from-primary-500 to-primary-400'
                            }`}
                        style={{ width: `${Math.min(total, 100)}%` }}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between">
                <div>
                    <div className={`text-3xl font-bold tabular-nums ${isComplete ? 'text-gain-400' :
                            isOverAllocated ? 'text-loss-400' :
                                'text-white'
                        }`}>
                        {total}%
                    </div>
                    <div className="text-sm text-slate-400">Total Allocated</div>
                </div>

                {!isComplete && !isOverAllocated && (
                    <div className="text-right">
                        <div className="text-xl font-semibold text-slate-300 tabular-nums">
                            ${cashRemaining.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-sm text-slate-400">Unallocated (Cash)</div>
                    </div>
                )}

                {isComplete && (
                    <div className="flex items-center gap-2 text-gain-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">Ready to invest!</span>
                    </div>
                )}

                {isOverAllocated && (
                    <div className="flex items-center gap-2 text-loss-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="font-semibold">Over-allocated by {total - 100}%</span>
                    </div>
                )}
            </div>

            {/* Helper text */}
            {!isComplete && !isOverAllocated && total > 0 && (
                <p className="mt-3 text-sm text-slate-400">
                    Add {100 - total}% more to fully invest your portfolio
                </p>
            )}
        </div>
    );
}
