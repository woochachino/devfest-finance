"""
LLM service for generating educational retrospectives.
Uses Claude (Anthropic) API. Falls back to mock if no API key.
"""

from app.config import get_settings

settings = get_settings()


async def generate_retrospective(
    stocks: list[dict],
    allocations: dict[str, float],
    player_return: float,
    optimal_return: float,
    documents_served: list[dict],
    causal_chains: list[dict],
    round_title: str,
    round_description: str,
) -> dict:
    """
    Generate an educational retrospective using LLM.
    Returns a structured dict matching RetrospectiveOut schema.
    """
    if not settings.anthropic_api_key or settings.anthropic_api_key.startswith("sk-ant-your"):
        return _mock_retrospective(
            stocks, allocations, player_return, optimal_return,
            documents_served, causal_chains, round_title
        )

    try:
        from anthropic import AsyncAnthropic
        client = AsyncAnthropic(api_key=settings.anthropic_api_key)

        prompt = _build_retrospective_prompt(
            stocks, allocations, player_return, optimal_return,
            documents_served, causal_chains, round_title, round_description,
        )

        system_prompt = (
            "You are an expert financial educator. Generate an encouraging, "
            "insightful retrospective for a finance education game. "
            "Respond in JSON format matching this schema: "
            '{"summary": "string", "key_signals": ["string"], '
            '"what_player_got_right": ["string"], "what_player_missed": ["string"], '
            '"lessons": [{"title": "string", "content": "string"}], '
            '"overall_grade": "A|B|C|D|F", "encouragement": "string"}'
        )

        response = await client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1500,
            temperature=0.7,
            system=system_prompt,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        import json
        result = json.loads(response.content[0].text)
        return result

    except Exception as e:
        print(f"LLM call failed, using mock: {e}")
        return _mock_retrospective(
            stocks, allocations, player_return, optimal_return,
            documents_served, causal_chains, round_title
        )


def _build_retrospective_prompt(
    stocks, allocations, player_return, optimal_return,
    documents_served, causal_chains, round_title, round_description,
) -> str:
    stock_lines = []
    for s in stocks:
        alloc = allocations.get(s["ticker"], 0)
        stock_lines.append(
            f"  {s['ticker']} ({s['company_name']}): "
            f"return={s['return_pct']}%, player_alloc={alloc}%"
        )

    chain_lines = []
    for c in causal_chains:
        chain_lines.append(
            f"  Doc '{c.get('doc_title', c['doc_id'])}' → {c['ticker']}: "
            f"{c['causal_chain']}"
        )

    return f"""Round: {round_title}
Context: {round_description}

Stocks & Returns:
{chr(10).join(stock_lines)}

Player's return: {player_return}%
Optimal return (max 50% per stock): {optimal_return}%

Key causal chains from documents to stocks:
{chr(10).join(chain_lines)}

Generate an educational retrospective. Explain:
1. What signals in the documents pointed to the actual outcomes
2. What the player got right in their allocation
3. What key signals the player may have missed
4. 2-3 personalized lessons based on their specific allocation choices
5. An overall letter grade (A-F) and encouraging message

Tone: like a great finance teacher — insightful, encouraging, never condescending.
"""


def _mock_retrospective(
    stocks, allocations, player_return, optimal_return,
    documents_served, causal_chains, round_title,
) -> dict:
    """Fallback mock retrospective when no LLM is available."""

    # Find best and worst stocks
    sorted_stocks = sorted(stocks, key=lambda s: s["return_pct"], reverse=True)
    best = sorted_stocks[0] if sorted_stocks else None
    worst = sorted_stocks[-1] if sorted_stocks else None

    # Determine grade
    if optimal_return > 0:
        ratio = player_return / optimal_return if optimal_return else 0
    else:
        ratio = 1.0 if player_return >= 0 else 0.0

    if ratio >= 0.8:
        grade = "A"
    elif ratio >= 0.6:
        grade = "B"
    elif ratio >= 0.4:
        grade = "C"
    elif ratio >= 0.2:
        grade = "D"
    else:
        grade = "F"

    key_signals = [c.get("causal_chain", "") for c in causal_chains[:4] if c.get("causal_chain")]

    # What did the player get right?
    got_right = []
    got_wrong = []
    for s in sorted_stocks:
        alloc = allocations.get(s["ticker"], 0)
        if s["return_pct"] > 20 and alloc >= 20:
            got_right.append(f"Good call allocating {alloc}% to {s['ticker']} — it returned {s['return_pct']}%.")
        elif s["return_pct"] < -10 and alloc >= 15:
            got_wrong.append(f"Allocating {alloc}% to {s['ticker']} hurt — it returned {s['return_pct']}%.")
        elif s["return_pct"] > 50 and alloc < 10:
            got_wrong.append(f"{s['ticker']} returned {s['return_pct']}% but you only allocated {alloc}%.")

    if not got_right:
        got_right.append("Your diversification strategy helped manage risk across the portfolio.")
    if not got_wrong:
        got_wrong.append("No major misses — solid signal reading overall.")

    return {
        "summary": (
            f"In the '{round_title}' round, the market delivered varied returns. "
            f"{best['ticker'] if best else 'The top performer'} led with "
            f"+{best['return_pct'] if best else 0}% while "
            f"{worst['ticker'] if worst else 'the laggard'} returned "
            f"{worst['return_pct'] if worst else 0}%. "
            f"Your portfolio returned {player_return}% vs the optimal {optimal_return}%."
        ),
        "key_signals": key_signals or [
            "Multiple documents contained directional signals that pointed to the actual outcomes.",
            "The causal chains from macro events to individual stocks were identifiable in the documents provided.",
        ],
        "what_player_got_right": got_right,
        "what_player_missed": got_wrong,
        "lessons": [
            {
                "title": "Signal vs. Noise",
                "content": "Not every document is equally important. Learn to weigh primary sources (earnings data, Fed statements) more heavily than opinion pieces.",
            },
            {
                "title": "Causal Chain Thinking",
                "content": "The best investors trace events through logical chains: macro event → sector impact → individual stock effect.",
            },
            {
                "title": "Diversification with Conviction",
                "content": "The optimal portfolio isn't 'all in one stock' — it's concentrated in high-conviction ideas while maintaining enough diversification to limit downside.",
            },
        ],
        "overall_grade": grade,
        "encouragement": (
            "Great effort! Every round teaches something new about reading financial signals. "
            "The key is building the habit of tracing causal chains from documents to stock movements."
            if player_return >= 0
            else "Losses are the best teachers in finance. The signals were there — "
            "now you know what to look for next time. Keep learning!"
        ),
    }
