"""
Transaction model
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class TransactionType(str, enum.Enum):
    """Transaction type enum"""
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    TRANSFER = "transfer"
    PAYMENT = "payment"
    LOAN_PAYMENT = "loan_payment"


class Transaction(Base):
    """Transaction model"""
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Float, nullable=False)
    recipient_account = Column(String, nullable=True)
    recipient_name = Column(String, nullable=True)
    description = Column(String, nullable=True)
    status = Column(String, default="completed")  # pending, completed, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", backref="transactions")

