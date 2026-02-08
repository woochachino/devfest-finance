"""
Reddit Scraper for FinSight
===========================
Scrapes real Reddit posts relevant to our 3 game rounds, then stores them
in the database with LLM-generated signal annotations.

SETUP (one-time):
1. Go to https://www.reddit.com/prefs/apps
2. Click "create another app..." at the bottom
3. Choose "script" type
4. Name: "FinSight Scraper" (or anything)
5. Redirect URI: http://localhost:8080
6. Copy the client_id (under the app name) and client_secret
7. Add them to backend/.env:
   REDDIT_CLIENT_ID=your_client_id
   REDDIT_CLIENT_SECRET=your_client_secret

USAGE:
  python scrape_reddit.py              # scrape + store in DB
  python scrape_reddit.py --dry-run    # preview what would be scraped (no DB write)
  python scrape_reddit.py --annotate   # also run LLM annotation on scraped posts
"""

import os
import sys
import json
import asyncio
import uuid
from datetime import datetime, date, timedelta
from dataclasses import dataclass, field, asdict

sys.path.insert(0, os.path.dirname(__file__))

import praw
from dotenv import load_dotenv

load_dotenv()


# ══════════════════════════════════════════════════════════════════════════════
# CONFIG: What to search for
# ══════════════════════════════════════════════════════════════════════════════

@dataclass
class SearchQuery:
    """A single Reddit search query."""
    subreddit: str
    query: str
    round_id: str           # which game round this is for
    tickers: list[str]      # tickers this could relate to
    sectors: list[str]      # sectors
    expected_direction: str  # bullish / bearish / mixed
    min_upvotes: int = 50   # minimum score to keep
    limit: int = 20         # max results to fetch


# Searches organized by round
SEARCHES = [
    # ── Round 1: AI Boom 2023 ─────────────────────────────────────────────
    SearchQuery("wallstreetbets", "NVDA AI GPU", "ai_boom_2023", ["NVDA"], ["semiconductors", "AI"], "bullish"),
    SearchQuery("wallstreetbets", "ChatGPT stocks", "ai_boom_2023", ["NVDA", "MSFT"], ["AI", "big_tech"], "bullish"),
    SearchQuery("stocks", "NVIDIA AI overvalued", "ai_boom_2023", ["NVDA"], ["semiconductors"], "mixed"),
    SearchQuery("stocks", "Microsoft OpenAI", "ai_boom_2023", ["MSFT"], ["big_tech", "AI"], "bullish"),
    SearchQuery("stocks", "Intel AI GPU", "ai_boom_2023", ["INTC"], ["semiconductors"], "bearish"),
    SearchQuery("wallstreetbets", "SNAP earnings", "ai_boom_2023", ["SNAP"], ["social_media"], "bearish"),
    SearchQuery("stocks", "Google ChatGPT threat", "ai_boom_2023", ["GOOGL"], ["big_tech"], "mixed"),
    SearchQuery("investing", "AI bubble 2023", "ai_boom_2023", ["NVDA", "MSFT"], ["AI"], "mixed"),

    # ── Round 2: Banking Crisis 2023 ──────────────────────────────────────
    SearchQuery("wallstreetbets", "SVB bank run", "banking_crisis_2023", ["SCHW", "KRE"], ["banking"], "bearish"),
    SearchQuery("stocks", "SVB Silicon Valley Bank", "banking_crisis_2023", ["SCHW", "KRE"], ["banking"], "bearish"),
    SearchQuery("stocks", "regional banks crisis", "banking_crisis_2023", ["KRE"], ["regional_banks"], "bearish"),
    SearchQuery("investing", "Schwab SVB bond losses", "banking_crisis_2023", ["SCHW"], ["financial_services"], "bearish"),
    SearchQuery("stocks", "JPMorgan fortress", "banking_crisis_2023", ["JPM"], ["megabanks"], "bullish"),
    SearchQuery("wallstreetbets", "gold safe haven 2023", "banking_crisis_2023", ["GLD"], ["gold"], "bullish"),
    SearchQuery("stocks", "Apple safe haven", "banking_crisis_2023", ["AAPL"], ["big_tech"], "bullish"),
    SearchQuery("investing", "bank unrealized losses bonds", "banking_crisis_2023", ["SCHW", "KRE"], ["banking"], "bearish"),

    # ── Round 3: Inflation 2022 ───────────────────────────────────────────
    SearchQuery("wallstreetbets", "oil stocks Ukraine Russia", "inflation_2022", ["XOM", "DVN"], ["energy"], "bullish"),
    SearchQuery("stocks", "META Metaverse spending", "inflation_2022", ["META"], ["big_tech"], "bearish"),
    SearchQuery("wallstreetbets", "buy the dip tech 2022", "inflation_2022", ["META", "AMZN"], ["big_tech"], "mixed"),
    SearchQuery("stocks", "Fed rate hike growth stocks", "inflation_2022", ["META", "AMZN"], ["growth_stocks"], "bearish"),
    SearchQuery("stocks", "Exxon oil 2022", "inflation_2022", ["XOM"], ["energy"], "bullish"),
    SearchQuery("stocks", "Amazon post COVID", "inflation_2022", ["AMZN"], ["e-commerce"], "bearish"),
    SearchQuery("investing", "defense stocks Ukraine NATO", "inflation_2022", ["LMT"], ["defense"], "bullish"),
    SearchQuery("stocks", "inflation CPI 2022", "inflation_2022", [], ["macro"], "bearish"),
]


