"""
Dialogue Management service for handling conversation flow
"""
from typing import Dict, List, Optional, Tuple
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)


class DialogueState:
    """Dialogue state tracking"""
    def __init__(self, user_id: int, session_id: str):
        self.user_id = user_id
        self.session_id = session_id
        self.context: Dict = {}
        self.pending_action: Optional[str] = None
        self.pending_entities: Dict = {}
        self.history: List[Dict] = []
        self.requires_confirmation: bool = False
        self.requires_otp: bool = False
    
    def add_to_history(self, user_text: str, intent: str, response: str):
        """Add interaction to history"""
        self.history.append({
            "timestamp": datetime.now().isoformat(),
            "user_text": user_text,
            "intent": intent,
            "response": response
        })
    
    def clear_pending(self):
        """Clear pending action"""
        self.pending_action = None
        self.pending_entities = {}
        self.requires_confirmation = False


class DialogueManager:
    """Manages conversation flow and context"""
    
    def __init__(self):
        self.active_sessions: Dict[str, DialogueState] = {}
    
    def get_session(self, user_id: int, session_id: Optional[str] = None) -> DialogueState:
        """Get or create dialogue session"""
        if session_id and session_id in self.active_sessions:
            return self.active_sessions[session_id]
        
        if not session_id:
            session_id = str(uuid.uuid4())
        
        session = DialogueState(user_id, session_id)
        self.active_sessions[session_id] = session
        return session
    
    def process_intent(
        self,
        user_id: int,
        session_id: str,
        user_text: str,
        intent: str,
        entities: Dict,
        user_balance: float = 0.0
    ) -> Tuple[str, Dict]:
        """
        Process user intent and generate response
        
        Args:
            user_id: User ID
            session_id: Session ID
            user_text: User input text
            intent: Detected intent
            entities: Extracted entities
            user_balance: User's current balance
        
        Returns:
            Tuple of (response_text, action_data)
        """
        session = self.get_session(user_id, session_id)
        
        # Handle greetings
        if intent == "greeting":
            response = "Hello! I'm your voice banking assistant. How can I help you today?"
            session.add_to_history(user_text, intent, response)
            return response, {}
        
        # Handle goodbye
        if intent == "goodbye":
            response = "Thank you for using voice banking. Have a great day!"
            session.clear_pending()
            return response, {}
        
        # Handle confirmation responses
        if session.requires_confirmation:
            return self._handle_confirmation(session, user_text, intent)
        
        # Handle OTP verification
        if session.requires_otp:
            return self._handle_otp_verification(session, user_text)
        
        # Process main intents
        if intent == "check_balance":
            return self._handle_check_balance(session, user_text, user_balance)
        
        elif intent == "transfer_funds":
            return self._handle_transfer_funds(session, user_text, entities, user_balance)
        
        elif intent == "view_transactions":
            return self._handle_view_transactions(session, user_text)
        
        elif intent == "loan_inquiry":
            return self._handle_loan_inquiry(session, user_text)
        
        elif intent == "interest_inquiry":
            return self._handle_interest_inquiry(session, user_text)
        
        elif intent == "credit_limit_inquiry":
            return self._handle_credit_limit(session, user_text)
        
        elif intent == "set_reminder":
            return self._handle_set_reminder(session, user_text, entities)
        
        elif intent == "payment_alert":
            return self._handle_payment_alert(session, user_text, entities)
        
        else:
            response = "I'm not sure I understand. Could you please rephrase your request?"
            session.add_to_history(user_text, intent, response)
            return response, {}
    
    def _handle_check_balance(self, session: DialogueState, user_text: str, balance: float) -> Tuple[str, Dict]:
        """Handle balance check"""
        response = f"Your current account balance is ₹{balance:,.2f}"
        session.add_to_history(user_text, "check_balance", response)
        return response, {"action": "check_balance", "balance": balance}
    
    def _handle_transfer_funds(
        self,
        session: DialogueState,
        user_text: str,
        entities: Dict,
        balance: float
    ) -> Tuple[str, Dict]:
        """Handle fund transfer"""
        amount = entities.get("amount")
        recipient = entities.get("recipient_name")
        
        # Check if we have all required information
        if not amount:
            response = "How much would you like to transfer?"
            session.pending_action = "transfer_funds"
            session.pending_entities = entities
            return response, {}
        
        if not recipient:
            response = "Who would you like to transfer to?"
            session.pending_action = "transfer_funds"
            session.pending_entities = entities
            return response, {}
        
        # Check balance
        if amount > balance:
            response = f"Insufficient balance. Your current balance is ₹{balance:,.2f}"
            session.clear_pending()
            return response, {}
        
        # Confirm transfer
        session.requires_confirmation = True
        session.pending_action = "transfer_funds"
        session.pending_entities = {"amount": amount, "recipient_name": recipient}
        
        response = (
            f"Please confirm: Transfer ₹{amount:,.2f} to {recipient}. "
            "Say 'yes' to confirm or 'no' to cancel."
        )
        return response, {}
    
    def _handle_confirmation(self, session: DialogueState, user_text: str, intent: str) -> Tuple[str, Dict]:
        """Handle confirmation response"""
        text_lower = user_text.lower()
        
        if any(word in text_lower for word in ["yes", "confirm", "proceed", "ok"]):
            if session.pending_action == "transfer_funds":
                session.requires_otp = True
                session.requires_confirmation = False
                response = (
                    "Please provide the OTP sent to your registered mobile number "
                    "to complete the transfer."
                )
                return response, {"action": "pending_transfer", "requires_otp": True}
        else:
            session.clear_pending()
            response = "Transaction cancelled."
            return response, {}
        
        return response, {}
    
    def _handle_otp_verification(self, session: DialogueState, user_text: str) -> Tuple[str, Dict]:
        """Handle OTP verification"""
        # Extract OTP from text
        import re
        otp_match = re.search(r'\b\d{4,6}\b', user_text)
        
        if not otp_match:
            response = "Please provide the 6-digit OTP."
            return response, {}
        
        otp = otp_match.group()
        session.requires_otp = False
        
        # Prepare action data
        action_data = {
            "action": "transfer_funds",
            "otp": otp,
            **session.pending_entities
        }
        
        response = (
            f"Processing transfer of ₹{session.pending_entities.get('amount', 0):,.2f} "
            f"to {session.pending_entities.get('recipient_name', '')}..."
        )
        session.clear_pending()
        session.add_to_history(user_text, "transfer_funds", response)
        
        return response, action_data
    
    def _handle_view_transactions(self, session: DialogueState, user_text: str) -> Tuple[str, Dict]:
        """Handle transaction history request"""
        response = "Fetching your recent transactions..."
        session.add_to_history(user_text, "view_transactions", response)
        return response, {"action": "view_transactions"}
    
    def _handle_loan_inquiry(self, session: DialogueState, user_text: str) -> Tuple[str, Dict]:
        """Handle loan inquiry"""
        response = (
            "You currently have a loan balance of ₹50,000. "
            "Your next payment of ₹5,000 is due on the 15th of next month. "
            "Would you like to make a payment now?"
        )
        session.add_to_history(user_text, "loan_inquiry", response)
        return response, {"action": "loan_inquiry"}
    
    def _handle_interest_inquiry(self, session: DialogueState, user_text: str) -> Tuple[str, Dict]:
        """Handle interest rate inquiry"""
        response = (
            "Current interest rates: "
            "Savings Account: 4.5% per annum, "
            "Fixed Deposit: 7.0% per annum, "
            "Personal Loan: 12.5% per annum."
        )
        session.add_to_history(user_text, "interest_inquiry", response)
        return response, {"action": "interest_inquiry"}
    
    def _handle_credit_limit(self, session: DialogueState, user_text: str) -> Tuple[str, Dict]:
        """Handle credit limit inquiry"""
        response = "Your credit card limit is ₹50,000. Available credit is ₹35,000."
        session.add_to_history(user_text, "credit_limit_inquiry", response)
        return response, {"action": "credit_limit_inquiry"}
    
    def _handle_set_reminder(self, session: DialogueState, user_text: str, entities: Dict) -> Tuple[str, Dict]:
        """Handle reminder setting"""
        response = "Reminder set successfully. You'll be notified before your payment due date."
        session.add_to_history(user_text, "set_reminder", response)
        return response, {"action": "set_reminder"}
    
    def _handle_payment_alert(self, session: DialogueState, user_text: str, entities: Dict) -> Tuple[str, Dict]:
        """Handle payment alert setup"""
        response = "Payment alerts have been activated. You'll receive notifications for all transactions."
        session.add_to_history(user_text, "payment_alert", response)
        return response, {"action": "payment_alert"}


# Global instance
dialogue_manager = DialogueManager()

