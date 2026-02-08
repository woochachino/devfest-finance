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

    // Border unfills clockwise using conic-gradient
    // progress goes from 1 (full) to 0 (empty)
    const borderStyle = {
        background: `conic-gradient(
            ${isWarning ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#3b82f6'} ${progress * 360}deg,
            rgba(30, 41, 59, 0.3) ${progress * 360}deg
        )`,
    };

    return (
        <>
            {/* Screen border flash - last 5 seconds */}
            {isWarning && (
                <div className="fixed inset-0 z-40 pointer-events-none border-[6px] border-red-500/60 animate-border-flash rounded-sm" />
            )}

            {/* Timer pill with border countdown */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                <div className="relative p-[3px] rounded-full" style={borderStyle}>
                    <div className="bg-[#0b0f19] rounded-full px-6 py-3 flex items-center gap-3">
                        <span className={`text-3xl font-mono font-bold tracking-wider tabular-nums ${
                            isWarning ? 'text-red-500' : timeLeft <= 10 ? 'text-amber-400' : 'text-blue-400'
                        }`}>
                            {formatTime(timeLeft)}
                        </span>
                        {timeLeft <= 10 && (
                            <span className={`text-xs font-bold uppercase tracking-widest ${
                                isWarning ? 'text-red-500 animate-pulse' : 'text-amber-400'
                            }`}>
                                {isWarning ? 'EXECUTE NOW' : 'PANIC!'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
