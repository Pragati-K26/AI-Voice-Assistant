"""
Script to create mapping from Banking77 intents to application banking intents
"""
import json
import os
import pandas as pd

# Mapping from Banking77 intents to application intents
BANKING77_TO_APP_INTENT = {
    # Balance related
    "balance": "check_balance",
    "check_balance": "check_balance",
    
    # Transfer related
    "transfer": "transfer_funds",
    "transfer_not_received": "transfer_funds",
    "transfer_timing": "transfer_funds",
    
    # Transaction related
    "transaction_history": "view_transactions",
    "transactions": "view_transactions",
    "recent_transactions": "view_transactions",
    
    # Loan related
    "loan": "loan_inquiry",
    "loan_application": "loan_inquiry",
    "loan_approval": "loan_inquiry",
    
    # Interest related
    "interest_rate": "interest_inquiry",
    "interest_charge": "interest_inquiry",
    
    # Credit card related
    "card_payment_fee_charged": "credit_limit_inquiry",
    "card_declined": "credit_limit_inquiry",
    "credit_limit_change": "credit_limit_inquiry",
    "credit_limit": "credit_limit_inquiry",
    
    # Reminders and alerts
    "reminder": "set_reminder",
    "payment_not_working": "payment_alert",
    "payment_issue": "payment_alert",
    
    # Spending
    "spending_history": "spending_summary",
    "expense": "spending_summary",
    
    # Notifications
    "notification": "view_notifications",
    "alerts": "view_notifications",
    
    # Card management
    "card_arrival": "manage_card",
    "card_linking": "manage_card",
    "card_payment_wrong_exchange_rate": "manage_card",
    "card_swallowed": "manage_card",
    "card_accepting": "manage_card",
    
    # Default mappings for common patterns
    "greeting": "greeting",
    "goodbye": "goodbye",
}

def load_banking77_labels(data_dir="banking77data"):
    """Load unique Banking77 labels from dataset"""
    possible_paths = [
        os.path.join(data_dir, "banking77_train.csv"),
        os.path.join("..", data_dir, "banking77_train.csv"),
        os.path.join(".", data_dir, "banking77_train.csv"),
    ]
    
    train_path = None
    for path in possible_paths:
        if os.path.exists(path):
            train_path = path
            break
    
    if not train_path:
        print("Warning: Could not find Banking77 dataset. Using default mapping.")
        return []
    
    df = pd.read_csv(train_path)
    
    if 'label_text' in df.columns:
        unique_labels = sorted(df['label_text'].unique())
    elif 'label' in df.columns:
        # Need to get label names from somewhere
        unique_labels = []
    else:
        unique_labels = []
    
    return unique_labels

def create_intent_mapping(data_dir="banking77data", output_path="banking77data/intent_mapping.json"):
    """Create comprehensive intent mapping"""
    print("Creating intent mapping from Banking77 to application intents...")
    
    banking77_labels = load_banking77_labels(data_dir)
    
    # Application intents
    app_intents = [
        "check_balance", "transfer_funds", "view_transactions", "loan_inquiry",
        "interest_inquiry", "credit_limit_inquiry", "set_reminder", "payment_alert",
        "spending_summary", "category_spending", "fraud_alert", "view_notifications",
        "setup_auto_pay", "request_chequebook", "manage_card", "greeting", "goodbye", "other"
    ]
    
    # Create mapping
    mapping = {}
    unmapped = []
    
    for label in banking77_labels:
        label_lower = label.lower().replace(" ", "_").replace("-", "_")
        
        # Try exact match
        if label_lower in BANKING77_TO_APP_INTENT:
            mapping[label] = BANKING77_TO_APP_INTENT[label_lower]
        else:
            # Try partial match
            matched = False
            for key, value in BANKING77_TO_APP_INTENT.items():
                if key in label_lower or label_lower in key:
                    mapping[label] = value
                    matched = True
                    break
            
            if not matched:
                # Try keyword matching
                if "balance" in label_lower:
                    mapping[label] = "check_balance"
                elif "transfer" in label_lower:
                    mapping[label] = "transfer_funds"
                elif "transaction" in label_lower or "history" in label_lower:
                    mapping[label] = "view_transactions"
                elif "loan" in label_lower:
                    mapping[label] = "loan_inquiry"
                elif "interest" in label_lower:
                    mapping[label] = "interest_inquiry"
                elif "credit" in label_lower or "card" in label_lower:
                    if "limit" in label_lower:
                        mapping[label] = "credit_limit_inquiry"
                    else:
                        mapping[label] = "manage_card"
                elif "payment" in label_lower or "bill" in label_lower:
                    mapping[label] = "payment_alert"
                elif "spend" in label_lower or "expense" in label_lower:
                    mapping[label] = "spending_summary"
                elif "notification" in label_lower or "alert" in label_lower:
                    mapping[label] = "view_notifications"
                elif "reminder" in label_lower:
                    mapping[label] = "set_reminder"
                else:
                    mapping[label] = "other"
                    unmapped.append(label)
    
    # Save mapping
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w") as f:
        json.dump({
            "banking77_to_app": mapping,
            "app_intents": app_intents,
            "banking77_labels": banking77_labels,
            "unmapped_labels": unmapped
        }, f, indent=2)
    
    print(f"[OK] Intent mapping created: {output_path}")
    print(f"  - Mapped {len(mapping)} Banking77 intents")
    print(f"  - Unmapped labels: {len(unmapped)}")
    if unmapped:
        print(f"  - Unmapped: {unmapped[:10]}...")
    
    return mapping

if __name__ == "__main__":
    create_intent_mapping()

