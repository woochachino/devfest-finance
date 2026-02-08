// WelcomePage - Shows round info, context, and start button

import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

export default function WelcomePage() {
    const { currentRound, balance, getCurrentRoundData, startRound, roundHistory } = useGame();
    const navigate = useNavigate();
    const roundData = getCurrentRoundData();

    const handleStart = () => {
        startRound();
        navigate('/portfolio');
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Round Badge */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 font-medium mb-4">
                        <span className="text-lg">🎮</span>
                        Round {currentRound} of 3
                    </div>

                    {/* Balance Display */}
                    <div className="glass-card p-6 mb-6">
                        <div className="text-sm text-slate-400 mb-1">Your Portfolio Value</div>
                        <div className="text-4xl font-bold text-white tabular-nums">
                            ${balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>

                    </div>
                </div>

                {/* Main Card */}
                <div className="glass-card p-8 animate-slide-up" style={{ animationDelay: '150ms' }}>
                    {/* Year & Title */}
                    <div className="text-center mb-6">
                        <div className="text-6xl font-bold gradient-text mb-2">{roundData.year}</div>
                        <h1 className="text-2xl font-bold text-white">{roundData.title}</h1>
                        <div className="text-slate-400 mt-2">{roundData.period}</div>
                    </div>

                    {/* Description */}
                    <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
                        <p className="text-lg text-white/90 leading-relaxed text-center">
                            {roundData.description}
                        </p>
                    </div>

                    {/* Context */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span>🌍</span> World Context
                        </h3>
                        <p className="text-slate-300 leading-relaxed">
                            {roundData.context}
                        </p>
                    </div>

                    {/* What You'll Do */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                            <div className="text-2xl mb-2">📰</div>
                            <div className="text-sm text-slate-300">Read {roundData.articles.length} Articles</div>
                        </div>
                        <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                            <div className="text-2xl mb-2">💼</div>
                            <div className="text-sm text-slate-300">Pick {roundData.stocks.length} Stocks</div>
                        </div>
                        <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                            <div className="text-2xl mb-2">📈</div>
                            <div className="text-sm text-slate-300">See Real Returns</div>
                        </div>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={handleStart}
                        className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
                    >
                        <span>Start Round {currentRound}</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-slate-500 text-sm animate-fade-in" style={{ animationDelay: '300ms' }}>
                    Powered by real historical data • Learn by doing
                </div>
            </div>
        </div>
    );
}
