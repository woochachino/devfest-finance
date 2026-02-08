// K2ThinkDebrief Component - Educational debrief display

export default function K2ThinkDebrief({ debrief, isLoading }) {
    if (isLoading) {
        return <K2DebriefLoading />;
    }

    if (!debrief) return null;

    const getGradeColor = (grade) => {
        switch (grade) {
            case 'A': return 'text-gain-400 bg-gain-500/20 border-gain-500/30';
            case 'B': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
            case 'C': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            case 'D': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
            default: return 'text-loss-400 bg-loss-500/20 border-loss-500/30';
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
                        <h3 className="font-bold text-white text-lg">Educational Debrief</h3>
                        <p className="text-sm text-k2-400">Powered by K2 Think AI</p>
                    </div>
                </div>

                {/* Grade Badge */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 ${getGradeColor(debrief.overallGrade)}`}>
                    <span className="text-2xl font-bold">{debrief.overallGrade}</span>
                </div>
            </div>

            {/* Encouragement Banner */}
            <div className="mb-6 p-4 bg-k2-500/10 border border-k2-500/20 rounded-xl">
                <p className="text-white/90 leading-relaxed italic">&ldquo;{debrief.encouragement}&rdquo;</p>
            </div>

            {/* What Happened */}
            <div className="mb-6">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">📰</span>
                    What Actually Happened
                </h4>
                <p className="text-slate-300 leading-relaxed">{debrief.whatHappened}</p>
            </div>

            {/* Key Events You May Have Missed */}
            <div className="mb-6">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">🔍</span>
                    Key Events & Signals
                </h4>
                <ul className="space-y-2">
                    {debrief.keyEvents.map((event, index) => (
                        <li key={index} className="flex items-start gap-2 text-slate-300">
                            <span className="text-primary-400 mt-1">→</span>
                            <span>{event}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Articles Analysis */}
            <div className="mb-6 grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gain-500/5 border border-gain-500/20 rounded-xl">
                    <h5 className="font-semibold text-gain-400 mb-2 flex items-center gap-2">
                        <span>✓</span>
                        What The Articles Got Right
                    </h5>
                    <ul className="space-y-1.5">
                        {debrief.articlesAnalysis.gotRight.map((item, index) => (
                            <li key={index} className="text-sm text-slate-300">{item}</li>
                        ))}
                    </ul>
                </div>
                <div className="p-4 bg-loss-500/5 border border-loss-500/20 rounded-xl">
                    <h5 className="font-semibold text-loss-400 mb-2 flex items-center gap-2">
                        <span>✗</span>
                        What They Got Wrong
                    </h5>
                    <ul className="space-y-1.5">
                        {debrief.articlesAnalysis.gotWrong.map((item, index) => (
                            <li key={index} className="text-sm text-slate-300">{item}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Personalized Lessons */}
            <div className="mb-6">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">🎓</span>
                    Personalized Lessons
                </h4>
                <div className="space-y-4">
                    {debrief.personalizedLessons.map((lesson, index) => (
                        <div
                            key={index}
                            className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl"
                        >
                            <h5 className="font-semibold text-k2-400 mb-2">{lesson.title}</h5>
                            <p className="text-slate-300 text-sm leading-relaxed">{lesson.lesson}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Biases Identified */}
            <div>
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">🧠</span>
                    Biases Active During This Period
                </h4>
                <div className="flex flex-wrap gap-2">
                    {debrief.biasesIdentified.map((bias, index) => (
                        <span
                            key={index}
                            className="px-3 py-1.5 bg-slate-700/50 rounded-lg text-sm text-slate-300 border border-slate-600/50"
                            title={bias.explanation}
                        >
                            {bias.name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function K2DebriefLoading() {
    return (
        <div className="glass-card-dark p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl k2-gradient flex items-center justify-center animate-pulse">
                    <span className="text-white font-bold text-sm">K2</span>
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg">Generating Your Debrief...</h3>
                    <p className="text-sm text-k2-400">Powered by K2 Think AI</p>
                </div>
            </div>

            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-4 bg-slate-700 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-slate-700/50 rounded w-full mb-1" />
                        <div className="h-3 bg-slate-700/50 rounded w-5/6" />
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
