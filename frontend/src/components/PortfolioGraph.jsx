import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { stockPrices } from '../data/stockPrices';

function computePortfolioTimeSeries(roundId, allocations, initialBalance) {
    const roundData = stockPrices[roundId];
    if (!roundData) return [];

    const allTickers = Object.keys(roundData.tickers);

    // Build price lookup: { NVDA: { "2023-01-03": 143.15, ... }, ... }
    const priceLookup = {};
    const initialPrices = {};
    allTickers.forEach((ticker) => {
        priceLookup[ticker] = {};
        roundData.tickers[ticker].forEach((p) => {
            priceLookup[ticker][p.date] = p.close;
        });
    });

    // Collect all unique dates, sorted
    const dateSet = new Set();
    allTickers.forEach((ticker) => {
        roundData.tickers[ticker].forEach((p) => dateSet.add(p.date));
    });
    const dates = [...dateSet].sort();

    if (dates.length === 0) return [];

    // Get day-0 prices
    const firstDate = dates[0];
    allTickers.forEach((ticker) => {
        initialPrices[ticker] = priceLookup[ticker][firstDate];
    });

    // Track last known prices for forward-fill
    const lastKnown = {};
    allTickers.forEach((t) => {
        lastKnown[t] = initialPrices[t];
    });

    return dates.map((date) => {
        let playerValue = 0;

        allTickers.forEach((ticker) => {
            const price = priceLookup[ticker][date] ?? lastKnown[ticker];
            lastKnown[ticker] = price;

            if (!price || !initialPrices[ticker]) return;
            const priceRatio = price / initialPrices[ticker];

            const alloc = allocations[ticker] || 0;
            playerValue += (alloc / 100) * initialBalance * priceRatio;
        });

        return {
            date,
            player: Math.round(playerValue * 100) / 100,
        };
    });
}

function formatMonth(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short' });
}

function formatFullDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#0f172a] border border-slate-700 rounded px-3 py-2 text-xs shadow-xl">
            <div className="text-slate-400 mb-1 font-mono">{formatFullDate(label)}</div>
            {payload.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                    <span className="text-slate-300">{entry.name}:</span>
                    <span className="font-mono font-bold" style={{ color: entry.color }}>
                        ${entry.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function PortfolioGraph({ roundId, allocations, initialBalance = 10000, onAnimationComplete }) {
    const data = useMemo(
        () => computePortfolioTimeSeries(roundId, allocations, initialBalance),
        [roundId, allocations, initialBalance]
    );

    if (!data.length) {
        return (
            <div className="h-[400px] flex items-center justify-center text-slate-500">
                No price data available for this round.
            </div>
        );
    }

    const finalPlayer = data[data.length - 1]?.player ?? initialBalance;
    const totalReturn = ((finalPlayer - initialBalance) / initialBalance) * 100;
    const isPositive = totalReturn >= 0;

    // Filter to ~monthly ticks for x-axis
    const monthTicks = [];
    let lastMonth = null;
    data.forEach((d) => {
        const month = d.date.slice(0, 7);
        if (month !== lastMonth) {
            monthTicks.push(d.date);
            lastMonth = month;
        }
    });

    return (
        <div>
            {/* Summary bar */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-4">
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Starting Value</div>
                        <div className="font-mono text-white text-lg">${initialBalance.toLocaleString()}</div>
                    </div>
                    <div className="text-slate-600 text-2xl font-light">&rarr;</div>
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Final Value</div>
                        <div className={`font-mono text-lg font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            ${Math.round(finalPlayer).toLocaleString()}
                        </div>
                    </div>
                </div>
                <div className={`font-mono text-2xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{totalReturn.toFixed(1)}%
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={380}>
                <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                        dataKey="date"
                        stroke="#334155"
                        tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                        ticks={monthTicks}
                        tickFormatter={formatMonth}
                    />
                    <YAxis
                        stroke="#334155"
                        tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                        domain={['dataMin - 500', 'dataMax + 500']}
                        width={55}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#94a3b8' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="player"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        dot={false}
                        name="Your Portfolio"
                        animationDuration={3000}
                        animationEasing="ease-in-out"
                        onAnimationEnd={onAnimationComplete}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
