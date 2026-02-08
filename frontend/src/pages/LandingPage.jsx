import { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useGame } from '../context/GameContext';
import MarketBackground from '../components/MarketBackground';
import Navbar from '../components/Navbar';

function AvatarModel() {
    const { scene } = useGLTF('/model.glb');
    return <primitive object={scene} scale={1.7} position={[0, 0, 0]} />;
}

export default function LandingPage() {
    const { startGame, setGameMode } = useGame();
    const navigate = useNavigate();

    const handleStart = (mode) => {
        setGameMode(mode);
        startGame();
        navigate('/intro');
    };

    return (
        <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-6 text-slate-200 text-center relative overflow-hidden">
            <Navbar />
            {/* Background Grid/Effect & Market Animation */}
            <MarketBackground />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <div className="max-w-6xl w-full animate-fade-in z-10 relative">
                {/* Header / Logo Area */}
                <div className="mb-12">
                    <div className="inline-block px-3 py-1 border border-amber-500/30 rounded-full bg-amber-500/10 text-amber-400 text-xs font-mono mb-4 tracking-widest uppercase">
                        Financial Literacy Initiative v1.0
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                        <span className="text-white">MARKET</span>
                        <span className="gradient-text-gold">MIND</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
                        Navigate historical market cycles. Master your psychology. <br />
                        <span className="text-slate-500">Analyze. execute. adapt.</span>
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
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Current Level</div>
                            <div className="text-xl font-mono-numbers text-white">01 <span className="text-xs text-slate-500 font-sans">/ ROOKIE</span></div>
                        </div>

                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Portfolio Value</div>
                            <div className="text-xl font-mono-numbers text-emerald-400">$0.00</div>
                        </div>

                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Risk Profile</div>
                            <div className="text-xl font-mono-numbers text-amber-400">UNRATED</div>
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

                    {/* Mode Selection (Right) */}
                    <div className="md:col-span-3 px-6 text-left">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                            SELECT STRATEGY
                        </h3>

                        <div className="space-y-4">
                            <button
                                onClick={() => handleStart('chill')}
                                className="w-full group text-left p-4 bg-slate-800/40 hover:bg-slate-800 border-l-2 border-slate-600 hover:border-blue-400 transition-all duration-200"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-white group-hover:text-blue-300">CHILL MODE</span>
                                    <span className="text-slate-600 group-hover:text-blue-300">→</span>
                                </div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">No Time Limit</div>
                            </button>

                            <button
                                onClick={() => handleStart('panic')}
                                className="w-full group text-left p-4 bg-slate-800/40 hover:bg-slate-800 border-l-2 border-slate-600 hover:border-red-500 transition-all duration-200"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-white group-hover:text-red-300">PANIC MODE</span>
                                    <span className="text-slate-600 group-hover:text-red-300">→</span>
                                </div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">30s Execution Timer</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="absolute bottom-6 w-full text-center border-t border-slate-800/50 pt-4">
                <div className="text-slate-600 text-xs font-mono uppercase tracking-widest">
                    MARKETMIND TERMINAL v2.0 • SYSTEM ACTIVE • {new Date().getFullYear()}
                </div>
            </footer>
        </div>
    );
}
