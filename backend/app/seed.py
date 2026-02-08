"""
Seed script — populates the database with all 3 round configs, stocks, documents,
and document-stock relevance mappings.

Usage:
    python -m app.seed

This is idempotent: it will skip records that already exist.
"""

import asyncio
from datetime import date
from sqlalchemy import select
from app.database import engine, Base, async_session
from app.models import (
    RoundConfig, StockReturn, Document, DocumentStockRelevance,
    SourceType, SignalDirection, Difficulty, RelevanceType,
)


# ═══════════════════════════════════════════════════════════════════════════════
# ROUND CONFIGS
# ═══════════════════════════════════════════════════════════════════════════════

ROUNDS = [
    {
        "id": "ai_boom_2023",
        "title": "The AI Boom Divergence",
        "period_start": date(2023, 1, 1),
        "period_end": date(2023, 6, 30),
        "description": (
            "ChatGPT has just launched. The market is repricing AI winners and losers. "
            "Not all tech benefits equally from AI — the signals are about infrastructure "
            "vs. application layer and credibility of AI positioning."
        ),
        "difficulty": Difficulty.medium,
        "display_order": 1,
    },
    {
        "id": "banking_crisis_2023",
        "title": "The Banking Crisis & Flight to Safety",
        "period_start": date(2023, 1, 1),
        "period_end": date(2023, 6, 30),
        "description": (
            "Rate environment → bond portfolio risk → bank vulnerability. "
            "Silicon Valley Bank just collapsed. Crisis means rotation into megacap "
            "quality and gold. Who survives and who doesn't?"
        ),
        "difficulty": Difficulty.medium,
        "display_order": 2,
    },
    {
        "id": "inflation_2022",
        "title": "The Inflation Regime Change",
        "period_start": date(2022, 1, 1),
        "period_end": date(2022, 12, 31),
        "description": (
            "Zero rates ended. Growth is getting crushed. Energy and value are winning. "
            "This is the most macro-driven period in a decade — whoever reads the Fed "
            "and the war correctly wins big."
        ),
        "difficulty": Difficulty.hard,
        "display_order": 3,
    },
]


# ═══════════════════════════════════════════════════════════════════════════════
# STOCKS PER ROUND
# ═══════════════════════════════════════════════════════════════════════════════

STOCKS = [
    # ── Round 1: AI Boom 2023 ──────────────────────────────────────────────
    {"id": "r1_nvda", "ticker": "NVDA", "company_name": "NVIDIA Corporation", "sector": "Semiconductors", "emoji": "💚", "round_id": "ai_boom_2023", "return_pct": 190.0, "story": "Direct AI infra winner — GPU demand exploded from generative AI training and inference workloads."},
    {"id": "r1_msft", "ticker": "MSFT", "company_name": "Microsoft", "sector": "Big Tech", "emoji": "🪟", "round_id": "ai_boom_2023", "return_pct": 40.0, "story": "OpenAI partnership + Copilot rollout positioned MSFT as the enterprise AI gateway."},
    {"id": "r1_googl", "ticker": "GOOGL", "company_name": "Alphabet", "sector": "Big Tech", "emoji": "🔍", "round_id": "ai_boom_2023", "return_pct": 35.0, "story": "Initially seen as AI loser (ChatGPT threat to Search), recovered with Bard launch and strong cloud results."},
    {"id": "r1_intc", "ticker": "INTC", "company_name": "Intel Corporation", "sector": "Semiconductors", "emoji": "🔷", "round_id": "ai_boom_2023", "return_pct": 10.0, "story": "Legacy chips, missed the AI wave. Restructuring story but no AI GPU product to compete with NVDA."},
    {"id": "r1_snap", "ticker": "SNAP", "company_name": "Snap Inc.", "sector": "Social Media", "emoji": "👻", "round_id": "ai_boom_2023", "return_pct": -15.0, "story": "Ad revenue pressure continued. AI integration attempts (My AI) not enough to offset structural ad market weakness."},
    {"id": "r1_ibm", "ticker": "IBM", "company_name": "IBM", "sector": "Enterprise Tech", "emoji": "🏢", "round_id": "ai_boom_2023", "return_pct": 5.0, "story": "Talked AI (WatsonX) but market didn't buy it. Legacy enterprise reputation made the AI pivot feel unconvincing."},

    # ── Round 2: Banking Crisis 2023 ───────────────────────────────────────
    {"id": "r2_jpm", "ticker": "JPM", "company_name": "JPMorgan Chase", "sector": "Megabank", "emoji": "🏦", "round_id": "banking_crisis_2023", "return_pct": 15.0, "story": "Too big to fail — absorbed First Republic. Fortress balance sheet benefited from crisis."},
    {"id": "r2_schw", "ticker": "SCHW", "company_name": "Charles Schwab", "sector": "Financial Services", "emoji": "📉", "round_id": "banking_crisis_2023", "return_pct": -30.0, "story": "Same unrealized bond loss problem as SVB. Massive deposit outflows and market panic."},
    {"id": "r2_kre", "ticker": "KRE", "company_name": "Regional Banks ETF", "sector": "Regional Banks", "emoji": "🏚️", "round_id": "banking_crisis_2023", "return_pct": -30.0, "story": "Entire sector crushed on contagion fear. Even healthy regionals sold off."},
    {"id": "r2_gld", "ticker": "GLD", "company_name": "Gold ETF (SPDR)", "sector": "Gold", "emoji": "🥇", "round_id": "banking_crisis_2023", "return_pct": 10.0, "story": "Classic crisis safe haven play. Gold rallied as banking stability concerns grew."},
    {"id": "r2_aapl", "ticker": "AAPL", "company_name": "Apple Inc.", "sector": "Big Tech", "emoji": "🍎", "round_id": "banking_crisis_2023", "return_pct": 50.0, "story": "Quality megacap flight to safety. When banks wobble, investors flock to cash-rich balance sheets."},
    {"id": "r2_pfe", "ticker": "PFE", "company_name": "Pfizer Inc.", "sector": "Pharma", "emoji": "💊", "round_id": "banking_crisis_2023", "return_pct": -20.0, "story": "Post-COVID demand cliff. Vaccine and Paxlovid revenue collapsed as pandemic ended."},

    # ── Round 3: Inflation 2022 ────────────────────────────────────────────
    {"id": "r3_xom", "ticker": "XOM", "company_name": "Exxon Mobil", "sector": "Energy", "emoji": "🛢️", "round_id": "inflation_2022", "return_pct": 80.0, "story": "Oil surged from Ukraine war + supply constraints. Energy majors printed record profits."},
    {"id": "r3_meta", "ticker": "META", "company_name": "Meta Platforms", "sector": "Big Tech", "emoji": "👓", "round_id": "inflation_2022", "return_pct": -65.0, "story": "Rate hikes hammered high-P/E tech. Metaverse spending backlash drove massive selloff."},
    {"id": "r3_cost", "ticker": "COST", "company_name": "Costco", "sector": "Consumer Staples", "emoji": "🛒", "round_id": "inflation_2022", "return_pct": -15.0, "story": "Defensive but not immune. Inflation squeezed margins even for best-in-class retailers."},
    {"id": "r3_dvn", "ticker": "DVN", "company_name": "Devon Energy", "sector": "Energy", "emoji": "⛽", "round_id": "inflation_2022", "return_pct": 60.0, "story": "Rode the oil wave. Strong dividend + buyback program funded by elevated oil prices."},
    {"id": "r3_amzn", "ticker": "AMZN", "company_name": "Amazon", "sector": "E-Commerce", "emoji": "📦", "round_id": "inflation_2022", "return_pct": -50.0, "story": "Post-COVID demand normalization + rate sensitivity crushed the stock. Over-investment in logistics."},
    {"id": "r3_lmt", "ticker": "LMT", "company_name": "Lockheed Martin", "sector": "Defense", "emoji": "🛡️", "round_id": "inflation_2022", "return_pct": 35.0, "story": "Ukraine war → NATO defense spending surge. Direct beneficiary of geopolitical tensions."},
]


# ═══════════════════════════════════════════════════════════════════════════════
# DOCUMENTS (initial batch — Round 1: AI Boom)
# These are synthetic but based on real events/sentiment from the period.
# ═══════════════════════════════════════════════════════════════════════════════

