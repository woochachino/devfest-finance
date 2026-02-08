"""
Seed script to populate the FinSight database with all 3 rounds of game data.
Run: python seed_data.py
"""

import asyncio
import uuid
from datetime import date

# Add parent to path so we can import app modules
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine, Base, async_session
from app.models import RoundConfig, StockReturn, Document, DocumentStockRelevance


async def seed():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created.")

    async with async_session() as db:
        # ══════════════════════════════════════════════════════════════════════
        # ROUND 1: The AI Boom Divergence (Jan 2023 - Jun 2023)
        # ══════════════════════════════════════════════════════════════════════
        r1 = RoundConfig(
            id="ai_boom_2023",
            title="The AI Boom Divergence",
            period_start=date(2023, 1, 1),
            period_end=date(2023, 6, 30),
            description="ChatGPT has just launched. The market is repricing AI winners and losers. Not all tech benefits equally from AI - can you spot who really wins?",
            difficulty="medium",
            display_order=1,
        )
        db.add(r1)

        # Stocks for Round 1
        r1_stocks = {
            "NVDA": StockReturn(id="r1_nvda", ticker="NVDA", company_name="NVIDIA Corporation", sector="Semiconductors", emoji="💚", round_id="ai_boom_2023", return_pct=190.0, story="Direct AI infrastructure winner - GPU demand exploded as every company rushed to train AI models"),
            "MSFT": StockReturn(id="r1_msft", ticker="MSFT", company_name="Microsoft", sector="Big Tech", emoji="🪟", round_id="ai_boom_2023", return_pct=40.0, story="OpenAI partnership and Copilot launch positioned Microsoft as the enterprise AI leader"),
            "GOOGL": StockReturn(id="r1_googl", ticker="GOOGL", company_name="Alphabet", sector="Big Tech", emoji="🔍", round_id="ai_boom_2023", return_pct=35.0, story="Initially seen as AI loser due to ChatGPT threat, but recovered as market recognized Google's AI capabilities"),
            "INTC": StockReturn(id="r1_intc", ticker="INTC", company_name="Intel Corporation", sector="Semiconductors", emoji="🔵", round_id="ai_boom_2023", return_pct=10.0, story="Legacy chip maker that missed the AI wave - no competitive GPU offering"),
            "SNAP": StockReturn(id="r1_snap", ticker="SNAP", company_name="Snap Inc.", sector="Social Media", emoji="👻", round_id="ai_boom_2023", return_pct=-15.0, story="Ad revenue under pressure, no credible AI story to attract investors"),
            "IBM": StockReturn(id="r1_ibm", ticker="IBM", company_name="IBM", sector="Enterprise Tech", emoji="🏢", round_id="ai_boom_2023", return_pct=5.0, story="Talked about AI with WatsonX but the market didn't buy it - seen as legacy player"),
        }
        for s in r1_stocks.values():
            db.add(s)

        # Documents for Round 1
        r1_docs = [
            Document(
                id="doc_r1_01",
                source_type="earnings_call",
                raw_text="NVIDIA Q4 FY2023 Earnings Call Excerpt - CEO Jensen Huang: 'We are seeing incredible demand for our data center GPUs. The ChatGPT moment has triggered a global race to adopt generative AI, and our A100 and H100 chips are the foundation. Data center revenue grew 11% sequentially and we expect acceleration as hyperscalers and enterprises build out AI infrastructure. We are at a tipping point - AI is the most powerful technology force of our time.'",
                title="NVIDIA Q4 2022 Earnings - Data Center Revenue Acceleration",
                publish_date=date(2023, 2, 22),
                source_label="NVIDIA Investor Relations",
                author="Jensen Huang",
                handle="",
                avatar="💚",
                engagement={"views": "2.1M"},
                tickers_referenced=["NVDA"],
                sectors_referenced=["semiconductors", "AI"],
                signal_direction="bullish",
                signal_strength=5,
                signal_reasoning="CEO directly states massive demand surge for AI chips. Data center revenue accelerating. Clear first-mover advantage in AI infrastructure.",
                causal_chain="ChatGPT launch -> massive AI model training demand -> NVIDIA GPU monopoly in AI compute -> data center revenue surge -> NVDA bullish",
                keywords=["GPU", "data center", "AI", "ChatGPT", "H100", "earnings"],
                difficulty="easy",
            ),
            Document(
                id="doc_r1_02",
                source_type="reddit",
                raw_text="Title: The AI trade is the most obvious trade since COVID stay-at-home stocks\n\nLook, I know everyone's already talking about it, but NVDA and the whole AI supply chain is going to run hard. ChatGPT hit 100M users in 2 months. Every tech CEO is scrambling to add 'AI' to their earnings calls. Microsoft just dropped $10B on OpenAI. This isn't hype - the capex numbers don't lie. Cloud providers are ordering GPUs like they're going out of style.\n\nBut here's the thing - not every 'AI company' is actually going to benefit. Intel? They're still trying to figure out their foundry strategy. Snap adding an AI chatbot doesn't make them an AI company. Stick with the picks and shovels play.\n\nPosition: 40% NVDA, 20% MSFT, rest in QQQ. 🚀",
                title="The AI trade is the most obvious trade since COVID stay-at-home stocks",
                publish_date=date(2023, 2, 15),
                source_label="r/wallstreetbets",
                author="u/ai_bull_2023",
                handle="ai_bull_2023",
                avatar="🤖",
                engagement={"upvotes": "18.2K", "comments": "2.4K"},
                tickers_referenced=["NVDA", "MSFT", "INTC"],
                sectors_referenced=["semiconductors", "big_tech", "AI"],
                signal_direction="bullish",
                signal_strength=4,
                signal_reasoning="Retail investor correctly identifying the AI infrastructure play. Points out capex data as evidence. Also correctly warns about fake AI plays.",
                causal_chain="ChatGPT adoption -> cloud provider GPU orders -> NVDA as picks-and-shovels play -> bullish",
                keywords=["AI", "ChatGPT", "GPU", "capex", "picks and shovels"],
                difficulty="easy",
            ),
            Document(
                id="doc_r1_03",
                source_type="article",
                raw_text="Microsoft confirmed a 'multiyear, multibillion-dollar investment' in OpenAI, reported to be around $10 billion. The deal gives Microsoft exclusive cloud-computing rights and deepens the integration of OpenAI's technology across Microsoft's product suite, including Azure, Office 365, and the new Bing search engine. CEO Satya Nadella said, 'AI is going to be the defining technology of our time, and Microsoft intends to lead.' The partnership positions Microsoft to embed generative AI into enterprise software used by hundreds of millions, a potential game-changer for its cloud business.",
                title="Microsoft Invests $10 Billion in OpenAI, Cements AI Leadership Bid",
                publish_date=date(2023, 1, 23),
                source_label="Reuters",
                author="",
                handle="",
                avatar="📰",
                engagement={},
                tickers_referenced=["MSFT"],
                sectors_referenced=["big_tech", "AI", "cloud"],
                signal_direction="bullish",
                signal_strength=4,
                signal_reasoning="$10B investment signals deep commitment. Exclusive cloud rights = Azure revenue growth. Enterprise AI integration across Office 365.",
                causal_chain="Microsoft $10B OpenAI investment -> exclusive cloud partnership -> Azure AI revenue growth -> MSFT bullish",
                keywords=["OpenAI", "Microsoft", "investment", "Azure", "enterprise AI"],
                difficulty="easy",
            ),
            Document(
                id="doc_r1_04",
                source_type="article",
                raw_text="Inside Google, a sense of panic is spreading. The company has declared a 'Code Red' in response to ChatGPT's explosive growth. Google's search monopoly, which generates the vast majority of Alphabet's $280 billion annual revenue, faces its first existential threat in decades. Internally, teams are racing to launch Bard, Google's conversational AI, but early demos have been rocky. Some analysts worry that Google's massive search ad revenue could be disrupted if users shift to AI-powered answers. However, Google has deep AI research capabilities - it invented the Transformer architecture that powers ChatGPT - and its cloud division is a major player in AI infrastructure.",
                title="Google Declares 'Code Red' as ChatGPT Threatens Search Dominance",
                publish_date=date(2022, 12, 21),
                source_label="The New York Times",
                author="",
                handle="",
                avatar="📰",
                engagement={},
                tickers_referenced=["GOOGL"],
                sectors_referenced=["big_tech", "AI", "search"],
                signal_direction="mixed",
                signal_strength=3,
                signal_reasoning="Article presents both threat (search disruption) and opportunity (Google's deep AI capabilities). Creates uncertainty about GOOGL direction.",
                causal_chain="ChatGPT threatens Google search -> Code Red panic -> BUT Google has Transformer tech and AI research depth -> mixed signal",
                keywords=["Google", "Code Red", "ChatGPT", "search", "Bard", "Transformer"],
                difficulty="medium",
            ),
            Document(
                id="doc_r1_05",
                source_type="article",
                raw_text="Intel's new CEO Pat Gelsinger unveiled an ambitious turnaround plan, including a $20 billion investment in new chip fabrication facilities in Ohio. However, the plan conspicuously lacks a competitive offering in AI accelerator chips, where NVIDIA dominates with over 80% market share. While Intel's data center revenue declined 33% year-over-year, NVIDIA's surged. Analysts note that Intel's traditional CPU business faces threats from both AMD's market share gains and the industry's shift toward GPU-accelerated computing for AI workloads. 'Intel is fighting yesterday's war,' said one semiconductor analyst.",
                title="Intel's Turnaround Plan Bets on Manufacturing, Not AI",
                publish_date=date(2023, 1, 26),
                source_label="Wall Street Journal",
                author="",
                handle="",
                avatar="📰",
                engagement={},
                tickers_referenced=["INTC", "NVDA"],
                sectors_referenced=["semiconductors"],
                signal_direction="bearish",
                signal_strength=4,
                signal_reasoning="Intel missing the AI wave entirely. No competitive GPU. Revenue declining while NVIDIA surges. 'Fighting yesterday's war.'",
                causal_chain="AI demand shifting to GPUs -> Intel has no competitive GPU -> data center revenue declining -> INTC bearish relative to AI winners",
                keywords=["Intel", "turnaround", "fabrication", "GPU", "AI chips", "decline"],
                difficulty="medium",
            ),
            Document(
                id="doc_r1_06",
                source_type="report",
                raw_text="Snap Inc. (SNAP) Q4 2022 Earnings Summary:\n- Revenue: $1.30B (missed estimates of $1.36B)\n- Daily Active Users: 375M (beat estimates)\n- Adjusted EBITDA: -$287M (deep loss)\n- 2023 Guidance: 'Extremely challenging' ad market\n\nSnap's digital advertising business continues to deteriorate as competition from TikTok intensifies and Apple's privacy changes reduce ad targeting effectiveness. The company announced layoffs of 20% of its workforce. CEO Evan Spiegel acknowledged 'significant headwinds' but noted the launch of an AI chatbot feature. Analysts remain skeptical that AI features will meaningfully improve monetization.",
                title="Snap Q4 2022 Earnings Miss - Ad Revenue Under Pressure",
                publish_date=date(2023, 2, 1),
                source_label="Seeking Alpha",
                author="",
                handle="",
                avatar="📊",
                engagement={},
                tickers_referenced=["SNAP"],
                sectors_referenced=["social_media", "digital_advertising"],
                signal_direction="bearish",
                signal_strength=5,
                signal_reasoning="Revenue miss, deep losses, layoffs, deteriorating ad market. AI chatbot is a superficial addition that doesn't fix core business problems.",
                causal_chain="TikTok competition + Apple privacy changes -> ad revenue decline -> earnings miss + layoffs -> SNAP bearish",
                keywords=["Snap", "earnings miss", "advertising", "layoffs", "TikTok"],
                difficulty="easy",
            ),
            Document(
                id="doc_r1_07",
                source_type="article",
                raw_text="Which companies will actually benefit from generative AI? That's the trillion-dollar question Wall Street is trying to answer. A new report from Goldman Sachs identifies three tiers of AI beneficiaries:\n\n1. Infrastructure layer (highest confidence): Companies providing the compute - NVIDIA (GPUs), cloud providers (Microsoft Azure, Google Cloud, Amazon AWS)\n2. Application layer (medium confidence): Companies integrating AI into existing products - Microsoft (Copilot), Salesforce (Einstein GPT)\n3. 'AI washing' (lowest confidence): Companies adding 'AI' to marketing without meaningful product changes - watch for inflated claims\n\nThe report warns: 'Not every company that mentions AI on an earnings call is an AI company. Look at actual R&D spend and product integration, not press releases.'",
                title="Goldman Sachs: 'Three Tiers of AI Beneficiaries' - Who Really Wins?",
                publish_date=date(2023, 3, 15),
                source_label="Bloomberg",
                author="",
                handle="",
                avatar="📰",
                engagement={},
                tickers_referenced=["NVDA", "MSFT", "GOOGL"],
                sectors_referenced=["semiconductors", "big_tech", "AI"],
                signal_direction="bullish",
                signal_strength=4,
                signal_reasoning="Professional analysis framework for identifying real AI winners vs. pretenders. Points directly to infrastructure layer (NVDA) as highest conviction.",
                causal_chain="Goldman Sachs identifies AI beneficiary tiers -> infrastructure (NVDA) highest confidence -> warns about AI washing -> bullish NVDA/MSFT, bearish pretenders",
                keywords=["AI beneficiaries", "infrastructure", "AI washing", "Goldman Sachs"],
                difficulty="medium",
            ),
            Document(
                id="doc_r1_08",
                source_type="tweet",
                raw_text="IBM just announced WatsonX, their new enterprise AI platform. 'We've been doing AI for decades,' says CEO Arvind Krishna. Claims WatsonX will help enterprises deploy AI 'responsibly and at scale.' \n\nSounds impressive on paper. But IBM has been 'pivoting to AI' since Watson beat Jeopardy in 2011. Watson Health was shut down last year. Enterprise clients I talk to are choosing Azure OpenAI or Google Cloud AI, not Watson. The stock barely moved on the announcement.\n\nWhen the market doesn't react to 'big' AI news, that tells you something. 🤔",
                title="IBM WatsonX: Real AI Play or Same Old Story?",
                publish_date=date(2023, 5, 9),
                source_label="@techanalyst",
                author="Tech Analyst",
                handle="techanalyst",
                avatar="🔬",
                engagement={"likes": "4.2K", "retweets": "1.1K"},
                tickers_referenced=["IBM"],
                sectors_referenced=["enterprise_tech", "AI"],
                signal_direction="mixed",
                signal_strength=3,
                signal_reasoning="Red herring document. IBM talks AI but market doesn't believe it. History of failed AI pivots. Enterprise customers choosing competitors.",
                causal_chain="IBM announces WatsonX AI platform -> but Watson Health already failed -> enterprise clients prefer Azure/Google -> market doesn't react -> IBM AI story lacks credibility",
                keywords=["IBM", "WatsonX", "Watson", "enterprise AI", "skepticism"],
                difficulty="medium",
            ),
            Document(
                id="doc_r1_09",
                source_type="article",
                raw_text="ChatGPT has reached 100 million monthly active users just two months after launch, making it the fastest-growing consumer application in history. By comparison, it took TikTok nine months and Instagram two and a half years to reach that milestone. The surge in interest has sparked a frenzy in Silicon Valley, with startups racing to build on top of OpenAI's API, and established tech giants rushing to launch competing products. Venture capital funding for AI startups reached $4.5 billion in January alone. 'We are witnessing the beginning of a platform shift as significant as the iPhone,' said one prominent VC.",
                title="ChatGPT Hits 100 Million Users in Record Time, Sparking AI Gold Rush",
                publish_date=date(2023, 2, 1),
                source_label="Reuters",
                author="",
                handle="",
                avatar="📰",
                engagement={},
                tickers_referenced=[],
                sectors_referenced=["AI", "big_tech"],
                signal_direction="bullish",
                signal_strength=5,
                signal_reasoning="Macro document showing unprecedented AI adoption speed. Signals massive industry shift. VC capital flooding in. Platform-level change.",
                causal_chain="ChatGPT fastest-growing app ever -> AI startup funding surge -> entire industry shift -> bullish for AI infrastructure providers",
                keywords=["ChatGPT", "100 million", "growth", "platform shift", "venture capital"],
                difficulty="easy",
            ),
        ]
        for doc in r1_docs:
            db.add(doc)

        # Document-Stock Relevance for Round 1
        r1_rels = [
            # doc_r1_01 (NVDA earnings) -> NVDA
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r1_01", stock_id="r1_nvda", relevance_type="direct", signal_direction_for_ticker="bullish", causal_chain_for_ticker="NVIDIA reports massive data center GPU demand from AI -> direct revenue growth -> NVDA bullish"),
            # doc_r1_02 (Reddit AI trade) -> NVDA, MSFT, INTC
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r1_02", stock_id="r1_nvda", relevance_type="direct", signal_direction_for_ticker="bullish", causal_chain_for_ticker="Retail identifies NVDA as picks-and-shovels AI play -> GPU orders surging -> bullish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r1_02", stock_id="r1_msft", relevance_type="direct", signal_direction_for_ticker="bullish", causal_chain_for_ticker="MSFT identified as key AI beneficiary via OpenAI partnership -> bullish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r1_02", stock_id="r1_intc", relevance_type="direct", signal_direction_for_ticker="bearish", causal_chain_for_ticker="Intel called out as missing AI wave, still figuring out foundry -> bearish relative signal"),
            # doc_r1_03 (MSFT OpenAI investment) -> MSFT
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r1_03", stock_id="r1_msft", relevance_type="direct", signal_direction_for_ticker="bullish", causal_chain_for_ticker="$10B OpenAI investment -> exclusive Azure cloud rights -> enterprise AI integration -> MSFT bullish"),
            # doc_r1_04 (Google Code Red) -> GOOGL
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r1_04", stock_id="r1_googl", relevance_type="direct", signal_direction_for_ticker="mixed", causal_chain_for_ticker="ChatGPT threatens Google search revenue BUT Google has deep AI research -> mixed outlook -> uncertainty"),
            # doc_r1_05 (Intel turnaround) -> INTC, NVDA
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r1_05", stock_id="r1_intc", relevance_type="direct", signal_direction_for_ticker="bearish", causal_chain_for_ticker="Intel has no competitive AI GPU -> data center revenue declining -> missing biggest tech trend -> bearish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r1_05", stock_id="r1_nvda", relevance_type="sector", signal_direction_for_ticker="bullish", causal_chain_for_ticker="Intel's weakness highlights NVIDIA's AI GPU monopoly -> NVDA dominant position reinforced -> bullish"),
            # doc_r1_06 (Snap earnings) -> SNAP
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r1_06", stock_id="r1_snap", relevance_type="direct", signal_direction_for_ticker="bearish", causal_chain_for_ticker="Revenue miss + layoffs + deteriorating ad market -> no real AI moat -> SNAP bearish"),
            # doc_r1_07 (Goldman AI tiers) -> NVDA, MSFT, GOOGL (macro)
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r1_07", stock_id="r1_nvda", relevance_type="macro", signal_direction_for_ticker="bullish", causal_chain_for_ticker="Goldman identifies infrastructure layer as highest confidence AI play -> NVDA is THE infrastructure pick -> bullish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r1_07", stock_id="r1_msft", relevance_type="macro", signal_direction_for_ticker="bullish", causal_chain_for_ticker="Goldman identifies application layer integration -> MSFT Copilot = real AI product -> bullish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r1_07", stock_id="r1_ibm", relevance_type="macro", signal_direction_for_ticker="bearish", causal_chain_for_ticker="Goldman warns about AI washing -> IBM fits this pattern -> bearish"),
            # doc_r1_08 (IBM WatsonX) -> IBM (red herring)
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r1_08", stock_id="r1_ibm", relevance_type="direct", signal_direction_for_ticker="mixed", causal_chain_for_ticker="IBM announces WatsonX but history of failed AI pivots -> market skeptical -> mixed/bearish"),
            # doc_r1_09 (ChatGPT growth) -> macro, all AI stocks
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r1_09", stock_id="r1_nvda", relevance_type="macro", signal_direction_for_ticker="bullish", causal_chain_for_ticker="ChatGPT fastest-growing app -> massive AI compute demand -> NVDA GPUs needed -> bullish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r1_09", stock_id="r1_msft", relevance_type="macro", signal_direction_for_ticker="bullish", causal_chain_for_ticker="ChatGPT growth -> OpenAI on Azure -> MSFT cloud revenue boost -> bullish"),
        ]
        for rel in r1_rels:
            db.add(rel)

        # ══════════════════════════════════════════════════════════════════════
        # ROUND 2: Banking Crisis + Flight to Safety (Jan 2023 - Jun 2023)
        # ══════════════════════════════════════════════════════════════════════
        r2 = RoundConfig(
            id="banking_crisis_2023",
            title="Banking Crisis & Flight to Safety",
            period_start=date(2023, 1, 1),
            period_end=date(2023, 6, 30),
            description="Rate hikes have exposed cracks in the banking system. SVB just collapsed. Is this 2008 all over again, or a contained crisis? Where do you hide - and where do you hunt for opportunity?",
            difficulty="medium",
            display_order=2,
        )
        db.add(r2)

        r2_stocks = {
            "JPM": StockReturn(id="r2_jpm", ticker="JPM", company_name="JPMorgan Chase", sector="Megabank", emoji="🏦", round_id="banking_crisis_2023", return_pct=15.0, story="Too big to fail - absorbed First Republic and gained market share during the crisis"),
            "SCHW": StockReturn(id="r2_schw", ticker="SCHW", company_name="Charles Schwab", sector="Financial Services", emoji="💼", round_id="banking_crisis_2023", return_pct=-30.0, story="Same unrealized bond loss problem as SVB - investor panic about deposit flight"),
            "KRE": StockReturn(id="r2_kre", ticker="KRE", company_name="Regional Banks ETF", sector="Regional Banks", emoji="🏛️", round_id="banking_crisis_2023", return_pct=-30.0, story="Entire regional banking sector crushed on contagion fears after SVB collapse"),
            "GLD": StockReturn(id="r2_gld", ticker="GLD", company_name="SPDR Gold Trust", sector="Gold", emoji="🥇", round_id="banking_crisis_2023", return_pct=10.0, story="Classic crisis safe haven - gold rallied as banking fears grew"),
            "AAPL": StockReturn(id="r2_aapl", ticker="AAPL", company_name="Apple Inc.", sector="Big Tech", emoji="🍎", round_id="banking_crisis_2023", return_pct=50.0, story="Quality megacap flight to safety - investors rotated into Apple as a safe harbor"),
            "PFE": StockReturn(id="r2_pfe", ticker="PFE", company_name="Pfizer Inc.", sector="Pharma", emoji="💊", round_id="banking_crisis_2023", return_pct=-20.0, story="Post-COVID demand cliff for vaccines and Paxlovid - unrelated to banking crisis"),
        }
        for s in r2_stocks.values():
            db.add(s)

        r2_docs = [
            Document(
                id="doc_r2_01",
                source_type="article",
                raw_text="A growing number of US banks are sitting on massive unrealized losses in their bond portfolios, a consequence of the Federal Reserve's aggressive rate hikes. When interest rates rise, the value of existing bonds falls. Banks that bought long-duration Treasury and mortgage-backed securities during the zero-rate era are now sitting on paper losses exceeding $600 billion industry-wide. For most large banks, these are classified as 'held-to-maturity' and don't appear on income statements. But if depositors withdraw funds and banks are forced to sell these bonds, the losses become very real.",
                title="US Banks Sitting on $600 Billion in Unrealized Bond Losses",
                publish_date=date(2022, 11, 15),
                source_label="Financial Times",
                author="",
                handle="",
                avatar="📰",
                engagement={},
                tickers_referenced=[],
                sectors_referenced=["banking", "financial_services"],
                signal_direction="bearish",
                signal_strength=5,
                signal_reasoning="THE smoking gun. $600B in unrealized losses across the banking system. If deposits flee, these become realized losses. This is the core vulnerability that led to SVB's collapse.",
                causal_chain="Fed rate hikes -> bond prices fall -> banks hold $600B unrealized losses -> if depositors withdraw, banks must sell at losses -> systemic risk for banks with concentrated deposits",
                keywords=["unrealized losses", "bonds", "banks", "rate hikes", "held-to-maturity"],
                difficulty="medium",
            ),
            Document(
                id="doc_r2_02",
                source_type="article",
                raw_text="Moody's has downgraded Silicon Valley Bank's credit rating, citing concerns about the bank's heavy concentration in tech and venture capital deposits, and its exposure to long-duration securities. SVB's depositor base is highly concentrated among tech startups and VC firms, making it vulnerable to a 'run' if confidence falters. The bank recently disclosed a $1.8 billion loss on bond sales to shore up liquidity. 'The combination of concentrated deposits and unrealized bond losses creates a fragile situation,' the Moody's report stated.",
                title="Moody's Downgrades SVB, Cites Deposit Concentration and Bond Losses",
                publish_date=date(2023, 3, 8),
                source_label="Bloomberg",
                author="",
                handle="",
                avatar="📰",
                engagement={},
                tickers_referenced=["SCHW", "KRE"],
                sectors_referenced=["banking", "regional_banks"],
                signal_direction="bearish",
                signal_strength=5,
                signal_reasoning="Direct warning about SVB's vulnerability. Deposit concentration + bond losses = bank run risk. Same dynamics apply to other regional banks and SCHW.",
                causal_chain="SVB downgrade -> deposit concentration + bond losses flagged -> contagion risk to similar banks (SCHW, regional banks) -> bearish for banking sector",
                keywords=["SVB", "Moody's", "downgrade", "deposit concentration", "bond losses"],
                difficulty="easy",
            ),
            Document(
                id="doc_r2_03",
                source_type="report",
                raw_text="FOMC Statement - January 31, 2023: The Federal Reserve raised the federal funds rate by 25 basis points to a range of 4.50%-4.75%, the eighth consecutive increase. Chair Powell stated: 'Inflation remains well above our 2% target. We anticipate that ongoing increases in the target range will be appropriate.' The committee noted that while inflation has shown signs of easing, the labor market remains 'extremely tight.' Powell pushed back against market expectations for rate cuts in 2023: 'It would not be appropriate to cut rates this year given our inflation outlook.'",
                title="Fed Raises Rates to 4.50-4.75%, Signals More Hikes Ahead",
                publish_date=date(2023, 2, 1),
                source_label="Federal Reserve",
                author="Jerome Powell",
                handle="",
                avatar="🏛️",
                engagement={},
                tickers_referenced=[],
                sectors_referenced=["banking", "financial_services", "bonds"],
                signal_direction="bearish",
                signal_strength=4,
                signal_reasoning="Continued rate hikes = more pressure on bank bond portfolios. Higher rates for longer means unrealized losses grow. Bad for rate-sensitive financials.",
                causal_chain="Fed raises rates again -> bond prices fall further -> bank unrealized losses increase -> more pressure on vulnerable banks -> bearish financials",
                keywords=["Fed", "rate hike", "FOMC", "inflation", "interest rates"],
                difficulty="medium",
            ),
            Document(
                id="doc_r2_04",
                source_type="tweet",
                raw_text="BREAKING: Silicon Valley Bank is done. Depositors are lining up. VCs telling portfolio companies to pull their money NOW. This could cascade - Schwab, First Republic, PacWest all have similar bond portfolio problems. If you have money in a regional bank, MOVE IT TO JPMorgan. The big banks will be the last ones standing. This is a modern bank run happening in real time. 🚨🚨🚨",
                title="",
                publish_date=date(2023, 3, 10),
                source_label="@financejuice",
                author="Finance Juice",
                handle="financejuice",
                avatar="🚨",
                engagement={"likes": "45.2K", "retweets": "28.1K"},
                tickers_referenced=["SCHW", "JPM", "KRE"],
                sectors_referenced=["banking", "regional_banks"],
                signal_direction="bearish",
                signal_strength=5,
                signal_reasoning="Real-time panic about SVB collapse spreading to other banks. Names Schwab specifically. Flight to safety toward JPMorgan.",
                causal_chain="SVB bank run -> panic spreads to similar banks (SCHW, regional banks) -> flight to safety to too-big-to-fail banks (JPM) -> bearish regionals, bullish megabanks",
                keywords=["SVB", "bank run", "Schwab", "JPMorgan", "contagion"],
                difficulty="easy",
            ),
            Document(
                id="doc_r2_05",
                source_type="article",
                raw_text="JPMorgan CEO Jamie Dimon reinforced the bank's 'fortress balance sheet' narrative in an investor letter this week. 'We have $400 billion in available liquidity and our capital ratios far exceed regulatory requirements,' Dimon wrote. He added that banking crises historically benefit the largest, best-capitalized banks as deposits flow from smaller institutions. 'JPMorgan has gained deposit market share in every crisis since 2008.' Analysts note that JPMorgan's diversified revenue streams and conservative risk management make it a potential acquirer of distressed banks.",
                title="Jamie Dimon: 'JPMorgan's Fortress Balance Sheet' Ready for Any Storm",
                publish_date=date(2023, 1, 15),
                source_label="CNBC",
                author="",
                handle="",
                avatar="📰",
                engagement={},
                tickers_referenced=["JPM"],
                sectors_referenced=["banking", "megabanks"],
                signal_direction="bullish",
                signal_strength=4,
                signal_reasoning="JPMorgan explicitly positioned as crisis beneficiary. $400B liquidity. History of gaining share in crises. Potential acquirer.",
                causal_chain="Banking crisis -> deposits flee weak banks -> flow to JPMorgan -> JPM gains market share + acquires distressed banks -> JPM bullish",
                keywords=["JPMorgan", "fortress balance sheet", "Dimon", "liquidity", "crisis"],
                difficulty="medium",
            ),
            Document(
                id="doc_r2_06",
                source_type="article",
                raw_text="Charles Schwab faces scrutiny as investors draw comparisons to Silicon Valley Bank. Like SVB, Schwab holds a massive portfolio of bonds that have declined in value due to rising rates - approximately $14 billion in unrealized losses. However, analysts are split: Schwab's depositor base is more diversified than SVB's (retail investors vs. concentrated VC deposits), and its brokerage business provides more stable revenue. Still, Schwab stock dropped 30% in the week following SVB's collapse as investors worried about a potential deposit flight. 'The comparison is imperfect but the market doesn't care about nuance right now,' said one bank analyst.",
                title="Schwab Bond Portfolio Draws SVB Comparisons - Is the Fear Justified?",
                publish_date=date(2023, 3, 14),
                source_label="Wall Street Journal",
                author="",
                handle="",
                avatar="📰",
                engagement={},
                tickers_referenced=["SCHW"],
                sectors_referenced=["financial_services", "banking"],
                signal_direction="bearish",
                signal_strength=4,
                signal_reasoning="Schwab has $14B unrealized bond losses, similar to SVB. Stock already dropped 30%. Market painting all banks with same brush.",
                causal_chain="SVB collapse -> market compares SCHW bond portfolio -> $14B unrealized losses -> panic selling -> SCHW bearish even if fundamentally different",
                keywords=["Schwab", "SVB", "unrealized losses", "bonds", "comparison"],
                difficulty="medium",
            ),
            Document(
                id="doc_r2_07",
                source_type="article",
                raw_text="Gold prices surged to $2,000 per ounce this week as the banking crisis intensified. Historically, gold has served as a safe haven during financial instability, and the pattern is repeating. 'When trust in the banking system erodes, investors turn to assets that don't have counterparty risk,' explained a commodities strategist at Goldman Sachs. Central bank gold purchases have also accelerated, with China and other nations diversifying reserves away from dollar-denominated assets. If banking stress continues, analysts expect gold could reach new all-time highs.",
                title="Gold Surges Past $2,000 as Banking Crisis Drives Safe Haven Demand",
                publish_date=date(2023, 3, 17),
                source_label="Reuters",
                author="",
                handle="",
                avatar="📰",
                engagement={},
                tickers_referenced=["GLD"],
                sectors_referenced=["gold", "commodities"],
                signal_direction="bullish",
                signal_strength=4,
                signal_reasoning="Classic crisis safe haven trade. Banking instability drives gold demand. Central bank buying adds structural support.",
                causal_chain="Banking crisis -> trust erodes -> investors seek no-counterparty-risk assets -> gold demand surges -> GLD bullish",
                keywords=["gold", "safe haven", "banking crisis", "$2000", "central bank"],
                difficulty="easy",
            ),
            Document(
                id="doc_r2_08",
                source_type="tweet",
                raw_text="Thread on why big tech (especially Apple) is the new safe haven:\n\n1. $160B cash on balance sheet\n2. No bank risk - they ARE the bank\n3. Recurring revenue from 2B+ devices\n4. Buybacks reduce share count every quarter\n5. In a crisis, investors rotate FROM risky assets TO quality megacaps\n\nWatch AAPL outperform the market during this banking mess. It happened in 2020, it'll happen again. Quality is king when fear is high. 🍎📈",
                title="",
                publish_date=date(2023, 3, 12),
                source_label="@macrostrategy",
                author="Macro Strategy",
                handle="macrostrategy",
                avatar="📊",
                engagement={"likes": "12.4K", "retweets": "5.8K"},
                tickers_referenced=["AAPL"],
                sectors_referenced=["big_tech"],
                signal_direction="bullish",
                signal_strength=4,
                signal_reasoning="Identifies Apple as safe haven during banking crisis. Strong balance sheet, recurring revenue, buybacks. Flight to quality trade.",
                causal_chain="Banking crisis -> investors flee risky assets -> rotate into quality megacaps -> Apple has $160B cash, no bank risk -> AAPL bullish",
                keywords=["Apple", "safe haven", "quality", "megacap", "buybacks", "cash"],
                difficulty="medium",
            ),
            Document(
                id="doc_r2_09",
                source_type="article",
                raw_text="Treasury Secretary Janet Yellen and Fed Chair Jerome Powell issued a joint statement Sunday evening assuring Americans that the banking system is 'sound and resilient.' The FDIC was appointed receiver of SVB and Signature Bank, and all depositors - including those above the $250,000 insurance limit - will be made whole. 'This is not 2008,' Yellen emphasized. 'The banking system is well-capitalized and the tools we have today are far more effective.' Markets rallied on Monday morning but analysts cautioned that the crisis may not be over. 'They said the same things before Bear Stearns,' tweeted one prominent hedge fund manager.",
                title="Yellen, Powell Assure Public: 'Banking System Sound and Resilient'",
                publish_date=date(2023, 3, 12),
                source_label="Associated Press",
                author="",
                handle="",
                avatar="📰",
                engagement={},
                tickers_referenced=[],
                sectors_referenced=["banking", "financial_services"],
                signal_direction="mixed",
                signal_strength=3,
                signal_reasoning="Red herring: official reassurance that could mislead. Government says it's contained but hedge fund managers are skeptical. Mixed signals.",
                causal_chain="Government guarantees all deposits -> short-term reassurance BUT skeptics recall 2008 false reassurances -> unclear if crisis is truly contained -> mixed signal",
                keywords=["Yellen", "Powell", "banking system", "FDIC", "reassurance", "SVB"],
                difficulty="hard",
            ),
        ]
        for doc in r2_docs:
            db.add(doc)

        r2_rels = [
            # doc_r2_01 (unrealized losses) -> SCHW, KRE
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r2_01", stock_id="r2_schw", relevance_type="sector", signal_direction_for_ticker="bearish", causal_chain_for_ticker="$600B industry-wide unrealized bond losses -> Schwab exposed with large bond portfolio -> bearish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r2_01", stock_id="r2_kre", relevance_type="sector", signal_direction_for_ticker="bearish", causal_chain_for_ticker="$600B unrealized losses -> regional banks most vulnerable -> bearish"),
            # doc_r2_02 (SVB downgrade) -> SCHW, KRE
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r2_02", stock_id="r2_schw", relevance_type="sector", signal_direction_for_ticker="bearish", causal_chain_for_ticker="SVB downgrade for deposit concentration + bond losses -> Schwab has same bond loss problem -> contagion risk -> bearish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r2_02", stock_id="r2_kre", relevance_type="sector", signal_direction_for_ticker="bearish", causal_chain_for_ticker="SVB downgrade signals systemic risk -> regional banks face similar deposit/bond dynamics -> bearish"),
            # doc_r2_03 (Fed rate hike) -> macro for all banks
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r2_03", stock_id="r2_schw", relevance_type="macro", signal_direction_for_ticker="bearish", causal_chain_for_ticker="More rate hikes -> bond portfolio losses deepen -> SCHW more vulnerable -> bearish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r2_03", stock_id="r2_kre", relevance_type="macro", signal_direction_for_ticker="bearish", causal_chain_for_ticker="More rate hikes -> bond losses grow -> regional banks under more pressure -> bearish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r2_03", stock_id="r2_gld", relevance_type="macro", signal_direction_for_ticker="bullish", causal_chain_for_ticker="Rate hikes create financial stress -> safe haven demand rises -> gold benefits -> bullish"),
            # doc_r2_04 (SVB panic tweet) -> SCHW, JPM, KRE
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r2_04", stock_id="r2_schw", relevance_type="direct", signal_direction_for_ticker="bearish", causal_chain_for_ticker="SVB collapse -> Schwab named as having similar problems -> panic selling -> bearish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r2_04", stock_id="r2_jpm", relevance_type="direct", signal_direction_for_ticker="bullish", causal_chain_for_ticker="SVB collapse -> flight to safety to JPMorgan -> deposits flow to big banks -> JPM bullish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r2_04", stock_id="r2_kre", relevance_type="direct", signal_direction_for_ticker="bearish", causal_chain_for_ticker="SVB collapse -> contagion fears for all regional banks -> KRE bearish"),
            # doc_r2_05 (JPM fortress) -> JPM
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r2_05", stock_id="r2_jpm", relevance_type="direct", signal_direction_for_ticker="bullish", causal_chain_for_ticker="Fortress balance sheet -> gains market share in crises -> potential acquirer -> JPM bullish"),
            # doc_r2_06 (Schwab SVB comparison) -> SCHW
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r2_06", stock_id="r2_schw", relevance_type="direct", signal_direction_for_ticker="bearish", causal_chain_for_ticker="$14B unrealized losses -> SVB comparison -> panic selling -> SCHW bearish"),
            # doc_r2_07 (Gold safe haven) -> GLD
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r2_07", stock_id="r2_gld", relevance_type="direct", signal_direction_for_ticker="bullish", causal_chain_for_ticker="Banking crisis -> safe haven demand -> gold surges -> GLD bullish"),
            # doc_r2_08 (Apple safe haven) -> AAPL
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r2_08", stock_id="r2_aapl", relevance_type="direct", signal_direction_for_ticker="bullish", causal_chain_for_ticker="Banking crisis -> flight to quality megacaps -> Apple has $160B cash, no bank risk -> AAPL bullish"),
            # doc_r2_09 (Yellen reassurance - red herring) -> mixed
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r2_09", stock_id="r2_kre", relevance_type="macro", signal_direction_for_ticker="mixed", causal_chain_for_ticker="Government says crisis contained -> but skeptics disagree -> mixed signal for regional banks"),
        ]
        for rel in r2_rels:
            db.add(rel)

        # ══════════════════════════════════════════════════════════════════════
        # ROUND 3: Inflation Regime Change (Jan 2022 - Dec 2022)
        # ══════════════════════════════════════════════════════════════════════
        r3 = RoundConfig(
            id="inflation_2022",
            title="Inflation Regime Change",
            period_start=date(2022, 1, 1),
            period_end=date(2022, 12, 31),
            description="Zero rates are over. Inflation is at 40-year highs. Russia invades Ukraine. The era of free money is ending - who wins, who loses, and can you see it coming?",
            difficulty="hard",
            display_order=3,
        )
        db.add(r3)

        r3_stocks = {
            "XOM": StockReturn(id="r3_xom", ticker="XOM", company_name="Exxon Mobil", sector="Energy", emoji="🛢️", round_id="inflation_2022", return_pct=80.0, story="Oil surge from Ukraine war + supply constraints made energy the top performer"),
            "META": StockReturn(id="r3_meta", ticker="META", company_name="Meta Platforms", sector="Big Tech", emoji="👓", round_id="inflation_2022", return_pct=-65.0, story="Rate hikes crushed growth stocks + massive Metaverse spending backlash"),
            "COST": StockReturn(id="r3_cost", ticker="COST", company_name="Costco", sector="Consumer Staples", emoji="🛒", round_id="inflation_2022", return_pct=-15.0, story="Defensive but not immune - even staples felt the inflation/rate hike pressure"),
            "DVN": StockReturn(id="r3_dvn", ticker="DVN", company_name="Devon Energy", sector="Energy", emoji="⛽", round_id="inflation_2022", return_pct=60.0, story="Rode the oil wave - strong cash flow from elevated energy prices"),
            "AMZN": StockReturn(id="r3_amzn", ticker="AMZN", company_name="Amazon", sector="E-commerce", emoji="📦", round_id="inflation_2022", return_pct=-50.0, story="Post-COVID demand normalization + rate sensitivity crushed the stock"),
            "LMT": StockReturn(id="r3_lmt", ticker="LMT", company_name="Lockheed Martin", sector="Defense", emoji="🛡️", round_id="inflation_2022", return_pct=35.0, story="Ukraine war triggered surge in defense spending across NATO"),
        }
        for s in r3_stocks.values():
            db.add(s)

        r3_docs = [
            Document(
                id="doc_r3_01",
                source_type="report",
                raw_text="FOMC Statement - December 15, 2021: The Federal Reserve signaled a dramatic hawkish pivot, indicating it expects to raise interest rates three times in 2022. Chair Powell stated: 'The economy no longer needs the highly accommodative policies we put in place during the pandemic. Inflation is persistent and broad-based. We need to act.' The dot plot showed a median expectation of 0.75%-1.00% by end of 2022. This was the most hawkish Fed messaging since 2018. Markets sold off sharply, with the Nasdaq falling 2.5% on the day. Growth stocks - which benefit most from low rates - face the steepest headwinds.",
                title="Fed Signals Hawkish Pivot: Three Rate Hikes Expected in 2022",
                publish_date=date(2021, 12, 15),
                source_label="Federal Reserve",
                author="Jerome Powell",
                handle="",
                avatar="🏛️",
                engagement={},
                tickers_referenced=[],
                sectors_referenced=["growth_stocks", "big_tech"],
                signal_direction="bearish",
                signal_strength=5,
                signal_reasoning="Fed hawkish pivot = end of easy money era. Growth stocks most vulnerable to rate hikes. Broad-based inflation signals aggressive tightening ahead.",
                causal_chain="Fed signals multiple rate hikes -> higher discount rates -> growth stock valuations compress -> Nasdaq/growth tech bearish",
                keywords=["Fed", "hawkish pivot", "rate hikes", "inflation", "growth stocks"],
                difficulty="medium",
            ),
            Document(
                id="doc_r3_02",
                source_type="statistic",
                raw_text="US Consumer Price Index (CPI) - January 2022:\n- Headline CPI: 7.5% year-over-year (highest since February 1982)\n- Core CPI (ex-food/energy): 6.0% YoY\n- Month-over-month: 0.6%\n\nKey drivers: Energy (+27.0% YoY), Used cars (+40.5%), Food (+7.0%), Shelter (+4.4%)\n\nThe Bureau of Labor Statistics noted that inflation is 'broad-based, not limited to a few categories.' Energy costs are the largest single contributor. Food prices show no signs of abating. Economists now expect the Fed to raise rates 5-7 times in 2022, up from 3 expected just weeks ago.",
                title="CPI Hits 7.5% - Highest Inflation in 40 Years",
                publish_date=date(2022, 2, 10),
                source_label="Bureau of Labor Statistics",
                author="",
                handle="",
                avatar="📊",
                engagement={},
                tickers_referenced=[],
                sectors_referenced=["energy", "consumer_staples"],
                signal_direction="bearish",
                signal_strength=5,
                signal_reasoning="40-year high inflation = aggressive Fed tightening. Energy leading inflation = bullish for energy stocks. Growth stocks face compression.",
                causal_chain="CPI at 7.5% -> Fed must tighten aggressively -> rate hikes crush growth stocks -> BUT energy prices driving inflation -> energy sector benefits",
                keywords=["CPI", "inflation", "7.5%", "energy", "rate hikes"],
                difficulty="medium",
            ),
            Document(
                id="doc_r3_03",
                source_type="article",
                raw_text="Russia launched a full-scale invasion of Ukraine in the early hours of February 24, 2022. Russian forces attacked from multiple directions, including a drive toward the capital Kyiv. The international community responded with unprecedented economic sanctions against Russia, including freezing central bank reserves and cutting major Russian banks from the SWIFT payment system. Oil prices immediately surged above $100 per barrel as markets priced in supply disruption from one of the world's largest energy exporters. European natural gas prices more than doubled. Defense stocks rallied sharply as NATO members signaled major increases in military spending.",
                title="Russia Invades Ukraine: Markets React as Energy Prices Surge, Defense Stocks Rally",
                publish_date=date(2022, 2, 24),
                source_label="Reuters",
                author="",
                handle="",
                avatar="📰",
                engagement={},
                tickers_referenced=["XOM", "DVN", "LMT"],
                sectors_referenced=["energy", "defense", "geopolitics"],
                signal_direction="bullish",
                signal_strength=5,
                signal_reasoning="War = energy supply disruption + defense spending surge. Directly bullish for energy and defense. Adds to inflation pressure which is bearish for growth.",
                causal_chain="Russia invades Ukraine -> sanctions on Russian energy -> oil spikes above $100 -> energy stocks surge + NATO defense spending increases -> XOM/DVN/LMT bullish",
                keywords=["Russia", "Ukraine", "invasion", "oil", "sanctions", "defense"],
                difficulty="easy",
            ),
            Document(
                id="doc_r3_04",
                source_type="article",
                raw_text="Oil prices surged past $120 per barrel as the Ukraine war disrupted global energy supply chains. Russia exports approximately 7 million barrels of oil per day, and Western sanctions are starting to bite. European countries, which depend on Russian gas for 40% of their supply, face an energy crisis. OPEC has refused to significantly increase production, citing 'supply uncertainty.' Energy companies like Exxon and Devon Energy are reporting record cash flows. 'This is a supply-driven oil shock similar to the 1970s,' said an energy analyst at Morgan Stanley. 'Energy stocks haven't been this cheap relative to their cash flows in decades.'",
                title="Oil Surges Past $120 as Ukraine War Disrupts Global Energy Supply",
                publish_date=date(2022, 3, 7),
                source_label="CNBC",
                author="",
                handle="",
                avatar="📰",
                engagement={},
                tickers_referenced=["XOM", "DVN"],
                sectors_referenced=["energy", "oil"],
                signal_direction="bullish",
                signal_strength=5,
                signal_reasoning="Oil at $120, Russia supply disruption, OPEC won't increase, record cash flows for energy companies. Clear bullish signal for energy.",
                causal_chain="Ukraine war -> Russian oil supply disrupted -> oil at $120 -> energy companies generating record cash flows -> XOM/DVN bullish",
                keywords=["oil", "$120", "supply disruption", "OPEC", "energy crisis", "cash flows"],
                difficulty="easy",
            ),
            Document(
                id="doc_r3_05",
                source_type="article",
                raw_text="Meta Platforms (formerly Facebook) reported Q4 2021 earnings that shocked Wall Street. While revenue of $33.7 billion beat estimates, the company revealed it plans to spend $29-34 billion on the 'Metaverse' in 2022 - a virtual reality initiative that generated just $2.2 billion in revenue last year while losing $10 billion. CEO Mark Zuckerberg defended the spending: 'Building the metaverse is a once-in-a-generation opportunity.' But investors were horrified - the stock fell 26% in a single day, erasing $230 billion in market value. Combined with Apple's privacy changes hammering ad revenue and rising interest rates, Meta faces a perfect storm.",
                title="Meta Loses $230 Billion in Single Day as Metaverse Spending Shocks Investors",
                publish_date=date(2022, 2, 3),
                source_label="Wall Street Journal",
                author="",
                handle="",
                avatar="📰",
                engagement={},
                tickers_referenced=["META"],
                sectors_referenced=["big_tech", "social_media"],
                signal_direction="bearish",
                signal_strength=5,
                signal_reasoning="Massive capex on unproven Metaverse, ad revenue headwinds from Apple, rising rates compressing growth valuations. Triple threat.",
                causal_chain="Metaverse spending $29-34B -> losing $10B/yr on unproven bet -> Apple privacy hurts ad revenue -> rising rates compress growth multiples -> META bearish",
                keywords=["Meta", "Metaverse", "$230 billion", "spending", "Apple privacy", "ad revenue"],
                difficulty="easy",
            ),
            Document(
                id="doc_r3_06",
                source_type="article",
                raw_text="Growth stocks face their worst start to a year since the 2000 dot-com crash. The Nasdaq has fallen 15% in January alone as the market reprices for a higher interest rate environment. The logic is straightforward: growth stocks are valued on the present value of future earnings, and higher interest rates increase the discount rate used in those calculations. A stock trading at 50x forward earnings is far more sensitive to rate changes than one trading at 15x. 'We're seeing a generational rotation from growth to value,' said a portfolio manager at Bridgewater. 'Companies that generate cash today will outperform companies that promise cash tomorrow.'",
                title="Growth Stocks Face Worst Start Since 2000 as Rate Hike Fears Mount",
                publish_date=date(2022, 1, 28),
                source_label="Bloomberg",
                author="",
                handle="",
                avatar="📰",
                engagement={},
                tickers_referenced=["META", "AMZN"],
                sectors_referenced=["big_tech", "growth_stocks"],
                signal_direction="bearish",
                signal_strength=4,
                signal_reasoning="Clear framework: rate hikes compress growth multiples. Worst start since dot-com crash. Generational rotation from growth to value.",
                causal_chain="Fed rate hikes -> higher discount rates -> growth stock valuations compress -> Nasdaq crashes -> META/AMZN as high-multiple growth stocks most vulnerable -> bearish",
                keywords=["growth stocks", "rate hikes", "discount rate", "Nasdaq", "dot-com", "rotation"],
                difficulty="medium",
            ),
            Document(
                id="doc_r3_07",
                source_type="article",
                raw_text="Amazon reported its first quarterly loss since 2014 as the pandemic-era e-commerce boom faded. Revenue growth slowed to just 7%, the weakest in over two decades. The company admitted it had over-hired during COVID and over-invested in warehouse capacity, announcing plans to sublease 10 million square feet of warehouse space. CEO Andy Jassy acknowledged 'we went from an environment of scarcity to an environment of excess' in fulfillment capacity. Meanwhile, the company's cloud unit AWS continued to grow at 37%, but it wasn't enough to offset the core retail weakness. Analysts now question Amazon's retail margins going forward.",
                title="Amazon Posts First Loss Since 2014 as Post-COVID Reality Hits",
                publish_date=date(2022, 4, 28),
                source_label="Reuters",
                author="",
                handle="",
                avatar="📰",
                engagement={},
                tickers_referenced=["AMZN"],
                sectors_referenced=["e-commerce", "big_tech"],
                signal_direction="bearish",
                signal_strength=4,
                signal_reasoning="First loss in 8 years, over-invested in capacity, revenue growth weakest in 20 years. Post-COVID normalization hitting hard.",
                causal_chain="COVID e-commerce boom reverses -> Amazon over-built capacity -> first loss since 2014 -> revenue growth slowest in 20 years -> AMZN bearish",
                keywords=["Amazon", "loss", "post-COVID", "warehouse", "excess capacity"],
                difficulty="easy",
            ),
            Document(
                id="doc_r3_08",
                source_type="article",
                raw_text="NATO allies pledged to dramatically increase defense spending following Russia's invasion of Ukraine. Germany announced a historic $100 billion special fund for its military, breaking decades of underinvestment. The UK, France, and Poland all committed to raising defense budgets to at least 2% of GDP, with some targeting 3%. The US Congress fast-tracked a $40 billion aid package for Ukraine including advanced weapons systems. Defense contractors like Lockheed Martin, Raytheon, and Northrop Grumman are expected to see a multi-year order boom. 'This is the biggest increase in Western defense spending since the Cold War,' said a defense policy analyst at CSIS.",
                title="NATO Defense Spending Surges as Ukraine War Reshapes Security Landscape",
                publish_date=date(2022, 3, 15),
                source_label="Financial Times",
                author="",
                handle="",
                avatar="📰",
                engagement={},
                tickers_referenced=["LMT"],
                sectors_referenced=["defense"],
                signal_direction="bullish",
                signal_strength=4,
                signal_reasoning="Massive, multi-year defense spending increase across NATO. Germany alone committing $100B. Lockheed Martin as prime contractor.",
                causal_chain="Ukraine invasion -> NATO defense spending surge -> Germany $100B, US $40B Ukraine aid -> defense contractors get multi-year orders -> LMT bullish",
                keywords=["NATO", "defense spending", "Germany", "Ukraine", "Lockheed Martin", "military"],
                difficulty="easy",
            ),
            Document(
                id="doc_r3_09",
                source_type="reddit",
                raw_text="Title: Tech is oversold. This is the buying opportunity of a decade.\n\nEveryone is panicking about rate hikes but this is ridiculous. META at 12x earnings? AMZN at pandemic lows? These are GENERATIONAL companies with billions in revenue. The Fed will pivot by summer when they see the economy slowing. Buy the dip.\n\nYes, rates are going up. Yes, inflation is high. But these companies have MOATS. Google isn't going anywhere. Apple isn't going anywhere. The market is overreacting and I'm loading up.\n\nRemember March 2020? Everyone panicked and then stocks doubled. Same playbook.\n\nPosition: 50% META, 30% AMZN, 20% GOOGL. See you on the moon. 🚀",
                title="Tech is oversold. This is the buying opportunity of a decade.",
                publish_date=date(2022, 2, 15),
                source_label="r/stocks",
                author="u/buy_the_dip_forever",
                handle="buy_the_dip_forever",
                avatar="🎯",
                engagement={"upvotes": "5.1K", "comments": "3.2K"},
                tickers_referenced=["META", "AMZN"],
                sectors_referenced=["big_tech"],
                signal_direction="mixed",
                signal_strength=3,
                signal_reasoning="Red herring - classic 'buy the dip' fallacy. Compares to 2020 but macro environment is completely different. The Fed won't pivot until inflation is tamed.",
                causal_chain="Retail investor assumes Fed pivot coming -> compares to 2020 crash recovery -> BUT 2022 has structural inflation problem -> buying the dip in growth stocks too early -> trap",
                keywords=["buy the dip", "oversold", "Fed pivot", "META", "AMZN", "panic"],
                difficulty="hard",
            ),
        ]
        for doc in r3_docs:
            db.add(doc)

        r3_rels = [
            # doc_r3_01 (Fed hawkish pivot) -> META, AMZN (macro bearish for growth)
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r3_01", stock_id="r3_meta", relevance_type="macro", signal_direction_for_ticker="bearish", causal_chain_for_ticker="Fed rate hikes -> growth stock compression -> META as high-multiple growth stock -> bearish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r3_01", stock_id="r3_amzn", relevance_type="macro", signal_direction_for_ticker="bearish", causal_chain_for_ticker="Fed rate hikes -> growth stock compression -> AMZN as rate-sensitive growth stock -> bearish"),
            # doc_r3_02 (CPI 7.5%) -> XOM, DVN (energy bullish), META/AMZN (growth bearish)
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r3_02", stock_id="r3_xom", relevance_type="macro", signal_direction_for_ticker="bullish", causal_chain_for_ticker="Energy driving 40-year high inflation -> energy prices elevated -> XOM revenue surge -> bullish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r3_02", stock_id="r3_dvn", relevance_type="macro", signal_direction_for_ticker="bullish", causal_chain_for_ticker="Energy prices driving inflation -> DVN benefits from elevated oil prices -> bullish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r3_02", stock_id="r3_meta", relevance_type="macro", signal_direction_for_ticker="bearish", causal_chain_for_ticker="High inflation -> aggressive Fed tightening -> growth stocks crushed -> META bearish"),
            # doc_r3_03 (Russia invades Ukraine) -> XOM, DVN, LMT
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r3_03", stock_id="r3_xom", relevance_type="direct", signal_direction_for_ticker="bullish", causal_chain_for_ticker="Ukraine war -> sanctions on Russian oil -> supply disruption -> oil price surge -> XOM bullish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r3_03", stock_id="r3_dvn", relevance_type="direct", signal_direction_for_ticker="bullish", causal_chain_for_ticker="Ukraine war -> oil supply disruption -> elevated energy prices -> DVN bullish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r3_03", stock_id="r3_lmt", relevance_type="direct", signal_direction_for_ticker="bullish", causal_chain_for_ticker="Ukraine war -> NATO defense spending surge -> weapons orders increase -> LMT bullish"),
            # doc_r3_04 (Oil at $120) -> XOM, DVN
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r3_04", stock_id="r3_xom", relevance_type="direct", signal_direction_for_ticker="bullish", causal_chain_for_ticker="Oil at $120 -> record cash flows for energy companies -> XOM bullish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r3_04", stock_id="r3_dvn", relevance_type="direct", signal_direction_for_ticker="bullish", causal_chain_for_ticker="Oil at $120 -> record cash flows -> DVN bullish"),
            # doc_r3_05 (Meta Metaverse shock) -> META
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r3_05", stock_id="r3_meta", relevance_type="direct", signal_direction_for_ticker="bearish", causal_chain_for_ticker="$29-34B Metaverse spending + Apple privacy headwinds + rate hikes -> triple threat -> META bearish"),
            # doc_r3_06 (Growth stock crash) -> META, AMZN
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r3_06", stock_id="r3_meta", relevance_type="sector", signal_direction_for_ticker="bearish", causal_chain_for_ticker="Growth to value rotation -> META as high-multiple growth stock -> bearish"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r3_06", stock_id="r3_amzn", relevance_type="sector", signal_direction_for_ticker="bearish", causal_chain_for_ticker="Growth to value rotation -> AMZN as growth stock with slowing revenue -> bearish"),
            # doc_r3_07 (Amazon loss) -> AMZN
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r3_07", stock_id="r3_amzn", relevance_type="direct", signal_direction_for_ticker="bearish", causal_chain_for_ticker="First loss since 2014 -> over-built capacity -> post-COVID demand normalization -> AMZN bearish"),
            # doc_r3_08 (NATO defense spending) -> LMT
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r3_08", stock_id="r3_lmt", relevance_type="direct", signal_direction_for_ticker="bullish", causal_chain_for_ticker="NATO historic defense spending increase -> multi-year order boom for defense contractors -> LMT bullish"),
            # doc_r3_09 (Buy the dip reddit - red herring) -> META, AMZN (mixed/misleading)
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r3_09", stock_id="r3_meta", relevance_type="direct", signal_direction_for_ticker="mixed", causal_chain_for_ticker="Reddit says buy the dip in META -> but macro environment unlike 2020 -> could be a trap -> mixed/misleading"),
            DocumentStockRelevance(id=str(uuid.uuid4()), doc_id="doc_r3_09", stock_id="r3_amzn", relevance_type="direct", signal_direction_for_ticker="mixed", causal_chain_for_ticker="Reddit says buy the dip in AMZN -> but post-COVID demand cliff + rate hikes -> misleading -> mixed"),
        ]
        for rel in r3_rels:
            db.add(rel)

        await db.commit()
        print("All 3 rounds seeded successfully!")
        print(f"  Round 1: AI Boom 2023 - 6 stocks, {len(r1_docs)} documents, {len(r1_rels)} relevance links")
        print(f"  Round 2: Banking Crisis 2023 - 6 stocks, {len(r2_docs)} documents, {len(r2_rels)} relevance links")
        print(f"  Round 3: Inflation 2022 - 6 stocks, {len(r3_docs)} documents, {len(r3_rels)} relevance links")


if __name__ == "__main__":
    asyncio.run(seed())
