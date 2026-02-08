// GameCompletePage - Final summary with constellation journey map + Gemini AI analysis

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { gameData } from '../data/gameData';
import { getGameAnalysis } from '../services/k2ThinkApi';
import Leaderboard, { saveScore } from '../components/Leaderboard';
import GlobalLeaderboard from '../components/GlobalLeaderboard';
import ConstellationMap from '../components/ConstellationMap';

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
    const { balance, roundHistory, selectedRounds, resetGame, gameMode, isGameOver } = useGame();
    const [scoreSaved, setScoreSaved] = useState(false);
    const [k2Analysis, setK2Analysis] = useState(null);
    const [k2Loading, setK2Loading] = useState(true);
    const [k2Error, setK2Error] = useState(false);

    const initialBalance = gameData.initialBalance;
    const totalReturn = ((balance - initialBalance) / initialBalance * 100);
    const isPositive = totalReturn >= 0;

    // Status message based on performance
    const statusMsg = isGameOver
        ? 'Margin called.'
        : totalReturn >= 20 ? 'Outstanding run.'
        : totalReturn >= 10 ? 'Strong performance.'
        : totalReturn >= 0 ? 'Survived the markets.'
        : totalReturn >= -10 ? 'Tough conditions.'
        : 'Rough ride.';

    useEffect(() => {
        if (!scoreSaved && balance > 0) {
            saveScore(balance, gameMode);
            setScoreSaved(true);
        }
    }, [balance, gameMode, scoreSaved]);

    useEffect(() => {
        let cancelled = false;
        async function fetchAnalysis() {
            setK2Loading(true);
            setK2Error(false);
            try {
                const analysis = await getGameAnalysis(roundHistory, selectedRounds);
                if (!cancelled) setK2Analysis(analysis);
            } catch (err) {
                console.error('K2 analysis failed:', err);
                if (!cancelled) setK2Error(true);
            }
            if (!cancelled) setK2Loading(false);
        }
        if (roundHistory.length > 0) fetchAnalysis();
        return () => { cancelled = true; };
    }, [roundHistory, selectedRounds]);

    return (
        <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans selection:bg-amber-500/30 overflow-x-hidden relative">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-slate-800/50">
                <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => { resetGame(); navigate('/'); }} className="text-sm font-bold tracking-tight hover:opacity-80 transition-opacity">
                            <span className="text-white">MARKET</span><span className="text-amber-400">MIND</span>
                        </button>
                        <div className="h-4 w-[1px] bg-slate-700" />
                        <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                            {isGameOver ? 'GAME OVER' : 'COMPLETE'}
                        </span>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Result hero — clean, no emoji */}
                <div className="text-center mb-10 animate-fade-in">
                    <div className="text-xs font-mono text-slate-500 uppercase tracking-[0.25em] mb-3">{statusMsg}</div>
                    <div className={`text-6xl font-black tabular-nums tracking-tight mb-2 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${Math.round(balance).toLocaleString('en-US')}
                    </div>
                    <div className={`text-xl font-semibold font-mono ${isPositive ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                        {isPositive ? '+' : ''}{totalReturn.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-600 mt-2">
                        {roundHistory.length} round{roundHistory.length !== 1 ? 's' : ''} completed
                    </div>
                </div>

                {/* Constellation Journey Map */}
                <ConstellationMap
                    roundHistory={roundHistory}
                    gameRounds={selectedRounds}
                    k2Analysis={k2Analysis}
                    k2Loading={k2Loading}
                    initialBalance={initialBalance}
                    finalBalance={balance}
                />

                {/* K2 Summary — simplified */}
                {k2Loading ? (
                    <div className="mb-6 bg-slate-900/60 border border-slate-800/50 rounded-xl p-8 backdrop-blur-sm animate-slide-up">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-[8px] font-black text-white">AI</div>
                            <div className="text-sm text-slate-400">Gemini is analyzing your decisions...</div>
                            <div className="flex gap-1 ml-auto">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : k2Analysis ? (
                    <div className="space-y-4 mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                        {/* Grade + Summary */}
                        <div className={`bg-gradient-to-br ${gradeBg(k2Analysis.overall_grade)} border rounded-xl p-6`}>
                            <div className="flex items-center gap-4">
                                <div className={`text-5xl font-black ${gradeColor(k2Analysis.overall_grade)}`}>
                                    {k2Analysis.overall_grade}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-[8px] font-black text-white">AI</div>
                                        <span className="text-xs text-slate-500 uppercase tracking-widest">AI Assessment</span>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">{k2Analysis.overall_summary}</p>
                                </div>
                            </div>
                        </div>

                        {/* Top Lessons */}
                        {(k2Analysis.top_lessons || []).length > 0 && (
                            <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-5 backdrop-blur-sm">
                                <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Takeaways</h3>
                                <ol className="space-y-2">
                                    {k2Analysis.top_lessons.map((lesson, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                                            <span>{lesson}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {/* Encouragement */}
                        {k2Analysis.encouragement && (
                            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center">
                                <p className="text-slate-400 text-sm italic">{k2Analysis.encouragement}</p>
                            </div>
                        )}
                    </div>
                ) : k2Error ? (
                    <div className="mb-6 bg-slate-900/60 border border-red-500/20 rounded-xl p-4 text-center">
                        <p className="text-red-400/70 text-sm">AI analysis unavailable.</p>
                    </div>
                ) : null}

                {/* Play Again */}
                <div className="mb-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
                    <button
                        onClick={() => { resetGame(); navigate('/'); }}
                        className="btn-primary w-full text-lg py-4"
                    >
                        Play Again
                    </button>
                </div>

                {/* Leaderboards */}
                <div className="grid md:grid-cols-2 gap-6 mb-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <GlobalLeaderboard />
                    <Leaderboard currentScore={balance} currentMode={gameMode} />
                </div>

                <div className="text-center text-slate-600 text-xs py-4">
                    Built for Columbia DevFest
                </div>
            </div>
        </div>
    );
}
