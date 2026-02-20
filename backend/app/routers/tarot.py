from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models import TarotCard
from app.schemas import TarotCardResponse

router = APIRouter()


@router.get("/cards", response_model=List[TarotCardResponse])
async def get_all_cards(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TarotCard).order_by(TarotCard.arcana, TarotCard.number))
    return result.scalars().all()


@router.get("/cards/{card_id}", response_model=TarotCardResponse)
async def get_card(card_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TarotCard).where(TarotCard.id == card_id))
    card = result.scalar_one_or_none()
    if not card:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Card not found")
    return card


@router.get("/cards/name/{name}", response_model=TarotCardResponse)
async def get_card_by_name(name: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TarotCard).where(TarotCard.name == name))
    card = result.scalar_one_or_none()
    if not card:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Card not found")
    return card
