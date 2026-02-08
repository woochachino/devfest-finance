from pydantic import BaseModel, Field
from datetime import date
from typing import Optional


# ── Shared ─────────────────────────────────────────────────────────────────────

class StockOut(BaseModel):
    ticker: str
    company_name: str
    sector: str
    emoji: str

    class Config:
        from_attributes = True


class StockWithReturn(StockOut):
    return_pct: float
    story: str = ""


class DocumentOut(BaseModel):
    id: str
    source_type: str
    raw_text: str
    title: str = ""
    publish_date: date
    source_label: str
    author: str = ""
    handle: str = ""
    avatar: str = ""
    engagement: dict = {}

    class Config:
        from_attributes = True


# ── Rounds ─────────────────────────────────────────────────────────────────────

class RoundListItem(BaseModel):
    id: str
    title: str
    period_start: date
    period_end: date
    description: str
    difficulty: str
    display_order: int

    class Config:
        from_attributes = True


# ── Game Start ─────────────────────────────────────────────────────────────────

class GameStartRequest(BaseModel):
    round_id: str
    difficulty: str = "medium"


class GameStartResponse(BaseModel):
    session_id: str
    round_id: str
    title: str
    description: str
    period_start: date
    period_end: date
    stocks: list[StockOut]       # returns NOT included — player shouldn't see them yet
    documents: list[DocumentOut]


# ── Game Submit ────────────────────────────────────────────────────────────────

class GameSubmitRequest(BaseModel):
    session_id: str
    allocations: dict[str, float]   # {"NVDA": 30.0, "MSFT": 25.0, ...} percentages summing to 100


class CausalChainMapping(BaseModel):
    doc_id: str
    doc_title: str
    source_type: str
    source_label: str
    ticker: str
    relevance_type: str
    signal_direction: str
    causal_chain: str


class StockResult(BaseModel):
    ticker: str
    company_name: str
    sector: str
    emoji: str
    return_pct: float
    player_allocation_pct: float
    player_dollar_invested: float
    player_dollar_final: float
    player_gain: float


class RetrospectiveOut(BaseModel):
    summary: str = ""
    key_signals: list[str] = []
    what_player_got_right: list[str] = []
    what_player_missed: list[str] = []
    lessons: list[dict] = []
    overall_grade: str = "C"
    encouragement: str = ""


class GameSubmitResponse(BaseModel):
    session_id: str
    stock_results: list[StockResult]
    player_return_pct: float
    optimal_return_pct: float
    score: int
    causal_chains: list[CausalChainMapping]
    retrospective: RetrospectiveOut


# ── Game Results (GET) ─────────────────────────────────────────────────────────

class GameResultsResponse(GameSubmitResponse):
    round_id: str
    round_title: str
