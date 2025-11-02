# Voice Banking Assistant - Features Template (Part 2)

## 9. Account Statement

**Feature ID**: F009
**Priority**: Medium
**Category**: Advanced

### Description
Generate and email/download account statements for specific date ranges.

### User Intent Examples
```
- "Send me my account statement"
- "Account statement for last month"
- "Generate statement from January to March"
- "Download statement PDF"
```

### Entities to Extract
- `start_date`: Statement start date
- `end_date`: Statement end date
- `format`: pdf, email (optional)
- `account_type`: savings, current (optional)

### Dialogue Flow
```
User: "Send me account statement for last month"
Assistant: "I'll generate your account statement for December 2023. Would you like it via email or download?"
User: "Email"
Assistant: "Account statement for December 2023 has been sent to your registered email address. You should receive it within 2 minutes."
```

### API Endpoint Specification
```python
POST /api/banking/statement
Body: {
    "start_date": "2023-12-01",
    "end_date": "2023-12-31",
    "format": "pdf",
    "delivery_method": "email"
}

Response: {
    "statement_id": "STMT123456",
    "status": "processing",
    "estimated_delivery": "2 minutes"
}
```

### Training Data Format
```json
{
    "text": "Send me account statement for last month",
    "intent": "request_statement",
    "entities": {
        "date_range": "last_month"
    }
}
```

---

## 10. Fixed Deposit (FD) Management

**Feature ID**: F010
**Priority**: Medium
**Category**: Advanced

### Description
View FD details, maturity dates, interest earned, and create new FDs.

### User Intent Examples
```
- "Show my fixed deposits"
- "FD maturity date kya hai?"
- "How much interest did I earn on FD?"
- "Create new FD for ₹1 lakh"
- "FD ki details batao"
```

### Entities to Extract
- `fd_id`: Specific FD number (optional)
- `action`: view, create, renew (optional)
- `amount`: For new FD creation
- `duration`: FD tenure in months/years

### Dialogue Flow
```
User: "Show my fixed deposits"
Assistant: "You have 2 active Fixed Deposits:
1. FD001 - Amount: ₹1,00,000
   Maturity Date: March 15, 2024
   Interest Rate: 7.0%
   Interest Earned: ₹5,250
2. FD002 - Amount: ₹50,000
   Maturity Date: June 20, 2024
   Interest Rate: 7.2%
   Interest Earned: ₹1,800"
```

### API Endpoint Specification
```python
GET /api/banking/fixed-deposits

POST /api/banking/fixed-deposits
Body: {
    "amount": 100000.00,
    "duration_months": 12,
    "interest_rate": 7.0
}
```

