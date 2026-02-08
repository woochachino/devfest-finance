#!/usr/bin/env python3
"""
CLI script for scraping news articles and storing them in the database.

Usage:
    python scrape_news.py --round ai_boom_2023 \
        --keywords "NVIDIA AI,Microsoft OpenAI,ChatGPT" \
        --from 2022-10-01 --to 2023-01-01
"""

import asyncio
import argparse
from datetime import date, datetime

from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session, engine, Base
from app.news_scraper import scrape_and_store_articles


async def main():
    parser = argparse.ArgumentParser(description="Scrape news articles and store in database")
    parser.add_argument("--round", type=str, required=True, help="Round ID (e.g., ai_boom_2023)")
    parser.add_argument("--keywords", type=str, required=True, help="Comma-separated keywords")
    parser.add_argument("--from", dest="from_date", type=str, required=True, help="Start date (YYYY-MM-DD)")
    parser.add_argument("--to", dest="to_date", type=str, required=True, help="End date (YYYY-MM-DD)")
    parser.add_argument("--source-type", type=str, default="article", help="Source type (default: article)")

    args = parser.parse_args()

    # Parse keywords
    keywords = [k.strip() for k in args.keywords.split(",")]

    # Parse dates
    try:
        from_date = datetime.strptime(args.from_date, "%Y-%m-%d").date()
        to_date = datetime.strptime(args.to_date, "%Y-%m-%d").date()
    except ValueError as e:
        print(f"Error parsing dates: {e}")
        print("Please use format: YYYY-MM-DD")
        return

    print("="*80)
    print("NEWS ARTICLE SCRAPER")
    print("="*80)
    print(f"Round: {args.round}")
    print(f"Keywords: {', '.join(keywords)}")
    print(f"Date range: {from_date} to {to_date}")
    print(f"Source type: {args.source_type}")
    print("="*80)
    print()

    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Scrape and store articles
    async with async_session() as session:
        count = await scrape_and_store_articles(
            db=session,
            keywords=keywords,
            from_date=from_date,
            to_date=to_date,
            source_type=args.source_type
        )

    print()
    print("="*80)
    print(f"✓ COMPLETE: {count} articles stored")
    print("="*80)


if __name__ == "__main__":
    asyncio.run(main())
