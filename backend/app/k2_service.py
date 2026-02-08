"""
K2 Think API Service for personalized game analysis.
Uses K2 Think API from MBZUAI. Falls back to mock if no API key.
"""

import json
import httpx
from app.config import get_settings

settings = get_settings()


async def generate_game_analysis(
    round_history: list[dict],
    game_data: dict,
) -> dict:
    """
    Generate personalized end-of-game analysis using K2 Think LLM.
    
    Args:
        round_history: List of round data with allocations, results, articles shown
        game_data: Game configuration data (stocks, articles, etc.)
    
    Returns:
        Structured analysis with per-round insights, teaching points, and overall feedback
    """
    if not settings.k2_api_key or settings.k2_api_key.startswith("your-"):
        return _mock_game_analysis(round_history, game_data)

    try:
        prompt = _build_analysis_prompt(round_history, game_data)
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                settings.k2_api_url,
                headers={
                    "Authorization": f"Bearer {settings.k2_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "k2-think",
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are an expert financial educator analyzing a player's investment decisions "
                                "in a stock market simulation game. Provide insightful, encouraging feedback that "
                                "helps them understand how to read financial signals from news articles. "
                                "Respond in JSON format."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "max_tokens": 2000,
                    "temperature": 0.7,
                },
            )
            response.raise_for_status()
            data = response.json()
            
            # Parse the response content as JSON
            content = data["choices"][0]["message"]["content"]
            result = json.loads(content)
            return result

    except Exception as e:
        print(f"K2 Think API call failed, using mock: {e}")
        return _mock_game_analysis(round_history, game_data)


def _build_analysis_prompt(round_history: list[dict], game_data: dict) -> str:
    """Build the analysis prompt from game data."""
    
    rounds_text = []
    for round_data in round_history:
        round_num = round_data.get("round", "?")
        allocations = round_data.get("allocations", {})
        results = round_data.get("results", {})
        articles = round_data.get("articles", [])
        
        # Format allocations
        alloc_lines = [f"  - {ticker}: {pct}%" for ticker, pct in allocations.items() if pct > 0]
        alloc_text = "\n".join(alloc_lines) if alloc_lines else "  No allocations"
        
        # Format results
        stock_results = results.get("stockResults", [])
        results_lines = []
        for sr in stock_results:
            results_lines.append(
                f"  - {sr['ticker']}: allocated {sr['allocationPercent']}%, "
                f"returned {sr['returnPercent']:+.1f}%, P/L: ${sr['gain']:+,.0f}"
            )
        results_text = "\n".join(results_lines) if results_lines else "  No results"
        
        # Format articles (summaries only)
        article_lines = []
        for art in articles[:5]:  # Limit to 5 articles per round
            article_lines.append(f"  - [{art.get('platform', 'news')}] {art.get('title', 'Untitled')}")
        articles_text = "\n".join(article_lines) if article_lines else "  No articles recorded"
        
        overall_return = results.get("overallReturn", 0)
        
        rounds_text.append(f"""
ROUND {round_num}:
Articles Shown:
{articles_text}

Player's Allocations:
{alloc_text}

Results:
{results_text}
Overall Return: {overall_return:+.1f}%
""")
    
    full_prompt = f"""Analyze this player's investment decisions across 3 market rounds.

{chr(10).join(rounds_text)}

Please provide analysis in this exact JSON format:
{{
    "overall_grade": "A/B/C/D/F",
    "overall_summary": "2-3 sentences summarizing performance",
    "round_analyses": [
        {{
            "round": 1,
            "what_signals_said": ["Key signals from articles"],
            "what_player_did_right": ["Good decisions"],
            "what_player_missed": ["Missed opportunities or mistakes"],
            "key_lesson": "One key takeaway for this round"
        }}
    ],
    "cognitive_biases_detected": [
        {{
            "bias": "Name of bias (e.g., FOMO, Recency Bias)",
            "evidence": "How this showed in their decisions",
            "advice": "How to overcome it"
        }}
    ],
    "top_3_lessons": [
        "Most important lesson 1",
        "Most important lesson 2", 
        "Most important lesson 3"
    ],
    "encouragement": "Personalized encouraging message"
}}

Be specific about which articles contained which signals. Reference actual stock decisions the player made.
Tone: Like a supportive mentor - insightful but encouraging."""
    
    return full_prompt


