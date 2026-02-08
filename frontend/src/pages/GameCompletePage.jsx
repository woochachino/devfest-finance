// GameCompletePage - Final summary with K2 Think AI analysis

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { gameData } from '../data/gameData';
import { getGameAnalysis } from '../services/k2ThinkApi';
import Leaderboard, { saveScore } from '../components/Leaderboard';
import GlobalLeaderboard from '../components/GlobalLeaderboard';

// Grade color helper
function gradeColor(grade) {
    switch (grade) {
        case 'A': return 'text-emerald-400';
        case 'B': return 'text-blue-400';
        case 'C': return 'text-amber-400';
        case 'D': return 'text-orange-400';
        case 'F': return 'text-red-400';
        default: return 'text-slate-400';
    }
}

function gradeBg(grade) {
    switch (grade) {
        case 'A': return 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30';
        case 'B': return 'from-blue-500/20 to-blue-500/5 border-blue-500/30';
        case 'C': return 'from-amber-500/20 to-amber-500/5 border-amber-500/30';
        case 'D': return 'from-orange-500/20 to-orange-500/5 border-orange-500/30';
        case 'F': return 'from-red-500/20 to-red-500/5 border-red-500/30';
        default: return 'from-slate-500/20 to-slate-500/5 border-slate-500/30';
    }
}

