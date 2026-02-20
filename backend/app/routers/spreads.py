from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models import Spread
from app.schemas import SpreadResponse, SpreadRecommendRequest, SpreadRecommendResponse
from app.services.ai_service import recommend_spread

router = APIRouter()


@router.get("", response_model=List[SpreadResponse])
async def get_all_spreads(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Spread).where(Spread.is_active == True).order_by(Spread.category, Spread.card_count)
    )
    spreads = result.scalars().all()
    return spreads


@router.get("/{spread_id}", response_model=SpreadResponse)
async def get_spread(spread_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Spread).where(Spread.id == spread_id))
    spread = result.scalar_one_or_none()
    if not spread:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Spread not found")
    return spread


@router.post("/recommend", response_model=SpreadRecommendResponse)
async def get_spread_recommendation(
    request: SpreadRecommendRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Spread).where(Spread.is_active == True))
    spreads = result.scalars().all()
    
    recommended = await recommend_spread(request.question, spreads)
    return recommended
