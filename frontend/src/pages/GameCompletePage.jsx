// GameCompletePage - Final summary after all 3 rounds

import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { gameData } from '../data/gameData';

export default function GameCompletePage() {
    const navigate = useNavigate();
    const { balance, roundHistory, resetGame } = useGame();

    const initialBalance = gameData.initialBalance;
    const totalReturn = ((balance - initialBalance) / initialBalance * 100);
    const isPositive = totalReturn >= 0;

    // Calculate stats
    const bestRound = roundHistory.reduce((best, round) => {
        const roundReturn = round.results?.overallReturn || 0;
        return roundReturn > (best?.results?.overallReturn || -Infinity) ? round : best;
    }, null);

    const worstRound = roundHistory.reduce((worst, round) => {
        const roundReturn = round.results?.overallReturn || 0;
        return roundReturn < (worst?.results?.overallReturn || Infinity) ? round : worst;
    }, null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Trophy Animation */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4 animate-float">
                        <span className="text-5xl">🏆</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Game Complete!</h1>
                    <p className="text-xl text-slate-400">You survived 3 market cycles</p>
                </div>

                {/* Final Results Card */}
                <div className="glass-card p-8 mb-6 animate-slide-up">
                    {/* Main Stats */}
                    <div className="text-center mb-8">
                        <div className="text-sm text-slate-400 mb-2">Final Portfolio Value</div>
                        <div className={`text-5xl font-bold tabular-nums mb-2 ${isPositive ? 'text-gain-400' : 'text-loss-400'}`}>
                            ${balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <div className={`text-2xl font-semibold ${isPositive ? 'text-gain-400' : 'text-loss-400'}`}>
                            {isPositive ? '+' : ''}{totalReturn.toFixed(1)}% Total Return
                        </div>
                    </div>

                    {/* Journey */}
                    <div className="grid grid-cols-4 gap-2 mb-8">
                        {/* Start */}
                        <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                            <div className="text-sm text-slate-400">Start</div>
                            <div className="font-bold text-white">${initialBalance.toLocaleString()}</div>
                        </div>

                        {/* Round Results */}
                        {roundHistory.map((round, index) => (
                            <div key={index} className="text-center p-3 bg-slate-800/50 rounded-xl">
                                <div className="text-sm text-slate-400">R{round.round}</div>
                                <div className={`font-bold ${round.results?.overallReturn >= 0 ? 'text-gain-400' : 'text-loss-400'}`}>
                                    {round.results?.overallReturn >= 0 ? '+' : ''}{round.results?.overallReturn?.toFixed(0)}%
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Performance Insights */}
                    <div className="space-y-4 mb-8">
                        {bestRound && (
                            <div className="flex items-center justify-between p-4 bg-gain-500/10 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🌟</span>
                                    <div>
                                        <div className="font-semibold text-white">Best Round</div>
                                        <div className="text-sm text-slate-400">Round {bestRound.round}</div>
                                    </div>
                                </div>
                                <div className="text-gain-400 font-bold">
                                    +{bestRound.results?.overallReturn?.toFixed(1)}%
                                </div>
                            </div>
                        )}

                        {worstRound && worstRound !== bestRound && (
                            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">↓</span>
                                    <div>
                                        <div className="font-semibold text-white">Toughest Round</div>
                                        <div className="text-sm text-slate-400">Round {worstRound.round}</div>
                                    </div>
                                </div>
                                <div className={`font-bold ${worstRound.results?.overallReturn >= 0 ? 'text-gain-400' : 'text-loss-400'}`}>
                                    {worstRound.results?.overallReturn >= 0 ? '+' : ''}{worstRound.results?.overallReturn?.toFixed(1)}%
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Key Takeaways */}
                    <div className="bg-k2-500/10 border border-k2-500/20 rounded-xl p-6 mb-6">
                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg k2-gradient flex items-center justify-center text-sm font-bold">K2</span>
                            Key Takeaways
                        </h3>
                        <ul className="space-y-2 text-slate-300">
                            <li className="flex items-start gap-2">
                                <span className="text-k2-400">•</span>
                                <span>Headlines often contain truth but miss critical context and timing.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-k2-400">•</span>
                                <span>Cognitive biases like FOMO and recency bias affect even experienced investors.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-k2-400">•</span>
                                <span>Diversification reduces risk, but concentration can amplify both gains and losses.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-k2-400">•</span>
                                <span>Understanding macro factors (Fed policy, structural shifts) matters as much as stock picking.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Play Again */}
                    <button
                        onClick={() => {
                            resetGame();
                            navigate('/');
                        }}
                        className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
                    >
                        <span>🔄</span>
                        <span>Play Again</span>
                    </button>
                </div>

                {/* Footer */}
                <div className="text-center text-slate-500 text-sm">
                    <p className="mb-2">Built for Columbia DevFest 2026</p>
                    <p className="flex items-center justify-center gap-2">
                        <span>Powered by</span>
                        <span className="px-2 py-1 k2-gradient rounded text-white font-bold text-xs">K2 Think</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
