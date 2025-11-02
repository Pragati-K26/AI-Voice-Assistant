"""
Banking operations service (mock implementation)
"""
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.transaction import Transaction, TransactionType
import random
import logging

logger = logging.getLogger(__name__)


class BankingService:
    """Service for banking operations"""
    
    def get_balance(self, db: Session, user_id: int) -> float:
        """Get user account balance"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        return user.balance
    
    def transfer_funds(
        self,
        db: Session,
        user_id: int,
        amount: float,
        recipient_name: str,
        recipient_account: Optional[str] = None,
        otp: Optional[str] = None
    ) -> Dict:
        """
        Transfer funds to another account
        
        Args:
            db: Database session
            user_id: Sender user ID
            amount: Transfer amount
            recipient_name: Recipient name
            recipient_account: Optional recipient account number
            otp: OTP for verification
        
        Returns:
            Dictionary with transaction details
        """
        # Verify OTP (in production, validate against actual OTP service)
        if not otp or not self._verify_otp(user_id, otp):
            raise ValueError("Invalid or expired OTP")
        
        # Get sender
        sender = db.query(User).filter(User.id == user_id).first()
        if not sender:
            raise ValueError("Sender not found")
        
        # Check balance
        if sender.balance < amount:
            raise ValueError("Insufficient balance")
        
        # Deduct from sender
        sender.balance -= amount
        
        # Create transaction record
        transaction = Transaction(
            user_id=user_id,
            transaction_type=TransactionType.TRANSFER,
            amount=amount,
            recipient_name=recipient_name,
            recipient_account=recipient_account or f"ACC{random.randint(100000, 999999)}",
            description=f"Transfer to {recipient_name}",
            status="completed"
        )
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        return {
            "transaction_id": transaction.id,
            "amount": amount,
            "recipient": recipient_name,
            "new_balance": sender.balance,
            "status": "success"
        }
    
    def get_transactions(
        self,
        db: Session,
        user_id: int,
        limit: int = 10
    ) -> List[Dict]:
        """Get user transaction history"""
        transactions = (
            db.query(Transaction)
            .filter(Transaction.user_id == user_id)
            .order_by(Transaction.created_at.desc())
            .limit(limit)
            .all()
        )
        
        return [
            {
                "id": t.id,
                "type": t.transaction_type.value,
                "amount": t.amount,
                "recipient": t.recipient_name,
                "description": t.description,
                "status": t.status,
                "date": t.created_at.isoformat()
            }
            for t in transactions
        ]
    
    def get_loan_info(self, db: Session, user_id: int) -> Dict:
        """Get user loan information"""
        # Mock loan data
        return {
            "loan_balance": 50000.0,
            "principal": 100000.0,
            "interest_rate": 12.5,
            "next_payment": 5000.0,
            "next_payment_date": (datetime.now() + timedelta(days=15)).isoformat(),
            "remaining_tenure_months": 10
        }
    
    def get_interest_rates(self) -> Dict:
        """Get current interest rates"""
        return {
            "savings_account": 4.5,
            "fixed_deposit_1year": 7.0,
            "fixed_deposit_5year": 7.5,
            "personal_loan": 12.5,
            "home_loan": 8.5,
            "credit_card": 24.0
        }
    
    def get_credit_limit(self, db: Session, user_id: int) -> Dict:
        """Get user credit limit information"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        used_credit = user.credit_limit - (user.credit_limit * 0.3)  # Mock usage
        return {
            "credit_limit": user.credit_limit,
            "available_credit": user.credit_limit - used_credit,
            "used_credit": used_credit
        }
    
    def _verify_otp(self, user_id: int, otp: str) -> bool:
        """
        Verify OTP (mock implementation)
        In production, integrate with SMS/email OTP service
        """
        # For demo: accept any 4-6 digit OTP
        if len(otp) >= 4 and otp.isdigit():
            return True
        return False


# Global instance
banking_service = BankingService()

