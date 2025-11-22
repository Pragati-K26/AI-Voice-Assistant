"""
Voice session model
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class VoiceSession(Base):
    """Voice interaction session model"""
    __tablename__ = "voice_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    session_id = Column(String, unique=True, index=True, nullable=False)
    transcript = Column(Text, nullable=True)
    intent = Column(String, nullable=True)
    entities = Column(JSON, nullable=True)
    response = Column(Text, nullable=True)
    status = Column(String, default="active")  # active, completed, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

