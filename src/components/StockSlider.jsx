// StockSlider Component - Individual stock allocation slider

import { useGame } from '../context/GameContext';

export default function StockSlider({ stock }) {
    const { allocations, setStockAllocation, balance } = useGame();

    const allocation = allocations[stock.ticker] || 0;
    const dollarAmount = (allocation / 100) * balance;

    const handleChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setStockAllocation(stock.ticker, value);
    };

    return (
        <div className="stock-card">
            <div className="flex items-center justify-between mb-3">
                {/* Stock Info */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-xl">
                        {stock.emoji}
                    </div>
                    <div>
                        <div className="font-bold text-white">{stock.ticker}</div>
                        <div className="text-sm text-slate-400">{stock.name}</div>
                    </div>
                </div>

                {/* Allocation Display */}
                <div className="text-right">
                    <div className="font-bold text-xl text-white tabular-nums">
                        {allocation}%
                    </div>
                    <div className="text-sm text-slate-400 tabular-nums">
                        ${dollarAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                </div>
            </div>

            {/* Slider */}
            <div className="relative">
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={allocation}
                    onChange={handleChange}
                    className="input-range w-full"
                    style={{
                        background: `linear-gradient(to right, 
              rgb(59, 130, 246) ${allocation}%, 
              rgb(51, 65, 85) ${allocation}%)`
                    }}
                />

                {/* Tick marks */}
                <div className="flex justify-between text-xs text-slate-600 mt-1 px-0.5">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                </div>
            </div>
        </div>
    );
}
