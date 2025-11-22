"""
Fraud Detection and Unusual Activity Alert Service
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.transaction import Transaction, TransactionType
from app.models.user import User
import logging

logger = logging.getLogger(__name__)


class FraudDetector:
    """Detect suspicious transactions and fraud patterns"""
    
    def __init__(self):
        # Thresholds
        self.LARGE_TRANSACTION_THRESHOLD = 50000.0  # ₹50,000
        self.RAPID_TRANSACTION_COUNT = 5  # 5 transactions in short time
        self.RAPID_TRANSACTION_WINDOW = timedelta(minutes=10)
        self.UNUSUAL_LOCATION_THRESHOLD = 500  # km (for future use)
    
    def check_large_transaction(self, amount: float, user_balance: float) -> Dict:
        """
        Check if transaction is unusually large
        
        Args:
            amount: Transaction amount
            user_balance: User's current balance
        
        Returns:
            Alert dictionary if suspicious, None otherwise
        """
        if amount > self.LARGE_TRANSACTION_THRESHOLD:
            return {
                "alert_type": "large_transaction",
                "severity": "high",
                "message": f"Large transaction detected: ₹{amount:,.2f}",
                "recommendation": "Please verify this transaction carefully"
            }
        
        # Check if transaction is more than 50% of balance
        if amount > user_balance * 0.5:
            return {
                "alert_type": "high_percentage_transaction",
                "severity": "medium",
                "message": f"Transaction is {amount/user_balance*100:.1f}% of your balance",
                "recommendation": "Please confirm this is intentional"
            }
        
        return None
    
    def check_rapid_transactions(
        self,
        db: Session,
        user_id: int,
        new_transaction_amount: float
    ) -> Dict:
        """
        Check for rapid multiple transactions
        
        Args:
            db: Database session
            user_id: User ID
            new_transaction_amount: Amount of new transaction
        
        Returns:
            Alert dictionary if suspicious
        """
        time_window_start = datetime.now() - self.RAPID_TRANSACTION_WINDOW
        
        recent_transactions = (
            db.query(Transaction)
            .filter(
                Transaction.user_id == user_id,
                Transaction.transaction_type.in_([
                    TransactionType.TRANSFER,
                    TransactionType.WITHDRAWAL,
                    TransactionType.PAYMENT
                ]),
                Transaction.created_at >= time_window_start,
                Transaction.status == "completed"
            )
            .count()
        )
        
        if recent_transactions >= self.RAPID_TRANSACTION_COUNT:
            return {
                "alert_type": "rapid_transactions",
                "severity": "high",
                "message": f"{recent_transactions + 1} transactions in last 10 minutes",
                "recommendation": "Please verify all transactions are authorized"
            }
        
        return None
    
    def check_unusual_pattern(
        self,
        db: Session,
        user_id: int,
        amount: float,
        recipient: Optional[str] = None
    ) -> Dict:
        """
        Check for unusual transaction patterns
        
        Args:
            db: Database session
            user_id: User ID
            amount: Transaction amount
            recipient: Recipient name
        
        Returns:
            Alert dictionary if unusual
        """
        # Check if transaction to new recipient
        if recipient:
            previous_transactions = (
                db.query(Transaction)
                .filter(
                    Transaction.user_id == user_id,
                    Transaction.recipient_name == recipient,
                    Transaction.status == "completed"
                )
                .count()
            )
            
            if previous_transactions == 0 and amount > 10000:
                return {
                    "alert_type": "new_recipient_large_amount",
                    "severity": "medium",
                    "message": f"First transaction to {recipient} with large amount ₹{amount:,.2f}",
                    "recommendation": "Please verify recipient details"
                }
        
        return None
    
    def detect_fraud(
        self,
        db: Session,
        user_id: int,
        amount: float,
        recipient: Optional[str] = None
    ) -> List[Dict]:
        """
        Run all fraud detection checks
        
        Args:
            db: Database session
            user_id: User ID
            amount: Transaction amount
            recipient: Recipient name
        
        Returns:
            List of alerts
        """
        alerts = []
        
        # Get user balance
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return alerts
        
        # Check large transaction
        large_transaction_alert = self.check_large_transaction(amount, user.balance)
        if large_transaction_alert:
            alerts.append(large_transaction_alert)
        
        # Check rapid transactions
        rapid_alert = self.check_rapid_transactions(db, user_id, amount)
        if rapid_alert:
            alerts.append(rapid_alert)
        
        # Check unusual patterns
        pattern_alert = self.check_unusual_pattern(db, user_id, amount, recipient)
        if pattern_alert:
            alerts.append(pattern_alert)
        
        return alerts


# Global instance
fraud_detector = FraudDetector()

