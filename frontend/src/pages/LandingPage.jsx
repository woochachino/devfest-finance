import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/game-start');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
            {/* 1. Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-0"></div>
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

                <div className="relative z-10 text-center max-w-4xl mx-auto animate-fade-in-up">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                        Would You Have Survived the <span className="gradient-text">2020 Market Crash?</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Experience real market events from 2017-2024. Make investment decisions based on actual news. Learn from AI-powered analysis. All without risking a dollar.
                    </p>
                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={handleStart}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-emerald-500/25 transition-all transform hover:scale-105 active:scale-95"
                        >
                            Start Playing →
                        </button>
                        <span className="text-sm text-slate-500 font-medium tracking-wide">
                            3 Rounds • 15 Minutes • Free Forever
                        </span>
                    </div>
                </div>
            </section>

            {/* 2. How It Works Section */}
            <section className="py-24 bg-white text-slate-900 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">How It Works</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Step 1 */}
                        <div className="bg-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-4xl mb-4 bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center">📰</div>
                            <h3 className="text-xl font-bold mb-3">Read Real News</h3>
                            <p className="text-slate-600 leading-relaxed">
                                See actual tweets, articles, and Reddit posts from pivotal market moments like the COVID crash or crypto boom.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-4xl mb-4 bg-emerald-100 w-16 h-16 rounded-xl flex items-center justify-center">💼</div>
                            <h3 className="text-xl font-bold mb-3">Build Portfolio</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Allocate $10,000 across stocks based only on what you read. No hindsight, just raw information.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-4xl mb-4 bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center">⏭️</div>
                            <h3 className="text-xl font-bold mb-3">Fast Forward</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Jump ahead 6 months to see how the market actually performed. Watch your decisions play out.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-4xl mb-4 bg-amber-100 w-16 h-16 rounded-xl flex items-center justify-center">🧠</div>
                            <h3 className="text-xl font-bold mb-3">Learn From AI</h3>
                            <p className="text-slate-600 leading-relaxed">
                                K2 Think analyzes your biases—FOMO, herd mentality, recency bias—and teaches you key lessons.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Why Play This Section */}
            <section className="py-24 bg-slate-50 text-slate-900">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-16">Why MarketMind?</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Benefit 1 */}
                        <div className="bg-white p-10 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex items-start gap-6">
                                <div className="text-4xl bg-green-50 p-4 rounded-xl">💸</div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-3">Risk-Free Learning</h3>
                                    <p className="text-slate-600 text-lg">
                                        Make every rookie mistake—FOMO buying, panic selling, ignoring red flags—without losing real money.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Benefit 2 */}
                        <div className="bg-white p-10 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex items-start gap-6">
                                <div className="text-4xl bg-blue-50 p-4 rounded-xl">🎯</div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-3">Spot Your Blind Spots</h3>
                                    <p className="text-slate-600 text-lg">
                                        AI-powered analysis identifies the cognitive biases you didn't even know you had.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Benefit 3 */}
                        <div className="bg-white p-10 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex items-start gap-6">
                                <div className="text-4xl bg-orange-50 p-4 rounded-xl">📊</div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-3">Real Market Data</h3>
                                    <p className="text-slate-600 text-lg">
                                        Learn from actual historical events, not made-up scenarios. Bitcoin 2017. COVID 2020. AI hype 2024.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Benefit 4 */}
                        <div className="bg-white p-10 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex items-start gap-6">
                                <div className="text-4xl bg-indigo-50 p-4 rounded-xl">🚀</div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-3">Build Confidence</h3>
                                    <p className="text-slate-600 text-lg">
                                        Understand market psychology before you invest your first real dollar.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Rounds Preview */}
            <section className="py-24 bg-white text-slate-900 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-4">Three Market Moments.</h2>
                    <p className="text-xl text-slate-500 text-center mb-16">Three Hard Lessons.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Round 1 */}
                        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 hover:border-blue-500/30 transition-all">
                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">2017</div>
                            <div className="p-8">
                                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 origin-left">🚀</div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">The Crypto Boom</h3>
                                <p className="text-slate-600">
                                    Bitcoin surges past $10K. Tech stocks rally. Everyone's getting rich. Can you spot the bubble before it bursts?
                                </p>
                            </div>
                        </div>

                        {/* Round 2 */}
                        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 hover:border-purple-500/30 transition-all">
                            <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">2020</div>
                            <div className="p-8">
                                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 origin-left">😷</div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-purple-600 transition-colors">The COVID Crash</h3>
                                <p className="text-slate-600">
                                    Markets plummet overnight. Airlines collapse. Zoom explodes. Work-from-home is the future. Or is it?
                                </p>
                            </div>
                        </div>

                        {/* Round 3 */}
                        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 hover:border-emerald-500/30 transition-all">
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">2024</div>
                            <div className="p-8">
                                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 origin-left">🤖</div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-600 transition-colors">The AI Frenzy</h3>
                                <p className="text-slate-600">
                                    AI hype reaches fever pitch. Tech valuations soar. Rate hikes loom. Separate signal from noise.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Final CTA */}
            <section className="py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-center px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white relative z-10">
                    Ready to Test Your Investing Instincts?
                </h2>
                <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto relative z-10">
                    Join thousands of players learning to make smarter financial decisions.
                </p>

                <button
                    onClick={handleStart}
                    className="relative z-10 bg-white text-blue-900 hover:bg-blue-50 text-xl font-bold py-5 px-12 rounded-full shadow-2xl hover:shadow-white/10 transition-all transform hover:scale-105 active:scale-95"
                >
                    Start Playing Now →
                </button>

                <div className="mt-12 text-blue-300/60 font-medium text-sm tracking-widest uppercase relative z-10">
                    Powered by K2 Think AI 🧠
                </div>
            </section>
        </div>
    );
}
