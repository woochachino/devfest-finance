// ConstellationMap - Interactive journey map for the game complete screen
// Each round is a star node connected by gradient lines in a constellation pattern

import { useState, useMemo, useRef, useCallback } from 'react';

// ── Layout constants ─────────────────────────────────────────────
const SVG_W = 800;
const SVG_H = 320;
const PAD_X = 100;
const CENTER_Y = 150;
const WAVE_AMP = 35;
const NODE_R = 26;

// ── Color helpers ────────────────────────────────────────────────
function nodeColor(ret) {
    if (ret >= 10) return { fill: '#4ade80', glow: 'rgba(74,222,128,0.35)', text: '#166534' };
    if (ret >= 0)  return { fill: '#86efac', glow: 'rgba(134,239,172,0.25)', text: '#14532d' };
    if (ret >= -10) return { fill: '#fbbf24', glow: 'rgba(251,191,36,0.3)', text: '#78350f' };
    return { fill: '#f87171', glow: 'rgba(248,113,113,0.35)', text: '#7f1d1d' };
}

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

// ── Deterministic star field ─────────────────────────────────────
function makeStars(count = 45) {
    const stars = [];
    for (let i = 0; i < count; i++) {
        // deterministic pseudo-random using primes
        const x = ((i * 137 + 73) % SVG_W);
        const y = ((i * 97 + 41) % SVG_H);
        const r = 0.8 + (i % 3) * 0.5;
        const opacity = 0.08 + (i % 5) * 0.04;
        stars.push({ x, y, r, opacity });
    }
    return stars;
}
const STARS = makeStars();

