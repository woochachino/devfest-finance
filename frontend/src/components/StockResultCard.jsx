// StockResultCard Component - Displays individual stock performance

export default function StockResultCard({ result, delay = 0 }) {
    const isPositive = result.returnPercent >= 0;

    return (
        <div
            className="glass-card p-5 animate-slide-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center text-2xl">
                        {result.emoji}
                    </div>
                    <div>
                        <div className="font-bold text-lg text-white">{result.ticker}</div>
                        <div className="text-sm text-slate-400">{result.name}</div>
                    </div>
                </div>

                <div className={`text-3xl font-bold ${isPositive ? 'text-gain-400' : 'text-loss-400'}`}>
                    {isPositive ? '📈' : '📉'}
                </div>
            </div>

            {/* Return Percentage - Large and Prominent */}
            <div className={`text-center py-4 rounded-xl mb-4 ${isPositive ? 'bg-gain-500/10' : 'bg-loss-500/10'
                }`}>
                <div className={`text-4xl font-bold tabular-nums ${isPositive ? 'text-gain-400' : 'text-loss-400'
                    }`}>
                    {isPositive ? '+' : ''}{result.returnPercent.toFixed(1)}%
                </div>
                <div className="text-sm text-slate-400 mt-1">Total Return</div>
            </div>

            {/* Money Flow */}
            <div className="flex items-center justify-between text-sm">
                <div>
                    <div className="text-slate-400">Invested</div>
                    <div className="font-semibold text-white tabular-nums">
                        ${result.initialAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                </div>

                <div className="flex items-center text-slate-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>

                <div className="text-right">
                    <div className="text-slate-400">Final Value</div>
                    <div className={`font-semibold tabular-nums ${isPositive ? 'text-gain-400' : 'text-loss-400'}`}>
                        ${result.finalAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                </div>
            </div>

            {/* Gain/Loss Amount */}
            <div className={`mt-3 pt-3 border-t border-slate-700/50 text-center`}>
                <span className={`font-semibold ${isPositive ? 'text-gain-400' : 'text-loss-400'}`}>
                    {isPositive ? '+' : ''}${result.gain.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <span className="text-slate-500 ml-1">
                    {isPositive ? 'profit' : 'loss'}
                </span>
            </div>
        </div>
    );
}
