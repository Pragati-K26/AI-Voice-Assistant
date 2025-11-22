"""
Intent Recognition service using BERT-based models
"""
from typing import Dict, List, Optional, Tuple
import logging
import re
import os

logger = logging.getLogger(__name__)

try:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    import torch
    import numpy as np
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logger.warning("Transformers not available. Using rule-based fallback only.")

# Banking intents mapping
BANKING_INTENTS = {
    "check_balance": 0,
    "transfer_funds": 1,
    "view_transactions": 2,
    "loan_inquiry": 3,
    "interest_inquiry": 4,
    "credit_limit_inquiry": 5,
    "set_reminder": 6,
    "payment_alert": 7,
    "spending_summary": 8,
    "category_spending": 9,
    "fraud_alert": 10,
    "view_notifications": 11,
    "setup_auto_pay": 12,
    "request_chequebook": 13,
    "manage_card": 14,
    "greeting": 15,
    "goodbye": 16,
    "other": 17
}

REVERSE_INTENTS = {v: k for k, v in BANKING_INTENTS.items()}

# Intent keywords for rule-based fallback
INTENT_KEYWORDS = {
    "check_balance": ["balance", "account balance", "how much", "money in account"],
    "transfer_funds": ["transfer", "send money", "pay", "send to"],
    "view_transactions": ["transactions", "history", "statement", "recent payments"],
    "loan_inquiry": ["loan", "loan amount", "loan balance", "borrow"],
    "interest_inquiry": ["interest", "interest rate", "rate of interest"],
    "credit_limit_inquiry": ["credit limit", "credit card limit", "limit"],
    "set_reminder": ["reminder", "remind me", "alert"],
    "payment_alert": ["alert", "notification", "payment reminder"],
    "spending_summary": ["spending", "expenses", "how much spent", "spending summary", "expense report"],
    "category_spending": ["spend on food", "spent on", "expenses for", "how much on"],
    "fraud_alert": ["fraud", "suspicious", "unusual", "fraudulent"],
    "view_notifications": ["notifications", "alerts", "notify me", "show alerts"],
    "setup_auto_pay": ["auto pay", "automatic payment", "auto bill", "recurring payment"],
    "request_chequebook": ["cheque book", "chequebook", "request cheque", "order cheque"],
    "manage_card": ["block card", "unblock card", "card limit", "card settings"]
}