// ── Main component ───────────────────────────────────────────────
export default function ConstellationMap({
    roundHistory,
    gameRounds,
    k2Analysis,
    k2Loading,
    initialBalance,
    finalBalance,
}) {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const [hoveredNode, setHoveredNode] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [showReasoning, setShowReasoning] = useState(false);

    // ── Node positions (sine wave) ───────────────────────────────
    const positions = useMemo(() => {
        const n = roundHistory.length;
        if (n === 0) return [];
        if (n === 1) return [{ x: SVG_W / 2, y: CENTER_Y }];
        return roundHistory.map((_, i) => ({
            x: PAD_X + (i / (n - 1)) * (SVG_W - 2 * PAD_X),
            y: CENTER_Y + WAVE_AMP * Math.sin((i * Math.PI) / (n - 1)),
        }));
    }, [roundHistory.length]);

    // ── K2 round analysis lookup ─────────────────────────────────
    const raMap = useMemo(() => {
        if (!k2Analysis?.round_analyses) return {};
        return Object.fromEntries(k2Analysis.round_analyses.map(ra => [ra.round, ra]));
    }, [k2Analysis]);

    // ── Balance at each step ─────────────────────────────────────
    const balances = useMemo(() => {
        const b = [initialBalance];
        for (const rh of roundHistory) {
            b.push(rh.results?.finalBalance ?? b[b.length - 1]);
        }
        return b;
    }, [roundHistory, initialBalance]);

    // ── SVG → pixel coordinate mapping for tooltip ───────────────
    const svgToPixel = useCallback((svgX, svgY) => {
        if (!svgRef.current || !containerRef.current) return { px: 0, py: 0 };
        const svgRect = svgRef.current.getBoundingClientRect();
        const contRect = containerRef.current.getBoundingClientRect();
        const scaleX = svgRect.width / SVG_W;
        const scaleY = svgRect.height / SVG_H;
        return {
            px: svgRect.left - contRect.left + svgX * scaleX,
            py: svgRect.top - contRect.top + svgY * scaleY,
        };
    }, []);

    // ── Gradient defs for lines ──────────────────────────────────
    const gradientDefs = useMemo(() => {
        return positions.slice(0, -1).map((_, i) => {
            const c1 = nodeColor(roundHistory[i].results?.overallReturn ?? 0);
            const c2 = nodeColor(roundHistory[i + 1].results?.overallReturn ?? 0);
            return (
                <linearGradient key={i} id={`line-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={c1.fill} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={c2.fill} stopOpacity="0.6" />
                </linearGradient>
            );
        });
    }, [positions, roundHistory]);

    // ── Selected round data ──────────────────────────────────────
    const selRound = selectedNode !== null ? roundHistory[selectedNode] : null;
    const selRoundData = selRound ? gameRounds.find(r => r.id === selRound.round) || gameRounds[selectedNode] : null;
    const selRA = selRound ? raMap[selRound.round] : null;

    return (
        <div ref={containerRef} className="relative mb-8 animate-fade-in">
            {/* Section label */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse-slow" />
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
                    Your Market Journey
                </h2>
            </div>

            {/* SVG constellation */}
            <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-4 md:p-6 backdrop-blur-sm relative overflow-hidden">
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    width="100%"
                    preserveAspectRatio="xMidYMid meet"
                    className="select-none"
                >
                    <defs>{gradientDefs}</defs>

                    {/* Star field */}
                    {STARS.map((s, i) => (
                        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.opacity} />
                    ))}

                    {/* Decorative crosses */}
                    {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
                        const cx = ((i * 113 + 50) % (SVG_W - 40)) + 20;
                        const cy = ((i * 83 + 30) % (SVG_H - 40)) + 20;
                        return (
                            <g key={`cross-${i}`} opacity={0.06 + (i % 3) * 0.03}>
                                <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} stroke="white" strokeWidth="0.5" />
                                <line x1={cx} y1={cy - 3} x2={cx} y2={cy + 3} stroke="white" strokeWidth="0.5" />
                            </g>
                        );
                    })}

                    {/* Connecting lines */}
                    {positions.slice(0, -1).map((p, i) => {
                        const next = positions[i + 1];
                        const dx = next.x - p.x;
                        const dy = next.y - p.y;
                        const len = Math.sqrt(dx * dx + dy * dy);
                        return (
                            <line
                                key={`line-${i}`}
                                x1={p.x} y1={p.y}
                                x2={next.x} y2={next.y}
                                stroke={`url(#line-grad-${i})`}
                                strokeWidth="2"
                                strokeDasharray={len}
                                strokeDashoffset={len}
                                style={{
                                    animation: `constellation-line-draw 1s ease-out ${0.3 + i * 0.25}s forwards`,
                                }}
                            />
                        );
                    })}

                    {/* Balance labels along path */}
                    {/* Start */}
                    {positions.length > 0 && (
                        <g>
                            <text
                                x={positions[0].x}
                                y={positions[0].y - NODE_R - 24}
                                textAnchor="middle"
                                fill="#64748b"
                                fontSize="10"
                                fontFamily="'Inter', sans-serif"
                                style={{ opacity: 0, animation: 'fadeIn 0.5s ease-out 1.2s forwards' }}
                            >
                                START
                            </text>
                            <text
                                x={positions[0].x}
                                y={positions[0].y - NODE_R - 12}
                                textAnchor="middle"
                                fill="#94a3b8"
                                fontSize="11"
                                fontWeight="600"
                                fontFamily="'JetBrains Mono', monospace"
                                style={{ opacity: 0, animation: 'fadeIn 0.5s ease-out 1.3s forwards' }}
                            >
                                ${initialBalance.toLocaleString()}
                            </text>
                        </g>
                    )}

                    {/* End */}
                    {positions.length > 0 && (
                        <g>
                            <text
                                x={positions[positions.length - 1].x}
                                y={positions[positions.length - 1].y + NODE_R + 36}
                                textAnchor="middle"
                                fill="#64748b"
                                fontSize="10"
                                fontFamily="'Inter', sans-serif"
                                style={{ opacity: 0, animation: 'fadeIn 0.5s ease-out 1.4s forwards' }}
                            >
                                FINISH
                            </text>
                            <text
                                x={positions[positions.length - 1].x}
                                y={positions[positions.length - 1].y + NODE_R + 48}
                                textAnchor="middle"
                                fill={finalBalance >= initialBalance ? '#4ade80' : '#f87171'}
                                fontSize="12"
                                fontWeight="700"
                                fontFamily="'JetBrains Mono', monospace"
                                style={{ opacity: 0, animation: 'fadeIn 0.5s ease-out 1.5s forwards' }}
                            >
                                ${Math.round(finalBalance).toLocaleString()}
                            </text>
                        </g>
                    )}

                    {/* Star nodes */}
                    {positions.map((p, i) => {
                        const rh = roundHistory[i];
                        const ret = rh.results?.overallReturn ?? 0;
                        const c = nodeColor(ret);
                        const isHovered = hoveredNode === i;
                        const isSelected = selectedNode === i;

                        return (
                            <g
                                key={`node-${i}`}
                                style={{
                                    cursor: 'pointer',
                                    opacity: 0,
                                    transformOrigin: `${p.x}px ${p.y}px`,
                                    animation: `constellation-node-pop 0.5s ease-out ${0.6 + i * 0.2}s forwards`,
                                }}
                                onMouseEnter={() => setHoveredNode(i)}
                                onMouseLeave={() => setHoveredNode(null)}
                                onClick={() => setSelectedNode(selectedNode === i ? null : i)}
                            >
                                {/* Outer glow */}
                                <circle
                                    cx={p.x} cy={p.y}
                                    r={isHovered || isSelected ? 38 : 34}
                                    fill={c.glow}
                                    style={{
                                        transition: 'r 0.3s ease',
                                        animation: 'constellation-glow 3s ease-in-out infinite',
                                    }}
                                />

                                {/* Selection ring */}
                                {isSelected && (
                                    <circle
                                        cx={p.x} cy={p.y} r={NODE_R + 5}
                                        fill="none"
                                        stroke={c.fill}
                                        strokeWidth="1.5"
                                        strokeDasharray="4 3"
                                        opacity="0.7"
                                    />
                                )}

                                {/* Main circle */}
                                <circle
                                    cx={p.x} cy={p.y} r={NODE_R}
                                    fill="#0f172a"
                                    stroke={c.fill}
                                    strokeWidth={isHovered || isSelected ? 3 : 2}
                                    style={{ transition: 'stroke-width 0.2s ease' }}
                                />

                                {/* Round number */}
                                <text
                                    x={p.x} y={p.y + 1}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill={c.fill}
                                    fontSize="13"
                                    fontWeight="800"
                                    fontFamily="'Inter', sans-serif"
                                >
                                    R{rh.round}
                                </text>

                                {/* Return label below node */}
                                <text
                                    x={p.x}
                                    y={p.y + NODE_R + 16}
                                    textAnchor="middle"
                                    fill={c.fill}
                                    fontSize="11"
                                    fontWeight="700"
                                    fontFamily="'JetBrains Mono', monospace"
                                >
                                    {ret >= 0 ? '+' : ''}{ret.toFixed(1)}%
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* HTML Tooltip */}
                {hoveredNode !== null && selectedNode !== hoveredNode && (() => {
                    const rh = roundHistory[hoveredNode];
                    const rd = gameRounds.find(r => r.id === rh.round) || gameRounds[hoveredNode];
                    const ra = raMap[rh.round];
                    const ret = rh.results?.overallReturn ?? 0;
                    const pos = svgToPixel(positions[hoveredNode].x, positions[hoveredNode].y);

                    return (
                        <div
                            className="absolute z-30 pointer-events-none"
                            style={{
                                left: `${pos.px}px`,
                                top: `${pos.py - 12}px`,
                                transform: 'translate(-50%, -100%)',
                            }}
                        >
                            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-lg px-4 py-3 shadow-xl shadow-black/40 min-w-[180px]">
                                <div className="flex items-center justify-between gap-3 mb-1.5">
                                    <div className="text-xs font-bold text-white truncate">{rd?.title || `Round ${rh.round}`}</div>
                                    {ra && (
                                        <span className={`text-xs font-black ${gradeColor(ra.grade)}`}>{ra.grade}</span>
                                    )}
                                </div>
                                <div className="text-[10px] text-slate-500 mb-2">{rd?.period}</div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Return</span>
                                    <span className={`font-bold font-mono ${ret >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {ret >= 0 ? '+' : ''}{ret.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs mt-0.5">
                                    <span className="text-slate-400">Balance</span>
                                    <span className="font-mono text-slate-300">
                                        ${Math.round(balances[hoveredNode]).toLocaleString()} → ${Math.round(balances[hoveredNode + 1]).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-[10px] text-violet-400 mt-2 text-center">Click to explore</div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* ── Detail panel for selected node ─────────────────── */}
            {selectedNode !== null && selRound && (
                <div className="mt-4 animate-slide-up" key={selectedNode}>
                    <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl overflow-hidden backdrop-blur-sm">
                        {/* Round header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-800/50">
                            <div className="flex items-center gap-4">
                                {selRA && (
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradeBg(selRA.grade)} flex items-center justify-center text-xl font-bold ${gradeColor(selRA.grade)} border`}>
                                        {selRA.grade}
                                    </div>
                                )}
                                <div>
                                    <div className="font-bold text-white">Round {selRound.round}: {selRoundData?.title}</div>
                                    <div className="text-xs text-slate-500">{selRoundData?.period}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Portfolio breakdown */}
                        {selRound.results?.stockResults?.length > 0 && (
                            <div className="p-5 border-b border-slate-800/50">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Portfolio Breakdown</h4>
                                <div className="grid gap-2">
                                    {[...selRound.results.stockResults]
                                        .sort((a, b) => b.allocationPercent - a.allocationPercent)
                                        .map(sr => (
                                            <div key={sr.ticker} className="flex items-center gap-3">
                                                <div className="w-12 text-xs font-mono font-bold text-white">{sr.ticker}</div>
                                                <div className="flex-1 h-5 bg-slate-800 rounded-full overflow-hidden relative">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${Math.min(Math.abs(sr.returnPercent) * 2, 100)}%`,
                                                            background: sr.returnPercent >= 0
                                                                ? 'linear-gradient(90deg, #166534, #4ade80)'
                                                                : 'linear-gradient(90deg, #7f1d1d, #f87171)',
                                                        }}
                                                    />
                                                    <span className="absolute inset-0 flex items-center px-2 text-[10px] font-mono font-bold text-white/80">
                                                        {sr.allocationPercent}% → {sr.returnPercent >= 0 ? '+' : ''}{sr.returnPercent.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* K2 analysis sections */}
                        {k2Loading ? (
                            <div className="p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center">
                                        <div className="w-3 h-3 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                    <span className="text-sm text-slate-400">K2 is analyzing your decisions...</span>
                                </div>
                                <div className="space-y-3">
                                    {[1, 2, 3].map(j => (
                                        <div key={j} className="animate-pulse">
                                            <div className="h-3 bg-slate-800 rounded w-2/3 mb-2" />
                                            <div className="h-2 bg-slate-800/50 rounded w-full" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : selRA ? (
                            <div className="p-5 space-y-5">
                                {/* Article Insights */}
                                {(selRA.article_insights || []).length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Key Article Signals</h4>
                                        <div className="space-y-3">
                                            {selRA.article_insights.map((ai, j) => (
                                                <div key={j} className="bg-slate-800/40 border-l-2 border-violet-500/50 rounded-r-lg p-4">
                                                    <div className="text-xs font-medium text-violet-300 mb-1">{ai.article_title}</div>
                                                    <blockquote className="text-xs text-slate-400 italic mb-2 pl-3 border-l border-slate-700">
                                                        &ldquo;{ai.key_quote}&rdquo;
                                                    </blockquote>
                                                    <div className="text-xs text-slate-300 mb-1">
                                                        <span className="text-slate-500 font-mono uppercase text-[10px]">Signal:</span> {ai.signal}
                                                    </div>
                                                    <div className="text-xs text-slate-300">
                                                        <span className="text-slate-500 font-mono uppercase text-[10px]">Your action:</span> {ai.player_action}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Did Well + Missed — two columns on desktop */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {(selRA.what_player_did_well || []).length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">What You Did Well</h4>
                                            <ul className="space-y-1.5">
                                                {selRA.what_player_did_well.map((item, j) => (
                                                    <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                                                        <span className="text-emerald-400 mt-0.5 text-xs">+</span>
                                                        <span className="text-xs">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {(selRA.what_player_missed || []).length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Missed Opportunities</h4>
                                            <ul className="space-y-1.5">
                                                {selRA.what_player_missed.map((item, j) => (
                                                    <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                                                        <span className="text-amber-400 mt-0.5 text-xs">!</span>
                                                        <span className="text-xs">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Key Lesson */}
                                {selRA.key_lesson && (
                                    <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4">
                                        <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1">Key Lesson</div>
                                        <p className="text-sm text-slate-300 leading-relaxed">{selRA.key_lesson}</p>
                                    </div>
                                )}

                                {/* K2 Reasoning toggle */}
                                {k2Analysis?._k2_reasoning && (
                                    <div className="border-t border-slate-800/50 pt-4">
                                        <button
                                            onClick={() => setShowReasoning(!showReasoning)}
                                            className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                            <span className="font-semibold">K2&apos;s Reasoning Process</span>
                                            <svg className={`w-3 h-3 transition-transform ${showReasoning ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {showReasoning && (
                                            <div className="mt-3 bg-slate-800/40 rounded-lg p-4 max-h-80 overflow-y-auto">
                                                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                                                    {k2Analysis._k2_reasoning}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-5 text-center text-sm text-slate-500">
                                AI analysis not available for this round.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
