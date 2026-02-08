import json
import asyncio
from datetime import date, datetime
from typing import List, Dict, Optional
import uuid

from newsapi import NewsApiClient
from anthropic import Anthropic
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import get_settings
from app.models import Document, StockReturn, DocumentStockRelevance, SourceType, SignalDirection, Difficulty, RelevanceType

settings = get_settings()


def fetch_news_for_keywords(
    keywords: List[str],
    from_date: date,
    to_date: date,
    language: str = "en",
    sort_by: str = "relevancy"
) -> List[Dict]:
    """
    Fetch news articles from newsapi.org based on keywords.

    Args:
        keywords: List of keyword phrases to search for
        from_date: Start date for articles
        to_date: End date for articles
        language: Language code (default: 'en')
        sort_by: Sort order ('relevancy', 'popularity', 'publishedAt')

    Returns:
        List of article dictionaries
    """
    if not settings.news_api_key:
        raise ValueError("NEWS_API_KEY not configured in settings")

    newsapi = NewsApiClient(api_key=settings.news_api_key)
    all_articles = []

    for keyword in keywords:
        print(f"Fetching articles for keyword: {keyword}")
        try:
            response = newsapi.get_everything(
                q=keyword,
                from_param=from_date.isoformat(),
                to=to_date.isoformat(),
                language=language,
                sort_by=sort_by,
                page_size=100  # Max per request
            )

            if response['status'] == 'ok':
                articles = response.get('articles', [])
                print(f"  Found {len(articles)} articles")
                all_articles.extend(articles)
            else:
                print(f"  Error: {response.get('message', 'Unknown error')}")

        except Exception as e:
            print(f"  Exception fetching news: {e}")
            continue

    # Deduplicate by URL
    seen_urls = set()
    unique_articles = []
    for article in all_articles:
        url = article.get('url', '')
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique_articles.append(article)

    print(f"\nTotal unique articles: {len(unique_articles)}")
    return unique_articles


def analyze_article_with_claude(
    article_text: str,
    title: str,
    publish_date: date
) -> Optional[Dict]:
    """
    Analyze a financial article using Claude API to extract signals.

    Args:
        article_text: Full article content
        title: Article headline
        publish_date: Publication date

    Returns:
        Dictionary with extracted financial signals, or None on error
    """
    if not settings.anthropic_api_key:
        raise ValueError("ANTHROPIC_API_KEY not configured in settings")

    client = Anthropic(api_key=settings.anthropic_api_key)

    prompt = f"""Analyze this financial article published on {publish_date.isoformat()}:

Title: {title}
Content: {article_text[:3000]}

Extract the following information in JSON format:
{{
  "tickers_referenced": ["TICKER1", "TICKER2"],
  "sectors_referenced": ["sector1", "sector2"],
  "signal_direction": "bullish|bearish|mixed",
  "signal_strength": 1-5,
  "signal_reasoning": "brief explanation",
  "causal_chain": "event -> impact -> outcome",
  "keywords": ["keyword1", "keyword2"],
  "difficulty": "easy|medium|hard"
}}

Guidelines:
- tickers_referenced: Stock tickers explicitly mentioned (uppercase, e.g. AAPL, MSFT)
- sectors_referenced: Broader sectors affected (e.g. "technology", "energy", "banking")
- signal_direction: Overall sentiment (bullish=positive, bearish=negative, mixed=unclear)
- signal_strength: 1=weak, 5=strong signal
- signal_reasoning: One sentence explaining the key insight
- causal_chain: Brief chain of causation (event -> immediate impact -> stock movement)
- keywords: 3-5 key terms for categorization
- difficulty: How hard to interpret (easy=obvious, hard=requires deep analysis)

Return ONLY the JSON object, no additional text."""

    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        response_text = message.content[0].text.strip()

        # Parse JSON response
        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1]) if len(lines) > 2 else response_text

        analysis = json.loads(response_text)
        return analysis

    except json.JSONDecodeError as e:
        print(f"Failed to parse Claude response as JSON: {e}")
        return None
    except Exception as e:
        print(f"Error analyzing article with Claude: {e}")
        return None