# ══════════════════════════════════════════════════════════════════════════════
# SCRAPER
# ══════════════════════════════════════════════════════════════════════════════

@dataclass
class ScrapedPost:
    """A scraped Reddit post."""
    reddit_id: str
    subreddit: str
    title: str
    selftext: str
    author: str
    score: int
    num_comments: int
    created_utc: float
    permalink: str
    url: str
    # Metadata from search config
    round_id: str
    tickers: list[str]
    sectors: list[str]
    expected_direction: str


def create_reddit_client() -> praw.Reddit:
    """Create a Reddit API client."""
    client_id = os.getenv("REDDIT_CLIENT_ID")
    client_secret = os.getenv("REDDIT_CLIENT_SECRET")

    if not client_id or not client_secret:
        print("=" * 60)
        print("REDDIT API CREDENTIALS NOT FOUND")
        print("=" * 60)
        print()
        print("To scrape Reddit, you need API credentials (free):")
        print()
        print("1. Go to: https://www.reddit.com/prefs/apps")
        print("2. Scroll down, click 'create another app...'")
        print("3. Fill in:")
        print("   - Name: FinSight Scraper")
        print("   - Type: script")
        print("   - Redirect URI: http://localhost:8080")
        print("4. Click 'create app'")
        print("5. Copy the client_id (string under the app name)")
        print("   and the client_secret")
        print()
        print("6. Add to backend/.env:")
        print("   REDDIT_CLIENT_ID=your_client_id_here")
        print("   REDDIT_CLIENT_SECRET=your_client_secret_here")
        print()
        print("Then run this script again.")
        sys.exit(1)

    return praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent="FinSight:v1.0 (educational finance game)",
    )


def scrape_posts(reddit: praw.Reddit, searches: list[SearchQuery]) -> list[ScrapedPost]:
    """Run all search queries and collect posts."""
    all_posts: list[ScrapedPost] = []
    seen_ids: set[str] = set()

    for i, search in enumerate(searches):
        print(f"  [{i+1}/{len(searches)}] r/{search.subreddit}: '{search.query}' ...", end=" ", flush=True)

        try:
            subreddit = reddit.subreddit(search.subreddit)
            results = subreddit.search(
                search.query,
                sort="relevance",
                time_filter="all",
                limit=search.limit,
            )

            count = 0
            for submission in results:
                if submission.id in seen_ids:
                    continue
                if submission.score < search.min_upvotes:
                    continue
                if not submission.selftext or len(submission.selftext) < 50:
                    continue  # Skip link-only posts

                seen_ids.add(submission.id)
                post = ScrapedPost(
                    reddit_id=submission.id,
                    subreddit=search.subreddit,
                    title=submission.title,
                    selftext=submission.selftext[:2000],  # Truncate very long posts
                    author=str(submission.author) if submission.author else "[deleted]",
                    score=submission.score,
                    num_comments=submission.num_comments,
                    created_utc=submission.created_utc,
                    permalink=submission.permalink,
                    url=submission.url,
                    round_id=search.round_id,
                    tickers=search.tickers,
                    sectors=search.sectors,
                    expected_direction=search.expected_direction,
                )
                all_posts.append(post)
                count += 1

            print(f"{count} posts")

        except Exception as e:
            print(f"ERROR: {e}")

    return all_posts


