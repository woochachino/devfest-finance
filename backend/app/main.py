"""
FinSight — Financial Signal Detection Game
Backend API Server
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine, Base
from app.routes import router
from app.multiplayer_routes import router as multiplayer_router


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created/verified")
    yield
    # Cleanup
    await engine.dispose()


app = FastAPI(
    title="FinSight API",
    description="Financial Signal Detection Game — Backend API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(router)
app.include_router(multiplayer_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "finsight-api"}
