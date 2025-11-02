"""
Spending Categorization and Tracking Service
Personalized Financial Assistant feature
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.transaction import Transaction, TransactionType
import logging

logger = logging.getLogger(__name__)

# Spending categories
SPENDING_CATEGORIES = {
    "food": ["food", "restaurant", "cafe", "grocery", "swiggy", "zomato", "uber eats"],
    "transport": ["uber", "ola", "taxi", "metro", "bus", "fuel", "petrol", "diesel"],
    "shopping": ["amazon", "flipkart", "mall", "shopping", "purchase"],
    "bills": ["electricity", "water", "phone", "internet", "utility", "bill"],
    "entertainment": ["movie", "netflix", "spotify", "concert", "theater"],
    "healthcare": ["pharmacy", "hospital", "doctor", "medicine", "clinic"],
    "education": ["tuition", "school", "college", "course", "books"],
    "transfer": ["transfer", "send", "pay"],
    "other": []
}


class SpendingTracker:
    """Track and categorize spending"""
    
    def categorize_transaction(self, description: str, recipient: Optional[str] = None) -> str:
        """
        Categorize transaction based on description and recipient
        
        Args:
            description: Transaction description
            recipient: Recipient name (optional)
        
        Returns:
            Category name
        """
        text = (description or "").lower()
        if recipient:
            text += " " + recipient.lower()
        
        # Check each category
        for category, keywords in SPENDING_CATEGORIES.items():
            if category == "other":
                continue
            for keyword in keywords:
                if keyword in text:
                    return category
        
        return "other"
    
    def get_spending_by_category(
        self,
        db: Session,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, float]:
        """
        Get spending breakdown by category
        
        Args:
            db: Database session
            user_id: User ID
            start_date: Start date (default: 30 days ago)
            end_date: End date (default: today)
        
        Returns:
            Dictionary with category -> total amount
        """
        if not start_date:
            start_date = datetime.now() - timedelta(days=30)
        if not end_date:
            end_date = datetime.now()
        
        # Get debit transactions
        transactions = (
            db.query(Transaction)
            .filter(
                Transaction.user_id == user_id,
                Transaction.transaction_type.in_([
                    TransactionType.TRANSFER,
                    TransactionType.WITHDRAWAL,
                    TransactionType.PAYMENT
                ]),
                Transaction.created_at >= start_date,
                Transaction.created_at <= end_date,
                Transaction.status == "completed"
            )
            .all()
        )
        
        category_totals = {}
        
        for transaction in transactions:
            category = self.categorize_transaction(
                transaction.description,
                transaction.recipient_name
            )
            category_totals[category] = category_totals.get(category, 0) + transaction.amount
        
        return category_totals
    
    def get_spending_summary(
        self,
        db: Session,
        user_id: int,
        period: str = "month"
    ) -> Dict:
        """
        Get spending summary for a period
        
        Args:
            db: Database session
            user_id: User ID
            period: "week", "month", "year" (default: "month")
        
        Returns:
            Summary dictionary
        """
        if period == "week":
            start_date = datetime.now() - timedelta(days=7)
        elif period == "year":
            start_date = datetime.now() - timedelta(days=365)
        else:  # month
            start_date = datetime.now() - timedelta(days=30)
        
        end_date = datetime.now()
        
        category_totals = self.get_spending_by_category(db, user_id, start_date, end_date)
        total_spending = sum(category_totals.values())
        
        # Get total income (credits)
        total_income = (
            db.query(Transaction)
            .filter(
                Transaction.user_id == user_id,
                Transaction.transaction_type == TransactionType.DEPOSIT,
                Transaction.created_at >= start_date,
                Transaction.created_at <= end_date,
                Transaction.status == "completed"
            )
            .with_entities(Transaction.amount)
            .all()
        )
        total_income = sum([t[0] for t in total_income])
        
        return {
            "period": period,
            "total_spending": total_spending,
            "total_income": total_income,
            "savings": total_income - total_spending,
            "category_breakdown": category_totals,
            "top_category": max(category_totals.items(), key=lambda x: x[1])[0] if category_totals else None
        }
    
    def get_category_spending(
        self,
        db: Session,
        user_id: int,
        category: str,
        period: str = "month"
    ) -> Dict:
        """
        Get spending for a specific category
        
        Args:
            db: Database session
            user_id: User ID
            category: Category name
            period: Time period
        """
        if period == "week":
            start_date = datetime.now() - timedelta(days=7)
        elif period == "year":
            start_date = datetime.now() - timedelta(days=365)
        else:
            start_date = datetime.now() - timedelta(days=30)
        
        category_totals = self.get_spending_by_category(db, user_id, start_date)
        amount = category_totals.get(category, 0)
        
        return {
            "category": category,
            "amount": amount,
            "period": period
        }


# Global instance
spending_tracker = SpendingTracker()