### Database Schema
```sql
CREATE TABLE fixed_deposits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    fd_number VARCHAR(50) UNIQUE,
    amount FLOAT,
    duration_months INTEGER,
    interest_rate FLOAT,
    maturity_date DATE,
    interest_earned FLOAT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Training Data Format
```json
{
    "text": "Show my fixed deposits",
    "intent": "view_fd",
    "entities": {}
}
```

---

## 11. Recurring Deposits (RD)

**Feature ID**: F011
**Priority**: Medium
**Category**: Advanced

### Description
View RD accounts, installment details, maturity information.

### User Intent Examples
```
- "Show my recurring deposits"
- "RD ki details batao"
- "RD installment kitna hai?"
- "RD maturity kab hai?"
```

### Training Data Format
```json
{
    "text": "Show my recurring deposits",
    "intent": "view_rd",
    "entities": {}
}
```

---

## 12. Cheque Book Request

**Feature ID**: F012
**Priority**: Low
**Category**: Advanced

### Description
Request new cheque book, track delivery status.

### User Intent Examples
```
- "Request cheque book"
- "Cheque book kaise order karu?"
- "Cheque book delivery status"
```

### Training Data Format
```json
{
    "text": "Request cheque book",
    "intent": "request_chequebook",
    "entities": {
        "account_number": null
    }
}
```

---

## 13. Debit/Credit Card Management

**Feature ID**: F013
**Priority**: High
**Category**: Advanced

### Description
Block/unblock cards, view card details, set spending limits, view card transactions.

### User Intent Examples
```
- "Block my debit card"
- "Card transactions dikhao"
- "Set card spending limit to ₹50000"
- "Unblock my credit card"
- "Card ko block karo"
```

### Entities to Extract
- `card_type`: debit, credit
- `action`: block, unblock, view, set_limit
- `limit_amount`: New spending limit

### Dialogue Flow
```
User: "Block my debit card"
Assistant: "This will immediately block your debit card ending in 1234. All transactions will be declined. Please confirm."
User: "Yes"
Assistant: "Your debit card has been blocked successfully. You can unblock it anytime or request a new card."
```

### API Endpoint Specification
```python
POST /api/banking/cards/{card_id}/block
POST /api/banking/cards/{card_id}/unblock
POST /api/banking/cards/{card_id}/set-limit
Body: {
    "spending_limit": 50000.00,
    "otp": "123456"
}
```

### Database Schema
```sql
CREATE TABLE cards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    card_number VARCHAR(16),
    card_type VARCHAR(10),
    status VARCHAR(20) DEFAULT 'active',
    spending_limit FLOAT,
    expiry_date DATE,
    is_blocked BOOLEAN DEFAULT false
);
```

### Security Requirements
- OTP for blocking/unblocking
- Immediate card blocking
- Notification to user

### Training Data Format
```json
{
    "text": "Block my debit card",
    "intent": "manage_card",
    "entities": {
        "card_type": "debit",
        "action": "block"
    },
    "context": {
        "requires_confirmation": true
    }
}
```

---

## 14. Beneficiary Management

**Feature ID**: F014
**Priority**: High
**Category**: Advanced

### Description
Add, view, update, and delete saved beneficiaries for quick transfers.

### User Intent Examples
```
- "Add beneficiary Akash"
- "Show my beneficiaries"
- "Delete beneficiary Rahul"
- "Update beneficiary Priya's account"
- "Beneficiary list dikhao"
```

### Entities to Extract
- `action`: add, view, delete, update
- `beneficiary_name`: Name of beneficiary
- `account_number`: Account number
- `ifsc_code`: IFSC code
- `nickname`: Short name for beneficiary

### Dialogue Flow
```
User: "Add beneficiary Akash"
Assistant: "Please provide Akash's account number."
User: "9876543210"
Assistant: "Please provide the IFSC code."
User: "SBIN0001234"
Assistant: "Beneficiary Akash has been added successfully. You can now transfer money using 'Transfer to Akash'."
```

### API Endpoint Specification
```python
POST /api/banking/beneficiaries
Body: {
    "name": "Akash",
    "account_number": "9876543210",
    "ifsc_code": "SBIN0001234",
    "nickname": "Akash",
    "account_type": "savings"
}

GET /api/banking/beneficiaries
DELETE /api/banking/beneficiaries/{id}
```

### Database Schema
```sql
CREATE TABLE beneficiaries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100),
    account_number VARCHAR(20),
    ifsc_code VARCHAR(11),
    nickname VARCHAR(50),
    account_type VARCHAR(20),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Security Requirements
- OTP verification for adding beneficiaries
- Beneficiary verification process
- Limit on number of beneficiaries

### Training Data Format
```json
{
    "text": "Add beneficiary Akash",
    "intent": "manage_beneficiary",
    "entities": {
        "action": "add",
        "beneficiary_name": "Akash"
    },
    "context": {
        "requires_account_details": true,
        "requires_otp": true
    }
}
```

---

## 15. UPI Transactions

**Feature ID**: F015
**Priority**: High
**Category**: Advanced

### Description
Make UPI payments, check UPI balance, view UPI transaction history.

### User Intent Examples
```
- "Pay ₹500 via UPI to 9876543210@paytm"
- "UPI balance kya hai?"
- "UPI transactions dikhao"
- "Send money to Priya@upi"
```

### Entities to Extract
- `amount`: Payment amount
- `upi_id`: Recipient UPI ID
- `action`: pay, check_balance, view_history

### Training Data Format
```json
{
    "text": "Pay ₹500 via UPI to 9876543210@paytm",
    "intent": "upi_payment",
    "entities": {
        "amount": "500",
        "upi_id": "9876543210@paytm"
    },
    "context": {
        "requires_confirmation": true,
        "requires_otp": true
    }
}
```

