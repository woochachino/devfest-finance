import { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useGame } from '../context/GameContext';

function AvatarModel() {
    const { scene } = useGLTF('/model.glb');
    return <primitive object={scene} scale={1.7} position={[0, 0, 0]} />;
}

export default function LandingPage() {
    const { startGame } = useGame();
    const navigate = useNavigate();

    const handleStart = () => {
        startGame();
        navigate('/intro');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
            <div className="max-w-5xl w-full animate-fade-in">
                {/* Hero Section */}
                <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient-x">
                    MarketMind
                </h1>

                <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Master the psychology of investing.
                    <br />
                    Navigate real historical market scenarios and defeat your biases.
                </p>

                {/* Stats + Avatar Row */}
                <div className="w-full max-w-4xl mx-auto mb-8 -mt-2 flex items-center gap-0 justify-center">
                    {/* Stats Panel - Left */}
                    <div className="flex-shrink-0 w-40 text-left flex flex-col justify-between h-[450px] py-4 mr-[-1rem]">
                        <div className="px-3 py-2">
                            <div className="text-[10px] uppercase tracking-wider text-slate-500">Level</div>
                            <div className="text-base font-bold text-white">1 <span className="text-[11px] font-normal text-slate-400">/ Rookie</span></div>
                        </div>
                        <div className="px-3 py-2">
                            <div className="text-[10px] uppercase tracking-wider text-slate-500">High Score</div>
                            <div className="text-base font-bold text-emerald-400">$0</div>
                        </div>
                        <div className="px-3 py-2">
                            <div className="text-[10px] uppercase tracking-wider text-slate-500">Investor Type</div>
                            <div className="text-base font-bold text-purple-400">Undiscovered</div>
                        </div>
                        <div className="px-3 py-2">
                            <div className="text-[10px] uppercase tracking-wider text-slate-500">Fav. Gamemode</div>
                            <div className="text-base font-bold text-blue-400">--</div>
                        </div>
                        <div className="px-3 py-2">
                            <div className="text-[10px] uppercase tracking-wider text-slate-500">Rounds Played</div>
                            <div className="text-base font-bold text-white">0</div>
                        </div>
                    </div>

                    {/* 3D Avatar - Right */}
                    <div className="w-[400px] flex-shrink-0 h-[450px]">
                        <Suspense fallback={
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-9xl mb-6 animate-bounce">👨‍💼</div>
                                    <div className="text-slate-400 text-lg">Loading your avatar...</div>
                                </div>
                            </div>
                        }>
                            <Canvas camera={{ position: [0, 0.5, 4.5], fov: 50 }} style={{ background: 'transparent' }}>
                                <ambientLight intensity={1.8} />
                                <directionalLight position={[5, 8, 5]} intensity={2.5} color="#ffffff" />
                                <directionalLight position={[-5, 5, -3]} intensity={1.2} color="#94a3b8" />
                                <spotLight position={[0, 10, 8]} angle={0.3} penumbra={1} intensity={2} color="#ffffff" />
                                <pointLight position={[-3, 2, 4]} intensity={1} color="#60a5fa" />
                                <pointLight position={[3, -1, 3]} intensity={0.8} color="#a78bfa" />
                                <hemisphereLight args={['#bfdbfe', '#1e293b', 1]} />
                                <AvatarModel />
                                <OrbitControls
                                    enableZoom={false}
                                    enablePan={false}
                                    minPolarAngle={Math.PI / 3}
                                    maxPolarAngle={Math.PI / 1.8}
                                    autoRotate={true}
                                    autoRotateSpeed={1}
                                />
                            </Canvas>
                        </Suspense>

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
