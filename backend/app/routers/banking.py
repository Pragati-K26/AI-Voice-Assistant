"""
Banking operations router
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.services.banking_service import banking_service

router = APIRouter()


class TransferRequest(BaseModel):
    amount: float
    recipient_name: str
    recipient_account: Optional[str] = None
    otp: str


class TransferResponse(BaseModel):
    transaction_id: int
    amount: float
    recipient: str
    new_balance: float
    status: str


class TransactionResponse(BaseModel):
    id: int
    type: str
    amount: float
    recipient: Optional[str]
    description: Optional[str]
    status: str
    date: str


@router.get("/balance")
async def get_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get account balance"""
    balance = banking_service.get_balance(db, current_user.id)
    return {"balance": balance, "account_number": current_user.account_number}


@router.post("/transfer", response_model=TransferResponse)
async def transfer_funds(
    request: TransferRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Transfer funds"""
    try:
        result = banking_service.transfer_funds(
            db=db,
            user_id=current_user.id,
            amount=request.amount,
            recipient_name=request.recipient_name,
            recipient_account=request.recipient_account,
            otp=request.otp
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/transactions", response_model=List[TransactionResponse])
async def get_transactions(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get transaction history"""
    transactions = banking_service.get_transactions(db, current_user.id, limit)
    return transactions


@router.get("/loans")
async def get_loan_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get loan information"""
    loan_info = banking_service.get_loan_info(db, current_user.id)
    return loan_info


@router.get("/interest-rates")
async def get_interest_rates():
    """Get current interest rates"""
    rates = banking_service.get_interest_rates()
    return rates


@router.get("/credit-limit")
async def get_credit_limit(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get credit limit information"""
    credit_info = banking_service.get_credit_limit(db, current_user.id)
    return credit_info

