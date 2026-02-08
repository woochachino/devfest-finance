import { Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useGame } from '../context/GameContext';
import MarketBackground from '../components/MarketBackground';
import Navbar from '../components/Navbar';
import Leaderboard from '../components/Leaderboard';
import GlobalLeaderboard from '../components/GlobalLeaderboard';
import { ChevronDown } from 'lucide-react';

function AvatarModel() {
    const { scene } = useGLTF('/model.glb');
    return <primitive object={scene} scale={1.7} position={[0, 0, 0]} />;
}

export default function LandingPage() {
    const { startGame, setGameMode, highscore } = useGame();
    const navigate = useNavigate();
    const [showTimerSelect, setShowTimerSelect] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(null);

    const handleStart = (mode, duration = 30) => {
        // Store duration in localStorage for PortfolioPage to use
        if (mode === 'panic') {
            localStorage.setItem('timerDuration', duration.toString());
        }
        setGameMode(mode);
        startGame();
        navigate('/intro');
    };

    const handleTimedClick = () => {
        setShowTimerSelect(true);
    };

    const handleTimerSelect = (duration) => {
        setSelectedDuration(duration);
        handleStart('panic', duration);
    };

    return (
        <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-6 text-slate-200 text-center relative overflow-hidden">
            <Navbar />
            {/* Background Grid/Effect & Market Animation */}
            <MarketBackground />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            {/* Timer Selection Modal */}
            {showTimerSelect && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        {/* Close button */}
                        <button
                            onClick={() => setShowTimerSelect(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Modal header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 mb-4">
                                <span className="text-3xl">⚡</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">SELECT DIFFICULTY</h2>
                            <p className="text-slate-400 text-sm">Choose your time pressure level</p>
                        </div>

                        {/* Timer options */}
                        <div className="space-y-3">
                            <button
                                onClick={() => handleTimerSelect(15)}
                                className="w-full group relative overflow-hidden p-5 rounded-xl bg-gradient-to-r from-red-600/20 to-red-500/10 border border-red-500/30 hover:border-red-400 transition-all duration-300 hover:scale-[1.02]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-red-400">15</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-white text-lg">INSANE</div>
                                            <div className="text-xs text-red-400/80 uppercase tracking-wider">15 Seconds</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <span className="text-red-400">🔥</span>
                                        <span className="text-red-400">🔥</span>
                                        <span className="text-red-400">🔥</span>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleTimerSelect(30)}
                                className="w-full group relative overflow-hidden p-5 rounded-xl bg-gradient-to-r from-orange-600/20 to-amber-500/10 border border-orange-500/30 hover:border-orange-400 transition-all duration-300 hover:scale-[1.02]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-orange-400">30</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-white text-lg">STANDARD</div>
                                            <div className="text-xs text-orange-400/80 uppercase tracking-wider">30 Seconds</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <span className="text-orange-400">🔥</span>
                                        <span className="text-orange-400">🔥</span>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleTimerSelect(60)}
                                className="w-full group relative overflow-hidden p-5 rounded-xl bg-gradient-to-r from-yellow-600/20 to-yellow-500/10 border border-yellow-500/30 hover:border-yellow-400 transition-all duration-300 hover:scale-[1.02]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-yellow-400">60</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-white text-lg">RELAXED</div>
                                            <div className="text-xs text-yellow-400/80 uppercase tracking-wider">60 Seconds</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <span className="text-yellow-400">🔥</span>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl w-full animate-fade-in z-10 relative">
                {/* Header / Logo Area */}
                <div className="mb-12">
                    {/* Stylized Logo */}
                    <div className="relative inline-block mb-6">
                        {/* Glow effect behind logo */}
                        <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-amber-500/30 opacity-50"></div>

                        <h1 className="relative text-5xl md:text-7xl font-black tracking-tighter">
                            <span className="relative inline-block">
                                <span className="bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-lg">
                                    MARKET
                                </span>
                            </span>
                            <span className="relative inline-block ml-1">
                                <span className="bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-lg animate-pulse-slow">
                                    MIND
                                </span>
                                {/* Decorative underline */}
                                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full"></div>
                            </span>
                        </h1>

                        {/* Decorative elements */}
                        <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-amber-500/50 rounded-tl-lg"></div>
                        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-amber-500/50 rounded-br-lg"></div>
                    </div>

                    <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
                        Navigate historical market cycles. Master your psychology. <br />
                        <span className="text-slate-500">Analyze. Execute. Adapt.</span>
                    </p>
                </div>

                {/* Main Content Area: Stats & Avatar */}
                <div className="grid md:grid-cols-12 gap-8 items-center mb-16 py-12">
                    {/* Stats / Trader Profile (Left) */}
                    <div className="md:col-span-3 text-right space-y-6 px-6">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                            TRADER PROFILE
                        </h3>

                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">High Score</div>
                            <div className={`text-xl font-mono-numbers ${highscore ? 'text-emerald-400' : 'text-slate-600'}`}>
                                {highscore ? `$${Math.round(highscore).toLocaleString()}` : '---'}
                            </div>
                        </div>

                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Starting Capital</div>
                            <div className="text-xl font-mono-numbers text-white">$10,000</div>
                        </div>

                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Rounds</div>
                            <div className="text-xl font-mono-numbers text-amber-400">3</div>
                        </div>

                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Status</div>
                            <span className="text-sm font-medium text-emerald-500">MARKET OPEN</span>
                        </div>
                    </div>

                    {/* Avatar (Center) */}
                    <div className="md:col-span-6 h-[400px] relative">
                        <Suspense fallback={
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-4xl mb-4 animate-pulse text-slate-700">◈</div>
                                    <div className="text-slate-500 text-xs uppercase tracking-widest">Initializing Asset...</div>
                                </div>
                            </div>
                        }>
                            <Canvas camera={{ position: [0, 0.5, 4.5], fov: 45 }} style={{ background: 'transparent' }}>
                                <ambientLight intensity={2.5} />
                                <directionalLight position={[5, 8, 5]} intensity={3} color="#ffffff" />
                                <directionalLight position={[-5, 5, -3]} intensity={2} color="#94a3b8" />
                                <spotLight position={[0, 10, 8]} angle={0.3} penumbra={1} intensity={2} color="#fbbf24" />
                                <hemisphereLight args={['#bfdbfe', '#1e293b', 1]} />
                                <AvatarModel />
                                <OrbitControls
                                    enableZoom={false}
                                    enablePan={false}
                                    minPolarAngle={Math.PI / 3}
                                    maxPolarAngle={Math.PI / 1.8}
                                    autoRotate={true}
                                    autoRotateSpeed={0.8}
                                />
                            </Canvas>
                        </Suspense>
                    </div>

                    {/* Mode Selection (Right) - Gamified Buttons */}
                    <div className="md:col-span-3 px-6 text-left">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                            SELECT MODE
                        </h3>

                        <div className="space-y-4">
                            {/* Zen Mode Button */}
                            <button
                                onClick={() => handleStart('chill')}
                                className="w-full group relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-cyan-900/40 via-blue-900/30 to-indigo-900/40 border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20"
                            >
                                {/* Animated gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                                {/* Icon */}
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                                <div className="relative flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                        🧘
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-black text-xl text-white group-hover:text-cyan-300 transition-colors">ZEN</span>
                                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase">Mode</span>
                                        </div>
                                        <div className="text-xs text-slate-400 group-hover:text-cyan-300/70 transition-colors">
                                            No time pressure • Think clearly
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>

                            {/* Timed Mode Button */}
                            <button
                                onClick={handleTimedClick}
                                className="w-full group relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-red-900/40 via-orange-900/30 to-amber-900/40 border border-red-500/30 hover:border-red-400/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20"
                            >
                                {/* Animated gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-red-400/10 to-red-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                                {/* Icon glow */}
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-red-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                                <div className="relative flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/30 to-orange-600/30 border border-red-400/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                        ⏱️
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-black text-xl text-white group-hover:text-red-300 transition-colors">TIMED</span>
                                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold uppercase animate-pulse">Mode</span>
                                        </div>
                                        <div className="text-xs text-slate-400 group-hover:text-red-300/70 transition-colors">
                                            Race the clock • 15/30/60s
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-slate-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-20">
                <ChevronDown className="w-8 h-8 text-slate-500 opacity-50" />
            </div>

            {/* Leaderboard Section - Below the fold */}
            <div className="w-full bg-[#0b0f19] relative z-20 border-t border-slate-800/50">
                <div className="max-w-6xl mx-auto px-6 py-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                            Global Market Rankings
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            See how you stack up against the best traders in the world.
                            Track your progress and aim for the top.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 text-left">
                        {/* Global Leaderboard */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    Global Competition
                                </h3>
                            </div>
                            <GlobalLeaderboard />
                        </div>

                        {/* Local Leaderboard */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    Your personal History
                                </h3>
                            </div>
                            <Leaderboard />
                        </div>
                    </div>
                </div>

                <footer className="w-full text-center border-t border-slate-800/50 py-8 bg-[#0b0f19]">
                    <div className="text-slate-600 text-xs font-mono uppercase tracking-widest">
                        MARKETMIND TERMINAL v2.0 • SYSTEM ACTIVE • {new Date().getFullYear()}
                    </div>
                </footer>
            </div>
        </div>
    );
}

