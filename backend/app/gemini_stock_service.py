"""
Gemini Stock Service - Dynamic stock generation using Gemini 2.5 Flash.

This service:
1. Selects stocks dynamically from a pool
2. Fetches real returns via yfinance
3. Ensures ~50% gains and ~50% losses
4. Uses Gemini to generate sector/description metadata
"""

import json
import random
import httpx
from datetime import date, timedelta
from typing import Optional
import yfinance as yf

from app.config import get_settings

settings = get_settings()

# Pool of tickers to randomly select from
STOCK_POOL = [
    # Technology
    "AAPL", "MSFT", "GOOGL", "META", "AMZN", "NFLX", "CRM", "ADBE", "ORCL", "IBM",
    "CSCO", "INTC", "QCOM", "TXN", "AVGO", "NOW", "SNOW", "PLTR", "UBER", "ABNB",
    # Semiconductors
    "NVDA", "AMD", "TSM", "ASML", "MRVL", "MU", "LRCX", "AMAT", "KLAC", "ON",
    # Finance/Banking
    "JPM", "BAC", "WFC", "GS", "MS", "C", "SCHW", "BLK", "AXP", "V", "MA", "PYPL",
    # Energy
    "XOM", "CVX", "COP", "SLB", "EOG", "PXD", "DVN", "OXY", "HAL", "MPC",
    # Healthcare/Biotech
    "JNJ", "UNH", "PFE", "MRK", "ABBV", "LLY", "TMO", "BMY", "AMGN", "GILD",
    "MRNA", "REGN", "VRTX", "BIIB", "ILMN",
    # Consumer
    "WMT", "COST", "TGT", "HD", "LOW", "NKE", "SBUX", "MCD", "DIS", "CMCSA",
    "KO", "PEP", "PG", "CL", "KMB",
    # Industrials/Defense
    "BA", "LMT", "RTX", "GE", "CAT", "DE", "UNP", "UPS", "FDX", "HON",
    # Real Estate
    "VNO", "SPG", "O", "AMT", "PLD", "EQIX", "DLR", "AVB", "EQR", "PSA",
    # Communications
    "T", "VZ", "TMUS", "CMCSA", "CHTR",
    # Crypto/Fintech
    "COIN", "SQ", "HOOD", "MSTR",
    # ETFs for variety
    "SPY", "QQQ", "GLD", "KRE", "XLE", "XLF", "XLV",
]

# Valid sectors for Gemini to categorize into
VALID_SECTORS = [
    "Technology",
    "Semiconductors", 
    "Energy",
    "Healthcare",
    "Biotechnology",
    "Finance",
    "Banking",
    "Consumer Retail",
    "Consumer Staples",
    "Industrials",
    "Defense",
    "Real Estate",
    "Communications",
    "Cryptocurrency",
    "Index Fund",
    "ETF",
]

# Emoji mapping for sectors
SECTOR_EMOJIS = {
    "Technology": "💻",
    "Semiconductors": "🔌",
    "Energy": "⛽",
    "Healthcare": "🏥",
    "Biotechnology": "🧬",
    "Finance": "💰",
    "Banking": "🏦",
    "Consumer Retail": "🛒",
    "Consumer Staples": "🛍️",
    "Industrials": "🏭",
    "Defense": "🛡️",
    "Real Estate": "🏠",
    "Communications": "📡",
    "Cryptocurrency": "₿",
    "Index Fund": "📊",
    "ETF": "📈",
}


def fetch_stock_return(ticker: str, start_date: date, end_date: date) -> Optional[float]:
    """Fetch actual stock return percentage using yfinance."""
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(start=start_date, end=end_date)
        
        if hist.empty or len(hist) < 2:
            return None
        
        start_price = hist.iloc[0]['Close']
        end_price = hist.iloc[-1]['Close']
        return_pct = ((end_price - start_price) / start_price) * 100
        
        return round(return_pct, 2)
    except Exception as e:
        print(f"Error fetching {ticker}: {e}")
        return None


def get_basic_company_info(ticker: str) -> dict:
    """Get basic company info from yfinance."""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        return {
            "company_name": info.get("longName") or info.get("shortName") or ticker,
            "sector": info.get("sector", ""),
            "industry": info.get("industry", ""),
            "description": info.get("longBusinessSummary", "")[:200] if info.get("longBusinessSummary") else "",
        }
    except Exception:
        return {"company_name": ticker, "sector": "", "industry": "", "description": ""}


