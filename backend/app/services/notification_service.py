"""
Proactive Notification Service
Sends alerts for balance drops, large transactions, incoming funds, etc.
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.transaction import Transaction, TransactionType
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Handle proactive notifications and alerts"""
    
    def check_balance_threshold(self, user: User, balance: float) -> Optional[Dict]:
        """
        Check if balance has dropped below threshold
        
        Args:
            user: User object
            balance: Current balance
        
        Returns:
            Notification dictionary if threshold crossed
        """
        # Check if balance is below ₹5,000 (configurable)
        threshold = 5000.0
        
        if balance < threshold:
            return {
                "type": "low_balance",
                "severity": "medium",
                "title": "Low Balance Alert",
                "message": f"Your account balance is ₹{balance:,.2f}, which is below the recommended threshold of ₹{threshold:,.2f}",
                "action_required": False
            }
        
        return None
    
    def check_incoming_funds(
        self,
        db: Session,
        user_id: int,
        transaction: Transaction
    ) -> Optional[Dict]:
        """
        Notify about incoming funds (credit transactions)
        
        Args:
            db: Database session
            user_id: User ID
            transaction: Credit transaction
        
        Returns:
            Notification dictionary
        """
        if transaction.transaction_type == TransactionType.DEPOSIT:
            return {
                "type": "funds_received",
                "severity": "info",
                "title": "Funds Received",
                "message": f"₹{transaction.amount:,.2f} has been credited to your account",
                "transaction_id": transaction.id,
                "action_required": False
            }
        
        return None
    
    def check_large_debit(
        self,
        transaction: Transaction,
        threshold: float = 10000.0
    ) -> Optional[Dict]:
        """
        Notify about large debit transactions
        
        Args:
            transaction: Debit transaction
            threshold: Amount threshold
        
        Returns:
            Notification dictionary
        """
        if transaction.amount >= threshold and transaction.transaction_type in [
            TransactionType.TRANSFER,
            TransactionType.WITHDRAWAL,
            TransactionType.PAYMENT
        ]:
            return {
                "type": "large_debit",
                "severity": "medium",
                "title": "Large Transaction Alert",
                "message": f"A transaction of ₹{transaction.amount:,.2f} has been made",
                "recipient": transaction.recipient_name,
                "transaction_id": transaction.id,
                "action_required": True
            }
        
        return None
    
    def check_payment_due(
        self,
        db: Session,
        user_id: int
    ) -> List[Dict]:
        """
        Check for upcoming payment dues (EMIs, bills, etc.)
        
        Args:
            db: Database session
            user_id: User ID
        
        Returns:
            List of notifications
        """
        notifications = []
        
        # Check loan EMIs (mock - in production, query loan table)
        # This is a placeholder - integrate with actual loan data
        today = datetime.now().date()
        days_ahead = 3
        
        # Example: Loan EMI due in 3 days
        # In production, query actual loan schedules
        notifications.append({
            "type": "payment_due",
            "severity": "medium",
            "title": "Payment Due Reminder",
            "message": f"Your Personal Loan EMI of ₹5,000 is due in {days_ahead} days",
            "due_date": (today + timedelta(days=days_ahead)).isoformat(),
            "amount": 5000.00,
            "action_required": True
        })
        
        return notifications
    
    def get_user_notifications(
        self,
        db: Session,
        user_id: int
    ) -> List[Dict]:
        """
        Get all active notifications for user
        
        Args:
            db: Database session
            user_id: User ID
        
        Returns:
            List of notifications
        """
        notifications = []
        
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return notifications
        
        # Check balance threshold
        balance_alert = self.check_balance_threshold(user, user.balance)
        if balance_alert:
            notifications.append(balance_alert)
        
        # Check payment dues
        payment_notifications = self.check_payment_due(db, user_id)
        notifications.extend(payment_notifications)
        
        # Check recent large transactions (last 24 hours)
        yesterday = datetime.now() - timedelta(days=1)
        recent_transactions = (
            db.query(Transaction)
            .filter(
                Transaction.user_id == user_id,
                Transaction.created_at >= yesterday,
                Transaction.status == "completed"
            )
            .order_by(Transaction.created_at.desc())
            .limit(5)
            .all()
        )
        
        for transaction in recent_transactions:
            # Check for incoming funds
            funds_notification = self.check_incoming_funds(db, user_id, transaction)
            if funds_notification:
                notifications.append(funds_notification)
            
            # Check for large debits
            large_debit_notification = self.check_large_debit(transaction)
            if large_debit_notification:
                notifications.append(large_debit_notification)
        
        return notifications


# Global instance
notification_service = NotificationService()