export default function GameCompletePage() {
    const navigate = useNavigate();
    const { balance, roundHistory, resetGame, gameMode, isGameOver } = useGame();
    const [scoreSaved, setScoreSaved] = useState(false);
    const [k2Analysis, setK2Analysis] = useState(null);
    const [k2Loading, setK2Loading] = useState(true);
    const [k2Error, setK2Error] = useState(false);
    const [expandedRound, setExpandedRound] = useState(null);

    const initialBalance = gameData.initialBalance;
    const totalReturn = ((balance - initialBalance) / initialBalance * 100);
    const isPositive = totalReturn >= 0;

    const handleHome = () => {
        resetGame();
        navigate('/');
    };

    // Save score to leaderboard on first render
    useEffect(() => {
        if (!scoreSaved && balance > 0) {
            saveScore(balance, gameMode);
            setScoreSaved(true);
        }
    }, [balance, gameMode, scoreSaved]);

    // Call K2 Think API for analysis
    useEffect(() => {
        let cancelled = false;
        async function fetchAnalysis() {
            setK2Loading(true);
            setK2Error(false);
            try {
                const analysis = await getGameAnalysis(roundHistory, gameData.rounds);
                if (!cancelled) {
                    setK2Analysis(analysis);
                }
            } catch (err) {
                console.error('K2 analysis failed:', err);
                if (!cancelled) setK2Error(true);
            }
            if (!cancelled) setK2Loading(false);
        }
        if (roundHistory.length > 0) {
            fetchAnalysis();
        }
        return () => { cancelled = true; };
    }, [roundHistory]);

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
        <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans selection:bg-amber-500/30 overflow-x-hidden relative">
            {/* Sticky Top Bar */}
            <header className="sticky top-0 z-40 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-slate-800/50">
                <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={handleHome} className="text-sm font-bold tracking-tight hover:opacity-80 transition-opacity">
                            <span className="text-white">MARKET</span><span className="text-amber-400">MIND</span>
                        </button>
                        <div className="h-4 w-[1px] bg-slate-700"></div>
                        <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                            {isGameOver ? 'GAME OVER' : 'GAME COMPLETE'}
                        </span>
                    </div>

                    {/* Portfolio Display */}
                    <div className="flex items-center gap-3">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Final Portfolio</div>
                        <div className={`font-mono text-lg font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            ${Math.round(balance).toLocaleString('en-US')}
                        </div>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${isPositive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                            }`}>
                            {isPositive ? '+' : ''}{totalReturn.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Trophy / Game Over */}
                <div className="text-center mb-8 animate-fade-in">
                    {isGameOver ? (
                        <>
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 mb-4 animate-pulse">
                                <span className="text-5xl">💸</span>
                            </div>
                            <h1 className="text-4xl font-bold text-red-400 mb-2">GAME OVER</h1>
                            <p className="text-xl text-slate-400">Your portfolio dropped below $5,000</p>
                            <p className="text-sm text-red-400/70 mt-2">You've been margin called!</p>
                        </>
                    ) : (
                        <>
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4 animate-float">
                                <span className="text-5xl">🏆</span>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2">Game Complete!</h1>
                            <p className="text-xl text-slate-400">You survived {roundHistory.length} market cycle{roundHistory.length > 1 ? 's' : ''}</p>
                        </>
                    )}
                </div>

                {/* Final Results Card */}
                <div className="glass-card p-8 mb-6 animate-slide-up">
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
                    <div className={`grid grid-cols-${roundHistory.length + 1} gap-2 mb-8`}>
                        <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                            <div className="text-sm text-slate-400">Start</div>
                            <div className="font-bold text-white">${initialBalance.toLocaleString()}</div>
                        </div>
                        {roundHistory.map((round, index) => (
                            <div key={index} className="text-center p-3 bg-slate-800/50 rounded-xl">
                                <div className="text-sm text-slate-400">R{round.round}</div>
                                <div className={`font-bold ${round.results?.overallReturn >= 0 ? 'text-gain-400' : 'text-loss-400'}`}>
                                    {round.results?.overallReturn >= 0 ? '+' : ''}{round.results?.overallReturn?.toFixed(0)}%
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Best/Worst Round */}
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
                </div>

                {/* ═══ K2 THINK AI ANALYSIS ═══ */}
                <div className="mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-violet-500/30">
                            K2
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">K2 Think Analysis</h2>
                            <p className="text-xs text-slate-500">Powered by MBZUAI K2 Think LLM</p>
                        </div>
                    </div>

                    {k2Loading ? (
                        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-12 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative w-12 h-12">
                                    <div className="absolute inset-0 rounded-full border-2 border-violet-500/20"></div>
                                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 animate-spin"></div>
                                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-600/20 flex items-center justify-center text-xs font-bold text-violet-400">K2</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-medium text-slate-300 mb-1">Analyzing your decisions...</div>
                                    <div className="text-xs text-slate-500">K2 Think is reviewing your portfolio choices and the articles you read</div>
                                </div>
                            </div>
                        </div>
                    ) : k2Error ? (
                        <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-6 text-center">
                            <p className="text-red-400 text-sm">Analysis unavailable. Please try again later.</p>
                        </div>
                    ) : k2Analysis ? (
                        <div className="space-y-4">
                            {/* Overall Grade + Summary */}
                            <div className={`bg-gradient-to-br ${gradeBg(k2Analysis.overall_grade)} border rounded-xl p-6`}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`text-5xl font-black ${gradeColor(k2Analysis.overall_grade)}`}>
                                        {k2Analysis.overall_grade}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Overall Performance</div>
                                        <p className="text-slate-300 text-sm leading-relaxed">{k2Analysis.overall_summary}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Per-Round Analysis */}
                            {(k2Analysis.round_analyses || []).map((ra) => (
                                <div key={ra.round} className="bg-slate-900/60 border border-slate-800/50 rounded-xl overflow-hidden backdrop-blur-sm">
                                    {/* Round Header (clickable) */}
                                    <button
                                        onClick={() => setExpandedRound(expandedRound === ra.round ? null : ra.round)}
                                        className="w-full flex items-center justify-between p-5 hover:bg-slate-800/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradeBg(ra.grade)} flex items-center justify-center text-lg font-bold ${gradeColor(ra.grade)}`}>
                                                {ra.grade}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold text-white text-sm">Round {ra.round}: {ra.title}</div>
                                                <div className="text-xs text-slate-500">{ra.key_lesson}</div>
                                            </div>
                                        </div>
                                        <svg className={`w-5 h-5 text-slate-500 transition-transform ${expandedRound === ra.round ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Expanded Content */}
                                    {expandedRound === ra.round && (
                                        <div className="px-5 pb-5 space-y-4 border-t border-slate-800/50 pt-4">
                                            {/* Article Insights */}
                                            {(ra.article_insights || []).length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Key Article Signals</h4>
                                                    <div className="space-y-3">
                                                        {ra.article_insights.map((ai, i) => (
                                                            <div key={i} className="bg-slate-800/40 border-l-2 border-violet-500/50 rounded-r-lg p-4">
                                                                <div className="text-xs font-medium text-violet-300 mb-1">{ai.article_title}</div>
                                                                <blockquote className="text-xs text-slate-400 italic mb-2 pl-3 border-l border-slate-700">
                                                                    "{ai.key_quote}"
                                                                </blockquote>
                                                                <div className="text-xs text-slate-300 mb-1">
                                                                    <span className="text-slate-500 font-mono uppercase">Signal:</span> {ai.signal}
                                                                </div>
                                                                <div className="text-xs text-slate-300">
                                                                    <span className="text-slate-500 font-mono uppercase">Your action:</span> {ai.player_action}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* What You Did Well */}
                                            {(ra.what_player_did_well || []).length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">What You Did Well</h4>
                                                    <ul className="space-y-1">
                                                        {ra.what_player_did_well.map((item, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                                <span className="text-emerald-400 mt-0.5">+</span>
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* What You Missed */}
                                            {(ra.what_player_missed || []).length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Missed Opportunities</h4>
                                                    <ul className="space-y-1">
                                                        {ra.what_player_missed.map((item, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                                <span className="text-amber-400 mt-0.5">!</span>
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Cognitive Biases Detected */}
                            {(k2Analysis.cognitive_biases || []).length > 0 && (
                                <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-5 backdrop-blur-sm">
                                    <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4">Cognitive Biases Detected</h3>
                                    <div className="space-y-4">
                                        {k2Analysis.cognitive_biases.map((cb, i) => (
                                            <div key={i} className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-4">
                                                <div className="font-semibold text-rose-300 text-sm mb-1">{cb.bias_name}</div>
                                                <div className="text-xs text-slate-400 mb-2">
                                                    <span className="text-slate-500 font-mono">Evidence:</span> {cb.evidence}
                                                </div>
                                                <div className="text-xs text-slate-300 bg-slate-800/40 rounded p-2">
                                                    <span className="text-violet-400 font-mono">Tip:</span> {cb.teaching}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Top Lessons */}
                            {(k2Analysis.top_lessons || []).length > 0 && (
                                <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-violet-500/20 rounded-xl p-5">
                                    <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Top Lessons</h3>
                                    <ol className="space-y-2">
                                        {k2Analysis.top_lessons.map((lesson, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                                <span>{lesson}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            {/* Encouragement */}
                            {k2Analysis.encouragement && (
                                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 text-center">
                                    <p className="text-slate-300 text-sm italic leading-relaxed">{k2Analysis.encouragement}</p>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Play Again */}
                <div className="mb-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
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

                {/* Leaderboards */}
                <div className="grid md:grid-cols-2 gap-6 mb-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <GlobalLeaderboard />
                    <Leaderboard currentScore={balance} currentMode={gameMode} />
                </div>

                {/* Footer */}
                <div className="text-center text-slate-500 text-sm">
                    <p className="mb-2">Built for Columbia DevFest</p>
                </div>
            </div>
        </div>
    );
}