def filter_by_date_relevance(posts: list[ScrapedPost]) -> list[ScrapedPost]:
    """Filter posts to those published in relevant time windows for each round."""
    date_ranges = {
        "ai_boom_2023": (datetime(2022, 10, 1), datetime(2023, 7, 1)),
        "banking_crisis_2023": (datetime(2022, 10, 1), datetime(2023, 7, 1)),
        "inflation_2022": (datetime(2021, 10, 1), datetime(2022, 12, 31)),
    }

    filtered = []
    for post in posts:
        post_date = datetime.fromtimestamp(post.created_utc)
        if post.round_id in date_ranges:
            start, end = date_ranges[post.round_id]
            if start <= post_date <= end:
                filtered.append(post)

    return filtered


# ══════════════════════════════════════════════════════════════════════════════
# DATABASE STORAGE
# ══════════════════════════════════════════════════════════════════════════════

async def store_posts_in_db(posts: list[ScrapedPost]):
    """Store scraped posts as Document records in the database."""
    from app.database import async_session, engine, Base
    from app.models import Document, DocumentStockRelevance, StockReturn

    async with async_session() as db:
        # Get stock IDs for linking
        from sqlalchemy import select
        result = await db.execute(select(StockReturn))
        stocks = {f"{s.round_id}_{s.ticker}": s.id for s in result.scalars().all()}

        stored = 0
        for post in posts:
            post_date = datetime.fromtimestamp(post.created_utc)
            doc_id = f"reddit_{post.reddit_id}"

            # Check if already exists
            existing = await db.execute(
                select(Document).where(Document.id == doc_id)
            )
            if existing.scalar_one_or_none():
                continue

            doc = Document(
                id=doc_id,
                source_type="reddit",
                raw_text=post.selftext,
                title=post.title,
                publish_date=post_date.date(),
                source_label=f"r/{post.subreddit}",
                author=post.author,
                handle=post.author,
                avatar="🤖",
                engagement={
                    "upvotes": f"{post.score:,}",
                    "comments": f"{post.num_comments:,}",
                },
                tickers_referenced=post.tickers,
                sectors_referenced=post.sectors,
                signal_direction=post.expected_direction,
                signal_strength=3,  # Default; LLM annotation will refine
                signal_reasoning="",  # Filled by LLM annotation
                causal_chain="",      # Filled by LLM annotation
                keywords=[],          # Filled by LLM annotation
                difficulty="medium",  # Default
            )
            db.add(doc)

            # Create relevance links to stocks
            for ticker in post.tickers:
                stock_key = f"{post.round_id}_{ticker}"
                stock_id = stocks.get(stock_key)
                if stock_id:
                    rel = DocumentStockRelevance(
                        id=str(uuid.uuid4()),
                        doc_id=doc_id,
                        stock_id=stock_id,
                        relevance_type="direct",
                        signal_direction_for_ticker=post.expected_direction,
                        causal_chain_for_ticker="",  # Filled by LLM annotation
                    )
                    db.add(rel)

            stored += 1

        await db.commit()
        print(f"\n  Stored {stored} new posts in database.")


# ══════════════════════════════════════════════════════════════════════════════
# LLM ANNOTATION (optional - requires OpenAI API key)
# ══════════════════════════════════════════════════════════════════════════════

