// K2ThinkAnalysis Component - Pre-decision analysis display

export default function K2ThinkAnalysis({ analysis, isLoading }) {
    if (isLoading) {
        return <K2LoadingState />;
    }

    if (!analysis) return null;

    const getRiskColor = (level) => {
        switch (level) {
            case 'Low': return 'text-gain-400 bg-gain-500/10';
            case 'Medium': return 'text-yellow-400 bg-yellow-500/10';
            case 'High': return 'text-orange-400 bg-orange-500/10';
            case 'Extreme': return 'text-loss-400 bg-loss-500/10';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'border-loss-500/50 bg-loss-500/5';
            case 'medium': return 'border-yellow-500/50 bg-yellow-500/5';
            case 'low': return 'border-gain-500/50 bg-gain-500/5';
            default: return 'border-slate-500/50 bg-slate-500/5';
        }
    };

    return (
        <div className="glass-card-dark p-6 animate-fade-in">
            {/* Header with K2 Think branding */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl k2-gradient flex items-center justify-center">
                        <span className="text-white font-bold text-sm">K2</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Pre-Decision Analysis</h3>
                        <p className="text-sm text-k2-400"></p>
                    </div>
                </div>

                {/* Risk Level Badge */}
                <div className={`px-4 py-2 rounded-xl font-bold ${getRiskColor(analysis.riskLevel)}`}>
                    {analysis.riskLevel} Risk
                </div>
            </div>

            {/* Risk Score Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Risk Score</span>
                    <span className="text-white font-semibold">{analysis.riskScore}/100</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${analysis.riskScore}%`,
                            background: analysis.riskScore > 75 ? 'linear-gradient(90deg, #ef4444, #dc2626)' :
                                analysis.riskScore > 50 ? 'linear-gradient(90deg, #f97316, #ea580c)' :
                                    analysis.riskScore > 25 ? 'linear-gradient(90deg, #eab308, #ca8a04)' :
                                        'linear-gradient(90deg, #22c55e, #16a34a)'
                        }}
                    />
                </div>
            </div>

            {/* Summary */}
            <div className="mb-6 p-4 bg-k2-500/10 border border-k2-500/20 rounded-xl">
                <p className="text-white/90 leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Biases Detected */}
            <div className="mb-6">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">🧠</span>
                    Cognitive Biases Detected
                </h4>
                <div className="space-y-3">
                    {analysis.biases.map((bias, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-xl border ${getSeverityColor(bias.severity)}`}
                        >
                            <div className="font-semibold text-white mb-1">{bias.name}</div>
                            <div className="text-sm text-slate-300">{bias.description}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Risk Factors */}
            <div className="mb-6">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    Risk Factors
                </h4>
                <ul className="space-y-2">
                    {analysis.riskFactors.map((factor, index) => (
                        <li key={index} className="flex items-start gap-2 text-slate-300">
                            <span className="text-loss-400 mt-1">•</span>
                            <span>{factor}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Alternative Perspectives */}
            <div>
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">💡</span>
                    Alternative Perspectives
                </h4>
                <ul className="space-y-2">
                    {analysis.alternatives.map((alt, index) => (
                        <li key={index} className="flex items-start gap-2 text-slate-300">
                            <span className="text-k2-400 mt-1">•</span>
                            <span>{alt}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function K2LoadingState() {
    return (
        <div className="glass-card-dark p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl k2-gradient flex items-center justify-center animate-pulse">
                    <span className="text-white font-bold text-sm">K2</span>
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg">Analyzing Your Portfolio...</h3>
                    <p className="text-sm text-k2-400"> AI</p>
                </div>
            </div>

            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-slate-700/50 rounded w-full" />
                    </div>
                ))}
            </div>

            <div className="mt-6 flex justify-center">
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 bg-k2-500 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