DOCUMENTS = [
    # ── Round 1: AI Boom 2023 ──────────────────────────────────────────────

    # Doc 1: NVDA earnings call excerpt (bullish NVDA)
    {
        "id": "r1_doc_01",
        "source_type": SourceType.earnings_call,
        "title": "NVIDIA Q4 2022 Earnings Call — Data Center Revenue Commentary",
        "raw_text": (
            "Jensen Huang, CEO: 'We are seeing extraordinary demand for our data center GPUs. "
            "The ChatGPT moment has triggered a wave of interest in generative AI that is unlike "
            "anything we have seen in the history of computing. Every major cloud provider and "
            "enterprise is racing to build AI infrastructure. Our data center revenue grew 11% "
            "sequentially and we expect this to accelerate dramatically. The installed base of "
            "data center GPUs worth over $1 trillion will need to be upgraded for AI workloads. "
            "This is not a one-quarter event — this is a platform shift.'"
        ),
        "publish_date": date(2023, 2, 22),
        "source_label": "NVIDIA Investor Relations",
        "author": "Jensen Huang",
        "handle": "",
        "avatar": "💚",
        "engagement": {},
        "tickers_referenced": ["NVDA"],
        "sectors_referenced": ["semiconductors", "AI infrastructure"],
        "signal_direction": SignalDirection.bullish,
        "signal_strength": 5,
        "signal_reasoning": "CEO directly stating unprecedented demand for core product, with specific revenue acceleration guidance.",
        "causal_chain": "ChatGPT adoption → massive AI training demand → NVDA GPU monopoly in AI → data center revenue acceleration → bullish NVDA",
        "keywords": ["data center", "GPU", "generative AI", "ChatGPT", "earnings"],
        "difficulty": Difficulty.easy,
    },

    # Doc 2: Reddit WSB post (mixed / retail hype)
    {
        "id": "r1_doc_02",
        "source_type": SourceType.reddit,
        "title": "AI is going to be BIGGER than crypto. Here's my portfolio.",
        "raw_text": (
            "Bro ChatGPT is literally the iPhone moment for AI. I just asked it to write "
            "my college essay and it was better than anything I could write. Every company "
            "is going to need this. I'm going all in:\n\n"
            "40% NVDA (picks and shovels play)\n"
            "20% MSFT (they own OpenAI basically)\n"
            "20% GOOGL (they invented transformers, they'll catch up)\n"
            "10% IBM (Watson is OG AI, sleeping giant)\n"
            "10% SNAP (My AI feature is genius)\n\n"
            "AI winter is OVER. This is like buying Amazon in 1999. 🚀🚀🚀\n\n"
            "Edit: yes I sold my index funds for this. YOLO."
        ),
        "publish_date": date(2023, 2, 5),
        "source_label": "r/wallstreetbets",
        "author": "u/neural_net_gains",
        "handle": "neural_net_gains",
        "avatar": "🦍",
        "engagement": {"upvotes": "15.2K", "comments": "2.1K"},
        "tickers_referenced": ["NVDA", "MSFT", "GOOGL", "IBM", "SNAP"],
        "sectors_referenced": ["semiconductors", "big_tech", "social_media", "enterprise_tech"],
        "signal_direction": SignalDirection.mixed,
        "signal_strength": 2,
        "signal_reasoning": "Retail enthusiasm confirms narrative strength but indiscriminate buying across all 'AI stocks' ignores quality differences. IBM and SNAP AI positioning is weak.",
        "causal_chain": "Retail AI hype → indiscriminate buying of anything labeled 'AI' → some picks correct (NVDA, MSFT) but others are low-quality AI plays (IBM, SNAP)",
        "keywords": ["AI", "ChatGPT", "retail sentiment", "YOLO", "hype"],
        "difficulty": Difficulty.medium,
    },

    # Doc 3: Microsoft OpenAI investment (bullish MSFT)
    {
        "id": "r1_doc_03",
        "source_type": SourceType.article,
        "title": "Microsoft Confirms $10 Billion Investment in OpenAI, Biggest AI Bet in Tech History",
        "raw_text": (
            "Microsoft has confirmed a multi-year, multi-billion dollar investment in OpenAI, "
            "reported to total $10 billion, making it the largest corporate AI investment ever. "
            "The deal gives Microsoft exclusive cloud computing rights for OpenAI and deep "
            "integration of GPT models across its product suite.\n\n"
            "'This is the most important technology platform shift since mobile,' said CEO "
            "Satya Nadella. Microsoft plans to embed AI across Office 365, Azure, Bing, and "
            "GitHub. The company has already begun rolling out Copilot features.\n\n"
            "Analysts at Goldman Sachs estimate the deal could add $50-100B to Microsoft's "
            "market cap over 3 years through Azure AI revenue and productivity suite pricing power."
        ),
        "publish_date": date(2023, 1, 23),
        "source_label": "Reuters",
        "author": "",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": ["MSFT"],
        "sectors_referenced": ["big_tech", "AI infrastructure", "cloud"],
        "signal_direction": SignalDirection.bullish,
        "signal_strength": 4,
        "signal_reasoning": "Massive capital commitment to AI leadership position. Exclusive cloud rights + product integration creates durable competitive moat.",
        "causal_chain": "$10B OpenAI investment → exclusive GPT integration → Azure AI revenue growth + Office suite pricing power → bullish MSFT",
        "keywords": ["OpenAI", "investment", "Azure", "Copilot", "GPT"],
        "difficulty": Difficulty.easy,
    },

    # Doc 4: Google "Code Red" (bearish then recovery GOOGL)
    {
        "id": "r1_doc_04",
        "source_type": SourceType.article,
        "title": "Google Declares 'Code Red' as ChatGPT Threatens Search Dominance",
        "raw_text": (
            "Internal documents reveal Google CEO Sundar Pichai issued a company-wide 'Code Red' "
            "alert after ChatGPT's explosive growth threatened Google's core search business. "
            "The AI chatbot reached 100 million users in just 2 months — faster than any "
            "technology in history.\n\n"
            "Google's dominance in search, which generates over 80% of parent Alphabet's revenue, "
            "faces its first existential threat in two decades. Former Google engineer says: "
            "'We have the technology but we were too cautious to ship it. Now Microsoft has "
            "the first-mover advantage.'\n\n"
            "Google hastily announced Bard, its ChatGPT competitor, but a factual error in "
            "the demo wiped $100 billion from Alphabet's market cap in a single day."
        ),
        "publish_date": date(2022, 12, 21),
        "source_label": "New York Times",
        "author": "",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": ["GOOGL", "MSFT"],
        "sectors_referenced": ["big_tech", "search", "AI"],
        "signal_direction": SignalDirection.bearish,
        "signal_strength": 4,
        "signal_reasoning": "Existential threat to core revenue stream. Botched Bard demo signals execution risk. First-mover advantage lost to MSFT.",
        "causal_chain": "ChatGPT threatens Google Search → 80% of revenue at risk → botched Bard launch → market confidence drops → bearish GOOGL (short-term)",
        "keywords": ["Code Red", "ChatGPT", "search disruption", "Bard", "existential threat"],
        "difficulty": Difficulty.medium,
    },

    # Doc 5: Intel restructuring (bearish/flat INTC)
    {
        "id": "r1_doc_05",
        "source_type": SourceType.article,
        "title": "Intel's Turnaround Plan Faces Skepticism as AI Boom Bypasses Legacy Chipmaker",
        "raw_text": (
            "Intel CEO Pat Gelsinger's ambitious turnaround strategy is facing growing skepticism "
            "from Wall Street as the AI boom benefits rival NVIDIA but largely bypasses Intel. "
            "The company's datacenter GPU efforts remain years behind NVIDIA's CUDA ecosystem.\n\n"
            "'Intel has great technology for traditional computing, but the market is shifting to "
            "AI accelerators where Intel has almost no presence,' said Bernstein analyst Stacy "
            "Rasgon. 'The company is spending $20B+ on new fabs for chips the market may not "
            "want in 3 years.'\n\n"
            "Intel's stock has underperformed the semiconductor index by 40% over the past year. "
            "While the company has announced its Gaudi AI chip, it has less than 1% market share "
            "in AI training hardware."
        ),
        "publish_date": date(2023, 1, 15),
        "source_label": "Barron's",
        "author": "",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": ["INTC", "NVDA"],
        "sectors_referenced": ["semiconductors", "AI infrastructure"],
        "signal_direction": SignalDirection.bearish,
        "signal_strength": 3,
        "signal_reasoning": "Intel missing the AI wave entirely. Legacy business in structural decline. Turnaround capex may not pay off.",
        "causal_chain": "AI demand shifts to GPUs → Intel has no competitive GPU product → massive capex on legacy fabs → poor ROI → bearish/flat INTC",
        "keywords": ["Intel", "turnaround", "fabs", "AI chips", "Gaudi", "underperformance"],
        "difficulty": Difficulty.easy,
    },

    # Doc 6: Snap earnings miss (bearish SNAP)
    {
        "id": "r1_doc_06",
        "source_type": SourceType.report,
        "title": "Snap Q4 2022 Earnings: Revenue Misses, Ad Market Weakness Persists",
        "raw_text": (
            "Snap Inc. reported Q4 2022 revenue of $1.3B, missing estimates by 3%. More "
            "concerning, the company declined to provide Q1 2023 guidance, citing 'continued "
            "uncertainty in the advertising market.'\n\n"
            "Key metrics:\n"
            "• Daily Active Users: 375M (+17% YoY) — growth is there but can't monetize it\n"
            "• Revenue per user: declining for 3rd straight quarter\n"
            "• Operating loss: $288M (widening)\n"
            "• Announced 20% workforce reduction (1,300 employees)\n\n"
            "The digital advertising market remains under pressure from Apple's privacy changes, "
            "TikTok competition, and macro weakness. Snap has launched 'My AI' chatbot powered "
            "by ChatGPT, but analysts question whether AI features can offset structural ad "
            "revenue challenges."
        ),
        "publish_date": date(2023, 1, 31),
        "source_label": "Snap Inc. Investor Relations",
        "author": "",
        "handle": "",
        "avatar": "👻",
        "engagement": {},
        "tickers_referenced": ["SNAP"],
        "sectors_referenced": ["social_media", "digital_advertising"],
        "signal_direction": SignalDirection.bearish,
        "signal_strength": 4,
        "signal_reasoning": "Revenue miss, no guidance, widening losses, layoffs. AI features (My AI) are a distraction from structural ad market problems.",
        "causal_chain": "Apple privacy changes + TikTok competition → ad revenue decline → operating losses widen → layoffs → bearish SNAP",
        "keywords": ["earnings miss", "advertising", "layoffs", "revenue decline", "Apple privacy"],
        "difficulty": Difficulty.easy,
    },

    # Doc 7: Analyst piece on AI beneficiaries (sector analysis)
    {
        "id": "r1_doc_07",
        "source_type": SourceType.article,
        "title": "Which Companies Actually Benefit From AI? A Framework for Investors",
        "raw_text": (
            "With every company suddenly claiming to be an 'AI company,' investors need a "
            "framework to separate genuine beneficiaries from AI-washers.\n\n"
            "Tier 1 — Infrastructure (highest confidence): Companies selling the picks and "
            "shovels. NVIDIA is the obvious winner with 80%+ market share in AI training chips. "
            "Their CUDA software ecosystem creates switching costs that competitors can't easily "
            "overcome.\n\n"
            "Tier 2 — Platforms (medium confidence): Cloud providers embedding AI into existing "
            "platforms. Microsoft (via OpenAI) and Google (via DeepMind) have real AI capabilities "
            "and distribution. But the monetization timeline is uncertain.\n\n"
            "Tier 3 — AI-Washers (low confidence): Companies adding 'AI' to press releases "
            "without meaningful technology or revenue. IBM's WatsonX, Snap's My AI chatbot, and "
            "dozens of companies doing 'AI transformations' that amount to using ChatGPT APIs. "
            "The market will eventually distinguish real AI plays from posturing.\n\n"
            "Key question to ask: Does this company have proprietary AI technology, or are they "
            "just a customer of someone else's AI?"
        ),
        "publish_date": date(2023, 2, 15),
        "source_label": "Seeking Alpha",
        "author": "TechAlpha Research",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": ["NVDA", "MSFT", "GOOGL", "IBM", "SNAP"],
        "sectors_referenced": ["semiconductors", "big_tech", "AI infrastructure"],
        "signal_direction": SignalDirection.mixed,
        "signal_strength": 4,
        "signal_reasoning": "Provides a clear tiered framework. Strongly bullish Tier 1 (NVDA), moderately bullish Tier 2 (MSFT, GOOGL), bearish Tier 3 (IBM, SNAP).",
        "causal_chain": "AI hype → need to distinguish real vs fake beneficiaries → infrastructure (NVDA) most certain → platforms (MSFT, GOOGL) have real but uncertain upside → 'AI-washers' (IBM, SNAP) will disappoint",
        "keywords": ["AI beneficiaries", "framework", "picks and shovels", "AI washing", "CUDA"],
        "difficulty": Difficulty.medium,
    },

    # Doc 8: IBM WatsonX (red herring — bullish talk but flat outcome)
    {
        "id": "r1_doc_08",
        "source_type": SourceType.article,
        "title": "IBM Unveils WatsonX: 'We've Been Doing AI for a Decade, Now It's Our Moment'",
        "raw_text": (
            "IBM CEO Arvind Krishna unveiled WatsonX, the company's new enterprise AI platform, "
            "calling it 'the culmination of IBM's decade-long AI journey.' The platform promises "
            "enterprise-grade generative AI with data governance and compliance built in.\n\n"
            "'While others are just discovering AI, IBM has been building AI solutions for "
            "enterprises since Watson won Jeopardy in 2011,' said Krishna. 'WatsonX is purpose-built "
            "for the enterprise — not a consumer toy.'\n\n"
            "IBM claims over 40,000 enterprise AI clients and projects WatsonX will contribute "
            "to 'mid-single-digit revenue growth' in the consulting segment. The stock rose 3% "
            "on the announcement.\n\n"
            "However, skeptics note that IBM's previous AI initiatives, including Watson Health "
            "(sold in 2022), failed to deliver on promises. 'IBM talks a great AI game but their "
            "execution track record is poor,' said one hedge fund manager."
        ),
        "publish_date": date(2023, 2, 1),
        "source_label": "Bloomberg",
        "author": "",
        "handle": "",
        "avatar": "🏢",
        "engagement": {},
        "tickers_referenced": ["IBM"],
        "sectors_referenced": ["enterprise_tech", "AI"],
        "signal_direction": SignalDirection.mixed,
        "signal_strength": 2,
        "signal_reasoning": "Bullish press release language but skepticism about execution. IBM has repeatedly failed to deliver on AI promises (Watson Health). 'Mid-single-digit growth' is underwhelming in an AI boom.",
        "causal_chain": "IBM announces WatsonX → sounds impressive → but history of AI execution failures + modest growth guidance → market doesn't fully buy it → flat/minimal upside IBM",
        "keywords": ["WatsonX", "enterprise AI", "Watson", "IBM", "execution risk"],
        "difficulty": Difficulty.medium,
    },

    # Doc 9: ChatGPT growth milestone (macro/sector — bullish AI)
    {
        "id": "r1_doc_09",
        "source_type": SourceType.statistic,
        "title": "ChatGPT Reaches 100 Million Users in 2 Months — Fastest-Growing App in History",
        "raw_text": (
            "OpenAI's ChatGPT has reached an estimated 100 million monthly active users in "
            "just two months after launch, making it the fastest-growing consumer application "
            "in history.\n\n"
            "For comparison:\n"
            "• TikTok: 9 months to reach 100M users\n"
            "• Instagram: 2.5 years to reach 100M users\n"
            "• Spotify: 4.5 years to reach 100M users\n"
            "• Uber: 5+ years to reach 100M users\n\n"
            "Morgan Stanley estimates that generative AI could add $4.4 trillion in annual "
            "economic value globally. Goldman Sachs predicts AI could boost global GDP by 7% "
            "over the next decade.\n\n"
            "The adoption curve suggests AI is not a niche technology but a platform shift "
            "comparable to the internet itself. Companies positioned to capture this demand — "
            "particularly in AI infrastructure (compute, chips) and platforms (cloud, enterprise "
            "software) — stand to benefit enormously."
        ),
        "publish_date": date(2023, 2, 1),
        "source_label": "UBS Research / Reuters",
        "author": "",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": [],
        "sectors_referenced": ["AI infrastructure", "big_tech", "semiconductors"],
        "signal_direction": SignalDirection.bullish,
        "signal_strength": 5,
        "signal_reasoning": "Unprecedented adoption speed validates generative AI as a platform shift, not a fad. Macro signal bullish for AI infrastructure and platform companies.",
        "causal_chain": "ChatGPT fastest app ever → validates massive market demand → companies need AI compute → GPU demand surge (NVDA) + cloud/platform demand (MSFT, GOOGL)",
        "keywords": ["ChatGPT", "100 million users", "adoption", "platform shift", "generative AI"],
        "difficulty": Difficulty.easy,
    },

    # Doc 10: Twitter thread on semiconductor supply (bullish NVDA)
    {
        "id": "r1_doc_10",
        "source_type": SourceType.tweet,
        "title": "",
        "raw_text": (
            "🧵 Thread: Why NVDA's AI moat is MUCH deeper than people realize\n\n"
            "1/ It's not just about making the best chips. It's about CUDA — NVDA's software "
            "ecosystem that 4M+ developers are locked into.\n\n"
            "2/ Switching from CUDA to AMD's ROCm or Intel's oneAPI means rewriting millions "
            "of lines of code. No company will do this.\n\n"
            "3/ H100 GPU demand is so extreme that wait times are 6+ months. Companies are "
            "BEGGING to buy these chips. When was the last time you saw that?\n\n"
            "4/ NVDA's gross margins are expanding because they have pricing power. When demand "
            "outstrips supply this much, the supplier names the price.\n\n"
            "5/ Bottom line: This isn't 'just a chip company.' It's a toll road on the AI "
            "revolution. And toll roads print money. 💰"
        ),
        "publish_date": date(2023, 3, 10),
        "source_label": "X (Twitter)",
        "author": "@semicon_analyst",
        "handle": "semicon_analyst",
        "avatar": "🔬",
        "engagement": {"likes": "24.1K", "retweets": "8.3K", "replies": "1.2K"},
        "tickers_referenced": ["NVDA", "AMD", "INTC"],
        "sectors_referenced": ["semiconductors", "AI infrastructure"],
        "signal_direction": SignalDirection.bullish,
        "signal_strength": 4,
        "signal_reasoning": "Deep analysis of NVDA's competitive moat — CUDA lock-in, supply-demand imbalance, pricing power. Not just hype but structural advantages.",
        "causal_chain": "CUDA ecosystem lock-in + 6-month GPU wait times + expanding margins → NVDA has monopoly-like pricing power in AI chips → bullish NVDA",
        "keywords": ["CUDA", "H100", "GPU shortage", "moat", "pricing power", "software ecosystem"],
        "difficulty": Difficulty.medium,
    },

    # ── Round 2: Banking Crisis 2023 ───────────────────────────────────────

    # Doc 11: Banks' unrealized bond losses (the smoking gun)
    {
        "id": "r2_doc_01",
        "source_type": SourceType.article,
        "title": "The $620 Billion Time Bomb: How Banks' Bond Portfolios Could Blow Up",
        "raw_text": (
            "American banks are sitting on over $620 billion in unrealized losses on their "
            "bond portfolios, according to FDIC data. The problem: banks bought long-duration "
            "Treasury bonds and mortgage-backed securities when rates were near zero. Now that "
            "the Fed has hiked rates aggressively, those bonds have plummeted in value.\n\n"
            "Under current accounting rules (held-to-maturity classification), banks don't have "
            "to mark these losses on their income statements. But if depositors withdraw funds "
            "and banks are forced to sell bonds at a loss, the paper losses become very real.\n\n"
            "Regional banks are especially vulnerable — they hold a higher proportion of "
            "long-duration bonds relative to their total assets. 'This is 2008 in slow motion,' "
            "warned one former Fed official. 'The losses are there. The only question is what "
            "triggers the realization.'"
        ),
        "publish_date": date(2022, 12, 15),
        "source_label": "Financial Times",
        "author": "",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": [],
        "sectors_referenced": ["banking", "regional_banks", "financial_services"],
        "signal_direction": SignalDirection.bearish,
        "signal_strength": 5,
        "signal_reasoning": "This is the smoking gun. $620B in unrealized losses across the banking sector. Regional banks most exposed. Clear systemic risk if deposits flee.",
        "causal_chain": "Fed rate hikes → bond prices collapse → $620B unrealized losses in banks → forced selling if deposits leave → bank solvency risk → bearish banking sector (especially regionals)",
        "keywords": ["unrealized losses", "bond portfolio", "FDIC", "held-to-maturity", "regional banks", "rate hikes"],
        "difficulty": Difficulty.medium,
    },

    # Doc 12: SVB warning signs
    {
        "id": "r2_doc_02",
        "source_type": SourceType.report,
        "title": "Moody's Downgrades SVB Financial — Deposit Concentration and Bond Losses Cited",
        "raw_text": (
            "Moody's Investors Service downgraded Silicon Valley Bank's parent SVB Financial "
            "from A3 to Baa1, citing 'significant exposure to unrealized losses in its "
            "securities portfolio and high deposit concentration risk.'\n\n"
            "Key concerns:\n"
            "• 97% of SVB's deposits exceed the $250K FDIC insurance limit\n"
            "• Unrealized bond losses equal 96% of the bank's equity capital\n"
            "• Customer base heavily concentrated in venture capital / tech startups\n"
            "• If VC-backed startups burn through cash (as expected in a downturn), deposits "
            "will decline, potentially forcing bond sales at realized losses\n\n"
            "SVB management announced a $2.25B capital raise to shore up the balance sheet. "
            "The stock fell 60% following the announcement as investors questioned why the "
            "raise was necessary."
        ),
        "publish_date": date(2023, 3, 8),
        "source_label": "Moody's Ratings",
        "author": "",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": ["SIVB"],
        "sectors_referenced": ["regional_banks", "financial_services"],
        "signal_direction": SignalDirection.bearish,
        "signal_strength": 5,
        "signal_reasoning": "Moody's downgrade with damning specifics — 97% uninsured deposits, losses equal to equity. Capital raise signals desperation. Classic bank run setup.",
        "causal_chain": "SVB bond losses ≈ equity → capital raise signals weakness → uninsured depositors panic → bank run → SVB collapse → contagion to similar banks (SCHW, KRE) → bearish regional banks",
        "keywords": ["SVB", "Moody's downgrade", "uninsured deposits", "capital raise", "bank run"],
        "difficulty": Difficulty.easy,
    },

    # Doc 13: Fed rate hike (macro — bearish banks)
    {
        "id": "r2_doc_03",
        "source_type": SourceType.statistic,
        "title": "FOMC Minutes: Fed Signals More Rate Hikes Ahead Despite Banking Stress",
        "raw_text": (
            "Federal Reserve FOMC Minutes — January/February 2023\n\n"
            "Key excerpts:\n"
            "• 'Inflation remains well above the Committee's 2% objective'\n"
            "• 'Ongoing increases in the target range will be appropriate'\n"
            "• Fed funds rate raised to 4.50-4.75%, highest since 2007\n"
            "• 'The Committee is strongly committed to returning inflation to its 2% target'\n\n"
            "The Fed's aggressive rate-hiking cycle has raised the federal funds rate by "
            "450 basis points in under a year — the fastest tightening since the Volcker era. "
            "Each additional rate hike deepens unrealized losses in bank bond portfolios.\n\n"
            "Market interpretation: The Fed prioritizes inflation over financial stability. "
            "Banks holding long-duration bonds face continued pressure."
        ),
        "publish_date": date(2023, 2, 22),
        "source_label": "Federal Reserve",
        "author": "",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": [],
        "sectors_referenced": ["banking", "macro", "federal_reserve"],
        "signal_direction": SignalDirection.bearish,
        "signal_strength": 4,
        "signal_reasoning": "Fed continues hiking despite banking stress — more bond losses ahead. Inflation priority over financial stability is a dangerous cocktail for banks.",
        "causal_chain": "Fed hikes rates further → bond prices fall more → bank unrealized losses deepen → banking sector pressure increases → bearish banks, but potentially bullish for safe havens (gold, quality megacaps)",
        "keywords": ["FOMC", "rate hike", "inflation", "4.75%", "financial stability", "bond losses"],
        "difficulty": Difficulty.medium,
    },

    # Doc 14: Social media panic about SVB (sentiment signal)
    {
        "id": "r2_doc_04",
        "source_type": SourceType.tweet,
        "title": "",
        "raw_text": (
            "🚨 BREAKING: $42 BILLION in deposits withdrawn from Silicon Valley Bank in A SINGLE DAY.\n\n"
            "This is the largest bank run since Washington Mutual in 2008.\n\n"
            "SVB is DONE. The question now: WHO IS NEXT?\n\n"
            "Every bank with:\n"
            "- Large unrealized bond losses\n"
            "- High uninsured deposit %\n"
            "- Rate-sensitive balance sheet\n\n"
            "...is at risk. Looking at you, First Republic, Schwab, and regionals.\n\n"
            "Get your money out of anything that isn't JPM or the Big 4. NOW. 🏃‍♂️💨"
        ),
        "publish_date": date(2023, 3, 10),
        "source_label": "X (Twitter)",
        "author": "@fintwit_alerts",
        "handle": "fintwit_alerts",
        "avatar": "🚨",
        "engagement": {"likes": "89.4K", "retweets": "42.1K", "replies": "12.3K"},
        "tickers_referenced": ["SIVB", "SCHW", "FRC"],
        "sectors_referenced": ["regional_banks", "financial_services"],
        "signal_direction": SignalDirection.bearish,
        "signal_strength": 5,
        "signal_reasoning": "Real-time panic capturing the bank run dynamic. Correctly identifies contagion candidates (SCHW, regionals). The panic itself accelerates deposits fleeing.",
        "causal_chain": "SVB $42B withdrawal → bank run confirmed → contagion fears → SCHW and regional banks face same dynamic → flight to 'too big to fail' (JPM) and safe havens → bearish SCHW/KRE, bullish JPM/GLD",
        "keywords": ["bank run", "SVB collapse", "contagion", "deposit flight", "Schwab", "regionals"],
        "difficulty": Difficulty.easy,
    },

    # Doc 15: JPMorgan fortress balance sheet (bullish JPM)
    {
        "id": "r2_doc_05",
        "source_type": SourceType.article,
        "title": "Jamie Dimon: 'JPMorgan Is Built for Exactly This Kind of Storm'",
        "raw_text": (
            "In a letter to shareholders, JPMorgan CEO Jamie Dimon struck a confident tone amid "
            "the banking crisis: 'Our fortress balance sheet has $1.4 trillion in cash and "
            "short-duration securities. We stress-test for scenarios far worse than this.'\n\n"
            "JPMorgan's key advantages during the crisis:\n"
            "• Diversified deposit base (no single-industry concentration)\n"
            "• Shorter-duration bond portfolio (smaller unrealized losses)\n"
            "• $190 billion in total loss-absorbing capacity\n"
            "• Too-big-to-fail implicit government backing\n\n"
            "The bank has already absorbed First Republic Bank's deposits and assets, "
            "gaining $173B in loans and $92B in deposits at a significant discount.\n\n"
            "'Every crisis makes the big banks bigger,' noted analyst Mike Mayo. 'JPMorgan "
            "is literally profiting from others' distress.'"
        ),
        "publish_date": date(2023, 3, 15),
        "source_label": "Wall Street Journal",
        "author": "",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": ["JPM", "FRC"],
        "sectors_referenced": ["megabank", "banking"],
        "signal_direction": SignalDirection.bullish,
        "signal_strength": 4,
        "signal_reasoning": "JPM is the crisis beneficiary — absorbing failed banks at a discount, gaining deposits fleeing regionals. Fortress balance sheet narrative is validated.",
        "causal_chain": "Banking crisis → deposits flee regionals → flow to JPM (too big to fail) → JPM absorbs First Republic at discount → crisis makes JPM stronger → bullish JPM",
        "keywords": ["fortress balance sheet", "Jamie Dimon", "First Republic", "too big to fail", "stress test"],
        "difficulty": Difficulty.easy,
    },

    # Doc 16: Schwab bond exposure (bearish SCHW)
    {
        "id": "r2_doc_06",
        "source_type": SourceType.article,
        "title": "Charles Schwab's Bond Portfolio: Is It the Next SVB?",
        "raw_text": (
            "Charles Schwab's stock has fallen 35% since SVB's collapse as investors scrutinize "
            "the brokerage's $173 billion bond portfolio. The comparison is uncomfortable:\n\n"
            "• Schwab has $15.8B in unrealized losses on held-to-maturity securities\n"
            "• Client cash sorting: customers moving from low-yielding sweep accounts to "
            "money market funds offering 4-5%\n"
            "• $15.3B in client funds moved out of bank deposits in Q1 2023\n\n"
            "Schwab management insists the situations are different: 'We have $8 trillion in "
            "client assets and our deposits are retail, not concentrated VC money like SVB.'\n\n"
            "But the math problem is similar: unrealized losses that become real if deposit "
            "outflows force sales. Schwab's net interest revenue — its biggest profit driver — "
            "is being squeezed from both sides."
        ),
        "publish_date": date(2023, 3, 14),
        "source_label": "Barron's",
        "author": "",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": ["SCHW"],
        "sectors_referenced": ["financial_services", "brokerage"],
        "signal_direction": SignalDirection.bearish,
        "signal_strength": 4,
        "signal_reasoning": "Direct comparison to SVB's problem — unrealized bond losses + deposit outflows. Cash sorting dynamic is structural, not temporary.",
        "causal_chain": "Schwab holds $173B in bonds → $15.8B unrealized losses → clients move cash to higher-yielding alternatives → net interest revenue squeezed → SVB comparison drives selloff → bearish SCHW",
        "keywords": ["Schwab", "unrealized losses", "cash sorting", "deposit outflows", "SVB comparison"],
        "difficulty": Difficulty.medium,
    },

    # Doc 17: Gold safe haven (bullish GLD)
    {
        "id": "r2_doc_07",
        "source_type": SourceType.article,
        "title": "Gold Surges Past $2,000 as Banking Crisis Revives Safe Haven Demand",
        "raw_text": (
            "Gold prices surged past $2,000 per ounce for the first time since March 2022, "
            "as the banking crisis triggered a classic flight to safety. The precious metal "
            "has gained 8% since SVB's collapse.\n\n"
            "Central bank gold purchases hit a record 1,136 tonnes in 2022, with China, "
            "Turkey, and India leading buyers. The trend is accelerating in 2023.\n\n"
            "'Gold thrives on exactly this environment: banking instability, uncertainty about "
            "the Fed's path, and loss of confidence in financial institutions,' said World Gold "
            "Council analyst Juan Carlos Artigas.\n\n"
            "Historically, gold has outperformed during every major banking crisis since 1970, "
            "averaging +15% in the 6 months following bank failures."
        ),
        "publish_date": date(2023, 3, 17),
        "source_label": "Reuters",
        "author": "",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": ["GLD"],
        "sectors_referenced": ["gold", "safe_haven", "commodities"],
        "signal_direction": SignalDirection.bullish,
        "signal_strength": 4,
        "signal_reasoning": "Clear historical pattern: gold rallies during banking crises. Central bank buying adds structural demand. $2,000 breakout is technically significant.",
        "causal_chain": "Banking crisis → loss of confidence in financial system → flight to safety → gold demand surges → central bank buying accelerates → bullish GLD",
        "keywords": ["gold", "$2000", "safe haven", "banking crisis", "central bank buying"],
        "difficulty": Difficulty.easy,
    },

    # Doc 18: Apple/big tech as safety (bullish AAPL)
    {
        "id": "r2_doc_08",
        "source_type": SourceType.tweet,
        "title": "",
        "raw_text": (
            "Fascinating capital flow data from Bank of America:\n\n"
            "Since SVB collapse:\n"
            "• $105B OUT of bank stocks\n"
            "• $47B OUT of small caps\n"
            "• $62B INTO mega-cap tech (AAPL, MSFT, GOOGL)\n"
            "• $18B INTO gold\n\n"
            "When the financial system wobbles, investors run to companies with:\n"
            "✅ $200B+ cash on balance sheet\n"
            "✅ No debt maturity concerns\n"
            "✅ Revenue from billions of customers, not interest income\n\n"
            "Apple is the ultimate 'mattress stock.' It's basically a savings account that "
            "also sells iPhones. 📱💰"
        ),
        "publish_date": date(2023, 3, 20),
        "source_label": "X (Twitter)",
        "author": "@macro_insights",
        "handle": "macro_insights",
        "avatar": "📊",
        "engagement": {"likes": "31.2K", "retweets": "12.7K", "replies": "3.4K"},
        "tickers_referenced": ["AAPL", "MSFT", "GOOGL"],
        "sectors_referenced": ["big_tech", "megacap"],
        "signal_direction": SignalDirection.bullish,
        "signal_strength": 4,
        "signal_reasoning": "Hard capital flow data showing money rotating from banks into quality mega-cap tech. AAPL as 'mattress stock' during banking crisis is a classic flight-to-safety pattern.",
        "causal_chain": "Banking crisis → capital flees financial sector → flows into mega-cap tech with fortress balance sheets → AAPL as ultimate safe haven → bullish AAPL",
        "keywords": ["capital flows", "flight to safety", "mega-cap tech", "Apple", "cash on balance sheet"],
        "difficulty": Difficulty.medium,
    },

    # Doc 19: Red herring — "banking crisis contained" (misleading for SCHW/KRE)
    {
        "id": "r2_doc_09",
        "source_type": SourceType.article,
        "title": "Treasury Secretary Yellen: 'Banking System Is Sound, Crisis Is Contained'",
        "raw_text": (
            "Treasury Secretary Janet Yellen assured markets that the U.S. banking system "
            "remains 'sound and resilient' following the collapse of Silicon Valley Bank and "
            "Signature Bank.\n\n"
            "'The government took decisive action to protect depositors and prevent contagion,' "
            "Yellen said. 'Americans should feel confident their deposits are safe.'\n\n"
            "The FDIC has guaranteed all deposits at failed banks, including uninsured amounts "
            "above $250K. The Fed's new Bank Term Funding Program allows banks to borrow against "
            "bonds at par value, effectively backstopping unrealized losses.\n\n"
            "Several analysts echoed the containment view: 'This is not 2008. The problems are "
            "isolated to banks with specific risk profiles — concentrated deposits, long-duration "
            "bonds, and poor risk management. The broader system is well-capitalized.'"
        ),
        "publish_date": date(2023, 3, 16),
        "source_label": "CNBC",
        "author": "",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": [],
        "sectors_referenced": ["banking", "federal_reserve", "macro"],
        "signal_direction": SignalDirection.mixed,
        "signal_strength": 3,
        "signal_reasoning": "Government reassurance is mixed signal. Yes, deposits are backstopped. But BTFP is a band-aid — the underlying rate risk hasn't changed. SCHW and regionals still face structural issues even if no more banks 'fail.'",
        "causal_chain": "Government says 'contained' → prevents total panic → but underlying problems persist → SCHW still has bond losses and cash sorting → crisis premium stays on regionals → mixed signal",
        "keywords": ["Yellen", "contained", "FDIC", "BTFP", "deposits safe", "not 2008"],
        "difficulty": Difficulty.hard,
    },

    # ── Round 3: Inflation 2022 ────────────────────────────────────────────

    # Doc 20: Fed hawkish pivot
    {
        "id": "r3_doc_01",
        "source_type": SourceType.statistic,
        "title": "FOMC Statement: Fed Signals 'Expeditious' Rate Hikes to Combat Inflation",
        "raw_text": (
            "Federal Reserve FOMC Statement — January 26, 2022\n\n"
            "The Committee decided to maintain the target range for the federal funds rate "
            "at 0 to 1/4 percent. However, with inflation well above 2 percent and a strong "
            "labor market, the Committee expects it will soon be appropriate to raise the "
            "target range.\n\n"
            "Chair Powell post-meeting press conference highlights:\n"
            "• 'Inflation is well above our 2% target and the labor market is extremely tight'\n"
            "• 'I think there's quite a bit of room to raise interest rates'\n"
            "• Asked about 50 basis point hikes: 'I don't want to rule anything out'\n"
            "• 'We will be nimble' — hawkish shift in language\n\n"
            "Market reaction: 10-year Treasury yield surged to 1.87%. Growth stocks sold off "
            "sharply, with Nasdaq falling 2.3% following the announcement. Rate-sensitive "
            "sectors — tech, growth, unprofitable companies — are most vulnerable."
        ),
        "publish_date": date(2022, 1, 26),
        "source_label": "Federal Reserve",
        "author": "",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": [],
        "sectors_referenced": ["macro", "federal_reserve", "growth_stocks"],
        "signal_direction": SignalDirection.bearish,
        "signal_strength": 5,
        "signal_reasoning": "Fed explicitly pivoting from 0% rates to aggressive hikes. 'Quite a bit of room to raise rates' + refusing to rule out 50bp hikes. Devastating for growth/tech stocks that depend on low discount rates.",
        "causal_chain": "Fed signals aggressive rate hikes → higher discount rates → growth stock valuations compress (high P/E multiples shrink) → bearish META, AMZN, growth tech → bullish for value, commodities",
        "keywords": ["FOMC", "rate hikes", "inflation", "hawkish pivot", "growth stocks", "Nasdaq"],
        "difficulty": Difficulty.medium,
    },

    # Doc 21: CPI inflation data
    {
        "id": "r3_doc_02",
        "source_type": SourceType.statistic,
        "title": "U.S. Inflation Hits 7.5% — Highest Since 1982",
        "raw_text": (
            "Bureau of Labor Statistics — Consumer Price Index, January 2022\n\n"
            "• CPI-U: +7.5% year-over-year (vs. 7.2% expected)\n"
            "• Core CPI (ex food & energy): +6.0% year-over-year\n"
            "• Month-over-month: +0.6%\n\n"
            "Categories with highest inflation:\n"
            "• Energy: +27.0%\n"
            "• Used cars: +40.5%\n"
            "• Food at home: +7.4%\n"
            "• Shelter: +4.4% (lagging indicator, expected to rise further)\n\n"
            "This is the highest inflation reading since February 1982. Markets now pricing "
            "in 5-7 rate hikes for 2022, up from 3-4 just a month ago.\n\n"
            "Goldman Sachs: 'The Fed is behind the curve. They need to hike aggressively, "
            "and that means pain for risk assets.'"
        ),
        "publish_date": date(2022, 2, 10),
        "source_label": "Bureau of Labor Statistics",
        "author": "",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": [],
        "sectors_referenced": ["macro", "energy", "consumer_staples"],
        "signal_direction": SignalDirection.bearish,
        "signal_strength": 5,
        "signal_reasoning": "7.5% CPI is a screaming signal. Beats expectations, highest in 40 years. Energy inflation +27% (bullish energy stocks). Aggressive rate hikes incoming (bearish growth).",
        "causal_chain": "7.5% inflation → Fed forced to hike aggressively → higher rates → growth stocks crushed (META, AMZN) → energy benefits from inflation (XOM, DVN) → defensive rotation",
        "keywords": ["CPI", "7.5%", "inflation", "40-year high", "energy", "rate hikes"],
        "difficulty": Difficulty.easy,
    },

    # Doc 22: Russia-Ukraine invasion
    {
        "id": "r3_doc_03",
        "source_type": SourceType.article,
        "title": "Russia Invades Ukraine in Largest European Military Conflict Since WWII",
        "raw_text": (
            "Russian forces launched a full-scale invasion of Ukraine on February 24, 2022, "
            "with missile strikes on major cities and ground troops advancing on multiple fronts. "
            "The attack marks the largest military conflict in Europe since World War II.\n\n"
            "Immediate market impacts:\n"
            "• Brent crude oil surged 8% to $105/barrel, highest since 2014\n"
            "• European natural gas prices up 62% (Russia supplies 40% of EU gas)\n"
            "• Global wheat prices hit record highs (Ukraine is 'breadbasket of Europe')\n"
            "• Defense stocks rallied sharply: Lockheed Martin +8%, Raytheon +5%\n"
            "• S&P 500 initially fell 2.5% then recovered\n\n"
            "Western nations announced unprecedented sanctions on Russia, including freezing "
            "central bank reserves and cutting major banks from SWIFT. NATO allies pledged to "
            "increase defense spending to 2%+ of GDP."
        ),
        "publish_date": date(2022, 2, 24),
        "source_label": "Associated Press",
        "author": "",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": ["LMT"],
        "sectors_referenced": ["energy", "defense", "macro", "commodities"],
        "signal_direction": SignalDirection.bullish,
        "signal_strength": 5,
        "signal_reasoning": "War disrupts energy supply (bullish oil/energy), triggers defense spending surge (bullish LMT), adds to inflation pressure. Clear sector rotation signal.",
        "causal_chain": "Russia invades Ukraine → energy supply disruption → oil surges → XOM/DVN profit → NATO defense spending increase → LMT/defense surge → adds to inflation → more rate hikes → more pain for growth",
        "keywords": ["Ukraine", "invasion", "oil", "defense spending", "NATO", "sanctions", "energy crisis"],
        "difficulty": Difficulty.easy,
    },

    # Doc 23: Oil price surge / energy supply
    {
        "id": "r3_doc_04",
        "source_type": SourceType.article,
        "title": "Oil Hits $130 as Western Ban on Russian Energy Reshapes Global Markets",
        "raw_text": (
            "Crude oil prices hit $130 per barrel in March 2022, the highest since 2008, as "
            "Western nations moved to ban Russian oil imports. The U.S. announced a full ban "
            "on Russian energy imports, while Europe outlined plans to reduce dependence by "
            "two-thirds within a year.\n\n"
            "Energy companies are posting record profits:\n"
            "• Exxon Mobil Q1 2022 profit: $5.5B (vs. $2.7B year ago)\n"
            "• Chevron Q1: $6.3B profit, doubled YoY\n"
            "• Devon Energy: raised dividend by 27%, announced $1B buyback\n\n"
            "The energy sector is the only S&P 500 sector in positive territory YTD, up 38% "
            "while the broader index is down 12%. Analysts expect elevated prices to persist: "
            "'Years of underinvestment in fossil fuels have created a structural supply deficit. "
            "You can't replace Russian energy overnight.'"
        ),
        "publish_date": date(2022, 3, 8),
        "source_label": "Bloomberg",
        "author": "",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": ["XOM", "DVN"],
        "sectors_referenced": ["energy", "oil"],
        "signal_direction": SignalDirection.bullish,
        "signal_strength": 5,
        "signal_reasoning": "Oil at $130, record energy profits, structural supply deficit. Energy is the only sector up while everything else is down. Clear bullish signal for XOM, DVN.",
        "causal_chain": "Russian energy ban → supply deficit → oil at $130 → XOM/DVN record profits → energy only positive sector → structural underinvestment means elevated prices persist → bullish energy",
        "keywords": ["oil $130", "Russian ban", "record profits", "supply deficit", "energy", "Exxon"],
        "difficulty": Difficulty.easy,
    },

    # Doc 24: Meta/Metaverse backlash (bearish META)
    {
        "id": "r3_doc_05",
        "source_type": SourceType.article,
        "title": "Meta Burned $10 Billion on the Metaverse Last Year. Investors Are Furious.",
        "raw_text": (
            "Meta Platforms' Reality Labs division lost $10.2 billion in 2021 and CEO Mark "
            "Zuckerberg shows no signs of slowing down. The company plans to spend $10-15 "
            "billion annually on metaverse development — a technology that most analysts say "
            "is 5-10 years from mass adoption, if it ever arrives.\n\n"
            "'This is the most expensive science project in corporate history,' said Altimeter "
            "Capital's Brad Gerstner in an open letter demanding Meta cut spending. 'Meta has "
            "lost investors' confidence by spending too much, too fast, on things that are too "
            "far away.'\n\n"
            "Meanwhile, Meta's core advertising business faces pressure from:\n"
            "• Apple's privacy changes (ATT) cutting ad targeting precision\n"
            "• TikTok stealing engagement from Instagram\n"
            "• Macro slowdown reducing ad budgets\n\n"
            "The stock is down 50% from its 2021 highs. With the Fed raising rates, Meta's "
            "sky-high valuation multiple is getting compressed further."
        ),
        "publish_date": date(2022, 2, 3),
        "source_label": "Wall Street Journal",
        "author": "",
        "handle": "",
        "avatar": "👓",
        "engagement": {},
        "tickers_referenced": ["META"],
        "sectors_referenced": ["big_tech", "social_media", "metaverse"],
        "signal_direction": SignalDirection.bearish,
        "signal_strength": 5,
        "signal_reasoning": "Triple threat: $10B+ metaverse spending with no revenue, core ad business under pressure (Apple, TikTok), and rate hikes compressing valuation. Investors openly revolting.",
        "causal_chain": "$10B+ metaverse spending → no near-term return → core ad business weakening (Apple ATT, TikTok) → rate hikes compress P/E multiple → investor revolt → bearish META",
        "keywords": ["Metaverse", "$10 billion loss", "Reality Labs", "ad revenue", "Apple ATT", "valuation"],
        "difficulty": Difficulty.easy,
    },

    # Doc 25: Growth stocks vulnerable to rate hikes (macro analysis)
    {
        "id": "r3_doc_06",
        "source_type": SourceType.article,
        "title": "Why Rising Rates Are Kryptonite for Growth Stocks — A Visual Explainer",
        "raw_text": (
            "With the Fed embarking on its most aggressive rate-hiking cycle since the 1980s, "
            "here's why growth stocks are getting crushed:\n\n"
            "The math is simple: Growth stocks derive most of their value from FUTURE earnings. "
            "When you discount those future earnings at a higher rate, today's value drops "
            "dramatically.\n\n"
            "Example: A company expected to earn $10/share in 2032\n"
            "• At 1% discount rate: worth $9.05 today\n"
            "• At 5% discount rate: worth $6.14 today (-32%)\n\n"
            "This is why unprofitable high-growth companies (many 2021 darlings) are down "
            "50-80%: Peloton (-75%), Zoom (-70%), Rivian (-80%).\n\n"
            "Even profitable growth companies aren't immune. Amazon (trading at 50x forward earnings) "
            "and Meta (growth decelerating) face significant valuation compression.\n\n"
            "The winners in a rising-rate environment? Value stocks, energy, commodities, and "
            "companies with current (not future) cash flows."
        ),
        "publish_date": date(2022, 1, 20),
        "source_label": "Morningstar",
        "author": "",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": ["AMZN", "META"],
        "sectors_referenced": ["growth_stocks", "big_tech", "value_stocks", "energy"],
        "signal_direction": SignalDirection.bearish,
        "signal_strength": 4,
        "signal_reasoning": "Clear framework explaining why rate hikes crush growth stocks. Provides the discount rate math that explains META and AMZN pain. Points toward value/energy as alternatives.",
        "causal_chain": "Fed hikes rates → discount rates rise → future earnings worth less today → growth stock valuations compress → META (-65%), AMZN (-50%) → rotation to value, energy, current cash flow businesses",
        "keywords": ["discount rate", "growth stocks", "rate hikes", "valuation compression", "value rotation"],
        "difficulty": Difficulty.medium,
    },

    # Doc 26: Amazon post-COVID normalization (bearish AMZN)
    {
        "id": "r3_doc_07",
        "source_type": SourceType.report,
        "title": "Amazon Q4 2021 Earnings: Revenue Misses, Warns of 'Significant' Cost Pressures",
        "raw_text": (
            "Amazon reported Q4 2021 results that missed revenue estimates and warned of "
            "rising costs in 2022:\n\n"
            "• Revenue: $137.4B (vs. $137.9B expected)\n"
            "• Operating income: $3.5B (down 50% YoY)\n"
            "• AWS revenue: $17.8B (+40% YoY) — bright spot but not enough\n\n"
            "Key concerns:\n"
            "• E-commerce demand normalizing post-COVID: 'We overbuilt fulfillment capacity '\n"
            "• Labor costs: $4B in additional costs from wage increases and hiring\n"
            "• Excess warehouse space: doubled logistics footprint during COVID, now overcapacity\n"
            "• CFO guidance: 'Operating income could range from $0 to $3B' in Q1 2022\n\n"
            "CEO Andy Jassy: 'We are working to right-size our cost structure, but the "
            "e-commerce normalization is real. We pulled forward 2-3 years of growth during "
            "COVID, and now we're digesting it.'"
        ),
        "publish_date": date(2022, 2, 3),
        "source_label": "Amazon Investor Relations",
        "author": "",
        "handle": "",
        "avatar": "📦",
        "engagement": {},
        "tickers_referenced": ["AMZN"],
        "sectors_referenced": ["e_commerce", "big_tech", "cloud"],
        "signal_direction": SignalDirection.bearish,
        "signal_strength": 4,
        "signal_reasoning": "Revenue miss, 50% profit decline, overcapacity warnings. COVID demand was pulled forward — now reversing. Operating income could hit $0. At 50x earnings, this valuation can't hold.",
        "causal_chain": "COVID e-commerce boom ending → demand normalization → overcapacity + rising costs → operating income collapsing → at high P/E, stock vulnerable → bearish AMZN",
        "keywords": ["e-commerce normalization", "overcapacity", "cost pressures", "COVID pullforward", "earnings miss"],
        "difficulty": Difficulty.medium,
    },

    # Doc 27: NATO defense spending (bullish LMT)
    {
        "id": "r3_doc_08",
        "source_type": SourceType.article,
        "title": "NATO Allies Pledge Historic Defense Spending Increases After Ukraine Invasion",
        "raw_text": (
            "NATO allies have committed to the most significant defense spending increase in "
            "a generation following Russia's invasion of Ukraine. Germany alone announced a "
            "€100 billion special defense fund — a dramatic reversal of decades of military "
            "underspending.\n\n"
            "Key commitments:\n"
            "• Germany: €100B defense fund + commitment to 2% GDP defense spending\n"
            "• Poland: increasing defense budget to 3% of GDP\n"
            "• UK: adding £24B over 4 years\n"
            "• Sweden and Finland: fast-tracking NATO membership\n\n"
            "Defense analysts estimate global defense spending will increase by $200-300 billion "
            "annually by 2025. 'This is a structural shift, not a temporary spike,' said CSIS "
            "analyst Mark Cancian. 'These spending commitments take 10-15 years to unwind.'\n\n"
            "Major U.S. defense contractors — Lockheed Martin, Raytheon, Northrop Grumman — "
            "are the primary beneficiaries, with existing production lines and government contracts."
        ),
        "publish_date": date(2022, 3, 25),
        "source_label": "Defense News",
        "author": "",
        "handle": "",
        "avatar": "",
        "engagement": {},
        "tickers_referenced": ["LMT"],
        "sectors_referenced": ["defense", "military"],
        "signal_direction": SignalDirection.bullish,
        "signal_strength": 5,
        "signal_reasoning": "Historic defense spending commitments. €100B from Germany alone. Structural shift lasting 10-15 years, not temporary. Direct revenue pipeline for LMT.",
        "causal_chain": "Ukraine invasion → NATO defense spending surge (€100B+ Germany alone) → structural multi-year increase → LMT as primary contractor → guaranteed revenue pipeline → bullish LMT",
        "keywords": ["NATO", "defense spending", "Germany €100B", "structural shift", "Lockheed Martin"],
        "difficulty": Difficulty.easy,
    },

    # Doc 28: Red herring — "buy the dip in tech"
    {
        "id": "r3_doc_09",
        "source_type": SourceType.reddit,
        "title": "The tech selloff is a gift. Here's why I'm buying META and AMZN hand over fist.",
        "raw_text": (
            "Everyone is panicking about rate hikes. I've seen this movie before.\n\n"
            "Remember 2018? Fed hiked rates, market dipped 20%, then ripped to new highs in "
            "2019. Remember March 2020? Crash, then biggest rally ever.\n\n"
            "META at 13x earnings is INSANELY cheap for a company with 3.6B users and $40B "
            "in annual free cash flow. Sure, the Metaverse spending is wild, but the core "
            "business is a cash machine.\n\n"
            "AMZN at 50x earnings looks expensive until you realize AWS alone is worth $1.5T. "
            "You're basically getting e-commerce for free.\n\n"
            "The Fed will pivot by Q3. They always do. Inflation will come down. And tech "
            "will lead the next leg up, just like always.\n\n"
            "DCA into quality tech on every dip. Thank me in 12 months. 💎🙌"
        ),
        "publish_date": date(2022, 3, 1),
        "source_label": "r/stocks",
        "author": "u/btd_forever",
        "handle": "btd_forever",
        "avatar": "💎",
        "engagement": {"upvotes": "8.7K", "comments": "1.9K"},
        "tickers_referenced": ["META", "AMZN"],
        "sectors_referenced": ["big_tech", "growth_stocks"],
        "signal_direction": SignalDirection.mixed,
        "signal_strength": 2,
        "signal_reasoning": "Classic 'buy the dip' narrative that ignores the structural change in rates. 2018 and 2020 comparisons are misleading — the Fed cut rates quickly then. This time inflation is persistent. Fed won't pivot in 2022.",
        "causal_chain": "Buy-the-dip narrative assumes Fed pivot → but inflation at 7.5% means no pivot → rates keep rising → META -65%, AMZN -50% → this advice leads to catching a falling knife",
        "keywords": ["buy the dip", "Fed pivot", "DCA", "tech selloff", "falling knife"],
        "difficulty": Difficulty.hard,
    },
]


