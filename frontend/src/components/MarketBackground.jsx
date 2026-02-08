import AnimatedStockChart from './AnimatedStockChart';

export default function MarketBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Animated Stock Chart Canvas */}
            <AnimatedStockChart />

            {/* Ticker Tape - Top */}
            <div className="absolute top-20 left-0 right-0 flex overflow-hidden opacity-20 z-10">
                <div className="animate-ticker-slide flex gap-8 whitespace-nowrap text-xs font-mono text-emerald-500/50">
                    {Array(20).fill('BTC +5.2%  ETH +3.1%  SPY +0.8%  NVDA +2.4%  TSLA -1.2%  AAPL +0.5%  MSFT +0.9%  GOOGL +1.1%  AMZN +0.7%  META +1.5%').map((text, i) => (
                        <span key={i}>{text}</span>
                    ))}
                </div>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f19] via-transparent to-[#0b0f19] z-20"></div>
        </div>
    );
}
