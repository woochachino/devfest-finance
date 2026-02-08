// K2 Think API Service
// Currently uses mock responses - replace with real API when key is available

const MOCK_DELAY = 1500; // Simulate API latency

// Mock K2 Think pre-decision analysis
const getMockPreAnalysis = (portfolio, articles, roundData) => {
    const allocations = Object.entries(portfolio).filter(([_, val]) => val > 0);
    const highAllocations = allocations.filter(([_, val]) => val >= 30);
    const cryptoOrVolatile = allocations.some(([ticker]) =>
        ['BTC', 'ETH', 'ZM', 'PTON', 'NVDA'].includes(ticker)
    );

    // Determine risk level
    let riskLevel = 'Low';
    if (highAllocations.length >= 2 || cryptoOrVolatile) riskLevel = 'Medium';
    if (highAllocations.length >= 3 || (cryptoOrVolatile && highAllocations.length >= 1)) riskLevel = 'High';
    if (allocations.some(([ticker, val]) => ['BTC', 'ETH'].includes(ticker) && val >= 40)) riskLevel = 'Extreme';

    // Detect biases based on portfolio
    const biases = [];
    if (cryptoOrVolatile && highAllocations.length > 0) {
        biases.push({
            name: 'FOMO (Fear of Missing Out)',
            description: 'Your portfolio shows heavy allocation to high-momentum assets that are dominating current headlines.',
            severity: 'high',
        });
    }
    if (allocations.length <= 2) {
        biases.push({
            name: 'Concentration Risk',
            description: 'Putting most eggs in few baskets. A single stock falling could devastate your portfolio.',
            severity: 'high',
        });
    }
    if (allocations.some(([ticker]) => ['DAL', 'UAL', 'AAL'].includes(ticker))) {
        biases.push({
            name: 'Mean Reversion Fallacy',
            description: 'Assuming beaten-down assets will "bounce back" - but they can stay down longer than you can stay solvent.',
            severity: 'medium',
        });
    }
    if (highAllocations.length > 0) {
        biases.push({
            name: 'Recency Bias',
            description: 'Recent performance is influencing your decisions. Past returns don\'t guarantee future results.',
            severity: 'medium',
        });
    }
    if (biases.length === 0) {
        biases.push({
            name: 'Herd Mentality Awareness',
            description: 'Good job staying diversified! However, ensure this isn\'t just following conventional wisdom blindly.',
            severity: 'low',
        });
    }

    // Risk factors
    const riskFactors = [
        'Market sentiment could shift rapidly if economic data surprises.',
        'High-flying stocks often correct 30-50% when momentum fades.',
        'Interest rate changes could impact growth stock valuations significantly.',
    ];

    // Alternative perspectives
    const alternatives = [
        'Consider what would happen if the dominant narrative proves wrong.',
        'Historical parallels suggest caution during euphoric periods.',
        'Defensive positions may underperform in rallies but protect in downturns.',
    ];

    return {
        riskLevel,
        riskScore: riskLevel === 'Extreme' ? 95 : riskLevel === 'High' ? 75 : riskLevel === 'Medium' ? 50 : 25,
        biases,
        riskFactors,
        alternatives,
        summary: `Your portfolio shows ${riskLevel.toLowerCase()} risk characteristics. ${biases[0]?.description || 'Diversification looks reasonable.'}`,
    };
};

// Mock K2 Think educational debrief
const getMockDebrief = (portfolio, results, roundData) => {
    const { teachingPoints } = roundData;

    return {
        whatHappened: `During ${roundData.period}, ${roundData.context}`,
        keyEvents: teachingPoints.missedSignals,
        biasesIdentified: teachingPoints.biases.map(bias => ({
            name: bias,
            explanation: `Many investors exhibited ${bias} during this period, often leading to suboptimal decisions.`,
        })),
        articlesAnalysis: {
            gotRight: [
                'Some predictions about technological shifts proved accurate.',
                'Market enthusiasm often reflected real underlying trends.',
            ],
            gotWrong: [
                'Timing predictions were often wildly off.',
                'The magnitude of moves surprised even experts.',
            ],
        },
        personalizedLessons: [
            {
                title: 'Diversification Matters',
                lesson: results.overallReturn > 30
                    ? 'You captured strong returns, but concentrated positions amplified both gains and risk.'
                    : 'Broader diversification could have improved risk-adjusted returns.',
            },
            {
                title: 'Narrative vs. Reality',
                lesson: 'Popular narratives often contain truth but miss critical nuances. The articles highlighted real trends, but timing and magnitude are impossible to predict.',
            },
            {
                title: 'The Long Game',
                lesson: teachingPoints.keyLessons,
            },
        ],
        overallGrade: results.overallReturn > 50 ? 'A' : results.overallReturn > 25 ? 'B' : results.overallReturn > 10 ? 'C' : 'D',
        encouragement: results.overallReturn > 0
            ? "You made money! But remember - in investing, the process matters more than short-term outcomes."
            : "Losses are learning opportunities. The best investors have all experienced setbacks.",
    };
};

// API Functions
export async function getPreDecisionAnalysis(portfolio, articles, roundData) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

    // TODO: Replace with real K2 Think API call when key is available
    // const response = await axios.post('https://api.k2think.com/analyze', {
    //   portfolio,
    //   articles,
    //   context: roundData.context,
    // }, {
    //   headers: { 'Authorization': `Bearer ${API_KEY}` }
    // });
    // return response.data;

    return getMockPreAnalysis(portfolio, articles, roundData);
}

export async function getEducationalDebrief(portfolio, results, roundData) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

    // TODO: Replace with real K2 Think API call when key is available
    // const response = await axios.post('https://api.k2think.com/debrief', {
    //   portfolio,
    //   results,
    //   context: roundData,
    // }, {
    //   headers: { 'Authorization': `Bearer ${API_KEY}` }
    // });
    // return response.data;

    return getMockDebrief(portfolio, results, roundData);
}

export default {
    getPreDecisionAnalysis,
    getEducationalDebrief,
};
