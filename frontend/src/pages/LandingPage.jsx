import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

export default function LandingPage() {
    const { startGame } = useGame();
    const navigate = useNavigate();

    const handleStart = () => {
        startGame();
        navigate('/intro');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
            <div className="max-w-4xl w-full animate-fade-in">
                {/* Hero Section */}
                <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient-x">
                    MarketMind
                </h1>

                <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Master the psychology of investing.
                    <br />
                    Navigate real historical market scenarios and defeat your biases.
                </p>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-16 text-left">
                    <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg transform hover:-translate-y-1 transition-transform duration-300">
                        <div className="text-4xl mb-4">📜</div>
                        <h3 className="text-lg font-bold mb-2 text-blue-300">Real History</h3>
                        <p className="text-slate-400 text-sm">Experience actual market events as they happened. Can you beat history?</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg transform hover:-translate-y-1 transition-transform duration-300 delay-100">
                        <div className="text-4xl mb-4">🧠</div>
                        <h3 className="text-lg font-bold mb-2 text-purple-300">Behavioral AI</h3>
                        <p className="text-slate-400 text-sm">Get analyzed by K2 Think's advanced AI to uncover your investing biases.</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg transform hover:-translate-y-1 transition-transform duration-300 delay-200">
                        <div className="text-4xl mb-4">🏆</div>
                        <h3 className="text-lg font-bold mb-2 text-pink-300">High Score</h3>
                        <p className="text-slate-400 text-sm">Compete for the best portfolio returns across 3 challenging rounds.</p>
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    onClick={handleStart}
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl hover:scale-105"
                >
                    <span className="w-full h-full rounded-full opacity-0 group-hover:animate-ping absolute inset-0 bg-white"></span>
                    <span className="relative flex items-center gap-3">
                        Start Your Journey
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </span>
                </button>
            </div>

            <footer className="absolute bottom-6 text-slate-500 text-sm">
                © {new Date().getFullYear()} MarketMind • Financial Literacy Initiative
            </footer>
        </div>
    );
}
