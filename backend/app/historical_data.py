"""
Historical price data service for portfolio performance graphs.
"""

from datetime import date, timedelta
from typing import Dict, List
import yfinance as yf
import pandas as pd


def get_daily_prices(ticker: str, start_date: date, end_date: date) -> List[Dict]:
    """
    Fetch daily closing prices for a stock.

    Args:
        ticker: Stock ticker symbol
        start_date: Start date
        end_date: End date

    Returns:
        List of {date: "YYYY-MM-DD", close: float}
    """
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(start=start_date, end=end_date, interval='1d')

        if hist.empty:
            return []

        result = []
        for date_idx, row in hist.iterrows():
            result.append({
                'date': date_idx.strftime('%Y-%m-%d'),
                'close': float(row['Close'])
            })

        return result

    except Exception as e:
        print(f"Error fetching daily prices for {ticker}: {e}")
        return []


def get_portfolio_time_series(
    allocations: Dict[str, float],
    start_date: date,
    end_date: date,
    initial_balance: float = 1000000.0
) -> List[Dict]:
    """
    Calculate weighted portfolio value over time.

    Args:
        allocations: Dict of {ticker: allocation_percentage} (e.g., {"NVDA": 0.30, "MSFT": 0.25})
        start_date: Start date
        end_date: End date
        initial_balance: Starting portfolio value (default: $1M)

    Returns:
        List of {date: "YYYY-MM-DD", portfolio_value: float}
    """
    if not allocations:
        return []

    # Fetch historical data for all tickers
    ticker_data = {}
    for ticker in allocations.keys():
        prices = get_daily_prices(ticker, start_date, end_date)
        if prices:
            ticker_data[ticker] = prices

    if not ticker_data:
        return []

    # Build a unified date index from all tickers
    all_dates = set()
    for prices in ticker_data.values():
        for price_point in prices:
            all_dates.add(price_point['date'])

    dates_sorted = sorted(list(all_dates))

    # Convert to DataFrames for easier manipulation
    dfs = {}
    for ticker, prices in ticker_data.items():
        df = pd.DataFrame(prices)
        df['date'] = pd.to_datetime(df['date'])
        df = df.set_index('date')
        dfs[ticker] = df

    # Calculate portfolio value for each date
    result = []
    for date_str in dates_sorted:
        date_dt = pd.to_datetime(date_str)
        portfolio_value = 0.0
        valid_data = True

        for ticker, allocation_pct in allocations.items():
            if ticker not in dfs:
                valid_data = False
                break

            df = dfs[ticker]

            # Get price on this date (or forward-fill if missing)
            if date_dt in df.index:
                price = df.loc[date_dt, 'close']
            else:
                # Forward fill - use last known price
                earlier_prices = df[df.index <= date_dt]
                if earlier_prices.empty:
                    valid_data = False
                    break
                price = earlier_prices.iloc[-1]['close']

            # Get initial price (first date)
            first_date = df.index[0]
            initial_price = df.loc[first_date, 'close']

            # Calculate return for this stock
            stock_return = (price - initial_price) / initial_price

            # Calculate contribution to portfolio
            allocation_amount = initial_balance * (allocation_pct / 100.0)
            current_value = allocation_amount * (1 + stock_return)
            portfolio_value += current_value

        if valid_data:
            result.append({
                'date': date_str,
                'portfolio_value': round(portfolio_value, 2)
            })

    return result


def get_optimal_portfolio_time_series(
    tickers: List[str],
    returns: Dict[str, float],
    start_date: date,
    end_date: date,
    initial_balance: float = 1000000.0,
    max_allocation_pct: float = 50.0
) -> List[Dict]:
    """
    Calculate optimal portfolio value over time.

    Optimal allocation: Greedy algorithm selecting best stocks with max 50% per stock.

    Args:
        tickers: List of all available tickers
        returns: Dict of {ticker: return_pct} with final returns
        start_date: Start date
        end_date: End date
        initial_balance: Starting value
        max_allocation_pct: Max allocation per stock (default: 50%)

    Returns:
        List of {date: "YYYY-MM-DD", portfolio_value: float}
    """
    # Calculate optimal allocation (greedy with constraint)
    sorted_stocks = sorted(returns.items(), key=lambda x: x[1], reverse=True)

    optimal_allocations = {}
    remaining_pct = 100.0

    for ticker, return_pct in sorted_stocks:
        if remaining_pct <= 0:
            break

        allocation = min(max_allocation_pct, remaining_pct)
        optimal_allocations[ticker] = allocation
        remaining_pct -= allocation

    # Get time series using optimal allocations
    return get_portfolio_time_series(optimal_allocations, start_date, end_date, initial_balance)


def get_stock_time_series(
    ticker: str,
    start_date: date,
    end_date: date,
    initial_investment: float = 100000.0
) -> List[Dict]:
    """
    Get value of a single stock investment over time.

    Args:
        ticker: Stock ticker
        start_date: Start date
        end_date: End date
        initial_investment: Initial amount invested

    Returns:
        List of {date: "YYYY-MM-DD", value: float}
    """
    prices = get_daily_prices(ticker, start_date, end_date)

    if not prices or len(prices) < 2:
        return []

    initial_price = prices[0]['close']
    result = []

    for price_point in prices:
        current_price = price_point['close']
        return_mult = current_price / initial_price
        value = initial_investment * return_mult

        result.append({
            'date': price_point['date'],
            'value': round(value, 2)
        })

    return result
