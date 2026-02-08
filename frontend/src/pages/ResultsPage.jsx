// ResultsPage - Gamified results with GSAP animations, particles, and live cash counter

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGame } from '../context/GameContext';
import { getPreDecisionAnalysis, getEducationalDebrief } from '../services/k2ThinkApi';
import K2ThinkAnalysis from '../components/K2ThinkAnalysis';
import K2ThinkDebrief from '../components/K2ThinkDebrief';
import StockResultCard from '../components/StockResultCard';
import StockIcon from '../components/StockIcon';
import LoadingScreen from '../components/LoadingScreen';
import PortfolioGraph from '../components/PortfolioGraph';
import MoneyParticles from '../components/MoneyParticles';
import ResultsBackground from '../components/ResultsBackground';

// Animated counter that ticks up/down to target value
function AnimatedCash({ from, to, duration = 2, onComplete }) {
    const ref = useRef(null);
    const valRef = useRef({ val: from });

    useEffect(() => {
        gsap.to(valRef.current, {
            val: to,
            duration,
            ease: 'power2.out',
            onUpdate() {
                if (ref.current) {
                    ref.current.textContent = `$${Math.round(valRef.current.val).toLocaleString('en-US')}`;
                }
            },
            onComplete,
        });
    }, [to, duration, onComplete]);

    return <span ref={ref}>${from.toLocaleString('en-US')}</span>;
}

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

    // Refs for GSAP animations
    const heroRef = useRef(null);
    const returnRef = useRef(null);
    const cashTargetRef = useRef(null);
    const graphSectionRef = useRef(null);
    const revealRef = useRef(null);
    const metricsRef = useRef(null);

    // UI State — sequential reveal
    const [showAnimation, setShowAnimation] = useState(true);
    const [showHero, setShowHero] = useState(false);
    const [showGraph, setShowGraph] = useState(false);
    const [showReveal, setShowReveal] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showDebrief, setShowDebrief] = useState(false);
    const [showParticles, setShowParticles] = useState(false);
    const [particlesDone, setParticlesDone] = useState(false);
    const [cashAnimDone, setCashAnimDone] = useState(false);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
    const [isLoadingDebrief, setIsLoadingDebrief] = useState(false);

    const isPositive = results ? results.overallReturn >= 0 : true;
    const pnl = results ? results.finalBalance - results.initialBalance : 0;

    // Fetch pre-decision analysis in parallel (start immediately)
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

    // Loading screen complete → show hero with big return + cash counter
    const handleAnimationComplete = () => {
        setShowAnimation(false);
        setShowHero(true);
        setShowParticles(true);
    };

    // GSAP entrance for hero section
    useEffect(() => {
        if (!showHero || !heroRef.current) return;

        const tl = gsap.timeline();
        tl.fromTo(heroRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)' });
        tl.fromTo(returnRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2');

        // After hero entrance, show graph
        tl.call(() => setShowGraph(true), null, '+=0.5');
    }, [showHero]);

    // GSAP entrance for graph
    useEffect(() => {
        if (!showGraph || !graphSectionRef.current) return;
        gsap.fromTo(graphSectionRef.current,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );
    }, [showGraph]);

    // GSAP entrance for reveal
    useEffect(() => {
        if (!showReveal || !revealRef.current) return;
        const tl = gsap.timeline();
        tl.fromTo(revealRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
        tl.fromTo(revealRef.current.querySelector('.reveal-year'),
            { opacity: 0, scale: 0.5, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }, '-=0.1');
        tl.fromTo(revealRef.current.querySelector('.reveal-title'),
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3');
        tl.fromTo(revealRef.current.querySelector('.reveal-context'),
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2');
    }, [showReveal]);

    // Graph animation complete → cascade reveal
    const handleGraphComplete = () => {
        setShowReveal(true);
        setTimeout(() => {
            setShowResults(true);
            setTimeout(() => {
                setShowDebrief(true);
                fetchDebrief();
            }, 1000);
        }, 1500);
    };

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

    if (showAnimation) {
        return <LoadingScreen onComplete={handleAnimationComplete} />;
    }

    return (
        <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans selection:bg-amber-500/30 overflow-x-hidden relative">
            {/* Animated canvas background */}
            <ResultsBackground isPositive={isPositive} />

            {/* Particle burst — one-shot, unmounts when done */}
            {showParticles && !particlesDone && results && (
                <MoneyParticles
                    isPositive={isPositive}
                    intensity={Math.min(Math.abs(results.overallReturn) / 10, 3)}
                    targetRef={cashTargetRef}
                    onComplete={() => setParticlesDone(true)}
                />
            )}

            {/* Sticky Top Bar — Cash Counter */}
            <header className="sticky top-0 z-40 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-slate-800/50">
                <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={handleHome} className="text-sm font-bold tracking-tight hover:opacity-80 transition-opacity">
                            <span className="text-white">MARKET</span><span className="text-amber-400">MIND</span>
                        </button>
                        <div className="h-4 w-[1px] bg-slate-700"></div>
                        <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                            SCENARIO 0{currentRound}
                        </span>
                    </div>

                    {/* Live Cash Display */}
                    <div className="flex items-center gap-3" ref={cashTargetRef}>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Portfolio</div>
                        <div className={`font-mono text-lg font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {results && (
                                <AnimatedCash
                                    from={results.initialBalance}
                                    to={results.finalBalance}
                                    duration={2.5}
                                    onComplete={() => setCashAnimDone(true)}
                                />
                            )}
                        </div>
                        {cashAnimDone && results && (
                            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                                isPositive
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/20 text-red-400'
                            }`}>
                                {isPositive ? '+' : ''}{results.overallReturn.toFixed(1)}%
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-8 relative z-10">

                {/* HERO — Big Return + P&L */}
                {showHero && results && (
                    <div ref={heroRef} className="text-center mb-12 pt-4">
                        {/* Return badge */}
                        <div ref={returnRef}>
                            <div className={`inline-block mb-3 px-4 py-1.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-widest border ${
                                isPositive
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}>
                                {isPositive ? 'Profitable Trade' : 'Loss Recorded'}
                            </div>

                            {/* Giant return number */}
                            <h1 className={`text-7xl md:text-9xl font-black tracking-tighter leading-none mb-2 ${
                                isPositive ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                                {isPositive ? '+' : ''}{results.overallReturn.toFixed(1)}%
                            </h1>

                            {/* P&L line */}
                            <div className="flex items-center justify-center gap-3 text-xl font-mono">
                                <span className="text-slate-500">$10,000</span>
                                <span className="text-slate-600">&rarr;</span>
                                <span className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                    ${Math.round(results.finalBalance).toLocaleString('en-US')}
                                </span>
                                <span className={`text-sm ${isPositive ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
                                    ({isPositive ? '+' : ''}${Math.round(pnl).toLocaleString('en-US')})
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Portfolio Graph */}
                {showGraph && (
                    <section ref={graphSectionRef} className="mb-14 opacity-0">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Performance Timeline
                            </h2>
                        </div>
                        <div className="bg-slate-900/60 border border-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
                            <PortfolioGraph
                                roundId={roundData.id}
                                allocations={allocations}
                                initialBalance={results?.initialBalance ?? 10000}
                                onAnimationComplete={handleGraphComplete}
                            />
                        </div>
                    </section>
                )}

                {/* The Reveal */}
                {showReveal && (
                    <div ref={revealRef} className="text-center mb-14 opacity-0">
                        <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-mono font-bold mb-5 uppercase tracking-widest">
                            Historical Context Identified
                        </div>

                        <h1 className="reveal-year text-6xl md:text-8xl font-black text-white mb-2 tracking-tighter">
                            <span className="gradient-text-gold">{roundData.year}</span>
                        </h1>

                        <h2 className="reveal-title text-2xl md:text-3xl text-slate-300 font-light mb-6">
                            {roundData.title}
                        </h2>

                        <div className="reveal-context max-w-2xl mx-auto bg-slate-900/50 border border-slate-800 p-5 rounded-lg relative">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                            <p className="text-slate-400 leading-relaxed font-light text-sm">
                                "{roundData.context}"
                            </p>
                        </div>
                    </div>
                )}

                {/* AI Pre-Decision Analysis */}
                {showReveal && (
                    <section className="mb-14 animate-fade-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                AI Analyst Remarks
                            </h2>
                        </div>
                        <div className="bg-slate-900/60 border border-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
                            <K2ThinkAnalysis analysis={preAnalysis} isLoading={isLoadingAnalysis} />
                        </div>
                    </section>
                )}

                {/* Performance Metrics */}
                {showResults && results && (
                    <section className="mb-14 animate-fade-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Position Breakdown
                            </h2>
                        </div>

                        {/* Best/Worst */}
                        <div className="grid md:grid-cols-2 gap-3 mb-6">
                            {results.bestPerformer && (
                                <div className="flex items-center justify-between p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 flex items-center justify-center bg-emerald-500/20 rounded-lg text-lg"><StockIcon name={results.bestPerformer.icon} className="w-5 h-5 text-emerald-400" /></div>
                                        <div>
                                            <div className="text-[10px] text-emerald-500 uppercase tracking-wider font-mono">Top Pick</div>
                                            <div className="font-bold text-white text-sm">{results.bestPerformer.ticker}</div>
                                        </div>
                                    </div>
                                    <div className="font-mono text-emerald-400 font-bold">+{results.bestPerformer.returnPercent.toFixed(1)}%</div>
                                </div>
                            )}
                            {results.worstPerformer && results.stockResults.length > 1 && (
                                <div className="flex items-center justify-between p-4 bg-red-900/10 border border-red-500/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 flex items-center justify-center bg-red-500/20 rounded-lg text-lg"><StockIcon name={results.worstPerformer.icon} className="w-5 h-5 text-red-400" /></div>
                                        <div>
                                            <div className="text-[10px] text-red-500 uppercase tracking-wider font-mono">Worst Pick</div>
                                            <div className="font-bold text-white text-sm">{results.worstPerformer.ticker}</div>
                                        </div>
                                    </div>
                                    <div className={`font-mono font-bold ${results.worstPerformer.returnPercent >= 0 ? 'text-slate-300' : 'text-red-400'}`}>
                                        {results.worstPerformer.returnPercent >= 0 ? '+' : ''}{results.worstPerformer.returnPercent.toFixed(1)}%
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Stock Cards */}
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

                {/* Educational Debrief */}
                {showDebrief && (
                    <section className="mb-14 animate-fade-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Analyst Debrief
                            </h2>
                        </div>
                        <div className="bg-slate-900/60 border border-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
                            <K2ThinkDebrief debrief={debrief} isLoading={isLoadingDebrief} />
                        </div>
                    </section>
                )}

                {/* Continue Button */}
                {showDebrief && !isLoadingDebrief && (
                    <section className="animate-fade-in pt-4 pb-20 flex justify-center">
                        <button
                            onClick={handleContinue}
                            className="group relative px-10 py-4 bg-white hover:bg-slate-100 text-slate-900 font-bold uppercase tracking-widest text-sm transition-all duration-200 hover:scale-105 rounded-lg shadow-lg shadow-white/10"
                        >
                            <span className="flex items-center gap-3">
                                {currentRound < 3 ? `NEXT SCENARIO` : 'VIEW FINAL RESULTS'}
                                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
                            </span>
                        </button>
                    </section>
                )}
            </div>
        </div>
    );
}
