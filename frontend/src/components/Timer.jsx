import { useState, useEffect } from 'react';

export default function Timer({ duration = 30, onTimeUp }) {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        // Reset timer if duration changes
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

    // Format time as MM:SS (e.g., 0:30, 0:09)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Determine color based on time remaining
    let colorClass = 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    let pulseClass = '';

    if (timeLeft <= 10) {
        colorClass = 'text-red-500 border-red-500/50 bg-red-500/20';
        pulseClass = 'animate-pulse';
    } else if (timeLeft <= 20) {
        colorClass = 'text-amber-400 border-amber-500/40 bg-amber-500/15';
    }

    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-full border-2 backdrop-blur-md shadow-lg transition-colors duration-300 ${colorClass} ${pulseClass}`}>
            <span className="text-2xl">⏱️</span>
            <span className="text-3xl font-mono font-bold tracking-wider tabular-nums">
                {formatTime(timeLeft)}
            </span>
            {timeLeft <= 10 && (
                <span className="text-xs font-bold uppercase tracking-widest text-red-500 animate-bounce">
                    PANIC!
                </span>
            )}
        </div>
    );
}
