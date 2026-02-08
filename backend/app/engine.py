"""
Document Selection Engine — the backward-linkage algorithm.

Selects documents for a round by working backward from known stock returns:
1. For each stock, find documents where tickers/sectors match
2. Filter to docs published BEFORE the period (within ~90 days)
3. Filter to docs where signal_direction ALIGNS with actual return direction
4. Score by signal_strength × difficulty_weight
5. Select top 2 per stock + 1-2 macro docs + 0-1 red herrings
6. Shuffle — never reveal which stock a doc maps to
"""

import random
from datetime import timedelta
from sqlalchemy import select, and_, or_, case
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import (
    Document, StockReturn, DocumentStockRelevance, RoundConfig,
    SignalDirection, RelevanceType, Difficulty,
)


DIFFICULTY_WEIGHTS = {
    "easy": {"easy": 3, "medium": 2, "hard": 1},
    "medium": {"easy": 1, "medium": 3, "hard": 2},
    "hard": {"easy": 1, "medium": 1, "hard": 3},
}


async def select_documents_for_round(
    db: AsyncSession,
    round_config: RoundConfig,
    stocks: list[StockReturn],
    difficulty: str = "medium",
    docs_per_stock: int = 2,
    macro_docs: int = 2,
    red_herrings: int = 1,
) -> list[Document]:
    """
    Select 8-12 documents for a game round using the backward-linkage algorithm.
    """
    weights = DIFFICULTY_WEIGHTS.get(difficulty, DIFFICULTY_WEIGHTS["medium"])
    selected_doc_ids: set[str] = set()
    selected_docs: list[Document] = []

    # Lookback window: docs published up to 90 days before the period start
    lookback_start = round_config.period_start - timedelta(days=90)
    lookback_end = round_config.period_start

    # ── Step 1: Select docs per stock (direct + sector relevance) ──────────
    for stock in stocks:
        # Determine the expected signal direction based on actual return
        if stock.return_pct > 5:
            expected_direction = "bullish"
        elif stock.return_pct < -5:
            expected_direction = "bearish"
        else:
            expected_direction = None  # flat — accept any direction

        # Query docs linked to this stock via the relevance table
        query = (
            select(Document)
            .join(DocumentStockRelevance, DocumentStockRelevance.doc_id == Document.id)
            .where(
                and_(
                    DocumentStockRelevance.stock_id == stock.id,
                    Document.publish_date >= lookback_start,
                    Document.publish_date <= lookback_end,
                    Document.id.notin_(selected_doc_ids) if selected_doc_ids else True,
                )
            )
        )

        # Filter by signal direction alignment
        if expected_direction is not None:
            query = query.where(
                DocumentStockRelevance.signal_direction_for_ticker == expected_direction
            )

        result = await db.execute(query)
        # Deduplicate (JOIN can produce duplicate rows)
        seen_ids = set()
        candidates = []
        for doc in result.scalars().all():
            if doc.id not in seen_ids:
                seen_ids.add(doc.id)
                candidates.append(doc)

        # Score candidates: signal_strength × difficulty_weight
        def score_doc(doc: Document) -> float:
            diff_key = doc.difficulty if doc.difficulty else "medium"
            return (doc.signal_strength or 3) * weights.get(diff_key, 2)

        candidates.sort(key=score_doc, reverse=True)

        # Pick top N, but prefer source_type variety
        picked = _pick_with_variety(candidates, docs_per_stock, selected_doc_ids)
        selected_docs.extend(picked)
        selected_doc_ids.update(d.id for d in picked)

    # ── Step 2: Add macro-level documents ──────────────────────────────────
    macro_query = (
        select(Document)
        .join(DocumentStockRelevance, DocumentStockRelevance.doc_id == Document.id)
        .where(
            and_(
                DocumentStockRelevance.relevance_type == "macro",
                Document.publish_date >= lookback_start,
                Document.publish_date <= lookback_end,
                Document.id.notin_(selected_doc_ids) if selected_doc_ids else True,
            )
        )
    )
    result = await db.execute(macro_query)
    # Deduplicate in Python (DISTINCT fails on JSON columns in Postgres)
    seen = set()
    macro_candidates = []
    for doc in result.scalars().all():
        if doc.id not in seen:
            seen.add(doc.id)
            macro_candidates.append(doc)
    random.shuffle(macro_candidates)

    for doc in macro_candidates[:macro_docs]:
        if doc.id not in selected_doc_ids:
            selected_docs.append(doc)
            selected_doc_ids.add(doc.id)

    # ── Step 3: Add red herrings (mixed signal docs) ───────────────────────
    herring_query = (
        select(Document)
        .where(
            and_(
                Document.signal_direction == "mixed",
                Document.publish_date >= lookback_start,
                Document.publish_date <= lookback_end,
                Document.id.notin_(selected_doc_ids) if selected_doc_ids else True,
            )
        )
    )
    result = await db.execute(herring_query)
    herring_candidates = list(result.scalars().all())
    random.shuffle(herring_candidates)

    for doc in herring_candidates[:red_herrings]:
        if doc.id not in selected_doc_ids:
            selected_docs.append(doc)
            selected_doc_ids.add(doc.id)

    # ── Step 4: If we don't have enough docs, pull any remaining linked docs
    if len(selected_docs) < 8:
        fallback_query = (
            select(Document)
            .join(DocumentStockRelevance, DocumentStockRelevance.doc_id == Document.id)
            .join(StockReturn, StockReturn.id == DocumentStockRelevance.stock_id)
            .where(
                and_(
                    StockReturn.round_id == round_config.id,
                    Document.id.notin_(selected_doc_ids) if selected_doc_ids else True,
                )
            )
            .limit(12 - len(selected_docs))
        )
        result = await db.execute(fallback_query)
        seen_fallback = set()
        for doc in result.scalars().all():
            if doc.id not in selected_doc_ids:
                selected_docs.append(doc)
                selected_doc_ids.add(doc.id)

    # ── Step 5: Shuffle to hide stock mapping ──────────────────────────────
    random.shuffle(selected_docs)

    return selected_docs


def _pick_with_variety(
    candidates: list[Document],
    n: int,
    already_selected: set[str],
) -> list[Document]:
    """Pick n docs from candidates, preferring source_type variety."""
    if not candidates:
        return []

    picked: list[Document] = []
    seen_types: set[str] = set()

    # First pass: pick one of each source type
    for doc in candidates:
        if len(picked) >= n:
            break
        if doc.id in already_selected:
            continue
        st = doc.source_type if doc.source_type else "article"
        if st not in seen_types:
            picked.append(doc)
            seen_types.add(st)

    # Second pass: fill remaining slots
    for doc in candidates:
        if len(picked) >= n:
            break
        if doc.id in already_selected or doc in picked:
            continue
        picked.append(doc)

    return picked
