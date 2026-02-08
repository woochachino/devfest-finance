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
        preAnalysis,
        setPreAnalysis,
        debrief,
        setDebrief,
    } = useGame();

    const navigate = useNavigate();
    const roundData = getCurrentRoundData();

    const handleContinue = () => {
        advanceToNextRound();
        navigate('/intro');
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Navigation Buttons */}
                            <div className="flex gap-2 mr-4">
                                <button
                                    onClick={() => navigate('/portfolio')}
                                    className="text-slate-400 hover:text-white transition-colors"
                                    title="Back to Portfolio"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleHome}
                                    className="text-slate-400 hover:text-white transition-colors"
                                    title="Go Home"
                                >
                                    🏠 Home
                                </button>
                            </div>
                            <div className="px-3 py-1 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 text-sm font-medium">
                                Round {currentRound}/3 Results
                            </div>
                            <div className="px-3 py-1 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 text-sm font-medium">
                                Round {currentRound}/3 Results
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">{roundData.title}</h1>
                                <p className="text-sm text-slate-400">{roundData.period}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

                {/* The Reveal Section */}
                <div className="text-center animate-slide-up">
                    <div className="inline-block px-4 py-1 bg-emerald-500/10 rounded-full text-emerald-400 text-sm font-bold mb-4 uppercase tracking-wider">
                        ✨ The Reveal
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                        You were trading in <span className="gradient-text">{roundData.year}</span>
                    </h1>
                    <h2 className="text-2xl md:text-3xl text-slate-300 font-medium mb-4">
                        {roundData.title}
                    </h2>
                    <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        {roundData.context}
                    </p>
                </div>

                {/* Section 1: K2 Think Pre-Decision Analysis */}
                <section className="animate-fade-in">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">🎯</span>
                        What K2 Think Noticed About Your Portfolio
                    </h2>
                    <K2ThinkAnalysis analysis={preAnalysis} isLoading={isLoadingAnalysis} />
                </section>

                {/* Section 2 & 3: Stock Performance Results */}
                {showResults && results && (
                    <section className="animate-fade-in">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">📊</span>
                            Your Portfolio Performance
                        </h2>

                        {/* Summary Card */}
                        <div className="glass-card p-6 mb-6">
                            <div className="grid md:grid-cols-3 gap-6">
                                {/* Initial */}
                                <div className="text-center">
                                    <div className="text-sm text-slate-400 mb-1">Started With</div>
                                    <div className="text-2xl font-bold text-white tabular-nums">
                                        ${results.initialBalance.toLocaleString('en-US')}
                                    </div>
                                </div>

                                {/* Final */}
                                <div className="text-center">
                                    <div className="text-sm text-slate-400 mb-1">Ended With</div>
                                    <div className={`text-3xl font-bold tabular-nums ${results.overallReturn >= 0 ? 'text-gain-400' : 'text-loss-400'
                                        }`}>
                                        ${results.finalBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </div>
                                </div>

                                {/* Return */}
                                <div className="text-center">
                                    <div className="text-sm text-slate-400 mb-1">Total Return</div>
                                    <div className={`text-3xl font-bold tabular-nums ${results.overallReturn >= 0 ? 'text-gain-400' : 'text-loss-400'
                                        }`}>
                                        {results.overallReturn >= 0 ? '+' : ''}{results.overallReturn.toFixed(1)}%
                                    </div>
                                </div>
                            </div>

                            {/* Best & Worst */}
                            <div className="grid md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700/50">
                                {results.bestPerformer && (
                                    <div className="flex items-center gap-3 p-3 bg-gain-500/10 rounded-xl">
                                        <span className="text-2xl">{results.bestPerformer.emoji}</span>
                                        <div>
                                            <div className="text-sm text-slate-400">Best Performer</div>
                                            <div className="font-semibold text-gain-400">
                                                {results.bestPerformer.ticker}: +{results.bestPerformer.returnPercent.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {results.worstPerformer && results.stockResults.length > 1 && (
                                    <div className="flex items-center gap-3 p-3 bg-loss-500/10 rounded-xl">
                                        <span className="text-2xl">{results.worstPerformer.emoji}</span>
                                        <div>
                                            <div className="text-sm text-slate-400">Worst Performer</div>
                                            <div className={`font-semibold ${results.worstPerformer.returnPercent >= 0 ? 'text-gain-400' : 'text-loss-400'}`}>
                                                {results.worstPerformer.ticker}: {results.worstPerformer.returnPercent >= 0 ? '+' : ''}{results.worstPerformer.returnPercent.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
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

                {/* Section 4: K2 Think Educational Debrief */}
                {showDebrief && (
                    <section className="animate-fade-in">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">🎓</span>
                            What You Can Learn From This
                        </h2>
                        <K2ThinkDebrief debrief={debrief} isLoading={isLoadingDebrief} />
                    </section>
                )}

                {/* Next Round / Finish Button */}
                {showDebrief && !isLoadingDebrief && (
                    <section className="animate-fade-in pt-4">
                        <button
                            onClick={handleContinue}
                            className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
                        >
                            {currentRound < 3 ? (
                                <>
                                    <span>Continue to Round {currentRound + 1}</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            ) : (
                                <>
                                    <span>🏆</span>
                                    <span>See Final Results</span>
                                </>
                            )}
                        </button>
                    </section>
                )}
            </div>
        </div>
    );
}
