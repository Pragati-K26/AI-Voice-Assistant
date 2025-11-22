"""
Plaid integration router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.transaction import Transaction, TransactionType
from app.services.plaid_service import plaid_service
from app.services.spending_tracker import spending_tracker

router = APIRouter()


class ExchangeTokenRequest(BaseModel):
    public_token: str


@router.post("/link-token")
async def create_link_token(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Plaid link token"""
    result = plaid_service.create_link_token(str(current_user.id))
    return result


@router.post("/exchange-token")
async def exchange_public_token(
    request: ExchangeTokenRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Exchange public token for access token and store it"""
    result = plaid_service.exchange_public_token(request.public_token)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Store access token in user model (you may need to add a field for this)
    # For now, we'll use a simple approach - store in a separate table or user metadata
    # This is a simplified version - in production, use proper encryption
    
    return {
        "access_token": result["access_token"],
        "item_id": result["item_id"],
        "message": "Token exchanged successfully"
    }


@router.post("/sync-transactions")
async def sync_plaid_transactions(
    access_token: Optional[str] = None,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sync transactions from Plaid to database"""
    if not access_token:
        # Try to get from user's stored token (implement this based on your storage method)
        raise HTTPException(status_code=400, detail="Access token required")
    
    start_date = datetime.now() - timedelta(days=days)
    end_date = datetime.now()
    
    # Fetch transactions from Plaid
    plaid_transactions = plaid_service.get_transactions(
        access_token,
        start_date=start_date,
        end_date=end_date
    )
    
    synced_count = 0
    for plaid_tx in plaid_transactions:
        # Check if transaction already exists
        existing = db.query(Transaction).filter(
            Transaction.user_id == current_user.id,
            Transaction.description == plaid_tx["name"],
            Transaction.amount == plaid_tx["amount"],
            Transaction.created_at >= datetime.strptime(plaid_tx["date"], "%Y-%m-%d")
        ).first()
        
        if not existing:
            # Map Plaid category to our transaction type
            tx_type = TransactionType.PAYMENT if plaid_tx["type"] == "debit" else TransactionType.DEPOSIT
            
            # Get category from Plaid categories
            category = spending_tracker.categorize_transaction(
                plaid_tx["name"],
                plaid_tx.get("merchant_name")
            )
            
            # Remove metadata field if Transaction model doesn't support it
            transaction = Transaction(
                user_id=current_user.id,
                transaction_type=tx_type,
                amount=plaid_tx["amount"],
                description=plaid_tx["name"],
                recipient_name=plaid_tx.get("merchant_name"),
                status="completed"
            )
            db.add(transaction)
            synced_count += 1
    
    db.commit()
    
    return {
        "message": f"Synced {synced_count} new transactions",
        "total_fetched": len(plaid_transactions),
        "synced": synced_count
    }


@router.get("/accounts")
async def get_plaid_accounts(
    access_token: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get account information from Plaid"""
    if not access_token:
        raise HTTPException(status_code=400, detail="Access token required")
    
    accounts = plaid_service.get_accounts(access_token)
    return {"accounts": accounts}