# ═══════════════════════════════════════════════════════════════════════════════
# DOCUMENT-STOCK RELEVANCE MAPPINGS
# ═══════════════════════════════════════════════════════════════════════════════

RELEVANCE_MAPPINGS = [
    # ── Round 1: AI Boom ───────────────────────────────────────────────────

    # Doc 1 (NVDA earnings) → NVDA
    {"id": "rel_r1_01", "doc_id": "r1_doc_01", "stock_id": "r1_nvda", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "NVDA CEO states unprecedented GPU demand from AI → direct revenue acceleration → bullish NVDA"},

    # Doc 2 (WSB post) → multiple
    {"id": "rel_r1_02a", "doc_id": "r1_doc_02", "stock_id": "r1_nvda", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "Retail hype confirms AI narrative strength → broad buying includes NVDA → moderate bullish signal"},
    {"id": "rel_r1_02b", "doc_id": "r1_doc_02", "stock_id": "r1_ibm", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.mixed, "causal_chain_for_ticker": "Retail investor includes IBM in AI portfolio → shows undiscriminating hype → IBM's AI credentials are weak → contrarian bearish signal"},
    {"id": "rel_r1_02c", "doc_id": "r1_doc_02", "stock_id": "r1_snap", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.mixed, "causal_chain_for_ticker": "Retail includes SNAP as 'AI play' → shows hype-driven reasoning → SNAP's My AI is superficial → contrarian bearish signal"},

    # Doc 3 (MSFT $10B) → MSFT
    {"id": "rel_r1_03", "doc_id": "r1_doc_03", "stock_id": "r1_msft", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "$10B OpenAI investment → exclusive GPT integration → Azure + Office AI revenue → bullish MSFT"},

    # Doc 4 (Google Code Red) → GOOGL
    {"id": "rel_r1_04", "doc_id": "r1_doc_04", "stock_id": "r1_googl", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "ChatGPT threatens Search → 80% of GOOGL revenue at risk → botched Bard launch → bearish short-term (though GOOGL recovered)"},

    # Doc 5 (Intel turnaround) → INTC
    {"id": "rel_r1_05a", "doc_id": "r1_doc_05", "stock_id": "r1_intc", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "Intel has no AI GPU product → AI boom bypasses INTC → turnaround capex questionable → bearish/flat INTC"},
    {"id": "rel_r1_05b", "doc_id": "r1_doc_05", "stock_id": "r1_nvda", "relevance_type": RelevanceType.sector, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "Intel's AI weakness confirms NVDA's dominance in AI chips → bullish NVDA by contrast"},

    # Doc 6 (Snap earnings miss) → SNAP
    {"id": "rel_r1_06", "doc_id": "r1_doc_06", "stock_id": "r1_snap", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "Revenue miss + no guidance + widening losses + layoffs → structural ad market problems → bearish SNAP"},

    # Doc 7 (AI beneficiary framework) → multiple
    {"id": "rel_r1_07a", "doc_id": "r1_doc_07", "stock_id": "r1_nvda", "relevance_type": RelevanceType.sector, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "Tier 1 infrastructure = highest confidence AI play → NVDA 80%+ GPU market share → CUDA lock-in → bullish"},
    {"id": "rel_r1_07b", "doc_id": "r1_doc_07", "stock_id": "r1_msft", "relevance_type": RelevanceType.sector, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "Tier 2 platform with real AI capabilities + distribution → bullish MSFT"},
    {"id": "rel_r1_07c", "doc_id": "r1_doc_07", "stock_id": "r1_ibm", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "Classified as 'AI-washer' Tier 3 → market will see through IBM's AI positioning → bearish/flat IBM"},
    {"id": "rel_r1_07d", "doc_id": "r1_doc_07", "stock_id": "r1_snap", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "My AI chatbot classified as Tier 3 AI-washing → no meaningful AI revenue → bearish SNAP"},

    # Doc 8 (IBM WatsonX) → IBM
    {"id": "rel_r1_08", "doc_id": "r1_doc_08", "stock_id": "r1_ibm", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.mixed, "causal_chain_for_ticker": "WatsonX announcement sounds impressive → but Watson Health failure history + modest growth guidance → market skeptical → flat/minimal upside IBM"},

    # Doc 9 (ChatGPT 100M users) → macro/sector
    {"id": "rel_r1_09a", "doc_id": "r1_doc_09", "stock_id": "r1_nvda", "relevance_type": RelevanceType.macro, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "100M users in 2 months validates AI platform shift → massive compute demand → NVDA GPU demand surge"},
    {"id": "rel_r1_09b", "doc_id": "r1_doc_09", "stock_id": "r1_msft", "relevance_type": RelevanceType.macro, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "ChatGPT adoption validates Microsoft's OpenAI investment → Azure + Office AI demand → bullish MSFT"},

    # Doc 10 (NVDA moat thread) → NVDA, INTC
    {"id": "rel_r1_10a", "doc_id": "r1_doc_10", "stock_id": "r1_nvda", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "CUDA lock-in + 6-month wait times + pricing power → monopoly-like position → bullish NVDA"},
    {"id": "rel_r1_10b", "doc_id": "r1_doc_10", "stock_id": "r1_intc", "relevance_type": RelevanceType.sector, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "NVDA's deep moat (CUDA, ecosystem) means Intel's Gaudi chip can't compete → bearish INTC in AI"},

    # ── Round 2: Banking Crisis ────────────────────────────────────────────

    # Doc 11 (unrealized bond losses) → KRE, SCHW
    {"id": "rel_r2_01a", "doc_id": "r2_doc_01", "stock_id": "r2_kre", "relevance_type": RelevanceType.sector, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "$620B unrealized losses → regional banks most exposed → forced selling risk → bearish KRE"},
    {"id": "rel_r2_01b", "doc_id": "r2_doc_01", "stock_id": "r2_schw", "relevance_type": RelevanceType.sector, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "Schwab has large bond portfolio → same rate risk as regional banks → bearish SCHW"},

    # Doc 12 (SVB downgrade) → KRE
    {"id": "rel_r2_02", "doc_id": "r2_doc_02", "stock_id": "r2_kre", "relevance_type": RelevanceType.sector, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "SVB downgrade shows contagion risk template → similar banks face same scrutiny → bearish KRE sector"},

    # Doc 13 (Fed rate hike) → macro for multiple
    {"id": "rel_r2_03a", "doc_id": "r2_doc_03", "stock_id": "r2_kre", "relevance_type": RelevanceType.macro, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "Fed keeps hiking → bond losses deepen → more pressure on bank balance sheets → bearish KRE"},
    {"id": "rel_r2_03b", "doc_id": "r2_doc_03", "stock_id": "r2_gld", "relevance_type": RelevanceType.macro, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "Fed hikes create financial instability risk → uncertainty drives safe haven demand → bullish GLD"},

    # Doc 14 (SVB bank run tweet) → SCHW, KRE, JPM
    {"id": "rel_r2_04a", "doc_id": "r2_doc_04", "stock_id": "r2_schw", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "Tweet explicitly names Schwab as 'next at risk' → contagion panic → deposits leave → bearish SCHW"},
    {"id": "rel_r2_04b", "doc_id": "r2_doc_04", "stock_id": "r2_kre", "relevance_type": RelevanceType.sector, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "'Get out of anything that isn't Big 4' → broad regional bank panic → bearish KRE"},
    {"id": "rel_r2_04c", "doc_id": "r2_doc_04", "stock_id": "r2_jpm", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "Flight to safety → 'only JPM and Big 4 are safe' → deposit inflows → bullish JPM"},

    # Doc 15 (JPM fortress) → JPM
    {"id": "rel_r2_05", "doc_id": "r2_doc_05", "stock_id": "r2_jpm", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "Fortress balance sheet + absorbing First Republic at discount → crisis makes JPM stronger → bullish JPM"},

    # Doc 16 (Schwab bond exposure) → SCHW
    {"id": "rel_r2_06", "doc_id": "r2_doc_06", "stock_id": "r2_schw", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "$15.8B unrealized losses + cash sorting + SVB comparison → net interest revenue squeezed → bearish SCHW"},

    # Doc 17 (Gold safe haven) → GLD
    {"id": "rel_r2_07", "doc_id": "r2_doc_07", "stock_id": "r2_gld", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "Banking crisis → historical pattern of gold outperformance → central bank buying record → bullish GLD"},

    # Doc 18 (AAPL flight to safety) → AAPL
    {"id": "rel_r2_08", "doc_id": "r2_doc_08", "stock_id": "r2_aapl", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "$62B flowing into mega-cap tech → AAPL $200B+ cash balance sheet = 'mattress stock' → flight to quality → bullish AAPL"},

    # Doc 19 (crisis contained — red herring) → mixed for multiple
    {"id": "rel_r2_09a", "doc_id": "r2_doc_09", "stock_id": "r2_schw", "relevance_type": RelevanceType.macro, "signal_direction_for_ticker": SignalDirection.mixed, "causal_chain_for_ticker": "Government says 'contained' but underlying problems persist → SCHW still has structural issues → misleading reassurance"},
    {"id": "rel_r2_09b", "doc_id": "r2_doc_09", "stock_id": "r2_kre", "relevance_type": RelevanceType.macro, "signal_direction_for_ticker": SignalDirection.mixed, "causal_chain_for_ticker": "FDIC backstop prevents total panic → but regionals still face rate risk and deposit competition → mixed outlook"},

    # ── Round 3: Inflation 2022 ────────────────────────────────────────────

    # Doc 20 (Fed hawkish pivot) → macro for multiple
    {"id": "rel_r3_01a", "doc_id": "r3_doc_01", "stock_id": "r3_meta", "relevance_type": RelevanceType.macro, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "Aggressive rate hikes → growth stock P/E compression → META at high multiple vulnerable → bearish META"},
    {"id": "rel_r3_01b", "doc_id": "r3_doc_01", "stock_id": "r3_amzn", "relevance_type": RelevanceType.macro, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "Rate hikes → AMZN at 50x earnings gets compressed → rate-sensitive growth stock → bearish AMZN"},

    # Doc 21 (CPI 7.5%) → macro
    {"id": "rel_r3_02a", "doc_id": "r3_doc_02", "stock_id": "r3_xom", "relevance_type": RelevanceType.macro, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "Energy inflation +27% → oil prices elevated → XOM revenue surge → bullish XOM"},
    {"id": "rel_r3_02b", "doc_id": "r3_doc_02", "stock_id": "r3_meta", "relevance_type": RelevanceType.macro, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "7.5% CPI → more aggressive rate hikes needed → growth stock pain → bearish META"},

    # Doc 22 (Ukraine invasion) → XOM, DVN, LMT
    {"id": "rel_r3_03a", "doc_id": "r3_doc_03", "stock_id": "r3_xom", "relevance_type": RelevanceType.sector, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "Russia invasion → energy supply disruption → oil surges → XOM record profits → bullish"},
    {"id": "rel_r3_03b", "doc_id": "r3_doc_03", "stock_id": "r3_dvn", "relevance_type": RelevanceType.sector, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "Oil supply shock → prices surge → DVN benefits from elevated prices → bullish"},
    {"id": "rel_r3_03c", "doc_id": "r3_doc_03", "stock_id": "r3_lmt", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "War → NATO defense spending → LMT as primary contractor → bullish"},

    # Doc 23 (Oil $130) → XOM, DVN
    {"id": "rel_r3_04a", "doc_id": "r3_doc_04", "stock_id": "r3_xom", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "Oil at $130 + record quarterly profits cited → structural supply deficit → bullish XOM"},
    {"id": "rel_r3_04b", "doc_id": "r3_doc_04", "stock_id": "r3_dvn", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "Devon Energy specifically mentioned — dividend raise + buyback → shareholder returns + oil exposure → bullish DVN"},

    # Doc 24 (Meta metaverse) → META
    {"id": "rel_r3_05", "doc_id": "r3_doc_05", "stock_id": "r3_meta", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "$10B+ metaverse spending + core ad weakness + rate hikes compressing P/E → triple threat → bearish META"},

    # Doc 25 (Growth stocks vulnerable) → META, AMZN
    {"id": "rel_r3_06a", "doc_id": "r3_doc_06", "stock_id": "r3_meta", "relevance_type": RelevanceType.sector, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "Rate hikes → discount rate math crushes growth valuations → META explicitly mentioned → bearish"},
    {"id": "rel_r3_06b", "doc_id": "r3_doc_06", "stock_id": "r3_amzn", "relevance_type": RelevanceType.sector, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "AMZN at 50x earnings explicitly cited as vulnerable → rate hikes compress valuation → bearish"},

    # Doc 26 (Amazon earnings miss) → AMZN
    {"id": "rel_r3_07", "doc_id": "r3_doc_07", "stock_id": "r3_amzn", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bearish, "causal_chain_for_ticker": "Revenue miss + overcapacity + costs rising + COVID demand pullback → operating income could hit $0 → bearish AMZN"},

    # Doc 27 (NATO defense spending) → LMT
    {"id": "rel_r3_08", "doc_id": "r3_doc_08", "stock_id": "r3_lmt", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.bullish, "causal_chain_for_ticker": "€100B Germany defense fund + NATO spending surge → structural 10-15 year demand → LMT primary beneficiary → bullish"},

    # Doc 28 (Buy the dip — red herring) → META, AMZN
    {"id": "rel_r3_09a", "doc_id": "r3_doc_09", "stock_id": "r3_meta", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.mixed, "causal_chain_for_ticker": "Buy-the-dip narrative for META → sounds logical but ignores persistent inflation → Fed won't pivot → META falls -65% → misleading bullish signal"},
    {"id": "rel_r3_09b", "doc_id": "r3_doc_09", "stock_id": "r3_amzn", "relevance_type": RelevanceType.direct, "signal_direction_for_ticker": SignalDirection.mixed, "causal_chain_for_ticker": "Buy-the-dip for AMZN → 'AWS alone worth $1.5T' sounds compelling → but ignores e-commerce normalization + rate pressure → AMZN -50% → trap"},
]


