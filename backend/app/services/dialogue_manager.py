"""
Dialogue Management service for handling conversation flow
Enhanced with error handling, clarification, and multi-turn conversations
"""
from typing import Dict, List, Optional, Tuple
import logging
from datetime import datetime, timedelta
import uuid
import difflib

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
        
        elif intent == "spending_summary":
            return self._handle_spending_summary(session, user_text, entities)
        
        elif intent == "category_spending":
            return self._handle_category_spending(session, user_text, entities)
        
        elif intent == "view_notifications":
            return self._handle_view_notifications(session, user_text)
        
        elif intent == "setup_auto_pay":
            return self._handle_setup_auto_pay(session, user_text, entities)
        
        elif intent == "request_chequebook":
            return self._handle_request_chequebook(session, user_text)
        
        elif intent == "manage_card":
            return self._handle_manage_card(session, user_text, entities)
        
        else:
            # Try error handling with suggestions
            response, action_data = self.handle_error_clarification(session, user_text, "invalid_command")
            return response, action_data
    
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
    
    def suggest_correction(self, user_text: str, valid_options: List[str]) -> Optional[str]:
        """
        Suggest corrections for user input (error handling)
        
        Args:
            user_text: User's input text
            valid_options: List of valid options
        
        Returns:
            Suggested correction or None
        """
        user_lower = user_text.lower()
        matches = difflib.get_close_matches(user_lower, [opt.lower() for opt in valid_options], n=1, cutoff=0.6)
        
        if matches:
            original_option = next(opt for opt in valid_options if opt.lower() == matches[0])
            return original_option
        
        return None
    
    def handle_error_clarification(self, session: DialogueState, user_text: str, error_type: str) -> Tuple[str, Dict]:
        """
        Handle errors with helpful clarification
        
        Args:
            session: Dialogue session
            user_text: User input
            error_type: Type of error
        
        Returns:
            Clarification response
        """
        clarifications = {
            "insufficient_info": "I need a bit more information. Could you please provide more details?",
            "invalid_amount": "I didn't understand the amount. Please say the amount clearly, for example: 'five thousand rupees' or '₹5000'",
            "invalid_recipient": "I couldn't find that recipient. Did you mean one of your saved beneficiaries?",
            "invalid_command": "I'm not sure I understand. Could you try rephrasing? For example: 'Transfer money' or 'Check balance'",
            "network_error": "I'm having trouble connecting. Please try again in a moment.",
            "timeout": "The request is taking too long. Please try again."
        }
        
        response = clarifications.get(error_type, "Something went wrong. Please try again.")
        
        # Add helpful suggestions
        if error_type == "invalid_command":
            response += " You can ask me to: check balance, transfer money, view transactions, spending summary, or inquire about loans."
        
        session.add_to_history(user_text, "error", response)
        return response, {"error": error_type, "requires_clarification": True}
    
    def _handle_spending_summary(self, session: DialogueState, user_text: str, entities: Dict) -> Tuple[str, Dict]:
        """Handle spending summary request"""
        period = entities.get("period", "month")
        response = f"Fetching your spending summary for the last {period}..."
        session.add_to_history(user_text, "spending_summary", response)
        return response, {"action": "spending_summary", "period": period}
    
    def _handle_category_spending(self, session: DialogueState, user_text: str, entities: Dict) -> Tuple[str, Dict]:
        """Handle category-specific spending inquiry"""
        category = entities.get("category", "all")
        period = entities.get("period", "month")
        response = f"Fetching your {category} spending for the last {period}..."
        session.add_to_history(user_text, "category_spending", response)
        return response, {"action": "category_spending", "category": category, "period": period}
    
    def _handle_view_notifications(self, session: DialogueState, user_text: str) -> Tuple[str, Dict]:
        """Handle notification viewing request"""
        response = "Fetching your notifications..."
        session.add_to_history(user_text, "view_notifications", response)
        return response, {"action": "view_notifications"}
    
    def _handle_setup_auto_pay(self, session: DialogueState, user_text: str, entities: Dict) -> Tuple[str, Dict]:
        """Handle auto-pay setup"""
        bill_type = entities.get("bill_type")
        if not bill_type:
            response = "Which bill would you like to set up auto-pay for?"
            session.pending_action = "setup_auto_pay"
            return response, {}
        
        response = f"Auto-pay has been set up for {bill_type} bills. You'll be notified before each payment."
        session.add_to_history(user_text, "setup_auto_pay", response)
        return response, {"action": "setup_auto_pay", "bill_type": bill_type}
    
    def _handle_request_chequebook(self, session: DialogueState, user_text: str) -> Tuple[str, Dict]:
        """Handle cheque book request"""
        response = "Cheque book request submitted. You'll receive it in 5-7 business days."
        session.add_to_history(user_text, "request_chequebook", response)
        return response, {"action": "request_chequebook"}
    
    def _handle_manage_card(self, session: DialogueState, user_text: str, entities: Dict) -> Tuple[str, Dict]:
        """Handle card management (block/unblock/set limit)"""
        action = entities.get("action", "view")
        card_type = entities.get("card_type", "debit")
        
        if action == "block":
            response = f"Your {card_type} card will be blocked. Please confirm."
            session.requires_confirmation = True
            session.pending_action = "block_card"
            return response, {}
        elif action == "unblock":
            response = f"Your {card_type} card has been unblocked."
        elif action == "set_limit":
            limit = entities.get("limit")
            if not limit:
                response = "What spending limit would you like to set?"
                session.pending_action = "set_card_limit"
                return response, {}
            response = f"Spending limit set to ₹{limit:,.2f} for your {card_type} card."
        else:
            response = f"Here are your {card_type} card details."
        
        session.add_to_history(user_text, "manage_card", response)
        return response, {"action": "manage_card", "card_action": action}


# Global instance
dialogue_manager = DialogueManager()

