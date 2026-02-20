from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, async_session_maker
from app.routers import auth, tarot, readings, spreads
from app.data.init_data import init_tarot_cards, init_spreads


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    async with async_session_maker() as db:
        await init_tarot_cards(db)
        await init_spreads(db)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tarot.router, prefix="/api/tarot", tags=["tarot"])
app.include_router(readings.router, prefix="/api/readings", tags=["readings"])
app.include_router(spreads.router, prefix="/api/spreads", tags=["spreads"])


@app.get("/")
async def root():
    return {"message": "AI Tarot API", "version": "1.0.0"}