class IntentRecognitionService:
    """Service for recognizing user intent from text"""
    
    def __init__(self):
        self.tokenizer = None
        self.model = None
        self.device = "cpu"
        self.banking77_mapping = {}  # Mapping from Banking77 labels to app intents
        self.label_to_text = {}  # Mapping from label index to label text
        if TRANSFORMERS_AVAILABLE:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            self.load_model()
        else:
            logger.info("Using rule-based intent recognition (transformers not installed)")
    
    def load_model(self):
        """Load pre-trained BERT model for intent classification"""
        if not TRANSFORMERS_AVAILABLE:
            return
        try:
            # Try to load fine-tuned Banking77 model first
            model_paths = [
                "./models/banking77-intent",
                "../models/banking77-intent",
                "models/banking77-intent",
                os.path.join(os.path.dirname(__file__), "../../models/banking77-intent"),
            ]
            
            model_loaded = False
            for model_path in model_paths:
                if os.path.exists(model_path) and os.path.exists(os.path.join(model_path, "config.json")):
                    logger.info(f"Loading fine-tuned Banking77 model from: {model_path}")
                    try:
                        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
                        self.model = AutoModelForSequenceClassification.from_pretrained(model_path)
                        
                        # Load intent mapping if available
                        mapping_file = os.path.join(model_path, "intent_mapping.json")
                        if os.path.exists(mapping_file):
                            import json
                            with open(mapping_file, "r") as f:
                                mapping_data = json.load(f)
                                self.banking77_mapping = mapping_data.get("banking77_to_app", {})
                                logger.info(f"Loaded intent mapping with {len(self.banking77_mapping)} mappings")
                        else:
                            self.banking77_mapping = {}
                        
                        # Load label mapping if available
                        label_mapping_file = os.path.join(model_path, "..", "label_mapping.json")
                        if not os.path.exists(label_mapping_file):
                            label_mapping_file = os.path.join(os.path.dirname(model_path), "label_mapping.json")
                        if os.path.exists(label_mapping_file):
                            import json
                            with open(label_mapping_file, "r") as f:
                                self.label_to_text = json.load(f)
                                logger.info(f"Loaded label mapping with {len(self.label_to_text)} labels")
                        else:
                            self.label_to_text = {}
                        
                        self.model.to(self.device)
                        self.model.eval()
                        model_loaded = True
                        logger.info("✓ Fine-tuned Banking77 model loaded successfully")
                        break
                    except Exception as e:
                        logger.warning(f"Could not load model from {model_path}: {e}")
                        continue
            
            if not model_loaded:
                # Fallback to base model
                model_name = "distilbert-base-uncased"
                logger.info(f"Fine-tuned model not found. Loading base model: {model_name}")
                logger.warning("Consider training the model with Banking77 dataset for better accuracy")
                
                self.tokenizer = AutoTokenizer.from_pretrained(model_name)
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    model_name,
                    num_labels=len(BANKING_INTENTS)
                )
                self.banking77_mapping = {}
                self.label_to_text = {}
                self.model.to(self.device)
                self.model.eval()
                logger.info("Base intent model loaded successfully")
        except Exception as e:
            logger.warning(f"Could not load model: {str(e)}. Using rule-based fallback.")
            self.model = None
            self.banking77_mapping = {}
            self.label_to_text = {}
    
    def extract_entities(self, text: str, intent: str) -> Dict:
        """
        Extract entities from text based on intent
        
        Args:
            text: User input text
            intent: Detected intent
        
        Returns:
            Dictionary with extracted entities
        """
        entities = {}
        
        # Extract amount
        amount_patterns = [
            r'(?:₹|rs\.?|rupees?)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:₹|rs\.?|rupees?)',
            r'amount\s*(?:of\s*)?(?:₹|rs\.?|rupees?)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)'
        ]
        for pattern in amount_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                amount_str = match.group(1).replace(',', '')
                entities["amount"] = float(amount_str)
                break
        
        # Extract recipient name for transfers
        if intent == "transfer_funds":
            # Simple pattern: "to [Name]" or "transfer [amount] to [Name]"
            to_patterns = [
                r'(?:to|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
                r'transfer.*?to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            ]
            for pattern in to_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    entities["recipient_name"] = match.group(1)
                    break
        
        # Extract category for spending queries
        if intent == "category_spending":
            category_patterns = [
                r'(?:spent|spend|expenses?)\s+(?:on|for)\s+(\w+)',
                r'(\w+)\s+(?:spending|expenses?)',
            ]
            for pattern in category_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    entities["category"] = match.group(1).lower()
                    break
        
        # Extract period for spending queries
        if intent in ["spending_summary", "category_spending"]:
            period_patterns = [
                r'(?:last|past)\s+(?:week|month|year)',
                r'this\s+(?:week|month|year)',
            ]
            text_lower = text.lower()
            if "last month" in text_lower or "past month" in text_lower:
                entities["period"] = "last_month"
            elif "last week" in text_lower or "past week" in text_lower:
                entities["period"] = "last_week"
            elif "last year" in text_lower or "past year" in text_lower:
                entities["period"] = "last_year"
            elif "this month" in text_lower:
                entities["period"] = "month"
            elif "this week" in text_lower:
                entities["period"] = "week"
        
        # Extract bill type for auto-pay
        if intent == "setup_auto_pay":
            bill_types = ["electricity", "phone", "water", "internet", "gas"]
            text_lower = text.lower()
            for bill_type in bill_types:
                if bill_type in text_lower:
                    entities["bill_type"] = bill_type
                    break
        
        # Extract card action
        if intent == "manage_card":
            text_lower = text.lower()
            if "block" in text_lower:
                entities["action"] = "block"
            elif "unblock" in text_lower:
                entities["action"] = "unblock"
            elif "limit" in text_lower:
                entities["action"] = "set_limit"
            
            if "debit" in text_lower:
                entities["card_type"] = "debit"
            elif "credit" in text_lower:
                entities["card_type"] = "credit"
        
        # Extract account number
        account_pattern = r'(?:account\s*)?(?:number\s*)?(\d{4,16})'
        match = re.search(account_pattern, text, re.IGNORECASE)
        if match:
            entities["account_number"] = match.group(1)
        
        return entities
    
    def recognize_intent(self, text: str) -> Tuple[str, float, Dict]:
        """
        Recognize intent from user text
        
        Args:
            text: User input text
        
        Returns:
            Tuple of (intent, confidence, entities)
        """
        if self.model is None:
            # Fallback to rule-based
            return self._rule_based_intent(text)
        
        try:
            # Tokenize and predict
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            ).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                probabilities = torch.softmax(logits, dim=-1)
                predicted_class = torch.argmax(probabilities, dim=-1).item()
                confidence = probabilities[0][predicted_class].item()
            
            # Map Banking77 intent to application intent
            if self.label_to_text and predicted_class in self.label_to_text:
                banking77_intent = self.label_to_text[predicted_class]
                # Map to application intent
                if banking77_intent in self.banking77_mapping:
                    intent = self.banking77_mapping[banking77_intent]
                else:
                    # Try to infer from Banking77 intent name
                    intent = self._map_banking77_intent(banking77_intent)
            else:
                # Fallback to direct mapping (for base model)
                intent = REVERSE_INTENTS.get(predicted_class, "other")
            
            # Extract entities
            entities = self.extract_entities(text, intent)
            
            return intent, confidence, entities
            
        except Exception as e:
            logger.error(f"Error in intent recognition: {str(e)}")
            return self._rule_based_intent(text)
    
    def _map_banking77_intent(self, banking77_intent: str) -> str:
        """Map Banking77 intent to application intent"""
        intent_lower = banking77_intent.lower().replace(" ", "_").replace("-", "_")
        
        # Keyword-based mapping
        if "balance" in intent_lower:
            return "check_balance"
        elif "transfer" in intent_lower:
            return "transfer_funds"
        elif "transaction" in intent_lower or "history" in intent_lower:
            return "view_transactions"
        elif "loan" in intent_lower:
            return "loan_inquiry"
        elif "interest" in intent_lower:
            return "interest_inquiry"
        elif "credit" in intent_lower or "card" in intent_lower:
            if "limit" in intent_lower:
                return "credit_limit_inquiry"
            else:
                return "manage_card"
        elif "payment" in intent_lower or "bill" in intent_lower:
            return "payment_alert"
        elif "spend" in intent_lower or "expense" in intent_lower:
            return "spending_summary"
        elif "notification" in intent_lower or "alert" in intent_lower:
            return "view_notifications"
        elif "reminder" in intent_lower:
            return "set_reminder"
        elif "greeting" in intent_lower or "hello" in intent_lower:
            return "greeting"
        elif "goodbye" in intent_lower or "bye" in intent_lower:
            return "goodbye"
        else:
            return "other"
    
    def _rule_based_intent(self, text: str) -> Tuple[str, float, Dict]:
        """Fallback rule-based intent recognition"""
        text_lower = text.lower()
        
        # Check for keywords
        for intent, keywords in INTENT_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text_lower:
                    entities = self.extract_entities(text, intent)
                    return intent, 0.8, entities
        
        # Check for greetings
        greetings = ["hello", "hi", "hey", "good morning", "good afternoon"]
        if any(g in text_lower for g in greetings):
            return "greeting", 0.9, {}
        
        # Default
        entities = self.extract_entities(text, "other")
        return "other", 0.5, entities


# Global instance - lazy initialization
_intent_service = None

def get_intent_service():
    """Get or create intent service instance (lazy initialization)"""
    global _intent_service
    if _intent_service is None:
        try:
            _intent_service = IntentRecognitionService()
        except Exception as e:
            logger.warning(f"Failed to initialize intent service: {e}. Using rule-based fallback only.")
            # Create a minimal service that only uses rule-based
            _intent_service = IntentRecognitionService()
            _intent_service.model = None
            _intent_service.tokenizer = None
    return _intent_service

# Backward compatibility - will be initialized on first access
class IntentServiceProxy:
    def __getattr__(self, name):
        return getattr(get_intent_service(), name)

intent_service = IntentServiceProxy()

