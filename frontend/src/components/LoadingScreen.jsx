import { useState, useEffect } from 'react';

export default function LoadingScreen({ onComplete }) {
    const [dots, setDots] = useState('');

    useEffect(() => {
        // Animate dots
        const dotsInterval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 400);

        // Auto-complete after 2 seconds
        const timer = setTimeout(() => {
            onComplete();
        }, 2000);

        return () => {
            clearInterval(dotsInterval);
            clearTimeout(timer);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-[#0b0f19] z-50 flex items-center justify-center">
            <div className="text-center">
                {/* Spinner */}
                <div className="mb-8 relative">
                    <div className="w-20 h-20 border-4 border-slate-700 border-t-amber-400 rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                    </div>
                </div>

                {/* Loading Text */}
                <h2 className="text-2xl font-bold text-white mb-2">
                    Calculating Results{dots}
                </h2>
                <p className="text-slate-400 text-sm">
                    Analyzing market performance
                </p>
            </div>
        </div>
    );
}
