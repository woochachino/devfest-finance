"""
API Routes for the FinSight game.
"""

import uuid
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.models import (
    RoundConfig, StockReturn, Document, DocumentStockRelevance, GameSession,
)
from app.schemas import (
    RoundListItem, GameStartRequest, GameStartResponse,
    GameSubmitRequest, GameSubmitResponse,
    StockOut, DocumentOut, StockResult, CausalChainMapping,
    RetrospectiveOut, GameResultsResponse,
)
from app.engine import select_documents_for_round
from app.scoring import (
    calculate_player_return, calculate_optimal_return,
    calculate_score, compute_stock_results,
)
from app.llm_service import generate_retrospective

router = APIRouter(prefix="/api")


# ── GET /api/rounds ────────────────────────────────────────────────────────────

@router.get("/rounds", response_model=list[RoundListItem])
async def list_rounds(db: AsyncSession = Depends(get_db)):
    """List all available rounds."""
    result = await db.execute(
        select(RoundConfig).order_by(RoundConfig.display_order)
    )
    rounds = result.scalars().all()
    return [RoundListItem.model_validate(r) for r in rounds]


# ── POST /api/game/start ──────────────────────────────────────────────────────

@router.post("/game/start", response_model=GameStartResponse)
async def start_game(req: GameStartRequest, db: AsyncSession = Depends(get_db)):
    """Start a new game session. Returns round config + selected documents + stocks (no returns)."""

    # Load round config
    result = await db.execute(
        select(RoundConfig).where(RoundConfig.id == req.round_id)
    )
    round_config = result.scalar_one_or_none()
    if not round_config:
        raise HTTPException(status_code=404, detail=f"Round '{req.round_id}' not found")

    # Load stocks for this round
    result = await db.execute(
        select(StockReturn).where(StockReturn.round_id == req.round_id)
    )
    stocks = list(result.scalars().all())
    if not stocks:
        raise HTTPException(status_code=500, detail="No stocks configured for this round")

    # Run document selection engine
    selected_docs = await select_documents_for_round(
        db, round_config, stocks, difficulty=req.difficulty
    )

    # Create game session
    session_id = str(uuid.uuid4())
    session = GameSession(
        id=session_id,
        round_id=req.round_id,
        documents_served=[doc.id for doc in selected_docs],
        created_at=datetime.utcnow(),
    )
    db.add(session)
    await db.commit()

    return GameStartResponse(
        session_id=session_id,
        round_id=round_config.id,
        title=round_config.title,
        description=round_config.description,
        period_start=round_config.period_start,
        period_end=round_config.period_end,
        stocks=[StockOut.model_validate(s) for s in stocks],
        documents=[DocumentOut.model_validate(d) for d in selected_docs],
    )


# ── POST /api/game/submit ────────────────────────────────────────────────────

