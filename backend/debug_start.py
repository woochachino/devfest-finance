"""Quick debug script to test the game start logic directly."""
import asyncio
import traceback
from app.database import async_session
from app.models import RoundConfig, StockReturn, Document, DocumentStockRelevance
from sqlalchemy import select

async def main():
    async with async_session() as db:
        # 1. Check round
        result = await db.execute(select(RoundConfig).where(RoundConfig.id == "ai_boom_2023"))
        rc = result.scalar_one_or_none()
        print(f"Round config: {rc}")
        print(f"  period_start type: {type(rc.period_start)}, value: {rc.period_start}")

        # 2. Check stocks
        result = await db.execute(select(StockReturn).where(StockReturn.round_id == "ai_boom_2023"))
        stocks = list(result.scalars().all())
        print(f"\nStocks ({len(stocks)}):")
        for s in stocks:
            print(f"  {s.id}: {s.ticker} return={s.return_pct}")

        # 3. Check docs
        result = await db.execute(select(Document).limit(5))
        docs = list(result.scalars().all())
        print(f"\nDocs ({len(docs)}):")
        for d in docs:
            print(f"  {d.id}: publish_date={d.publish_date} (type={type(d.publish_date)})")

        # 4. Try running engine
        from app.engine import select_documents_for_round
        try:
            selected = await select_documents_for_round(db, rc, stocks, difficulty="medium")
            print(f"\nEngine returned {len(selected)} docs")
            for d in selected:
                print(f"  {d.id}: {d.headline}")
        except Exception as e:
            print(f"\nEngine ERROR: {e}")
            traceback.print_exc()

asyncio.run(main())