def _mock_game_analysis(round_history: list[dict], game_data: dict) -> dict:
    """Fallback mock analysis when K2 API is unavailable."""
    
    # Calculate overall stats
    total_return = 0
    round_analyses = []
    
    for i, round_data in enumerate(round_history, 1):
        results = round_data.get("results", {})
        allocations = round_data.get("allocations", {})
        overall_return = results.get("overallReturn", 0)
        total_return += overall_return
        
        stock_results = results.get("stockResults", [])
        
        # Find best/worst performers
        sorted_stocks = sorted(stock_results, key=lambda s: s.get("returnPercent", 0), reverse=True)
        best = sorted_stocks[0] if sorted_stocks else None
        worst = sorted_stocks[-1] if len(sorted_stocks) > 1 else None
        
        got_right = []
        missed = []
        
        for sr in stock_results:
            ret = sr.get("returnPercent", 0)
            alloc = sr.get("allocationPercent", 0)
            ticker = sr.get("ticker", "?")
            
            if ret > 15 and alloc >= 20:
                got_right.append(f"Strong conviction in {ticker} paid off with {ret:+.1f}% return")
            elif ret < -10 and alloc >= 20:
                missed.append(f"Heavy allocation to {ticker} ({alloc}%) hurt with {ret:+.1f}% return")
            elif ret > 30 and alloc < 15:
                missed.append(f"Underweighted {ticker} which returned {ret:+.1f}%")
        
        if not got_right:
            got_right.append("Maintained diversification across the portfolio")
        if not missed:
            missed.append("No major misses - solid signal reading")
        
        round_analyses.append({
            "round": i,
            "what_signals_said": [
                "Articles contained directional signals about market trends",
                "Earnings data and analyst reports pointed to sector movements",
            ],
            "what_player_did_right": got_right[:2],
            "what_player_missed": missed[:2],
            "key_lesson": f"Round {i} showed the importance of reading between the lines of financial news",
        })
    
    # Determine grade
    avg_return = total_return / len(round_history) if round_history else 0
    if avg_return >= 15:
        grade = "A"
    elif avg_return >= 8:
        grade = "B"
    elif avg_return >= 0:
        grade = "C"
    elif avg_return >= -10:
        grade = "D"
    else:
        grade = "F"
    
    return {
        "overall_grade": grade,
        "overall_summary": (
            f"Across 3 rounds of market action, you achieved an average return of {avg_return:+.1f}%. "
            f"Your decisions showed understanding of key market signals, though there were opportunities to improve."
        ),
        "round_analyses": round_analyses,
        "cognitive_biases_detected": [
            {
                "bias": "Recency Bias",
                "evidence": "Tendency to weight recent news more heavily than historical context",
                "advice": "Consider the full picture - recent headlines may not reflect underlying fundamentals",
            },
            {
                "bias": "Confirmation Bias",
                "evidence": "Looking for articles that support pre-existing views on stocks",
                "advice": "Actively seek out contrary opinions and challenge your assumptions",
            },
        ],
        "top_3_lessons": [
            "Headlines often contain truth but miss critical context and timing",
            "Diversification reduces risk, but conviction in high-signal plays can amplify gains",
            "Understanding macro factors (Fed policy, sector shifts) matters as much as stock picking",
        ],
        "encouragement": (
            "Great effort navigating these market scenarios! "
            "Every round teaches something new about reading financial signals. "
            "The best investors are always learning - keep building that pattern recognition!"
        ),
    }