# ═══════════════════════════════════════════════════════════════════════════════
# SEED FUNCTION
# ═══════════════════════════════════════════════════════════════════════════════

async def seed_database():
    """Seed the database with all rounds, stocks, documents, and relevance mappings."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # ── Rounds ─────────────────────────────────────────────────────────
        for r in ROUNDS:
            existing = await db.execute(
                select(RoundConfig).where(RoundConfig.id == r["id"])
            )
            if not existing.scalar_one_or_none():
                db.add(RoundConfig(**r))
                print(f"  ✅ Round: {r['title']}")
            else:
                print(f"  ⏭️  Round exists: {r['title']}")

        await db.commit()

        # ── Stocks ─────────────────────────────────────────────────────────
        for s in STOCKS:
            existing = await db.execute(
                select(StockReturn).where(StockReturn.id == s["id"])
            )
            if not existing.scalar_one_or_none():
                db.add(StockReturn(**s))
                print(f"  ✅ Stock: {s['ticker']} ({s['round_id']})")
            else:
                print(f"  ⏭️  Stock exists: {s['ticker']} ({s['round_id']})")

        await db.commit()

        # ── Documents ──────────────────────────────────────────────────────
        for d in DOCUMENTS:
            existing = await db.execute(
                select(Document).where(Document.id == d["id"])
            )
            if not existing.scalar_one_or_none():
                db.add(Document(**d))
                print(f"  ✅ Doc: {d['id']} — {d.get('title', d['source_label'])[:50]}")
            else:
                print(f"  ⏭️  Doc exists: {d['id']}")

        await db.commit()

        # ── Relevance Mappings ─────────────────────────────────────────────
        for rel in RELEVANCE_MAPPINGS:
            existing = await db.execute(
                select(DocumentStockRelevance).where(DocumentStockRelevance.id == rel["id"])
            )
            if not existing.scalar_one_or_none():
                db.add(DocumentStockRelevance(**rel))
                print(f"  ✅ Relevance: {rel['doc_id']} → {rel['stock_id']}")
            else:
                print(f"  ⏭️  Relevance exists: {rel['id']}")

        await db.commit()

    print(f"\n🎉 Seeding complete!")
    print(f"   Rounds:    {len(ROUNDS)}")
    print(f"   Stocks:    {len(STOCKS)}")
    print(f"   Documents: {len(DOCUMENTS)}")
    print(f"   Mappings:  {len(RELEVANCE_MAPPINGS)}")


if __name__ == "__main__":
    asyncio.run(seed_database())
