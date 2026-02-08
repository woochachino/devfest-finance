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

// Stock information database for hover tooltips
const stockInfoDatabase = {
    // Round 1 - AI Boom
    NVDA: { sector: 'Semiconductors', description: 'Designs GPUs and AI accelerator chips. Dominates the AI training hardware market with 80%+ share.' },
    AMD: { sector: 'Semiconductors', description: 'Makes CPUs and GPUs. The #2 AI chip maker, competing directly with NVIDIA in data centers.' },
    MSFT: { sector: 'Technology', description: 'Software giant behind Windows, Office, Azure cloud, and a major investor in OpenAI.' },
    GOOGL: { sector: 'Technology', description: 'Parent of Google Search, YouTube, and Google Cloud. Invented the Transformer architecture behind ChatGPT.' },
    INTC: { sector: 'Semiconductors', description: 'Legacy chip maker focused on CPUs and manufacturing. Struggling to compete in AI accelerators.' },
    SNAP: { sector: 'Social Media', description: 'Snapchat parent company. Ad-dependent business facing competition from TikTok.' },
    IBM: { sector: 'Technology', description: 'Enterprise IT services and consulting. Has been "pivoting to AI" for over a decade with mixed results.' },
    DIS: { sector: 'Entertainment', description: 'Media conglomerate owning Disney+, theme parks, Marvel, and Star Wars. Facing streaming losses.' },
    MRNA: { sector: 'Biotechnology', description: 'mRNA vaccine pioneer. Revenue heavily dependent on COVID vaccines, now declining.' },

    // Round 2 - Banking Crisis
    JPM: { sector: 'Banking', description: 'Largest US bank by assets. Known as the "fortress balance sheet" that gains deposits during crises.' },
    WFC: { sector: 'Banking', description: 'Major US bank. Similar to JPMorgan, benefits from deposit flight during banking panics.' },
    SCHW: { sector: 'Financial Services', description: 'Brokerage and wealth management. Holds significant bond portfolios sensitive to rate changes.' },
    KRE: { sector: 'Banking ETF', description: 'Regional bank ETF. Exposed to smaller banks with concentrated deposits and bond losses.' },
    GLD: { sector: 'Commodities', description: 'Gold ETF. Traditional safe haven when trust in financial system erodes.' },
    AAPL: { sector: 'Technology', description: 'iPhone maker with $160B cash. Often acts as a "safe haven" tech stock during volatility.' },
    PFE: { sector: 'Pharmaceuticals', description: 'Major pharma company. Defensive healthcare stock, less correlated with banking sector.' },
    VNO: { sector: 'Real Estate', description: 'Office REIT focused on NYC. Vulnerable to work-from-home trends and CRE credit crunch.' },
    COIN: { sector: 'Cryptocurrency', description: 'Largest US crypto exchange. Dependent on crypto-friendly banks for operations.' },

    // Round 3 - Inflation
    XOM: { sector: 'Energy', description: 'Oil & gas supermajor. Benefits directly from high oil prices and energy supply shocks.' },
    META: { sector: 'Technology', description: 'Facebook/Instagram parent. Spending billions on Metaverse while core ad business faces headwinds.' },
    COST: { sector: 'Consumer Retail', description: 'Warehouse club retailer. Membership model with lower margins than traditional retail.' },
    DVN: { sector: 'Energy', description: 'Oil & gas producer focused on US shale. Highly leveraged to oil price movements.' },
    AMZN: { sector: 'Technology', description: 'E-commerce and cloud giant. Post-COVID hangover with excess warehouse capacity.' },
    LMT: { sector: 'Defense', description: 'Largest defense contractor. Benefits from increased military spending and geopolitical tension.' },
    WMT: { sector: 'Consumer Retail', description: 'Biggest US retailer. Vulnerable to margin compression when inflation raises costs faster than prices.' },
    TGT: { sector: 'Consumer Retail', description: 'Discount retailer. More exposed to discretionary spending shifts than pure grocers.' },
    TSLA: { sector: 'Automotive', description: 'Electric vehicle leader. Growth stock trading at high multiples, sensitive to interest rates.' },

    // Common
    SPY: { sector: 'Index Fund', description: 'S&P 500 ETF tracking the 500 largest US companies. The benchmark for US equity markets.' },
};

// Get stock information for hover tooltip
export async function getStockInfo(ticker) {
    // In future, this could call K2 Think API for dynamic descriptions
    // For now, use the predefined database

    const info = stockInfoDatabase[ticker];
    if (info) {
        return info;
    }

    // Fallback for unknown tickers
    return {
        sector: 'Unknown',
        description: 'Stock information not available.',
    };
}

export default {
    getPreDecisionAnalysis,
    getEducationalDebrief,
    getStockInfo,
};

