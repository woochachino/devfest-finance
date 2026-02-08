// ResultsPage - Shows K2 Think analysis, animation, results, and debrief

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { getPreDecisionAnalysis, getEducationalDebrief } from '../services/k2ThinkApi';
import K2ThinkAnalysis from '../components/K2ThinkAnalysis';
import K2ThinkDebrief from '../components/K2ThinkDebrief';
import StockResultCard from '../components/StockResultCard';
import FastForwardAnimation from '../components/FastForwardAnimation';

export default function ResultsPage() {
    const {
        currentRound,
        results,
        allocations,
        getCurrentRoundData,
        advanceToNextRound,
        resetGame,
        preAnalysis,
        setPreAnalysis,
        debrief,
        setDebrief,
    } = useGame();

    const navigate = useNavigate();
    const roundData = getCurrentRoundData();

    const handleContinue = () => {
        if (currentRound >= 3) {
            advanceToNextRound();
            navigate('/complete');
        } else {
            advanceToNextRound();
            navigate('/intro');
        }
    };

    const handleHome = () => {
        resetGame();
        navigate('/');
    };

    // UI State
    const [showAnimation, setShowAnimation] = useState(true);
    const [showResults, setShowResults] = useState(false);
    const [showDebrief, setShowDebrief] = useState(false);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
    const [isLoadingDebrief, setIsLoadingDebrief] = useState(false);

    // Fetch pre-decision analysis on mount
    useEffect(() => {
        const fetchAnalysis = async () => {
            setIsLoadingAnalysis(true);
            try {
                const analysis = await getPreDecisionAnalysis(allocations, roundData.articles, roundData);
                setPreAnalysis(analysis);
            } catch (error) {
                console.error('Failed to fetch analysis:', error);
            }
            setIsLoadingAnalysis(false);
        };
        fetchAnalysis();
    }, [allocations, roundData, setPreAnalysis]);

    // Handle animation complete
    const handleAnimationComplete = () => {
        setShowAnimation(false);
        setShowResults(true);

        // Fetch debrief after showing results
        setTimeout(() => {
            setShowDebrief(true);
            fetchDebrief();
        }, 1500);
    };

    // Fetch educational debrief
    const fetchDebrief = async () => {
        setIsLoadingDebrief(true);
        try {
            const debriefData = await getEducationalDebrief(allocations, results, roundData);
            setDebrief(debriefData);
        } catch (error) {
            console.error('Failed to fetch debrief:', error);
        }
        setIsLoadingDebrief(false);
    };

    // Show animation first
    if (showAnimation) {
        return (
            <FastForwardAnimation
                period={roundData.period}
                onComplete={handleAnimationComplete}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans selection:bg-amber-500/30 overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                            <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">POST-TRADE ANALYSIS</span>
                        </div>
                        <div className="h-4 w-[1px] bg-slate-800"></div>
                        <div className="font-mono text-sm text-slate-400">SCENARIO 0{currentRound} COMPLETE</div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleHome}
                            className="text-xs font-mono text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                        >
                            EXIT TO DASHBOARD
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">

                {/* The Reveal Section */}
                <div className="text-center mb-16 animate-slide-up">
                    <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-mono font-bold mb-6 uppercase tracking-widest">
                        Historical Context Identified
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold text-white mb-2 tracking-tighter">
                        <span className="gradient-text-gold">{roundData.year}</span>
                    </h1>

                    <h2 className="text-2xl md:text-3xl text-slate-300 font-light mb-8">
                        {roundData.title}
                    </h2>

                    <div className="max-w-2xl mx-auto bg-slate-900/50 border border-slate-800 p-6 rounded-sm relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                        <p className="text-slate-400 leading-relaxed font-light">
                            "{roundData.context}"
                        </p>
                    </div>
                </div>

                {/* Section 1: Pre-Decision Analysis */}
                <section className="mb-16 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-2">
                        <span className="text-amber-500 text-xl">◈</span>
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            AI Analyst Remarks (Pre-Results)
                        </h2>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-sm">
                        <K2ThinkAnalysis analysis={preAnalysis} isLoading={isLoadingAnalysis} />
                    </div>
                </section>

                {/* Section 2 & 3: Performance Results */}
                {showResults && results && (
                    <section className="mb-16 animate-fade-in" style={{ animationDelay: '400ms' }}>
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-2">
                            <span className="text-emerald-500 text-xl">◈</span>
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                Performance Metrics
                            </h2>
                        </div>

                        {/* P&L Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-slate-900 border border-slate-800 p-6">
                                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Starting Equity</div>
                                <div className="text-2xl font-mono-numbers text-slate-300">
                                    ${results.initialBalance.toLocaleString('en-US')}
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-6">
                                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Ending Equity</div>
                                <div className={`text-3xl font-mono-numbers font-bold ${results.overallReturn >= 0 ? 'text-white' : 'text-white'}`}>
                                    ${results.finalBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-6 relative overflow-hidden">
                                <div className={`absolute inset-0 opacity-10 ${results.overallReturn >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Net Return</div>
                                <div className={`text-3xl font-mono-numbers font-bold ${results.overallReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {results.overallReturn >= 0 ? '+' : ''}{results.overallReturn.toFixed(2)}%
                                </div>
                            </div>
                        </div>

                        {/* Best/Worst Performers */}
                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                            {results.bestPerformer && (
                                <div className="flex items-center justify-between p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/20 rounded text-lg">{results.bestPerformer.emoji}</div>
                                        <div>
                                            <div className="text-[10px] text-emerald-500 uppercase tracking-wider">Top Performer</div>
                                            <div className="font-bold text-white">{results.bestPerformer.ticker}</div>
                                        </div>
                                    </div>
                                    <div className="font-mono-numbers text-emerald-400 font-bold">+{results.bestPerformer.returnPercent.toFixed(1)}%</div>
                                </div>
                            )}

                            {results.worstPerformer && results.stockResults.length > 1 && (
                                <div className="flex items-center justify-between p-4 bg-red-900/10 border border-red-500/20 rounded-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-red-500/20 rounded text-lg">{results.worstPerformer.emoji}</div>
                                        <div>
                                            <div className="text-[10px] text-red-500 uppercase tracking-wider">Underperformer</div>
                                            <div className="font-bold text-white">{results.worstPerformer.ticker}</div>
                                        </div>
                                    </div>
                                    <div className={`font-mono-numbers font-bold ${results.worstPerformer.returnPercent >= 0 ? 'text-slate-200' : 'text-red-400'}`}>
                                        {results.worstPerformer.returnPercent >= 0 ? '+' : ''}{results.worstPerformer.returnPercent.toFixed(1)}%
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Individual Stock Results */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {results.stockResults.map((result, index) => (
                                <StockResultCard
                                    key={result.ticker}
                                    result={result}
                                    delay={index * 150}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Section 4: Educational Debrief */}
                {showDebrief && (
                    <section className="mb-16 animate-fade-in" style={{ animationDelay: '600ms' }}>
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-2">
                            <span className="text-blue-500 text-xl">◈</span>
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                Analyst Debrief
                            </h2>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-sm">
                            <K2ThinkDebrief debrief={debrief} isLoading={isLoadingDebrief} />
                        </div>
                    </section>
                )}

                {/* Continue Button */}
                {showDebrief && !isLoadingDebrief && (
                    <section className="animate-fade-in pt-8 pb-20 flex justify-center">
                        <button
                            onClick={handleContinue}
                            className="group relative px-8 py-4 bg-slate-100 hover:bg-white text-slate-900 font-bold uppercase tracking-widest text-sm transition-all duration-200 hover:scale-105"
                        >
                            <span className="flex items-center gap-3">
                                {currentRound < 3 ? `PROCEED TO SCENARIO 0${currentRound + 1}` : 'FINALIZE SESSION'}
                                <span className="text-slate-400 group-hover:text-slate-900 transition-colors">→</span>
                            </span>
                        </button>
                    </section>
                )}
            </div>
        </div>
    );
}
