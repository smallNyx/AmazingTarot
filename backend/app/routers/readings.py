import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models import User, Reading, Spread, TarotCard
from app.schemas import (
    ReadingCreate, ReadingResponse, DrawCardResult, 
    SpreadPosition, AIInterpretationRequest, AIInterpretationResponse,
    TarotCardResponse
)
from app.routers.auth import get_current_user
from app.services.ai_service import get_interpretation

router = APIRouter()


@router.post("/draw/{spread_id}", response_model=List[DrawCardResult])
async def draw_cards(
    spread_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Spread).where(Spread.id == spread_id))
    spread = result.scalar_one_or_none()
    if not spread:
        raise HTTPException(status_code=404, detail="Spread not found")
    
    cards_result = await db.execute(select(TarotCard))
    all_cards = cards_result.scalars().all()
    
    if len(all_cards) < spread.card_count:
        raise HTTPException(status_code=500, detail="Not enough cards in database")
    
    selected_cards = random.sample(list(all_cards), spread.card_count)
    
    positions = spread.positions
    drawn_cards = []
    
    for i, card in enumerate(selected_cards):
        is_reversed = random.random() < 0.5
        position_data = positions[i] if i < len(positions) else {"name": f"Position {i+1}", "name_cn": f"位置{i+1}", "description": "", "order": i}
        
        drawn_cards.append(DrawCardResult(
            card=TarotCardResponse.model_validate(card),
            is_reversed=is_reversed,
            position=SpreadPosition(**position_data)
        ))
    
    return drawn_cards


@router.post("/create", response_model=ReadingResponse)
async def create_reading(
    reading_data: ReadingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reading = Reading(
        user_id=current_user.id,
        spread_id=reading_data.spread_id,
        question=reading_data.question,
        cards=reading_data.cards,
        interpretation=None
    )
    db.add(reading)
    await db.commit()
    await db.refresh(reading)
    return reading


@router.get("/history", response_model=List[ReadingResponse])
async def get_reading_history(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Reading)
        .where(Reading.user_id == current_user.id)
        .order_by(Reading.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()


@router.get("/{reading_id}", response_model=ReadingResponse)
async def get_reading(
    reading_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Reading).where(
            Reading.id == reading_id,
            Reading.user_id == current_user.id
        )
    )
    reading = result.scalar_one_or_none()
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found")
    return reading


@router.post("/interpret", response_model=AIInterpretationResponse)
async def interpret_reading(
    request: AIInterpretationRequest,
    current_user: User = Depends(get_current_user)
):
    interpretation = await get_interpretation(
        question=request.question,
        spread_name=request.spread_name,
        cards=request.cards
    )
    return AIInterpretationResponse(interpretation=interpretation)