---

## 16. Investment Inquiries

**Feature ID**: F016
**Priority**: Low
**Category**: Advanced

### Description
View investment portfolio, mutual fund details, SIP information.

### User Intent Examples
```
- "Show my investments"
- "Mutual fund portfolio dikhao"
- "SIP details batao"
```

### Training Data Format
```json
{
    "text": "Show my investments",
    "intent": "view_investments",
    "entities": {}
}
```

---

## 17. Insurance Inquiries

**Feature ID**: F017
**Priority**: Low
**Category**: Advanced

### Description
View insurance policies, premium due dates, coverage details.

### User Intent Examples
```
- "Show my insurance policies"
- "Insurance premium kab due hai?"
- "Life insurance details"
```

### Training Data Format
```json
{
    "text": "Show my insurance policies",
    "intent": "view_insurance",
    "entities": {}
}
```

---

## 18. Tax & TDS Information

**Feature ID**: F018
**Priority**: Medium
**Category**: Advanced

### Description
View TDS certificates, tax statements, form 26AS information.

### User Intent Examples
```
- "Show my TDS certificate"
- "Form 26AS download karo"
- "Tax statement for last year"
```

### Training Data Format
```json
{
    "text": "Show my TDS certificate",
    "intent": "view_tax_info",
    "entities": {
        "document_type": "tds_certificate"
    }
}
```

---

## 19. Branch Locator

**Feature ID**: F019
**Priority**: Low
**Category**: Advanced

### Description
Find nearby bank branches, ATMs, working hours.

### User Intent Examples
```
- "Find nearest branch"
- "ATM near me"
- "Branch timings"
- "Nearest branch kahan hai?"
```

### Entities to Extract
- `location`: user location (optional, use GPS)
- `search_type`: branch, atm, both
- `radius`: Search radius in km

### Training Data Format
```json
{
    "text": "Find nearest branch",
    "intent": "locate_branch",
    "entities": {
        "search_type": "branch"
    },
    "context": {
        "requires_location": true
    }
}
```

---

## 20. Customer Support

**Feature ID**: F020
**Priority**: High
**Category**: Advanced

### Description
Connect to customer support, raise complaints, track complaint status.

### User Intent Examples
```
- "I want to talk to customer support"
- "Raise a complaint"
- "Complaint status check"
- "Help me with account issue"
```

### Entities to Extract
- `complaint_type`: account, card, transaction, other
- `description`: Complaint details
- `priority`: low, medium, high

### Training Data Format
```json
{
    "text": "I want to talk to customer support",
    "intent": "customer_support",
    "entities": {
        "action": "connect"
    },
    "context": {
        "requires_connection": true
    }
}
```

---

## 21. Voice Biometric Authentication

**Feature ID**: F021
**Priority**: High
**Category**: Security

### Description
Authenticate users using voice biometrics for secure transactions.

### User Intent Examples
- Implicit (automatic during sensitive operations)

### Implementation
- Voice enrollment process
- Voice verification for transactions
- Fallback to OTP if voice verification fails

### Training Data Format
```json
{
    "feature": "voice_biometric",
    "requires_enrollment": true,
    "verification_threshold": 0.85,
    "fallback_method": "otp"
}
```

---

## 22. Transaction Limits Management

**Feature ID**: F022
**Priority**: Medium
**Category**: Security

### Description
View and update transaction limits for different operations.

### User Intent Examples
```
- "What's my daily transfer limit?"
- "Increase my transaction limit"
- "Set transfer limit to ₹1 lakh"
```

### Training Data Format
```json
{
    "text": "What's my daily transfer limit?",
    "intent": "check_transaction_limits",
    "entities": {
        "limit_type": "daily_transfer"
    }
}
```

---

## 23. Fraud Alerts

**Feature ID**: F023
**Priority**: High
**Category**: Security

### Description
Set up fraud alerts, suspicious transaction notifications.

### User Intent Examples
```
- "Set up fraud alerts"
- "Notify me for transactions above ₹10000"
- "Fraud alert settings"
```

### Training Data Format
```json
{
    "text": "Set up fraud alerts",
    "intent": "manage_fraud_alerts",
    "entities": {
        "action": "setup"
    }
}
```

---

## 24. Security Settings

