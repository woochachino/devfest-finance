import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Text, Float, Integer, Date, DateTime,
    ForeignKey, JSON, Index
)
from sqlalchemy.orm import relationship
from app.database import Base
import enum


# ── Enums ──────────────────────────────────────────────────────────────────────

class SourceType(str, enum.Enum):
    article = "article"
    report = "report"
    statistic = "statistic"
    earnings_call = "earnings_call"


class SignalDirection(str, enum.Enum):
    bullish = "bullish"
    bearish = "bearish"
    mixed = "mixed"


class Difficulty(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class RelevanceType(str, enum.Enum):
    direct = "direct"
    sector = "sector"
    macro = "macro"


# ── Round Configs ──────────────────────────────────────────────────────────────

class RoundConfig(Base):
    __tablename__ = "round_configs"

    id = Column(String, primary_key=True)                       # e.g. "ai_boom_2023"
    title = Column(String, nullable=False)                      # "The AI Boom"
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String, default=Difficulty.medium)
    display_order = Column(Integer, default=0)                  # for ordering rounds
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    stocks = relationship("StockReturn", back_populates="round_config", lazy="selectin")


# ── Stock Returns ──────────────────────────────────────────────────────────────

class StockReturn(Base):
    __tablename__ = "stock_returns"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ticker = Column(String(10), nullable=False)
    company_name = Column(String, nullable=False)
    sector = Column(String, nullable=False)
    emoji = Column(String(10), default="📊")
    round_id = Column(String, ForeignKey("round_configs.id"), nullable=False)
    return_pct = Column(Float, nullable=False)
    story = Column(Text, default="")                            # brief narrative for this stock this period

    # Relationships
    round_config = relationship("RoundConfig", back_populates="stocks")
    relevance_links = relationship("DocumentStockRelevance", back_populates="stock_return", lazy="selectin")

    __table_args__ = (
        Index("ix_stock_returns_round_ticker", "round_id", "ticker", unique=True),
    )


# ── Documents ──────────────────────────────────────────────────────────────────

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True)                       # e.g. "doc_001"
    source_type = Column(String, nullable=False)
    raw_text = Column(Text, nullable=False)                     # the actual content shown to player
    title = Column(String, default="")                          # headline / post title (if applicable)
    publish_date = Column(Date, nullable=False)
    source_label = Column(String, nullable=False)               # e.g. "Reuters", "Bloomberg"
    url = Column(String, default="")                            # article source URL
    image_url = Column(String, default="")                      # article thumbnail/image

    # ── LLM-annotated fields (populated at ingestion time) ──
    tickers_referenced = Column(JSON, default=list)             # ["NVDA", "AAPL"]
    sectors_referenced = Column(JSON, default=list)             # ["semiconductors", "big_tech"]
    signal_direction = Column(String, default=SignalDirection.mixed)
    signal_strength = Column(Integer, default=3)                # 1-5
    signal_reasoning = Column(Text, default="")
    causal_chain = Column(Text, default="")
    keywords = Column(JSON, default=list)
    difficulty = Column(String, default=Difficulty.medium)

    # Relationships
    relevance_links = relationship("DocumentStockRelevance", back_populates="document", lazy="selectin")

    __table_args__ = (
        Index("ix_documents_source_type", "source_type"),
        Index("ix_documents_publish_date", "publish_date"),
        Index("ix_documents_difficulty", "difficulty"),
    )


# ── Document ↔ Stock Relevance (many-to-many with metadata) ───────────────────

class DocumentStockRelevance(Base):
    __tablename__ = "document_stock_relevance"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    doc_id = Column(String, ForeignKey("documents.id"), nullable=False)
    stock_id = Column(String, ForeignKey("stock_returns.id"), nullable=False)
    relevance_type = Column(String, default=RelevanceType.direct)
    signal_direction_for_ticker = Column(String, nullable=False)
    causal_chain_for_ticker = Column(Text, default="")

    # Relationships
    document = relationship("Document", back_populates="relevance_links")
    stock_return = relationship("StockReturn", back_populates="relevance_links")

    __table_args__ = (
        Index("ix_doc_stock_rel", "doc_id", "stock_id", unique=True),
    )


# ── Game Sessions ──────────────────────────────────────────────────────────────

class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    round_id = Column(String, ForeignKey("round_configs.id"), nullable=False)
    player_allocations = Column(JSON, default=dict)             # {"NVDA": 0.30, "MSFT": 0.25}
    player_return_pct = Column(Float, nullable=True)
    optimal_return_pct = Column(Float, nullable=True)
    score = Column(Integer, nullable=True)
    documents_served = Column(JSON, default=list)               # list of doc IDs
    retrospective = Column(JSON, nullable=True)                 # LLM-generated retrospective
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