async def annotate_posts_with_llm():
    """Run LLM annotation on unannotated documents in the database."""
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key or api_key.startswith("sk-your"):
        print("\n  Skipping LLM annotation (no OPENAI_API_KEY in .env)")
        print("  Add OPENAI_API_KEY=sk-... to .env and run with --annotate")
        return

    try:
        from openai import AsyncOpenAI
    except ImportError:
        print("\n  Install openai: pip install openai")
        return

    client = AsyncOpenAI(api_key=api_key)

    from app.database import async_session
    from app.models import Document, DocumentStockRelevance
    from sqlalchemy import select, and_

    async with async_session() as db:
        # Find documents without signal_reasoning (unannotated)
        result = await db.execute(
            select(Document).where(
                and_(
                    Document.signal_reasoning == "",
                    Document.source_type == "reddit",
                )
            )
        )
        docs = list(result.scalars().all())

        if not docs:
            print("\n  No unannotated documents found.")
            return

        print(f"\n  Annotating {len(docs)} documents with LLM...")

        for i, doc in enumerate(docs):
            print(f"    [{i+1}/{len(docs)}] {doc.id}: {doc.title[:50]}...", end=" ", flush=True)

            prompt = f"""Analyze this Reddit post from r/{doc.source_label} published on {doc.publish_date}.

Title: {doc.title}
Content: {doc.raw_text[:1500]}

Referenced tickers: {doc.tickers_referenced}
Referenced sectors: {doc.sectors_referenced}

Extract:
1. signal_direction: "bullish", "bearish", or "mixed" - what directional signal does this imply?
2. signal_strength: 1-5 (1=very subtle, 5=screaming obvious)
3. signal_reasoning: How does this post's content logically connect to expected stock movement? (2-3 sentences)
4. causal_chain: The logical chain, e.g., "ChatGPT adoption -> GPU demand surge -> NVDA revenue growth -> bullish"
5. difficulty: "easy", "medium", or "hard" - how subtle is the signal for someone reading it?
6. keywords: List of 3-5 key financial keywords

Respond in JSON format:
{{"signal_direction": "...", "signal_strength": N, "signal_reasoning": "...", "causal_chain": "...", "difficulty": "...", "keywords": ["...", "..."]}}"""

            try:
                response = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a financial analyst annotating documents for an educational finance game. Respond only in JSON."},
                        {"role": "user", "content": prompt},
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.3,
                    max_tokens=500,
                )

                annotation = json.loads(response.choices[0].message.content)

                doc.signal_direction = annotation.get("signal_direction", doc.signal_direction)
                doc.signal_strength = annotation.get("signal_strength", 3)
                doc.signal_reasoning = annotation.get("signal_reasoning", "")
                doc.causal_chain = annotation.get("causal_chain", "")
                doc.difficulty = annotation.get("difficulty", "medium")
                doc.keywords = annotation.get("keywords", [])

                # Also update relevance links
                rel_result = await db.execute(
                    select(DocumentStockRelevance).where(
                        DocumentStockRelevance.doc_id == doc.id
                    )
                )
                for rel in rel_result.scalars().all():
                    rel.signal_direction_for_ticker = annotation.get("signal_direction", rel.signal_direction_for_ticker)
                    rel.causal_chain_for_ticker = annotation.get("causal_chain", "")

                print("OK")

            except Exception as e:
                print(f"ERROR: {e}")

        await db.commit()
        print(f"\n  Annotation complete!")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def main():
    dry_run = "--dry-run" in sys.argv
    annotate = "--annotate" in sys.argv

    print("=" * 60)
    print("FinSight Reddit Scraper")
    print("=" * 60)

    # Step 1: Scrape
    print("\n[1/4] Connecting to Reddit API...")
    reddit = create_reddit_client()
    print(f"  Connected as: {reddit.user.me() if hasattr(reddit.user, 'me') else 'read-only'}")

    print(f"\n[2/4] Searching {len(SEARCHES)} queries across Reddit...")
    posts = scrape_posts(reddit, SEARCHES)
    print(f"\n  Total posts scraped: {len(posts)}")

    # Step 2: Filter by date
    print("\n[3/4] Filtering by date relevance...")
    filtered = filter_by_date_relevance(posts)
    print(f"  Posts in relevant date windows: {len(filtered)}")
    print(f"  Filtered out: {len(posts) - len(filtered)} (wrong time period)")

    # Show summary
    by_round = {}
    for p in filtered:
        by_round.setdefault(p.round_id, []).append(p)
    for round_id, round_posts in by_round.items():
        print(f"    {round_id}: {len(round_posts)} posts")

    if dry_run:
        print("\n[DRY RUN] Preview of scraped posts:")
        for p in filtered[:10]:
            post_date = datetime.fromtimestamp(p.created_utc).strftime("%Y-%m-%d")
            print(f"  [{post_date}] r/{p.subreddit} ({p.score} pts): {p.title[:80]}")
        if len(filtered) > 10:
            print(f"  ... and {len(filtered) - 10} more")
        print("\nRun without --dry-run to store in database.")
        return

    # Step 3: Store in DB
    print("\n[4/4] Storing in database...")
    asyncio.run(store_posts_in_db(filtered))

    # Step 4: Optional LLM annotation
    if annotate:
        print("\n[BONUS] Running LLM annotation...")
        asyncio.run(annotate_posts_with_llm())

    print("\nDone!")
    print("\nNext steps:")
    print("  1. Run 'python scrape_reddit.py --annotate' to add LLM signal analysis")
    print("  2. Review scraped posts in the database")
    print("  3. Start the backend: uvicorn app.main:app --port 8000")


if __name__ == "__main__":
    main()