**Feature ID**: F024
**Priority**: Medium
**Category**: Security

### Description
Manage security settings, change passwords, update contact information.

### User Intent Examples
```
- "Change my password"
- "Update mobile number"
- "Security settings dikhao"
```

### Training Data Format
```json
{
    "text": "Change my password",
    "intent": "manage_security",
    "entities": {
        "action": "change_password"
    },
    "context": {
        "requires_otp": true,
        "requires_voice_pin": true
    }
}
```

---

## 25. Transaction Alerts

**Feature ID**: F025
**Priority**: Medium
**Category**: Notifications

### Description
Configure transaction alerts, notification preferences.

### User Intent Examples
```
- "Turn on transaction alerts"
- "Alert settings"
- "Notify me for all transactions"
```

### Training Data Format
```json
{
    "text": "Turn on transaction alerts",
    "intent": "manage_alerts",
    "entities": {
        "alert_type": "transaction",
        "action": "enable"
    }
}
```

---

## 26. Balance Alerts

**Feature ID**: F026
**Priority**: Low
**Category**: Notifications

### Description
Set balance threshold alerts (low balance, high balance notifications).

### User Intent Examples
```
- "Alert me when balance is below ₹5000"
- "Notify if balance exceeds ₹1 lakh"
```

### Training Data Format
```json
{
    "text": "Alert me when balance is below ₹5000",
    "intent": "set_balance_alert",
    "entities": {
        "threshold": "5000",
        "alert_type": "low_balance"
    }
}
```

---

## 27. Payment Due Reminders

**Feature ID**: F027
**Priority**: Medium
**Category**: Notifications

### Description
Automatic reminders for EMIs, bills, credit card payments.

### User Intent Examples
```
- "Remind me 3 days before EMI due"
- "Payment reminder settings"
```

### Training Data Format
```json
{
    "text": "Remind me 3 days before EMI due",
    "intent": "configure_payment_reminders",
    "entities": {
        "days_before": "3",
        "payment_type": "emi"
    }
}
```

---

## Training Data Collection Template

### Format for Intent Training Data

```json
{
    "id": "unique_id",
    "text": "user utterance",
    "intent": "intent_name",
    "entities": {
        "entity_name": "extracted_value",
        "entity_name2": null
    },
    "context": {
        "requires_confirmation": false,
        "requires_otp": false,
        "previous_intent": null
    },
    "response_template": "Response template with {variables}",
    "language": "en",
    "variant": "standard"  // or "paraphrase", "translation"
}
```

### Example Dataset Entry

```json
{
    "id": "F002_001",
    "text": "Transfer ₹5000 to Akash",
    "intent": "transfer_funds",
    "entities": {
        "amount": "5000",
        "recipient_name": "Akash",
        "transfer_type": null
    },
    "context": {
        "requires_confirmation": true,
        "requires_otp": true
    },
    "response_template": "Please confirm: Transfer ₹{amount} to {recipient}.",
    "language": "en",
    "variant": "standard"
}
```

### Multi-language Example

```json
{
    "id": "F002_002",
    "text": "Akash ko ₹5000 bhejo",
    "intent": "transfer_funds",
    "entities": {
        "amount": "5000",
        "recipient_name": "Akash"
    },
    "language": "hi",
    "variant": "translation"
}
```

---

## Next Steps for Implementation

1. **Phase 1 (Weeks 1-2)**: Implement Core Features (F001-F008)
2. **Phase 2 (Weeks 3-4)**: Implement Advanced Features (F009-F015)
3. **Phase 3 (Weeks 5-6)**: Security Features (F021-F024)
4. **Phase 4 (Weeks 7-8)**: Notifications & Alerts (F025-F027)
5. **Ongoing**: Collect training data, fine-tune models, iterate

---

## Data Collection Strategy

1. **Start with Banking77**: Base dataset for intent classification
2. **Collect Real Queries**: From customer service logs
3. **Paraphrase Generation**: Use GPT/LLMs to create variations
4. **Translation**: Create Hindi/regional language versions
5. **Continuous Collection**: Monitor production, collect user queries

---

**Total Features**: 27
**Core Features**: 8
**Advanced Features**: 12
**Security Features**: 4
**Notification Features**: 3

