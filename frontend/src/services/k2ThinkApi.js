// K2 Think API Service — Real integration with MBZUAI K2 Think LLM

const K2_API_URL = import.meta.env.VITE_K2_API_URL || '/k2api/v1/chat/completions';
const K2_API_KEY = import.meta.env.VITE_K2_API_KEY || '';

/**
 * Call K2 Think API for end-of-game analysis.
 * Sends full round history (articles, allocations, results) and gets back
 * personalized teaching with document snippets, bias detection, and lessons.
 */
export async function getGameAnalysis(roundHistory, gameRounds) {
    const prompt = buildAnalysisPrompt(roundHistory, gameRounds);

    if (!K2_API_KEY) {
        console.warn('No K2 API key — using mock analysis');
        return getMockAnalysis(roundHistory, gameRounds);
    }

    try {
        const response = await fetch(K2_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${K2_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'K2-Chat',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert financial educator analyzing a player's investment decisions in MarketMind, a stock market simulation game. The player read real news articles and allocated a portfolio across stocks in 3 historical market rounds.

Your job: provide insightful, specific, educational feedback that teaches them how to read financial signals from news articles. Reference SPECIFIC articles and quotes. Explain what the signals indicated and whether the player acted on them or missed them.

You MUST respond with ONLY valid JSON (no markdown, no code fences, no explanation outside the JSON). Follow the exact schema provided.`,
                    },
                    { role: 'user', content: prompt },
                ],
                max_tokens: 3000,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('K2 API error:', response.status, errText);
            return getMockAnalysis(roundHistory, gameRounds);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            console.error('K2 API returned empty content');
            return getMockAnalysis(roundHistory, gameRounds);
        }

        // Parse JSON from the response — handle potential markdown fences
        let cleaned = content.trim();
        if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        const parsed = JSON.parse(cleaned);
        return parsed;
    } catch (err) {
        console.error('K2 Think API call failed:', err);
        return getMockAnalysis(roundHistory, gameRounds);
    }
}

function buildAnalysisPrompt(roundHistory, gameRounds) {
    const roundTexts = roundHistory.map((rh, idx) => {
        const roundData = gameRounds.find(r => r.id === rh.round) || gameRounds[idx];
        if (!roundData) return '';

        // Format allocations
        const allocLines = Object.entries(rh.allocations || {})
            .filter(([, pct]) => pct > 0)
            .map(([ticker, pct]) => {
                const stock = roundData.stocks.find(s => s.ticker === ticker);
                const ret = stock ? stock.return : '?';
                return `  - ${ticker} (${stock?.name || ticker}): ${pct}% allocated → returned ${ret > 0 ? '+' : ''}${ret}%`;
            });

        // Format stock results
        const results = rh.results || {};
        const stockResults = results.stockResults || [];
        const resultLines = stockResults.map(sr =>
            `  - ${sr.ticker}: ${sr.allocationPercent}% allocated, returned ${sr.returnPercent > 0 ? '+' : ''}${sr.returnPercent.toFixed(1)}%, P/L: $${sr.gain >= 0 ? '+' : ''}${Math.round(sr.gain).toLocaleString()}`
        );

        // Format articles with key quotes (truncate to keep prompt manageable)
        const articleLines = roundData.articles.map(a => {
            const snippet = a.content.length > 200 ? a.content.slice(0, 200) + '...' : a.content;
            return `  - [${a.source || a.platform}] "${a.title || ''}" — ${snippet}`;
        });

        // All available stocks (including ones NOT chosen)
        const allStocks = roundData.stocks.map(s =>
            `  - ${s.ticker} (${s.name}): actual return ${s.return > 0 ? '+' : ''}${s.return}%`
        );

        return `
═══ ROUND ${rh.round}: "${roundData.title}" (${roundData.period}) ═══
Context: ${roundData.context}

ARTICLES THE PLAYER SAW:
${articleLines.join('\n')}

ALL AVAILABLE STOCKS & ACTUAL RETURNS:
${allStocks.join('\n')}

PLAYER'S PORTFOLIO ALLOCATION:
${allocLines.length > 0 ? allocLines.join('\n') : '  (No allocation made)'}

RESULTS:
${resultLines.length > 0 ? resultLines.join('\n') : '  No positions taken'}
Overall Return: ${results.overallReturn != null ? (results.overallReturn > 0 ? '+' : '') + results.overallReturn.toFixed(1) + '%' : 'N/A'}
Starting Balance: $${Math.round(results.initialBalance || 10000).toLocaleString()}
Ending Balance: $${Math.round(results.finalBalance || 10000).toLocaleString()}
`;
    });

    return `Analyze this player's investment decisions across ${roundHistory.length} market round(s) in MarketMind.

${roundTexts.join('\n')}

Respond with ONLY this JSON structure (no other text):
{
    "overall_grade": "A/B/C/D/F",
    "overall_summary": "2-3 sentence personalized summary of their performance across all rounds",
    "round_analyses": [
        {
            "round": 1,
            "title": "Round title",
            "grade": "A/B/C/D/F",
            "article_insights": [
                {
                    "article_title": "Exact article title",
                    "key_quote": "A specific quote or paraphrase from the article",
                    "signal": "What this article signaled about specific stocks",
                    "player_action": "Whether the player acted on this signal or missed it"
                }
            ],
            "what_player_did_well": ["Specific things they got right, referencing their allocation decisions"],
            "what_player_missed": ["Specific missed opportunities or mistakes, referencing articles they should have acted on"],
            "key_lesson": "One-sentence key takeaway for this round"
        }
    ],
    "cognitive_biases": [
        {
            "bias_name": "Name of cognitive bias (e.g., FOMO, Anchoring, Confirmation Bias)",
            "evidence": "Specific evidence from their portfolio decisions that shows this bias",
            "teaching": "How to recognize and overcome this bias in real investing"
        }
    ],
    "top_lessons": [
        "Most important lesson 1 — specific to their decisions",
        "Most important lesson 2",
        "Most important lesson 3"
    ],
    "encouragement": "Personalized encouraging closing message"
}

IMPORTANT INSTRUCTIONS:
- Reference SPECIFIC article titles and quotes in your analysis
- Point out which articles contained the strongest signals and whether the player caught them
- Be specific about portfolio decisions (e.g., "You allocated 40% to NVDA, which was smart because...")
- If the player missed a big winner, explain which article hinted at it
- If they fell into a trap (e.g., consumer staples myth in R3), explain what the articles said vs reality
- Keep article_insights to 2-3 per round (the most important ones)
- Tone: Like a supportive but honest mentor — teach, don't lecture`;
}

// ─── Fallback mock analysis ──────────────────────────────────────────────────

function getMockAnalysis(roundHistory, gameRounds) {
    const roundAnalyses = roundHistory.map((rh, idx) => {
        const roundData = gameRounds.find(r => r.id === rh.round) || gameRounds[idx];
        const results = rh.results || {};
        const stockResults = results.stockResults || [];
        const sortedResults = [...stockResults].sort((a, b) => b.returnPercent - a.returnPercent);
        const best = sortedResults[0];
        const worst = sortedResults[sortedResults.length - 1];

        const didWell = [];
        const missed = [];

        for (const sr of stockResults) {
            if (sr.returnPercent > 15 && sr.allocationPercent >= 20) {
                didWell.push(`Strong conviction in ${sr.ticker} (+${sr.returnPercent.toFixed(1)}%) with ${sr.allocationPercent}% allocation paid off`);
            } else if (sr.returnPercent < -10 && sr.allocationPercent >= 20) {
                missed.push(`Heavy ${sr.allocationPercent}% allocation to ${sr.ticker} (${sr.returnPercent.toFixed(1)}%) hurt the portfolio`);
            }
        }

        // Check for big winners the player missed
        if (roundData) {
            for (const stock of roundData.stocks) {
                const playerAlloc = rh.allocations?.[stock.ticker] || 0;
                if (stock.return > 20 && playerAlloc < 10) {
                    missed.push(`Underweighted ${stock.ticker} which returned +${stock.return}% — articles hinted at this`);
                }
            }
        }

        if (!didWell.length) didWell.push('Maintained portfolio diversification');
        if (!missed.length) missed.push('No major misses — solid reading of the signals');

        return {
            round: rh.round,
            title: roundData?.title || `Round ${rh.round}`,
            grade: results.overallReturn > 15 ? 'A' : results.overallReturn > 5 ? 'B' : results.overallReturn > 0 ? 'C' : 'D',
            article_insights: (roundData?.articles || []).slice(0, 2).map(a => ({
                article_title: a.title,
                key_quote: a.content.slice(0, 120) + '...',
                signal: 'This article contained key signals about market direction',
                player_action: 'Review how this aligned with your portfolio decisions',
            })),
            what_player_did_well: didWell.slice(0, 2),
            what_player_missed: missed.slice(0, 2),
            key_lesson: roundData?.teachingPoints?.keyLessons || 'Reading between the lines of financial news is crucial',
        };
    });

    const totalReturn = roundHistory.reduce((sum, rh) => sum + (rh.results?.overallReturn || 0), 0);
    const avgReturn = totalReturn / (roundHistory.length || 1);

    return {
        overall_grade: avgReturn >= 15 ? 'A' : avgReturn >= 8 ? 'B' : avgReturn >= 0 ? 'C' : avgReturn >= -10 ? 'D' : 'F',
        overall_summary: `Across ${roundHistory.length} rounds, you achieved an average return of ${avgReturn >= 0 ? '+' : ''}${avgReturn.toFixed(1)}% per round. Your decisions showed understanding of key market signals, with room to improve on catching all the signals the articles provided.`,
        round_analyses: roundAnalyses,
        cognitive_biases: [
            {
                bias_name: 'Recency Bias',
                evidence: 'Tendency to weight recent headlines more heavily than structural analysis',
                teaching: 'Look beyond the latest headlines — structural shifts (like Fed policy changes) matter more than daily news cycles.',
            },
            {
                bias_name: 'Confirmation Bias',
                evidence: 'Portfolio decisions may have favored information that confirmed existing views',
                teaching: 'Actively seek out contrary opinions. The best investors are the ones who can change their minds when the evidence changes.',
            },
        ],
        top_lessons: [
            'Headlines often contain truth but miss critical timing and magnitude',
            'Diversification reduces risk, but conviction in high-signal plays amplifies returns',
            'Understanding macro shifts (Fed policy, supply shocks) matters as much as stock picking',
        ],
        encouragement: 'Great effort navigating these market scenarios! Every round teaches something new about reading financial signals. The best investors are always learning — keep building that pattern recognition!',
    };
}

// ─── Re-export stock info (unchanged) ────────────────────────────────────────

const stockInfoDatabase = {
    NVDA: { sector: 'Semiconductors', description: 'Designs GPUs and AI accelerator chips. Dominates the AI training hardware market with 80%+ share.' },
    AMD: { sector: 'Semiconductors', description: 'Makes CPUs and GPUs. The #2 AI chip maker, competing directly with NVIDIA in data centers.' },
    MSFT: { sector: 'Technology', description: 'Software giant behind Windows, Office, Azure cloud, and a major investor in OpenAI.' },
    GOOGL: { sector: 'Technology', description: 'Parent of Google Search, YouTube, and Google Cloud. Invented the Transformer architecture behind ChatGPT.' },
    INTC: { sector: 'Semiconductors', description: 'Legacy chip maker focused on CPUs and manufacturing. Struggling to compete in AI accelerators.' },
    SNAP: { sector: 'Social Media', description: 'Snapchat parent company. Ad-dependent business facing competition from TikTok.' },
    IBM: { sector: 'Technology', description: 'Enterprise IT services and consulting. Has been "pivoting to AI" for over a decade with mixed results.' },
    DIS: { sector: 'Entertainment', description: 'Media conglomerate owning Disney+, theme parks, Marvel, and Star Wars. Facing streaming losses.' },
    MRNA: { sector: 'Biotechnology', description: 'mRNA vaccine pioneer. Revenue heavily dependent on COVID vaccines, now declining.' },
    JPM: { sector: 'Banking', description: 'Largest US bank by assets. Known as the "fortress balance sheet" that gains deposits during crises.' },
    WFC: { sector: 'Banking', description: 'Major US bank. Similar to JPMorgan, benefits from deposit flight during banking panics.' },
    SCHW: { sector: 'Financial Services', description: 'Brokerage and wealth management. Holds significant bond portfolios sensitive to rate changes.' },
    KRE: { sector: 'Banking ETF', description: 'Regional bank ETF. Exposed to smaller banks with concentrated deposits and bond losses.' },
    GLD: { sector: 'Commodities', description: 'Gold ETF. Traditional safe haven when trust in financial system erodes.' },
    AAPL: { sector: 'Technology', description: 'iPhone maker with $160B cash. Often acts as a "safe haven" tech stock during volatility.' },
    PFE: { sector: 'Pharmaceuticals', description: 'Major pharma company. Defensive healthcare stock, less correlated with banking sector.' },
    VNO: { sector: 'Real Estate', description: 'Office REIT focused on NYC. Vulnerable to work-from-home trends and CRE credit crunch.' },
    COIN: { sector: 'Cryptocurrency', description: 'Largest US crypto exchange. Dependent on crypto-friendly banks for operations.' },
    XOM: { sector: 'Energy', description: 'Oil & gas supermajor. Benefits directly from high oil prices and energy supply shocks.' },
    META: { sector: 'Technology', description: 'Facebook/Instagram parent. Spending billions on Metaverse while core ad business faces headwinds.' },
    COST: { sector: 'Consumer Retail', description: 'Warehouse club retailer. Membership model with lower margins than traditional retail.' },
    DVN: { sector: 'Energy', description: 'Oil & gas producer focused on US shale. Highly leveraged to oil price movements.' },
    AMZN: { sector: 'Technology', description: 'E-commerce and cloud giant. Post-COVID hangover with excess warehouse capacity.' },
    LMT: { sector: 'Defense', description: 'Largest defense contractor. Benefits from increased military spending and geopolitical tension.' },
    WMT: { sector: 'Consumer Retail', description: 'Biggest US retailer. Vulnerable to margin compression when inflation raises costs faster than prices.' },
    TGT: { sector: 'Consumer Retail', description: 'Discount retailer. More exposed to discretionary spending shifts than pure grocers.' },
    TSLA: { sector: 'Automotive', description: 'Electric vehicle leader. Growth stock trading at high multiples, sensitive to interest rates.' },
    SPY: { sector: 'Index Fund', description: 'S&P 500 ETF tracking the 500 largest US companies. The benchmark for US equity markets.' },
};

export async function getStockInfo(ticker) {
    return stockInfoDatabase[ticker] || { sector: 'Unknown', description: 'Stock information not available.' };
}

export default { getGameAnalysis, getStockInfo };