@router.post("/game/submit", response_model=GameSubmitResponse)
async def submit_portfolio(req: GameSubmitRequest, db: AsyncSession = Depends(get_db)):
    """Submit player allocations. Returns actual returns, score, retrospective."""

    # Load session
    result = await db.execute(
        select(GameSession).where(GameSession.id == req.session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found")

    # Load round + stocks
    result = await db.execute(
        select(RoundConfig).where(RoundConfig.id == session.round_id)
    )
    round_config = result.scalar_one_or_none()

    result = await db.execute(
        select(StockReturn).where(StockReturn.round_id == session.round_id)
    )
    stocks = list(result.scalars().all())

    # Build return map
    return_map = {s.ticker: s.return_pct for s in stocks}
    stock_dicts = [
        {
            "ticker": s.ticker,
            "company_name": s.company_name,
            "sector": s.sector,
            "emoji": s.emoji,
            "return_pct": s.return_pct,
        }
        for s in stocks
    ]

    # Calculate returns
    player_return = calculate_player_return(req.allocations, return_map)
    optimal_return = calculate_optimal_return(return_map, max_per_stock=50.0)
    score = calculate_score(player_return, optimal_return)
    stock_results = compute_stock_results(req.allocations, stock_dicts)

    # Build causal chain mappings for documents served
    causal_chains = []
    if session.documents_served:
        for doc_id in session.documents_served:
            result = await db.execute(
                select(DocumentStockRelevance)
                .where(DocumentStockRelevance.doc_id == doc_id)
            )
            rels = result.scalars().all()

            # Get doc details
            doc_result = await db.execute(
                select(Document).where(Document.id == doc_id)
            )
            doc = doc_result.scalar_one_or_none()

            for rel in rels:
                # Find the stock
                stock_match = next(
                    (s for s in stocks if s.id == rel.stock_id), None
                )
                if stock_match and doc:
                    causal_chains.append(CausalChainMapping(
                        doc_id=doc_id,
                        doc_title=doc.title or doc.source_label,
                        source_type=doc.source_type,
                        source_label=doc.source_label,
                        ticker=stock_match.ticker,
                        relevance_type=rel.relevance_type,
                        signal_direction=rel.signal_direction_for_ticker,
                        causal_chain=rel.causal_chain_for_ticker or "",
                    ))

    # Generate retrospective (LLM or mock)
    retro_data = await generate_retrospective(
        stocks=stock_dicts,
        allocations=req.allocations,
        player_return=player_return,
        optimal_return=optimal_return,
        documents_served=[{"id": d} for d in (session.documents_served or [])],
        causal_chains=[c.model_dump() for c in causal_chains],
        round_title=round_config.title,
        round_description=round_config.description,
    )

    retrospective = RetrospectiveOut(
        summary=retro_data.get("summary", ""),
        key_signals=retro_data.get("key_signals", []),
        what_player_got_right=retro_data.get("what_player_got_right", []),
        what_player_missed=retro_data.get("what_player_missed", []),
        lessons=retro_data.get("lessons", []),
        overall_grade=retro_data.get("overall_grade", "C"),
        encouragement=retro_data.get("encouragement", ""),
    )

    # Save to session
    session.player_allocations = req.allocations
    session.player_return_pct = player_return
    session.optimal_return_pct = optimal_return
    session.score = score
    session.retrospective = retro_data
    session.completed_at = datetime.utcnow()
    await db.commit()

    return GameSubmitResponse(
        session_id=session.id,
        stock_results=[StockResult(**sr) for sr in stock_results],
        player_return_pct=player_return,
        optimal_return_pct=optimal_return,
        score=score,
        causal_chains=causal_chains,
        retrospective=retrospective,
    )


# ── GET /api/game/{session_id}/results ────────────────────────────────────────

@router.get("/game/{session_id}/results", response_model=GameResultsResponse)
async def get_results(session_id: str, db: AsyncSession = Depends(get_db)):
    """Get results for a completed game session."""
    result = await db.execute(
        select(GameSession).where(GameSession.id == session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found")
    if not session.completed_at:
        raise HTTPException(status_code=400, detail="Game session not yet completed")

    # Reconstruct the response from saved data
    result = await db.execute(
        select(RoundConfig).where(RoundConfig.id == session.round_id)
    )
    round_config = result.scalar_one_or_none()

    result = await db.execute(
        select(StockReturn).where(StockReturn.round_id == session.round_id)
    )
    stocks = list(result.scalars().all())

    stock_dicts = [
        {
            "ticker": s.ticker,
            "company_name": s.company_name,
            "sector": s.sector,
            "emoji": s.emoji,
            "return_pct": s.return_pct,
        }
        for s in stocks
    ]

    stock_results = compute_stock_results(
        session.player_allocations or {}, stock_dicts
    )

    retro = session.retrospective or {}
    retrospective = RetrospectiveOut(
        summary=retro.get("summary", ""),
        key_signals=retro.get("key_signals", []),
        what_player_got_right=retro.get("what_player_got_right", []),
        what_player_missed=retro.get("what_player_missed", []),
        lessons=retro.get("lessons", []),
        overall_grade=retro.get("overall_grade", "C"),
        encouragement=retro.get("encouragement", ""),
    )

    return GameResultsResponse(
        session_id=session.id,
        round_id=session.round_id,
        round_title=round_config.title if round_config else "",
        stock_results=[StockResult(**sr) for sr in stock_results],
        player_return_pct=session.player_return_pct or 0,
        optimal_return_pct=session.optimal_return_pct or 0,
        score=session.score or 0,
        causal_chains=[],  # Would need to reconstruct from DB
        retrospective=retrospective,
    )


# ── GET /api/articles/count ────────────────────────────────────────────────

@router.get("/articles/count")
async def get_article_count(db: AsyncSession = Depends(get_db)):
    """Get total count of articles in database (for testing)."""
    from sqlalchemy import func

    result = await db.execute(select(func.count(Document.id)))
    count = result.scalar()
    return {"count": count, "source": "PostgreSQL"}


# ── POST /api/game/{session_id}/graph-data ─────────────────────────────────

@router.post("/game/{session_id}/graph-data")
async def get_graph_data(session_id: str, db: AsyncSession = Depends(get_db)):
    """Get historical time series data for portfolio performance graph."""
    from app.historical_data import get_portfolio_time_series, get_optimal_portfolio_time_series

    # Load game session
    result = await db.execute(
        select(GameSession).where(GameSession.id == session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Load round config
    result = await db.execute(
        select(RoundConfig).where(RoundConfig.id == session.round_id)
    )
    round_config = result.scalar_one_or_none()
    if not round_config:
        raise HTTPException(status_code=404, detail="Round not found")

    # Load stocks
    result = await db.execute(
        select(StockReturn).where(StockReturn.round_id == session.round_id)
    )
    stocks = list(result.scalars().all())

    # Get player allocations
    allocations = session.player_allocations or {}

    # Build returns dict for optimal calculation
    returns_dict = {stock.ticker: stock.return_pct for stock in stocks}

    # Get time series data
    player_series = get_portfolio_time_series(
        allocations,
        round_config.period_start,
        round_config.period_end,
        initial_balance=1000000.0
    )

    optimal_series = get_optimal_portfolio_time_series(
        [stock.ticker for stock in stocks],
        returns_dict,
        round_config.period_start,
        round_config.period_end,
        initial_balance=1000000.0,
        max_allocation_pct=50.0
    )

    return {
        "player_series": player_series,
        "optimal_series": optimal_series,
        "period_start": round_config.period_start.isoformat(),
        "period_end": round_config.period_end.isoformat(),
    }
