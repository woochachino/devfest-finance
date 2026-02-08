// WelcomePage - Shows round info, context, and start button

import { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useGame } from '../context/GameContext';

function AvatarModel() {
    const { scene } = useGLTF('/Cartoon Boy 3D Model.glb');
    return <primitive object={scene} scale={2} position={[0, -1.5, 0]} />;
}

export default function WelcomePage() {
    const { currentRound, balance, getCurrentRoundData, startRound } = useGame();
    const navigate = useNavigate();
    const roundData = getCurrentRoundData();

    const handleStart = () => {
        startRound();
        navigate('/portfolio');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                {/* Round Badge */}
                <div className="text-center mb-6 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 font-medium mb-4">
                        <span className="text-lg">🎮</span>
                        Round {currentRound} of 3
                    </div>

                    {/* Balance Display */}
                    <div className="glass-card p-4 mb-4 inline-block">
                        <div className="text-xs text-slate-400 mb-1">Portfolio Value</div>
                        <div className="text-2xl font-bold text-white tabular-nums">
                            ${balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                    </div>
                </div>

                {/* Main Card with 3D Model */}
                <div className="glass-card p-8 animate-slide-up" style={{ animationDelay: '150ms' }}>
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Left: Round Info */}
                        <div>
                            {/* Year & Title */}
                            <div className="mb-6">
                                <div className="text-3xl font-bold gradient-text mb-2">{roundData.year}</div>
                                <h1 className="text-xl font-bold text-white">{roundData.title}</h1>
                                <div className="text-slate-400 text-sm mt-1">{roundData.period}</div>
                            </div>

                            {/* Description */}
                            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                                <p className="text-sm text-white/90 leading-relaxed">
                                    {roundData.description}
                                </p>
                            </div>

                            {/* Context */}
                            <div className="mb-6">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span>🌍</span> World Context
                                </h3>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {roundData.context}
                                </p>
                            </div>

                            {/* Start Button */}
                            <button
                                onClick={handleStart}
                                className="btn-primary w-full text-base py-3 flex items-center justify-center gap-2"
                            >
                                <span>Start Round {currentRound}</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>

                        {/* Right: 3D Avatar Model */}
                        <div className="h-[400px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-800/50 to-slate-900/50">
                            <Suspense fallback={
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-slate-400">Loading avatar...</div>
                                </div>
                            }>
                                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                                    <ambientLight intensity={0.5} />
                                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                                    <pointLight position={[-10, -10, -10]} intensity={0.5} />
                                    <AvatarModel />
                                    <OrbitControls
                                        enableZoom={false}
                                        enablePan={false}
                                        minPolarAngle={Math.PI / 3}
                                        maxPolarAngle={Math.PI / 1.5}
                                    />
                                </Canvas>
                            </Suspense>
                            <div className="text-center -mt-8 relative z-10">
                                <div className="text-xs text-slate-400">Drag to rotate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
