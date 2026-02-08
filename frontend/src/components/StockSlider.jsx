// StockSlider Component - Gamified stock allocation slider with sector-based colors

import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import StockIcon from './StockIcon';
import { getStockInfo } from '../services/k2ThinkApi';

// Sector color palette for consistent theming
export const sectorColors = {
    'Semiconductors': { primary: '#06b6d4', bg: 'from-cyan-500/20', border: 'border-cyan-500/40', text: 'text-cyan-400', glow: 'shadow-cyan-500/30' },
    'Technology': { primary: '#a855f7', bg: 'from-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400', glow: 'shadow-purple-500/30' },
    'Banking': { primary: '#f59e0b', bg: 'from-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400', glow: 'shadow-amber-500/30' },
    'Banking ETF': { primary: '#f59e0b', bg: 'from-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400', glow: 'shadow-amber-500/30' },
    'Financial Services': { primary: '#eab308', bg: 'from-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400', glow: 'shadow-yellow-500/30' },
    'Energy': { primary: '#22c55e', bg: 'from-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', glow: 'shadow-emerald-500/30' },
    'Biotechnology': { primary: '#ec4899', bg: 'from-pink-500/20', border: 'border-pink-500/40', text: 'text-pink-400', glow: 'shadow-pink-500/30' },
    'Pharmaceuticals': { primary: '#f43f5e', bg: 'from-rose-500/20', border: 'border-rose-500/40', text: 'text-rose-400', glow: 'shadow-rose-500/30' },
    'Entertainment': { primary: '#8b5cf6', bg: 'from-violet-500/20', border: 'border-violet-500/40', text: 'text-violet-400', glow: 'shadow-violet-500/30' },
    'Social Media': { primary: '#3b82f6', bg: 'from-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
    'Commodities': { primary: '#fbbf24', bg: 'from-yellow-400/20', border: 'border-yellow-400/40', text: 'text-yellow-300', glow: 'shadow-yellow-400/30' },
    'Real Estate': { primary: '#14b8a6', bg: 'from-teal-500/20', border: 'border-teal-500/40', text: 'text-teal-400', glow: 'shadow-teal-500/30' },
    'Cryptocurrency': { primary: '#f97316', bg: 'from-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-400', glow: 'shadow-orange-500/30' },
    'Consumer Retail': { primary: '#0ea5e9', bg: 'from-sky-500/20', border: 'border-sky-500/40', text: 'text-sky-400', glow: 'shadow-sky-500/30' },
    'Defense': { primary: '#64748b', bg: 'from-slate-500/20', border: 'border-slate-400/40', text: 'text-slate-300', glow: 'shadow-slate-500/30' },
    'Automotive': { primary: '#ef4444', bg: 'from-red-500/20', border: 'border-red-500/40', text: 'text-red-400', glow: 'shadow-red-500/30' },
    'Index Fund': { primary: '#6366f1', bg: 'from-indigo-500/20', border: 'border-indigo-500/40', text: 'text-indigo-400', glow: 'shadow-indigo-500/30' },
    'Telecommunications': { primary: '#0891b2', bg: 'from-cyan-600/20', border: 'border-cyan-600/40', text: 'text-cyan-500', glow: 'shadow-cyan-600/30' },
    'Unknown': { primary: '#94a3b8', bg: 'from-slate-500/20', border: 'border-slate-500/40', text: 'text-slate-400', glow: 'shadow-slate-500/30' },
};

export default function StockSlider({ stock, mpAllocations, mpSetAllocation, mpBalance, mpGetTotal }) {
    const game = useGame();
    // Use multiplayer props if provided, otherwise fall back to GameContext
    const allocations = mpAllocations || game.allocations;
    const setStockAllocation = mpSetAllocation || game.setStockAllocation;
    const balance = mpBalance ?? game.balance;
    const getTotalAllocation = mpGetTotal || game.getTotalAllocation;
    const [showInfo, setShowInfo] = useState(false);
    const [stockInfo, setStockInfo] = useState(null);

    const allocation = allocations[stock.ticker] || 0;
    const dollarAmount = (allocation / 100) * balance;
    const totalAllocation = getTotalAllocation();

    // Fetch stock info when component mounts
    useEffect(() => {
        const fetchInfo = async () => {
            const info = await getStockInfo(stock.ticker);
            setStockInfo(info);
        };
        fetchInfo();
    }, [stock.ticker]);

    const handleChange = (e) => {
        const value = parseInt(e.target.value, 10);
        const otherAllocations = totalAllocation - allocation;
        const maxAllowed = 100 - otherAllocations;
        const cappedValue = Math.min(value, maxAllowed);
        setStockAllocation(stock.ticker, cappedValue);
    };

    // Get sector colors
    const sector = stockInfo?.sector || 'Unknown';
    const colors = sectorColors[sector] || sectorColors['Unknown'];
    const isActive = allocation > 0;


    return (
        <div
            className={`relative rounded-xl transition-all duration-300 ${isActive
                ? `bg-gradient-to-br ${colors.bg} to-slate-900/80 ${colors.border} border shadow-lg ${colors.glow}`
                : 'bg-slate-900/60 border border-slate-700/50 hover:border-slate-600'
                }`}
            style={{
                zIndex: showInfo ? 9999 : 1,
                boxShadow: !isActive ? `0 4px 12px ${colors.primary}25` : undefined
            }}
        >
            <div className="p-4 relative">
                <div className="flex items-center justify-between mb-4">
                    {/* Stock Info */}
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${isActive
                                ? `bg-gradient-to-br ${colors.bg} to-transparent border ${colors.border}`
                                : 'bg-slate-800/50 border border-slate-700/50'
                                }`}
                        >
                            <StockIcon name={stock.icon} className={`w-6 h-6 ${isActive ? colors.text : 'text-slate-400'}`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`font-bold text-lg ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                    {stock.ticker}
                                </span>
                                {/* Sector badge */}
                                {stockInfo && (
                                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${colors.text} bg-black/30 border ${colors.border}`}>
                                        {sector.split(' ')[0]}
                                    </span>
                                )}
                                {/* Info Icon */}
                                <div
                                    className="relative"
                                    onMouseEnter={() => setShowInfo(true)}
                                    onMouseLeave={() => setShowInfo(false)}
                                >
                                    <button className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${isActive
                                        ? `${colors.text} bg-black/30 hover:bg-black/50`
                                        : 'text-slate-500 bg-slate-700/50 hover:bg-slate-600/50'
                                        }`}>
                                        ?
                                    </button>

                                    {/* Info Tooltip */}
                                    {showInfo && stockInfo && (
                                        <div className={`absolute z-[99999] bottom-full left-0 mb-2 w-64 p-3 bg-slate-900/95 backdrop-blur-sm border rounded-lg shadow-2xl animate-fade-in ${colors.border}`}>
                                            <p className="text-xs text-slate-300 leading-relaxed">
                                                {stockInfo.description}
                                            </p>
                                            <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-slate-900/95 border-r border-b border-slate-700 transform rotate-45"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-sm text-slate-500">{stock.name}</div>
                        </div>
                    </div>

                    {/* Allocation Display */}
                    <div className="text-right">
                        <div className={`font-bold text-2xl tabular-nums transition-colors ${isActive ? colors.text : 'text-slate-500'}`}>
                            {allocation}%
                        </div>
                        <div className={`text-sm tabular-nums ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>
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
                        step="1"
                        value={allocation}
                        onChange={handleChange}
                        className="input-range w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, ${colors.primary} ${allocation}%, rgb(51, 65, 85) ${allocation}%)`
                        }}
                    />

                    {/* Progress indicators */}
                    <div className="flex justify-between text-[10px] text-slate-600 mt-2 px-0.5">
                        <span>0</span>
                        <span>25</span>
                        <span>50</span>
                        <span>75</span>
                        <span>100</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