async def get_stock_metadata_from_gemini(ticker: str, company_name: str) -> dict:
    """
    Use Gemini 2.5 Flash to generate sector and description for a stock.
    """
    if not settings.gemini_api_key:
        # Fallback to default
        return {
            "sector": "Technology",
            "description": f"{company_name} is a publicly traded company.",
        }
    
    prompt = f"""You are a financial analyst. For the stock ticker {ticker} ({company_name}), provide:

1. sector: Categorize into EXACTLY ONE of these sectors: {', '.join(VALID_SECTORS)}
2. description: A concise 1-2 sentence investment-focused description explaining what the company does and why investors care about it. Include key business drivers and market position.

Respond with ONLY valid JSON in this exact format:
{{"sector": "one of the valid sectors", "description": "investment-focused description"}}"""

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.gemini_api_key}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url,
                json={
                    "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "maxOutputTokens": 256,
                        "temperature": 0.3,
                    },
                },
            )
            response.raise_for_status()
            data = response.json()
            
            # Extract text from response
            parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
            raw_text = ""
            for part in parts:
                if part.get("text"):
                    raw_text += part["text"]
            
            # Parse JSON from response
            raw_text = raw_text.strip()
            if raw_text.startswith("```"):
                raw_text = raw_text.replace("```json", "").replace("```", "").strip()
            
            result = json.loads(raw_text)
            
            # Validate sector
            if result.get("sector") not in VALID_SECTORS:
                result["sector"] = "Technology"  # Default fallback
            
            return result
            
    except Exception as e:
        print(f"Gemini API error for {ticker}: {e}")
        return {
            "sector": "Technology",
            "description": f"{company_name} is a publicly traded company.",
        }


async def generate_stocks_for_round(
    round_id: str,
    period_start: date,
    period_end: date,
    num_stocks: int = 6,
    target_gain_ratio: float = 0.5,
) -> list[dict]:
    """
    Dynamically generate stocks for a round with balanced gains/losses.
    
    Args:
        round_id: Unique identifier for the round
        period_start: Start date for return calculation
        period_end: End date for return calculation
        num_stocks: Number of stocks to include (default 6)
        target_gain_ratio: Target ratio of stocks with positive returns (default 0.5)
    
    Returns:
        List of stock dictionaries with ticker, company_name, sector, emoji, return_pct, description
    """
    # Shuffle pool and fetch returns
    shuffled_pool = random.sample(STOCK_POOL, min(len(STOCK_POOL), 50))
    
    gainers = []
    losers = []
    
    for ticker in shuffled_pool:
        return_pct = fetch_stock_return(ticker, period_start, period_end)
        if return_pct is None:
            continue
        
        basic_info = get_basic_company_info(ticker)
        
        stock_data = {
            "ticker": ticker,
            "company_name": basic_info["company_name"],
            "return_pct": return_pct,
            "_basic_sector": basic_info["sector"],
        }
        
        if return_pct > 0:
            gainers.append(stock_data)
        else:
            losers.append(stock_data)
        
        # Stop when we have enough candidates
        if len(gainers) >= num_stocks and len(losers) >= num_stocks:
            break
    
    # Calculate how many gainers/losers we need
    num_gainers = round(num_stocks * target_gain_ratio)
    num_losers = num_stocks - num_gainers
    
    # Sort by return to get most interesting stocks
    gainers.sort(key=lambda x: x["return_pct"], reverse=True)
    losers.sort(key=lambda x: x["return_pct"])  # Most negative first
    
    # Select stocks
    selected = gainers[:num_gainers] + losers[:num_losers]
    
    # If we don't have enough, pad with whatever we have
    if len(selected) < num_stocks:
        remaining = [s for s in gainers + losers if s not in selected]
        selected.extend(remaining[:num_stocks - len(selected)])
    
    # Shuffle to randomize order
    random.shuffle(selected)
    
    # Enrich with Gemini metadata
    enriched_stocks = []
    for stock in selected:
        metadata = await get_stock_metadata_from_gemini(
            stock["ticker"], 
            stock["company_name"]
        )
        
        enriched_stocks.append({
            "id": f"{round_id}_{stock['ticker'].lower()}",
            "ticker": stock["ticker"],
            "company_name": stock["company_name"],
            "sector": metadata["sector"],
            "emoji": SECTOR_EMOJIS.get(metadata["sector"], "📊"),
            "return_pct": stock["return_pct"],
            "description": metadata["description"],
            "round_id": round_id,
        })
    
    return enriched_stocks


async def get_stock_info(ticker: str) -> dict:
    """
    Get stock info for a single ticker, using Gemini for metadata.
    """
    basic_info = get_basic_company_info(ticker)
    metadata = await get_stock_metadata_from_gemini(ticker, basic_info["company_name"])
    
    return {
        "ticker": ticker,
        "company_name": basic_info["company_name"],
        "sector": metadata["sector"],
        "description": metadata["description"],
        "emoji": SECTOR_EMOJIS.get(metadata["sector"], "📊"),
    }