async def scrape_and_store_articles(
    db: AsyncSession,
    keywords: List[str],
    from_date: date,
    to_date: date,
    source_type: str = "article"
) -> int:
    """
    Main orchestrator: Fetch articles, analyze with Claude, and store in database.

    Args:
        db: Database session
        keywords: List of search keywords
        from_date: Start date
        to_date: End date
        source_type: Document source type (default: "article")

    Returns:
        Number of articles stored
    """
    # Fetch articles from newsapi
    raw_articles = fetch_news_for_keywords(keywords, from_date, to_date)

    if not raw_articles:
        print("No articles fetched")
        return 0

    stored_count = 0

    for idx, raw_article in enumerate(raw_articles, 1):
        print(f"\nProcessing article {idx}/{len(raw_articles)}: {raw_article.get('title', 'Untitled')[:60]}...")

        # Extract basic fields
        title = raw_article.get('title', '')
        content = raw_article.get('content') or raw_article.get('description', '')
        url = raw_article.get('url', '')
        image_url = raw_article.get('urlToImage', '')
        source_label = raw_article.get('source', {}).get('name', 'Unknown')

        # Parse publish date
        published_at = raw_article.get('publishedAt', '')
        try:
            pub_date = datetime.fromisoformat(published_at.replace('Z', '+00:00')).date()
        except:
            pub_date = from_date  # Fallback

        # Skip if content is too short
        if not content or len(content) < 100:
            print("  Skipping: content too short")
            continue

        # Analyze with Claude
        analysis = analyze_article_with_claude(content, title, pub_date)
        if not analysis:
            print("  Skipping: analysis failed")
            continue

        # Create document ID
        doc_id = f"doc_{uuid.uuid4().hex[:12]}"

        # Create Document record
        document = Document(
            id=doc_id,
            source_type=source_type,
            raw_text=content,
            title=title,
            publish_date=pub_date,
            source_label=source_label,
            url=url,
            image_url=image_url,
            tickers_referenced=analysis.get('tickers_referenced', []),
            sectors_referenced=analysis.get('sectors_referenced', []),
            signal_direction=analysis.get('signal_direction', 'mixed'),
            signal_strength=analysis.get('signal_strength', 3),
            signal_reasoning=analysis.get('signal_reasoning', ''),
            causal_chain=analysis.get('causal_chain', ''),
            keywords=analysis.get('keywords', []),
            difficulty=analysis.get('difficulty', 'medium')
        )

        db.add(document)
        stored_count += 1
        print(f"  ✓ Stored as {doc_id} | Direction: {analysis.get('signal_direction')} | Strength: {analysis.get('signal_strength')}")

        # Commit in batches
        if stored_count % 10 == 0:
            await db.commit()
            print(f"  [Committed batch: {stored_count} articles]")

        # Rate limiting (Claude API)
        await asyncio.sleep(1.5)

    # Final commit
    await db.commit()
    print(f"\n✓ Total articles stored: {stored_count}")
    return stored_count


async def build_relevance_mappings(
    db: AsyncSession,
    round_id: str
) -> int:
    """
    Second-pass analysis: Link documents to stocks with relevance metadata.

    Args:
        db: Database session
        round_id: Round ID to process

    Returns:
        Number of relevance links created
    """
    if not settings.anthropic_api_key:
        raise ValueError("ANTHROPIC_API_KEY not configured")

    client = Anthropic(api_key=settings.anthropic_api_key)

    # Load all documents
    result = await db.execute(select(Document))
    documents = result.scalars().all()

    # Load all stocks for this round
    result = await db.execute(
        select(StockReturn).where(StockReturn.round_id == round_id)
    )
    stocks = result.scalars().all()

    if not documents or not stocks:
        print("No documents or stocks found")
        return 0

    print(f"Building relevance mappings: {len(documents)} documents × {len(stocks)} stocks")

    link_count = 0

    for doc_idx, document in enumerate(documents, 1):
        print(f"\nDocument {doc_idx}/{len(documents)}: {document.title[:60]}...")

        for stock in stocks:
            # Check if article timeframe overlaps with stock period
            # Skip this check for now - assume all are relevant by date

            prompt = f"""Analyze the relevance of this financial article to {stock.ticker} ({stock.company_name}, {stock.sector} sector):

Article Title: {document.title}
Article Content: {document.raw_text[:1000]}
Published: {document.publish_date}

Tickers mentioned: {', '.join(document.tickers_referenced) if document.tickers_referenced else 'None'}
Sectors mentioned: {', '.join(document.sectors_referenced) if document.sectors_referenced else 'None'}

Determine:
1. Is this article relevant to {stock.ticker}?
2. If yes, what type of relevance? (direct, sector, macro)
3. What's the signal direction for {stock.ticker}? (bullish, bearish, mixed)
4. What's the causal chain for {stock.ticker}?

Return JSON:
{{
  "is_relevant": true|false,
  "relevance_type": "direct|sector|macro",
  "signal_direction_for_ticker": "bullish|bearish|mixed",
  "causal_chain_for_ticker": "brief explanation"
}}

Guidelines:
- direct: Article specifically mentions this stock or company
- sector: Article discusses the sector/industry this stock belongs to
- macro: Article discusses broader economic trends affecting this stock
- Only return is_relevant=true if there's a meaningful connection"""

            try:
                message = client.messages.create(
                    model="claude-3-haiku-20240307",  # Cheaper model for this task
                    max_tokens=512,
                    messages=[{"role": "user", "content": prompt}]
                )

                response_text = message.content[0].text.strip()
                if response_text.startswith("```"):
                    lines = response_text.split("\n")
                    response_text = "\n".join(lines[1:-1]) if len(lines) > 2 else response_text

                relevance = json.loads(response_text)

                if relevance.get('is_relevant', False):
                    # Create relevance link
                    link = DocumentStockRelevance(
                        id=str(uuid.uuid4()),
                        doc_id=document.id,
                        stock_id=stock.id,
                        relevance_type=relevance.get('relevance_type', 'macro'),
                        signal_direction_for_ticker=relevance.get('signal_direction_for_ticker', 'mixed'),
                        causal_chain_for_ticker=relevance.get('causal_chain_for_ticker', '')
                    )
                    db.add(link)
                    link_count += 1
                    print(f"  ✓ {stock.ticker}: {relevance['relevance_type']} / {relevance['signal_direction_for_ticker']}")

                # Rate limiting
                await asyncio.sleep(0.5)

            except Exception as e:
                print(f"  Error analyzing {stock.ticker}: {e}")
                continue

        # Commit after each document
        await db.commit()

    print(f"\n✓ Total relevance links created: {link_count}")
    return link_count
