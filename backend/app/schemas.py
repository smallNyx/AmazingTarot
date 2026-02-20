from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List, Dict, Any


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class TarotCardResponse(BaseModel):
    id: int
    name: str
    name_cn: str
    arcana: str
    number: Optional[int]
    element: Optional[str]
    zodiac: Optional[str]
    keywords: str
    upright_meaning: str
    reversed_meaning: str
    description: str
    image_url: Optional[str]

    class Config:
        from_attributes = True


class SpreadPosition(BaseModel):
    name: str
    name_cn: str
    description: str
    order: int


class SpreadResponse(BaseModel):
    id: int
    name: str
    name_cn: str
    card_count: int
    description: str
    positions: List[Dict[str, Any]]
    category: str

    class Config:
        from_attributes = True


class DrawCardResult(BaseModel):
    card: TarotCardResponse
    is_reversed: bool
    position: SpreadPosition


class ReadingCreate(BaseModel):
    spread_id: int
    question: Optional[str] = None
    cards: List[Dict[str, Any]]


class ReadingResponse(BaseModel):
    id: int
    spread_id: int
    question: Optional[str]
    cards: List[Dict[str, Any]]
    interpretation: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AIInterpretationRequest(BaseModel):
    question: Optional[str]
    spread_name: str
    cards: List[Dict[str, Any]]


class AIInterpretationResponse(BaseModel):
    interpretation: str


class SpreadRecommendRequest(BaseModel):
    question: str


class SpreadRecommendResponse(BaseModel):
    spread_id: int
    spread_name: str
    spread_name_cn: str
    reason: str
