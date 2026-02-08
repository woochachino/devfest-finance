#!/usr/bin/env python3
"""
Populate stock returns using real historical data from yfinance.
Fetches actual returns for each round's ticker list.
"""

import asyncio

from app.database import async_session, engine, Base
from app.stock_data import populate_stock_returns_for_round


# Define ticker lists for each round
ROUND_TICKERS = {
    "ai_boom_2023": ["NVDA", "MSFT", "GOOGL", "INTC", "SNAP", "IBM"],
    "banking_crisis_2023": ["JPM", "SCHW", "KRE", "GLD", "AAPL", "PFE"],
    "inflation_regime_2022": ["META", "AMZN", "XOM", "DVN", "LMT", "TSLA"],
}


async def main():
    print("="*80)
    print("STOCK DATA POPULATION")
    print("="*80)
    print()

    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    total_count = 0

    for round_id, tickers in ROUND_TICKERS.items():
        print(f"\n{'='*80}")
        print(f"ROUND: {round_id}")
        print(f"{'='*80}")

        async with async_session() as session:
            count = await populate_stock_returns_for_round(
                db=session,
                round_id=round_id,
                tickers=tickers
            )
            total_count += count

        print(f"✓ {count} stocks populated for {round_id}")

    print()
    print("="*80)
    print(f"✓ COMPLETE: {total_count} total stocks populated across all rounds")
    print("="*80)


if __name__ == "__main__":
    asyncio.run(main())
