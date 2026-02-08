// Gemini API Service — Google Gemini 2.5 Flash for game analysis

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Call Gemini API for end-of-game analysis.
 * Sends full round history (articles, allocations, results) and gets back
 * personalized teaching with document snippets, bias detection, and lessons.
 */
export async function getGameAnalysis(roundHistory, gameRounds) {
    const prompt = buildAnalysisPrompt(roundHistory, gameRounds);

    try {
        const systemInstruction = `You are an expert financial educator analyzing a player's investment decisions in MarketMind, a stock market simulation game. The player read real news articles and allocated a portfolio across stocks in historical market rounds.

Your job: provide insightful, specific, educational feedback that teaches them how to read financial signals from news articles. Reference SPECIFIC articles and quotes. Explain what the signals indicated and whether the player acted on them or missed them.

You MUST respond with ONLY valid JSON (no markdown, no code fences, no explanation outside the JSON). Follow the exact schema provided.`;

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemInstruction }],
                },
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    maxOutputTokens: 8000,
                    temperature: 0.7,
                    thinkingConfig: { thinkingBudget: 2048 },
                },
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Gemini API error:', response.status, errText);
            return getMockAnalysis(roundHistory, gameRounds);
        }

        const data = await response.json();
        const parts = data.candidates?.[0]?.content?.parts || [];

        // Gemini 2.5 Flash returns thinking in a separate part with `thought: true`
        let reasoning = '';
        let raw = '';
        for (const part of parts) {
            if (part.thought) {
                reasoning += (reasoning ? '\n' : '') + part.text;
            } else if (part.text) {
                raw += part.text;
            }
        }

        if (!raw) {
            console.error('Gemini API returned empty content');
            return getMockAnalysis(roundHistory, gameRounds);
        }

        raw = raw.trim();

        // Strip markdown fences
        if (raw.startsWith('```')) {
            raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        // Try to extract JSON object from the cleaned text
        const jsonStart = raw.indexOf('{');
        if (jsonStart > 0) {
            raw = raw.substring(jsonStart);
        }

        const parsed = JSON.parse(raw);
        // Attach reasoning so the UI can display it
        if (reasoning) {
            parsed._k2_reasoning = reasoning;
        }
        return parsed;
    } catch (err) {
        console.error('Gemini API call failed:', err);
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

// ─── Re-export stock info (with backend API fallback) ───────────────────────

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

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

// Cache for dynamically fetched stock info
const stockInfoCache = {};

export async function getStockInfo(ticker) {
    // First check local database (fast)
    if (stockInfoDatabase[ticker]) {
        return stockInfoDatabase[ticker];
    }

    // Check cache for previously fetched stocks
    if (stockInfoCache[ticker]) {
        return stockInfoCache[ticker];
    }

    // Fetch from backend API (uses Gemini for sector/description)
    if (API_BASE) {
        try {
            const response = await fetch(`${API_BASE}/api/stocks/${ticker}/info`);
            if (response.ok) {
                const info = await response.json();
                // Cache the result
                stockInfoCache[ticker] = { sector: info.sector, description: info.description };
                return stockInfoCache[ticker];
            }
        } catch (error) {
            console.warn(`Failed to fetch stock info for ${ticker}:`, error);
        }
    }

    // Final fallback - use a generic description based on ticker
    return {
        sector: 'Technology', // Default to Technology instead of Unknown
        description: `${ticker} is a publicly traded company. Visit the investor relations page for more details.`
    };
}

export default { getGameAnalysis, getStockInfo };

