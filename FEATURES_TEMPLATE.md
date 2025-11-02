# Voice Banking Assistant - Complete Features Template

This document provides detailed templates for all features that can be implemented in the AI Voice Banking Assistant. Each template includes:
- Feature description
- User intent examples
- Entity extraction requirements
- Dialogue flows
- API specifications
- Data requirements
- Training data format

---

## Table of Contents

### Core Banking Features
1. [Account Balance Inquiry](#1-account-balance-inquiry)
2. [Fund Transfer](#2-fund-transfer)
3. [Transaction History](#3-transaction-history)
4. [Loan Inquiry & Management](#4-loan-inquiry--management)
5. [Interest Rate Inquiry](#5-interest-rate-inquiry)
6. [Credit Limit Inquiry](#6-credit-limit-inquiry)
7. [Payment Reminders](#7-payment-reminders)
8. [Bill Payments](#8-bill-payments)

### Advanced Features
9. [Account Statement](#9-account-statement)
10. [Fixed Deposit (FD) Management](#10-fixed-deposit-fd-management)
11. [Recurring Deposits (RD)](#11-recurring-deposits-rd)
12. [Cheque Book Request](#12-cheque-book-request)
13. [Debit/Credit Card Management](#13-debitcredit-card-management)
14. [Beneficiary Management](#14-beneficiary-management)
15. [UPI Transactions](#15-upi-transactions)
16. [Investment Inquiries](#16-investment-inquiries)
17. [Insurance Inquiries](#17-insurance-inquiries)
18. [Tax & TDS Information](#18-tax--tds-information)
19. [Branch Locator](#19-branch-locator)
20. [Customer Support](#20-customer-support)

### Security & Authentication Features
21. [Voice Biometric Authentication](#21-voice-biometric-authentication)
22. [Transaction Limits Management](#22-transaction-limits-management)
23. [Fraud Alerts](#23-fraud-alerts)
24. [Security Settings](#24-security-settings)

### Notification & Alerts
25. [Transaction Alerts](#25-transaction-alerts)
26. [Balance Alerts](#26-balance-alerts)
27. [Payment Due Reminders](#27-payment-due-reminders)

---

## Feature Template Structure

Each feature follows this template:

```markdown
### Feature Name

**Feature ID**: [ID]
**Priority**: [High/Medium/Low]
**Category**: [Core/Advanced/Security]

#### Description
[Feature description]

#### User Intent Examples
[Sample user utterances]

#### Entities to Extract
[List of entities]

#### Dialogue Flow
[Multi-turn conversation flow]

#### API Endpoint Specification
[Backend API details]

#### Database Schema
[Required database tables/fields]

#### Security Requirements
[Security measures needed]

#### Training Data Format
[Format for training data]

#### Test Cases
[Test scenarios]
```

---

## 1. Account Balance Inquiry

**Feature ID**: F001
**Priority**: High
**Category**: Core

### Description
Allow users to check their account balance, available balance, and account details through voice commands.

### User Intent Examples
```
- "What's my account balance?"
- "Check my balance"
- "How much money do I have?"
- "Show me my current balance"
- "What's the balance in my savings account?"
- "Account balance kya hai?"
- "Mere account mein kitna paisa hai?"
```

### Entities to Extract
- `account_type` (optional): savings, current, salary, etc.
- `account_number` (optional): if user has multiple accounts

### Dialogue Flow
```
User: "Check my balance"
Assistant: "Your current account balance is ₹50,000.00. Available balance is ₹49,500.00."
```

Or:
```
User: "What's my balance?"
Assistant: "You have 2 accounts. Which account would you like to check?"
User: "Savings"
Assistant: "Your savings account balance is ₹50,000.00"
```

### API Endpoint Specification
```python
GET /api/banking/balance
Headers: Authorization: Bearer <token>

Response:
{
    "balance": 50000.00,
    "available_balance": 49500.00,
    "currency": "INR",
    "account_number": "ACC001234567",
    "account_type": "savings",
    "last_updated": "2024-01-15T10:30:00Z"
}
```

### Database Schema
```sql
-- Uses existing users table
ALTER TABLE users ADD COLUMN available_balance FLOAT DEFAULT 0.0;
```

### Security Requirements
- JWT authentication required
- Voice PIN verification for sensitive operations
- Log balance inquiries for audit

### Training Data Format
```json
{
    "text": "What's my account balance?",
    "intent": "check_balance",
    "entities": {},
    "context": {},
    "response_template": "Your current account balance is ₹{balance}."
}
```

### Test Cases
1. Single account user - direct balance display
2. Multiple accounts - prompt for account selection
3. Low balance - show warning message
4. Invalid token - return 401 error
5. No account found - error message

---

## 2. Fund Transfer

**Feature ID**: F002
**Priority**: High
**Category**: Core

### Description
Enable users to transfer funds to other accounts using voice commands. Supports both bank transfers and UPI transfers.

### User Intent Examples
```
- "Transfer ₹5000 to Akash"
- "Send money to account number 123456789"
- "Pay ₹2000 to Rahul"
- "Transfer funds to SBI account 987654321"
- "Akash ko ₹5000 bhejo"
- "Rahul ke account mein ₹2000 transfer karo"
- "Send ₹10000 to beneficiary Priya"
```

### Entities to Extract
- `amount`: Transfer amount (required)
- `recipient_name`: Name of recipient (optional)
- `recipient_account`: Account number or UPI ID (optional)
- `transfer_type`: NEFT, IMPS, UPI, RTGS (optional, default: IMPS)
- `beneficiary_id`: If using saved beneficiary (optional)

### Dialogue Flow
```
User: "Transfer ₹5000 to Akash"
Assistant: "Please confirm: Transfer ₹5,000 to Akash. Say 'yes' to confirm or 'no' to cancel."
User: "Yes"
Assistant: "Please provide the 6-digit OTP sent to your registered mobile number to complete the transfer."
User: "123456"
Assistant: "₹5,000 has been successfully transferred to Akash. Transaction ID: TXN123456. Your new balance is ₹45,000."
```

Multi-turn for missing information:
```
User: "Transfer money to Akash"
Assistant: "How much would you like to transfer?"
User: "₹5000"
Assistant: "Please confirm: Transfer ₹5,000 to Akash..."
```

### API Endpoint Specification
```python
POST /api/banking/transfer
Headers: Authorization: Bearer <token>
Body: {
    "amount": 5000.00,
    "recipient_name": "Akash",
    "recipient_account": "ACC987654321",
    "transfer_type": "IMPS",
    "beneficiary_id": null,
    "otp": "123456",
    "remarks": "Payment for services"
}

Response:
{
    "transaction_id": "TXN123456",
    "status": "completed",
    "amount": 5000.00,
    "recipient": "Akash",
    "new_balance": 45000.00,
    "timestamp": "2024-01-15T10:35:00Z"
}
```

### Database Schema
```sql
-- Uses existing transactions table
-- Additional fields if needed:
ALTER TABLE transactions ADD COLUMN transfer_type VARCHAR(10);
ALTER TABLE transactions ADD COLUMN ifsc_code VARCHAR(11);
ALTER TABLE transactions ADD COLUMN upi_id VARCHAR(50);
```

### Security Requirements
- OTP verification mandatory
- Voice PIN for high-value transactions (>₹10,000)
- Transaction limits per day/month
- Fraud detection checks
- Real-time transaction validation

### Training Data Format
```json
{
    "text": "Transfer ₹5000 to Akash",
    "intent": "transfer_funds",
    "entities": {
        "amount": "5000",
        "recipient_name": "Akash"
    },
    "context": {
        "requires_confirmation": true,
        "requires_otp": true
    },
    "response_template": "Please confirm: Transfer ₹{amount} to {recipient}."
}
```

### Test Cases
1. Complete transfer with all details
2. Missing amount - prompt user
3. Missing recipient - prompt user
4. Insufficient balance - error message
5. Invalid OTP - retry prompt
6. Amount exceeds daily limit - warning
7. Beneficiary not found - error

---

## 3. Transaction History

**Feature ID**: F003
**Priority**: High
**Category**: Core

### Description
Allow users to view their recent transactions, filter by date range, type, or search for specific transactions.

### User Intent Examples
```
- "Show my recent transactions"
- "What were my last 10 transactions?"
- "Show transactions from last week"
- "List all debits this month"
- "Find transaction to Akash"
- "Mere recent transactions dikhao"
- "Pichle mahine ki transactions batao"
- "Akash ko diye gaye payment dikhao"
```

### Entities to Extract
- `date_range`: last_week, last_month, today, custom (optional)
- `transaction_type`: debit, credit, all (optional)
- `limit`: number of transactions to show (optional, default: 10)
- `recipient_name`: filter by recipient (optional)
- `amount_range`: min/max amount (optional)

### Dialogue Flow
```
User: "Show my recent transactions"
Assistant: "Here are your last 10 transactions:
1. Transfer to Akash - ₹5,000 (Debit) - Jan 15, 10:35 AM
2. Salary credit - ₹50,000 (Credit) - Jan 1, 9:00 AM
3. ATM withdrawal - ₹2,000 (Debit) - Jan 14, 5:30 PM
... [continues]
Would you like to see more details about any transaction?"
```

With filters:
```
User: "Show transactions to Akash"
Assistant: "I found 3 transactions to Akash:
1. ₹5,000 - Jan 15, 2024
2. ₹3,000 - Jan 10, 2024
3. ₹2,000 - Dec 28, 2023
Total: ₹10,000"
```

### API Endpoint Specification
```python
GET /api/banking/transactions
Headers: Authorization: Bearer <token>
Query Params:
    - limit: int (default: 10)
    - offset: int (default: 0)
    - start_date: ISO date
    - end_date: ISO date
    - type: debit|credit|all
    - recipient: string
    - min_amount: float
    - max_amount: float

Response:
{
    "transactions": [
        {
            "id": 123,
            "type": "transfer",
            "amount": 5000.00,
            "recipient": "Akash",
            "description": "Transfer to Akash",
            "status": "completed",
            "date": "2024-01-15T10:35:00Z",
            "transaction_id": "TXN123456"
        }
    ],
    "total": 25,
    "limit": 10,
    "offset": 0
}
```

### Database Schema
```sql
-- Uses existing transactions table
-- Indexes for performance:
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_recipient ON transactions(recipient_name);
```

### Security Requirements
- User can only view their own transactions
- Sensitive information masking (partial account numbers)
- Rate limiting on queries

### Training Data Format
```json
{
    "text": "Show my recent transactions",
    "intent": "view_transactions",
    "entities": {
        "limit": "10",
        "date_range": "recent"
    },
    "context": {},
    "response_template": "Here are your last {limit} transactions: {transaction_list}"
}
```

### Test Cases
1. Recent transactions - default view
2. Date range filter - custom dates
3. Type filter - debit/credit only
4. Recipient search - filter by name
5. No transactions - empty state message
6. Large result set - pagination

---

## 4. Loan Inquiry & Management

**Feature ID**: F004
**Priority**: Medium
**Category**: Core

### Description
Provide information about user's loans, loan balance, EMI details, payment history, and enable EMI payments.

### User Intent Examples
```
- "What's my loan balance?"
- "How much loan do I have?"
- "When is my next EMI due?"
- "Pay my EMI"
- "Show loan payment history"
- "What's my remaining loan tenure?"
- "Mera loan balance kya hai?"
- "Next EMI kab due hai?"
- "EMI pay karni hai"
```

### Entities to Extract
- `loan_type`: personal, home, car, etc. (optional)
- `action`: check_balance, pay_emi, view_history (optional)
- `amount`: EMI payment amount (optional)

### Dialogue Flow
```
User: "What's my loan balance?"
Assistant: "You have 2 active loans:
1. Personal Loan - Remaining balance: ₹50,000
   Next EMI: ₹5,000 due on January 25, 2024
2. Home Loan - Remaining balance: ₹25,00,000
   Next EMI: ₹30,000 due on January 20, 2024
Would you like to pay any EMI?"
```

EMI Payment:
```
User: "Pay my personal loan EMI"
Assistant: "Your Personal Loan EMI of ₹5,000 is due. Please confirm payment."
User: "Yes"
Assistant: "EMI of ₹5,000 has been paid. Remaining loan balance is ₹45,000."
```

### API Endpoint Specification
```python
GET /api/banking/loans
Headers: Authorization: Bearer <token>

Response:
{
    "loans": [
        {
            "loan_id": "LN001",
            "loan_type": "personal",
            "principal_amount": 100000.00,
            "remaining_balance": 50000.00,
            "interest_rate": 12.5,
            "emi_amount": 5000.00,
            "next_emi_date": "2024-01-25",
            "remaining_tenure_months": 10,
            "total_paid": 50000.00
        }
    ]
}

POST /api/banking/loans/{loan_id}/pay-emi
Body: {
    "amount": 5000.00,
    "payment_method": "account",
    "otp": "123456"
}
```

### Database Schema
```sql
CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    loan_id VARCHAR(50) UNIQUE,
    loan_type VARCHAR(50),
    principal_amount FLOAT,
    remaining_balance FLOAT,
    interest_rate FLOAT,
    emi_amount FLOAT,
    next_emi_date DATE,
    remaining_tenure_months INTEGER,
    total_paid FLOAT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE loan_payments (
    id SERIAL PRIMARY KEY,
    loan_id VARCHAR(50) REFERENCES loans(loan_id),
    amount FLOAT,
    payment_date DATE,
    transaction_id VARCHAR(50),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Security Requirements
- OTP for EMI payments
- Verify loan ownership
- Payment confirmation required

### Training Data Format
```json
{
    "text": "What's my loan balance?",
    "intent": "loan_inquiry",
    "entities": {
        "loan_type": null,
        "action": "check_balance"
    },
    "context": {},
    "response_template": "You have {count} active loans: {loan_details}"
}
```

### Test Cases
1. Single loan - show details
2. Multiple loans - list all
3. Pay EMI - successful payment
4. Pay EMI - insufficient balance
5. No active loans - empty state

---

## 5. Interest Rate Inquiry

**Feature ID**: F005
**Priority**: Medium
**Category**: Core

### Description
Provide current interest rates for various banking products like savings accounts, fixed deposits, loans, etc.

### User Intent Examples
```
- "What are the current interest rates?"
- "FD interest rate kya hai?"
- "Savings account interest rate"
- "Personal loan interest rate"
- "What's the interest rate for 1 year FD?"
- "Home loan ki interest rate kitni hai?"
```

### Entities to Extract
- `product_type`: savings, fd, loan, etc. (optional)
- `duration`: for FD/loans (optional)
- `loan_type`: personal, home, car (optional)

### Dialogue Flow
```
User: "What are the interest rates?"
Assistant: "Current interest rates:
- Savings Account: 4.5% per annum
- Fixed Deposit (1 year): 7.0% per annum
- Fixed Deposit (5 years): 7.5% per annum
- Personal Loan: 12.5% per annum
- Home Loan: 8.5% per annum
- Credit Card: 24.0% per annum
Which product would you like more details about?"
```

Specific product:
```
User: "FD interest rate for 1 year"
Assistant: "Fixed Deposit interest rate for 1 year is 7.0% per annum. For an investment of ₹1,00,000, you would earn ₹7,000 per year."
```

### API Endpoint Specification
```python
GET /api/banking/interest-rates
Query Params:
    - product_type: string (optional)
    - duration: int (optional)

Response:
{
    "rates": {
        "savings_account": 4.5,
        "fixed_deposit": {
            "1_year": 7.0,
            "3_years": 7.2,
            "5_years": 7.5
        },
        "personal_loan": 12.5,
        "home_loan": 8.5,
        "credit_card": 24.0
    },
    "last_updated": "2024-01-15T00:00:00Z"
}
```

### Database Schema
```sql
CREATE TABLE interest_rates (
    id SERIAL PRIMARY KEY,
    product_type VARCHAR(50),
    duration_months INTEGER,
    interest_rate FLOAT,
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Security Requirements
- Public information - no authentication required
- Keep rate history for audit

### Training Data Format
```json
{
    "text": "What are the interest rates?",
    "intent": "interest_inquiry",
    "entities": {
        "product_type": null,
        "duration": null
    },
    "context": {},
    "response_template": "Current interest rates: {rates_list}"
}
```

### Test Cases
1. All rates - complete list
2. Specific product - detailed rate
3. FD with duration - specific rate
4. Invalid product - error message

---

## 6. Credit Limit Inquiry

**Feature ID**: F006
**Priority**: Medium
**Category**: Core

### Description
Display credit card limit, available credit, used credit, and payment due information.

### User Intent Examples
```
- "What's my credit limit?"
- "Available credit kitna hai?"
- "Credit card limit batao"
- "How much credit do I have left?"
- "Credit card payment due kab hai?"
```

### Entities to Extract
- `card_type`: credit_card (implicit)
- `action`: check_limit, check_available, check_due (optional)

### Dialogue Flow
```
User: "What's my credit limit?"
Assistant: "Your credit card details:
- Total credit limit: ₹50,000
- Available credit: ₹35,000
- Used credit: ₹15,000
- Payment due: ₹15,000
- Due date: January 25, 2024
Would you like to make a payment?"
```

### API Endpoint Specification
```python
GET /api/banking/credit-limit
Headers: Authorization: Bearer <token>

Response:
{
    "credit_limit": 50000.00,
    "available_credit": 35000.00,
    "used_credit": 15000.00,
    "payment_due": 15000.00,
    "due_date": "2024-01-25",
    "minimum_payment": 5000.00
}
```

### Database Schema
```sql
CREATE TABLE credit_cards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    card_number VARCHAR(16),
    credit_limit FLOAT,
    available_credit FLOAT,
    used_credit FLOAT,
    payment_due FLOAT,
    due_date DATE,
    minimum_payment FLOAT,
    status VARCHAR(20) DEFAULT 'active'
);
```

### Security Requirements
- Mask card numbers in responses
- OTP for payment

### Training Data Format
```json
{
    "text": "What's my credit limit?",
    "intent": "credit_limit_inquiry",
    "entities": {},
    "context": {},
    "response_template": "Your credit card details: {credit_details}"
}
```

### Test Cases
1. Check limit - all details
2. Low available credit - warning
3. Payment due - prompt for payment
4. No credit card - error message

---

## 7. Payment Reminders

**Feature ID**: F007
**Priority**: Medium
**Category**: Core

### Description
Set, view, and manage payment reminders for bills, EMIs, subscriptions, etc.

### User Intent Examples
```
- "Set a reminder for my phone bill"
- "Remind me to pay electricity bill on 20th"
- "Show my payment reminders"
- "Delete reminder for rent payment"
- "Phone bill ki reminder set karo"
```

### Entities to Extract
- `reminder_type`: bill, emi, subscription, custom
- `amount`: payment amount (optional)
- `due_date`: reminder date (required)
- `description`: what the reminder is for
- `action`: set, view, delete, update

### Dialogue Flow
```
User: "Set a reminder for phone bill on 20th"
Assistant: "What's the amount for the phone bill?"
User: "₹500"
Assistant: "Reminder set! I'll remind you to pay ₹500 phone bill on January 20, 2024. You'll receive a notification 2 days before."
```

View reminders:
```
User: "Show my payment reminders"
Assistant: "You have 3 active payment reminders:
1. Phone bill - ₹500 - Due: Jan 20, 2024
2. Electricity bill - ₹2,000 - Due: Jan 22, 2024
3. Personal Loan EMI - ₹5,000 - Due: Jan 25, 2024"
```

### API Endpoint Specification
```python
POST /api/banking/reminders
Headers: Authorization: Bearer <token>
Body: {
    "type": "bill",
    "description": "Phone bill",
    "amount": 500.00,
    "due_date": "2024-01-20",
    "notification_days_before": 2
}

GET /api/banking/reminders
Response: {
    "reminders": [...]
}

DELETE /api/banking/reminders/{id}
```

### Database Schema
```sql
CREATE TABLE payment_reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50),
    description VARCHAR(200),
    amount FLOAT,
    due_date DATE,
    notification_days_before INTEGER DEFAULT 2,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Security Requirements
- User can only manage their own reminders
- Secure notification delivery

### Training Data Format
```json
{
    "text": "Set a reminder for phone bill on 20th",
    "intent": "set_reminder",
    "entities": {
        "reminder_type": "bill",
        "description": "phone bill",
        "due_date": "20th"
    },
    "context": {},
    "response_template": "Reminder set! I'll remind you to pay ₹{amount} {description} on {due_date}."
}
```

### Test Cases
1. Set reminder - complete details
2. Set reminder - missing amount, prompt
3. View reminders - list all
4. Delete reminder - confirmation
5. Past due date - error handling

---

## 8. Bill Payments

**Feature ID**: F008
**Priority**: High
**Category**: Core

### Description
Pay utility bills (electricity, water, phone, gas, etc.) and other bills through voice commands.

### User Intent Examples
```
- "Pay my electricity bill"
- "Phone bill pay karo"
- "Pay ₹500 for internet bill"
- "Pay water bill account number 123456"
- "Show my bill payment history"
```

### Entities to Extract
- `bill_type`: electricity, phone, water, gas, internet, etc.
- `amount`: bill amount (required)
- `account_number`: biller account number (optional)
- `biller_id`: saved biller ID (optional)

### Dialogue Flow
```
User: "Pay my electricity bill"
Assistant: "Your electricity bill of ₹2,000 is due. Account: 1234567890. Please confirm payment."
User: "Yes"
Assistant: "Please provide the 6-digit OTP sent to your mobile number."
User: "123456"
Assistant: "Electricity bill of ₹2,000 has been paid successfully. Transaction ID: BILL123456. Your new balance is ₹48,000."
```

### API Endpoint Specification
```python
POST /api/banking/bill-payment
Headers: Authorization: Bearer <token>
Body: {
    "bill_type": "electricity",
    "biller_id": "ELEC001",
    "account_number": "1234567890",
    "amount": 2000.00,
    "otp": "123456"
}

Response: {
    "transaction_id": "BILL123456",
    "status": "completed",
    "amount": 2000.00,
    "bill_type": "electricity",
    "new_balance": 48000.00
}
```

### Database Schema
```sql
CREATE TABLE billers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    biller_id VARCHAR(50),
    bill_type VARCHAR(50),
    account_number VARCHAR(50),
    nickname VARCHAR(100),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE bill_payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    biller_id VARCHAR(50),
    bill_type VARCHAR(50),
    amount FLOAT,
    transaction_id VARCHAR(50),
    payment_date DATE,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Security Requirements
- OTP verification mandatory
- Biller verification
- Transaction limits

### Training Data Format
```json
{
    "text": "Pay my electricity bill",
    "intent": "pay_bill",
    "entities": {
        "bill_type": "electricity",
        "amount": null
    },
    "context": {
        "requires_confirmation": true,
        "requires_otp": true
    },
    "response_template": "Your {bill_type} bill of ₹{amount} is due. Please confirm payment."
}
```

### Test Cases
1. Pay bill - saved biller
2. Pay bill - new biller, enter account
3. Pay bill - insufficient balance
4. Invalid biller - error
5. View bill history - list payments

---

*[Continuing with remaining features...]*

