import { useState, useEffect } from 'react';

export default function Timer({ duration = 30, onTimeUp }) {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        setTimeLeft(duration);
    }, [duration]);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft, onTimeUp]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = timeLeft / duration; // 1 = full, 0 = empty
    const isWarning = timeLeft <= 5;
    const isUrgent = timeLeft <= 10;

    // Border unfills clockwise using conic-gradient
    // progress goes from 1 (full) to 0 (empty)
    const borderStyle = {
        background: `conic-gradient(
            ${isWarning ? '#ef4444' : isUrgent ? '#f59e0b' : '#3b82f6'} ${progress * 360}deg,
            rgba(30, 41, 59, 0.3) ${progress * 360}deg
        )`,
    };

    // Calculate vignette intensity based on time remaining (more intense as time runs out)
    // Reduced intensity: max 0.35 opacity instead of 0.6, larger transparent center
    const vignetteOpacity = isWarning ? Math.min(0.35, (5 - timeLeft) / 5 * 0.25 + 0.15) : 0;

    return (
        <>
            {/* Screen vignette effect - last 5 seconds (smooth red fade from edges) */}
            {isWarning && (
                <div
                    className="fixed inset-0 z-40 pointer-events-none transition-opacity duration-500"
                    style={{
                        background: `radial-gradient(ellipse at center, transparent 55%, rgba(220, 38, 38, ${vignetteOpacity}) 100%)`,
                    }}
                />
            )}

            {/* Timer pill with border countdown */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                <div className="relative p-[3px] rounded-full" style={borderStyle}>
                    <div className="bg-[#0b0f19] rounded-full px-6 py-3 flex items-center gap-3">
                        <span className={`text-3xl font-mono font-bold tracking-wider tabular-nums ${isWarning ? 'text-red-500' : isUrgent ? 'text-amber-400' : 'text-blue-400'
                            }`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}

