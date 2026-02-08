"""
Scoring and portfolio calculations.
"""


def calculate_player_return(
    allocations: dict[str, float],
    stock_returns: dict[str, float],
) -> float:
    """
    Calculate player's portfolio return as weighted sum.
    allocations: {"NVDA": 30.0, "MSFT": 25.0, ...} — percentages (0-100)
    stock_returns: {"NVDA": 190.0, "MSFT": 40.0, ...} — return percentages
    """
    total_return = 0.0
    for ticker, alloc_pct in allocations.items():
        ret = stock_returns.get(ticker, 0.0)
        total_return += (alloc_pct / 100.0) * ret
    return round(total_return, 2)


def calculate_optimal_return(
    stock_returns: dict[str, float],
    max_per_stock: float = 50.0,
) -> float:
    """
    Calculate constrained optimal return.
    Greedy: allocate max_per_stock% to highest returners first.
    """
    sorted_stocks = sorted(stock_returns.items(), key=lambda x: x[1], reverse=True)
    remaining = 100.0
    total_return = 0.0

    for ticker, ret in sorted_stocks:
        alloc = min(max_per_stock, remaining)
        if alloc <= 0:
            break
        total_return += (alloc / 100.0) * ret
        remaining -= alloc

    return round(total_return, 2)


def calculate_score(
    player_return: float,
    optimal_return: float,
) -> int:
    """
    Score 0-100 based on how close player is to optimal.
    """
    if optimal_return <= 0:
        # Edge case: if optimal is negative/zero, score based on absolute performance
        if player_return >= 0:
            return 100
        return max(0, int(50 + player_return))

    if player_return >= optimal_return:
        return 100

    if player_return <= 0 and optimal_return > 0:
        return max(0, int(25 + (player_return / optimal_return) * 25))

    ratio = player_return / optimal_return
    return max(0, min(100, int(ratio * 100)))


def compute_stock_results(
    allocations: dict[str, float],
    stocks: list[dict],
    base_balance: float = 1_000_000,
) -> list[dict]:
    """
    Compute detailed per-stock results.
    stocks: list of dicts with ticker, company_name, sector, emoji, return_pct
    """
    results = []
    for stock in stocks:
        ticker = stock["ticker"]
        alloc_pct = allocations.get(ticker, 0.0)
        invested = (alloc_pct / 100.0) * base_balance
        ret_pct = stock["return_pct"]
        final = invested * (1 + ret_pct / 100.0)
        gain = final - invested

        results.append({
            "ticker": ticker,
            "company_name": stock["company_name"],
            "sector": stock["sector"],
            "emoji": stock.get("emoji", "📊"),
            "return_pct": ret_pct,
            "player_allocation_pct": alloc_pct,
            "player_dollar_invested": round(invested, 2),
            "player_dollar_final": round(final, 2),
            "player_gain": round(gain, 2),
        })

    # Sort by return desc
    results.sort(key=lambda x: x["return_pct"], reverse=True)
    return results
