// FastForwardAnimation Component - Time-lapse animation between portfolio lock-in and results

import { useState, useEffect } from 'react';

export default function FastForwardAnimation({ period, onComplete }) {
    const [progress, setProgress] = useState(0);
    const [currentMonth, setCurrentMonth] = useState('');
    const [phase, setPhase] = useState('accelerating'); // accelerating, running, revealing

    // Parse the period to extract months
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        const duration = 4000; // 4 seconds total
        const startTime = Date.now();

        // Simulate month progression
        const monthInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progressPercent = Math.min((elapsed / duration) * 100, 100);
            setProgress(progressPercent);

            // Change month every ~400ms
            const monthIndex = Math.floor((elapsed / duration) * 12) % 12;
            setCurrentMonth(months[monthIndex]);

            // Update phase
            if (progressPercent < 20) {
                setPhase('accelerating');
            } else if (progressPercent < 90) {
                setPhase('running');
            } else {
                setPhase('revealing');
            }

            if (progressPercent >= 100) {
                clearInterval(monthInterval);
                setTimeout(onComplete, 500);
            }
        }, 50);

        return () => clearInterval(monthInterval);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-lg z-50 flex items-center justify-center">
            <div className="text-center max-w-lg px-6">
                {/* Time Icon with Animation */}
                <div className="mb-8">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-500/20 border-2 border-primary-500/40 ${phase === 'running' ? 'animate-pulse' : ''
                        }`}>
                        <span className="text-5xl">⏳</span>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-white mb-2">
                    {phase === 'accelerating' && 'Time Traveling...'}
                    {phase === 'running' && 'Fast Forwarding...'}
                    {phase === 'revealing' && 'Revealing Results...'}
                </h2>

                {/* Period */}
                <p className="text-lg text-slate-400 mb-8">{period}</p>

                {/* Current Month Display */}
                <div className="mb-8">
                    <div className="text-6xl font-bold gradient-text mb-2 tabular-nums transition-all duration-150">
                        {currentMonth}
                    </div>
                    <p className="text-slate-500">
                        {phase === 'revealing' ? 'Calculating returns...' : 'Simulating market conditions...'}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md mx-auto">
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary-500 via-k2-500 to-primary-500 rounded-full transition-all duration-100"
                            style={{
                                width: `${progress}%`,
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 1s linear infinite'
                            }}
                        />
                    </div>
                    <div className="flex justify-between text-sm text-slate-500 mt-2">
                        <span>Start</span>
                        <span>{Math.round(progress)}%</span>
                        <span>End</span>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {['↑', '↓', '💰', '📈', '💵', '🏦'].map((symbol, index) => (
                        <div
                            key={index}
                            className="absolute text-3xl opacity-20 animate-float"
                            style={{
                                left: `${15 + index * 15}%`,
                                top: `${20 + (index % 3) * 25}%`,
                                animationDelay: `${index * 0.3}s`,
                                animationDuration: `${2 + index * 0.5}s`,
                            }}
                        >
                            {symbol}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
