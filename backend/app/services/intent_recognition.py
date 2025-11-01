"""
Intent Recognition service using BERT-based models
"""
from typing import Dict, List, Optional, Tuple
import logging
import re

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
    "greeting": 8,
    "goodbye": 9,
    "other": 10
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
    "payment_alert": ["alert", "notification", "payment reminder"]
}


class IntentRecognitionService:
    """Service for recognizing user intent from text"""
    
    def __init__(self):
        self.tokenizer = None
        self.model = None
        self.device = "cpu"
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
            # Using DistilBERT for faster inference
            model_name = "distilbert-base-uncased"
            logger.info(f"Loading intent model: {model_name}")
            
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            # For production, you should fine-tune on Banking77 dataset
            # For now, using a pre-trained model as base
            self.model = AutoModelForSequenceClassification.from_pretrained(
                model_name,
                num_labels=len(BANKING_INTENTS)
            )
            self.model.to(self.device)
            self.model.eval()
            logger.info("Intent model loaded successfully")
        except Exception as e:
            logger.warning(f"Could not load model: {str(e)}. Using rule-based fallback.")
            self.model = None
    
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
            
            intent = REVERSE_INTENTS.get(predicted_class, "other")
            
            # Extract entities
            entities = self.extract_entities(text, intent)
            
            return intent, confidence, entities
            
        except Exception as e:
            logger.error(f"Error in intent recognition: {str(e)}")
            return self._rule_based_intent(text)
    
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

