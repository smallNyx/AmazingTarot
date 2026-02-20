from datetime import datetime
from sqlalchemy import String, Boolean, Integer, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    readings: Mapped[list["Reading"]] = relationship("Reading", back_populates="user")


class TarotCard(Base):
    __tablename__ = "tarot_cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    name_cn: Mapped[str] = mapped_column(String(50))
    arcana: Mapped[str] = mapped_column(String(20))
    number: Mapped[int] = mapped_column(Integer, nullable=True)
    element: Mapped[str] = mapped_column(String(20), nullable=True)
    zodiac: Mapped[str] = mapped_column(String(20), nullable=True)
    keywords: Mapped[str] = mapped_column(Text)
    upright_meaning: Mapped[str] = mapped_column(Text)
    reversed_meaning: Mapped[str] = mapped_column(Text)
    description: Mapped[str] = mapped_column(Text)
    image_url: Mapped[str] = mapped_column(String(255), nullable=True)


class Spread(Base):
    __tablename__ = "spreads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    name_cn: Mapped[str] = mapped_column(String(50))
    card_count: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(Text)
    positions: Mapped[dict] = mapped_column(JSON)
    category: Mapped[str] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Reading(Base):
    __tablename__ = "readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    spread_id: Mapped[int] = mapped_column(Integer, ForeignKey("spreads.id"))
    question: Mapped[str] = mapped_column(Text, nullable=True)
    cards: Mapped[dict] = mapped_column(JSON)
    interpretation: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    user: Mapped["User"] = relationship("User", back_populates="readings")
