"""
Banking operations router
Enhanced with spending tracking, fraud detection, notifications, and advanced features
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.services.banking_service import banking_service
from app.services.spending_tracker import spending_tracker
from app.services.fraud_detector import fraud_detector
from app.services.notification_service import notification_service

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


# Advanced Features: Spending Tracking
@router.get("/spending/summary")
async def get_spending_summary(
    period: str = "month",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get spending summary by category"""
    summary = spending_tracker.get_spending_summary(db, current_user.id, period)
    return summary


@router.get("/spending/category/{category}")
async def get_category_spending(
    category: str,
    period: str = "month",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get spending for a specific category"""
    spending = spending_tracker.get_category_spending(db, current_user.id, category, period)
    return spending


@router.get("/spending/breakdown")
async def get_spending_breakdown(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get spending breakdown by category for date range"""
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None
    
    breakdown = spending_tracker.get_spending_by_category(
        db, current_user.id, start, end
    )
    return {"category_breakdown": breakdown}


# Advanced Features: Fraud Detection & Alerts
@router.post("/transfer/check-fraud")
async def check_transaction_fraud(
    amount: float,
    recipient_name: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check for potential fraud before transaction"""
    alerts = fraud_detector.detect_fraud(
        db, current_user.id, amount, recipient_name
    )
    return {
        "alerts": alerts,
        "has_alerts": len(alerts) > 0,
        "recommendation": "proceed_with_caution" if alerts else "proceed"
    }


# Advanced Features: Proactive Notifications
@router.get("/notifications")
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all active notifications for user"""
    notifications = notification_service.get_user_notifications(db, current_user.id)
    return {"notifications": notifications, "count": len(notifications)}


@router.get("/notifications/unread")
async def get_unread_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get unread notifications count"""
    notifications = notification_service.get_user_notifications(db, current_user.id)
    unread = [n for n in notifications if n.get("action_required", False)]
    return {"unread_count": len(unread), "notifications": unread}


# Advanced Features: Bill & Recharge Automation
class AutoPayRequest(BaseModel):
    bill_type: str
    biller_id: Optional[str] = None
    account_number: Optional[str] = None
    amount: Optional[float] = None
    auto_pay_enabled: bool = True
    reminder_days_before: int = 2


@router.post("/bills/auto-pay")
async def setup_auto_pay(
    request: AutoPayRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Setup automatic bill payment"""
    # In production, this would create a scheduled payment
    return {
        "message": f"Auto-pay enabled for {request.bill_type}",
        "auto_pay_enabled": request.auto_pay_enabled,
        "reminder_days": request.reminder_days_before
    }


@router.get("/bills/auto-pay")
async def get_auto_pay_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get auto-pay settings"""
    # Mock data - in production, fetch from database
    return {
        "auto_pay_enabled": True,
        "auto_pay_bills": [
            {"type": "electricity", "amount": 2000, "next_payment": "2024-01-25"},
            {"type": "phone", "amount": 500, "next_payment": "2024-01-20"}
        ]
    }


# Advanced Features: Cheque Book & Card Services
class ChequeBookRequest(BaseModel):
    account_number: Optional[str] = None
    delivery_address: Optional[str] = None


@router.post("/chequebook/request")
async def request_cheque_book(
    request: ChequeBookRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Request new cheque book"""
    return {
        "message": "Cheque book request submitted successfully",
        "request_id": f"CHQ{current_user.id}{datetime.now().strftime('%Y%m%d')}",
        "estimated_delivery": "5-7 business days"
    }


class CardActionRequest(BaseModel):
    card_id: Optional[str] = None
    action: str  # block, unblock, set_limit
    spending_limit: Optional[float] = None
    otp: Optional[str] = None


@router.post("/cards/action")
async def manage_card(
    request: CardActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Block, unblock, or set limits on card"""
    actions = {
        "block": "Your card has been blocked successfully",
        "unblock": "Your card has been unblocked successfully",
        "set_limit": f"Spending limit set to ₹{request.spending_limit:,.2f}"
    }
    
    return {
        "message": actions.get(request.action, "Action completed"),
        "action": request.action,
        "status": "success"
    }


@router.get("/cards")
async def get_cards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's cards"""
    # Mock data - in production, fetch from cards table
    return {
        "cards": [
            {
                "card_id": "CARD001",
                "card_type": "debit",
                "last_four": "1234",
                "status": "active",
                "spending_limit": None
            },
            {
                "card_id": "CARD002",
                "card_type": "credit",
                "last_four": "5678",
                "status": "active",
                "spending_limit": 50000
            }
        ]
    }

