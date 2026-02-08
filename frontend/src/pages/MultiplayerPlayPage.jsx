// MultiplayerPlayPage - Timed portfolio allocation for multiplayer

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayer } from '../context/MultiplayerContext';
import ArticleCard from '../components/ArticleCard';
import StockSlider from '../components/StockSlider';
import AllocationSummary from '../components/AllocationSummary';
import Timer from '../components/Timer';

export default function MultiplayerPlayPage() {
    const {
        currentRound, timerDuration, allocations, submitted,
        submittedCount, players, phase,
        setStockAllocation, getTotalAllocation, getCurrentRoundData,
        submitAllocations,
    } = useMultiplayer();

    const navigate = useNavigate();
    const roundData = getCurrentRoundData();
    const totalAllocation = getTotalAllocation();
    const isComplete = totalAllocation === 100;

    // Navigate on phase changes
    useEffect(() => {
        if (phase === 'scoreboard') navigate('/multiplayer/scoreboard');
        if (phase === 'complete') navigate('/multiplayer/complete');
    }, [phase, navigate]);

    const handleTimeUp = useCallback(() => {
        if (!submitted) {
            submitAllocations();
        }
    }, [submitted, submitAllocations]);

    const handleLockIn = () => {
        if (!submitted && isComplete) {
            submitAllocations();
        }
    };

    if (!roundData) {
        return (
            <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-pulse">Loading round data...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans">
            {/* Timer */}
            <div className="fixed top-0 left-0 w-full h-1 z-50">
                <Timer duration={timerDuration} onTimeUp={handleTimeUp} />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0b0f19] border-b border-slate-800">
                <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                            <span className="font-mono text-xs text-purple-400 uppercase tracking-widest">MULTIPLAYER</span>
                        </div>
                        <div className="h-4 w-[1px] bg-slate-800"></div>
                        <span className="font-mono text-amber-500 text-sm font-bold">ROUND 0{currentRound}/05</span>
                        <div className="h-4 w-[1px] bg-slate-800"></div>
                        <span className="text-slate-500 text-xs truncate max-w-md hidden md:inline">{roundData.description}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {submitted && (
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-emerald-400">{submittedCount}/{players.length} submitted</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-3.5rem)]">

                {/* Left Panel: News Wire */}
                <div className="lg:col-span-5 flex flex-col h-full overflow-hidden bg-slate-900/50 border border-slate-800 rounded-sm">
                    <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="text-lg">NEWS</span> WIRES
                        </h2>
                        <span className="text-[10px] font-mono text-slate-600">LIVE FEED</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {roundData.articles.map((article) => (
                            <div key={article.id} className="group transition-all duration-200 hover:bg-slate-800/50 rounded-sm">
                                <ArticleCard article={article} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Order Entry */}
                <div className="lg:col-span-7 flex flex-col h-full bg-slate-900/30 border border-slate-800 rounded-sm relative">
                    <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="text-lg">ORDER</span> ENTRY
                        </h2>
                        <span className="text-[10px] font-mono text-slate-600">ALLOCATE UP TO 100%</span>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                        <div className="mb-6">
                            <AllocationSummary
                                mpGetTotal={getTotalAllocation}
                                mpBalance={10000}
                                mpAllocations={allocations}
                                mpRoundData={roundData}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {roundData.stocks.map((stock) => (
                                <StockSlider
                                    key={stock.ticker}
                                    stock={stock}
                                    mpAllocations={allocations}
                                    mpSetAllocation={setStockAllocation}
                                    mpBalance={10000}
                                    mpGetTotal={getTotalAllocation}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Execution Footer */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900/80">
                        <div className="flex items-center justify-between gap-4">
                            <div className="text-xs text-slate-500 max-w-md">
                                {submitted ? (
                                    <span className="text-purple-400 flex items-center gap-2">
                                        ✓ SUBMITTED. Waiting for others ({submittedCount}/{players.length})...
                                    </span>
                                ) : isComplete ? (
                                    <span className="text-emerald-500 flex items-center gap-2">
                                        ✓ PORTFOLIO BALANCED. READY TO SUBMIT.
                                    </span>
                                ) : (
                                    <span className="text-amber-500 flex items-center gap-2 animate-pulse">
                                        ⚠ ALLOCATE EXACTLY 100% TO SUBMIT.
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={handleLockIn}
                                disabled={!isComplete || submitted}
                                className={`
                                    relative overflow-hidden px-10 py-4 font-bold tracking-widest uppercase text-sm
                                    rounded-xl transition-all duration-300
                                    ${submitted
                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 cursor-not-allowed'
                                        : isComplete
                                            ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.03] border border-emerald-400/30'
                                            : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700 rounded-xl'}
                                `}
                            >
                                <span className="relative flex items-center gap-2">
                                    {submitted ? 'SUBMITTED ✓' : isComplete ? 'LOCK IN' : 'AWAITING INPUT'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
