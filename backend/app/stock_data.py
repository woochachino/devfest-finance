"""
Stock data fetching service using yfinance for real historical returns.
"""

import uuid
from datetime import date
from typing import Dict, List, Optional
import yfinance as yf
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import StockReturn, RoundConfig


def fetch_stock_return(ticker: str, start_date: date, end_date: date) -> Optional[float]:
    """
    Fetch actual stock return percentage using yfinance.

    Args:
        ticker: Stock ticker symbol (e.g., 'NVDA', 'AAPL')
        start_date: Period start date
        end_date: Period end date

    Returns:
        Return percentage (e.g., 190.5 for 190.5%), or None on error
    """
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(start=start_date, end=end_date)

        if hist.empty or len(hist) < 2:
            print(f"  Warning: No price data for {ticker}")
            return None

        # Get first and last closing prices
        start_price = hist.iloc[0]['Close']
        end_price = hist.iloc[-1]['Close']

        # Calculate percentage return
        return_pct = ((end_price - start_price) / start_price) * 100

        return round(return_pct, 2)

    except Exception as e:
        print(f"  Error fetching {ticker}: {e}")
        return None


def get_company_info(ticker: str) -> Dict[str, str]:
    """
    Fetch company metadata from yfinance.

    Args:
        ticker: Stock ticker symbol

    Returns:
        Dictionary with company_name, sector, and emoji
    """
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        company_name = info.get('longName') or info.get('shortName') or ticker
        sector = info.get('sector', 'Unknown')

        # Simple emoji mapping by sector
        sector_emojis = {
            'Technology': '💻',
            'Healthcare': '💊',
            'Financial Services': '🏦',
            'Energy': '⚡',
            'Consumer Cyclical': '🛒',
            'Consumer Defensive': '🛍️',
            'Industrials': '🏭',
            'Basic Materials': '⚒️',
            'Real Estate': '🏠',
            'Communication Services': '📡',
            'Utilities': '💡',
        }
        emoji = sector_emojis.get(sector, '📊')

        return {
            'company_name': company_name,
            'sector': sector,
            'emoji': emoji
        }

    except Exception as e:
        print(f"  Error fetching info for {ticker}: {e}")
        return {
            'company_name': ticker,
            'sector': 'Unknown',
            'emoji': '📊'
        }


async def populate_stock_returns_for_round(
    db: AsyncSession,
    round_id: str,
    tickers: List[str]
) -> int:
    """
    Fetch real stock returns for a round and create/update StockReturn records.

    Args:
        db: Database session
        round_id: Round ID (must exist in database)
        tickers: List of ticker symbols

    Returns:
        Number of stocks populated
    """
    # Load round config
    result = await db.execute(
        select(RoundConfig).where(RoundConfig.id == round_id)
    )
    round_config = result.scalar_one_or_none()

    if not round_config:
        raise ValueError(f"Round {round_id} not found")

    print(f"Populating stocks for round: {round_config.title}")
    print(f"Period: {round_config.period_start} to {round_config.period_end}")
    print(f"Tickers: {', '.join(tickers)}")
    print()

    count = 0

    for ticker in tickers:
        print(f"Processing {ticker}...")

        # Fetch return
        return_pct = fetch_stock_return(
            ticker,
            round_config.period_start,
            round_config.period_end
        )

        if return_pct is None:
            print(f"  Skipping {ticker}: no data available")
            continue

        # Fetch company info
        info = get_company_info(ticker)

        # Check if stock already exists for this round
        result = await db.execute(
            select(StockReturn).where(
                StockReturn.round_id == round_id,
                StockReturn.ticker == ticker
            )
        )
        existing_stock = result.scalar_one_or_none()

        if existing_stock:
            # Update existing
            existing_stock.return_pct = return_pct
            existing_stock.company_name = info['company_name']
            existing_stock.sector = info['sector']
            existing_stock.emoji = info['emoji']
            print(f"  ✓ Updated {ticker}: {return_pct:+.1f}% | {info['company_name']} ({info['sector']})")
        else:
            # Create new
            stock = StockReturn(
                id=str(uuid.uuid4()),
                ticker=ticker,
                company_name=info['company_name'],
                sector=info['sector'],
                emoji=info['emoji'],
                round_id=round_id,
                return_pct=return_pct,
                story=""
            )
            db.add(stock)
            print(f"  ✓ Created {ticker}: {return_pct:+.1f}% | {info['company_name']} ({info['sector']})")

        count += 1

    await db.commit()
    print(f"\n✓ Total stocks populated: {count}")
    return count


async def update_all_stock_returns(db: AsyncSession) -> int:
    """
    Update all existing stock returns with fresh data from yfinance.

    Args:
        db: Database session

    Returns:
        Number of stocks updated
    """
    # Load all stocks
    result = await db.execute(select(StockReturn))
    stocks = result.scalars().all()

    if not stocks:
        print("No stocks found in database")
        return 0

    print(f"Updating {len(stocks)} stock returns...")

    updated_count = 0

    for stock in stocks:
        # Load round config
        result = await db.execute(
            select(RoundConfig).where(RoundConfig.id == stock.round_id)
        )
        round_config = result.scalar_one_or_none()

        if not round_config:
            print(f"  Warning: Round {stock.round_id} not found for {stock.ticker}")
            continue

        # Fetch new return
        return_pct = fetch_stock_return(
            stock.ticker,
            round_config.period_start,
            round_config.period_end
        )

        if return_pct is not None:
            old_return = stock.return_pct
            stock.return_pct = return_pct
            updated_count += 1
            print(f"  ✓ {stock.ticker}: {old_return:+.1f}% → {return_pct:+.1f}%")
        else:
            print(f"  ✗ {stock.ticker}: failed to fetch data")

    await db.commit()
    print(f"\n✓ Total stocks updated: {updated_count}")
    return updated_count
