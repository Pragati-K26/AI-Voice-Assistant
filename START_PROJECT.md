# 🚀 Starting the Project

## Quick Start Guide

### Option 1: Automatic Start (Both Servers)

Both servers are starting in the background. Wait a few seconds for them to initialize.

### Option 2: Manual Start

#### Start Backend (Terminal 1)
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

### Option 3: Using Docker
```bash
docker-compose up
```

---

## 🌐 Access Points

Once servers are running:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://127.0.0.1:8000
- **API Documentation**: http://127.0.0.1:8000/docs
- **Health Check**: http://127.0.0.1:8000/health

---

## 🔑 Login Credentials

- **Username**: `demo_user`
- **Password**: `demo123`
- **Voice PIN**: `1234`

---

## ✨ Available Features

### Core Features
- ✅ Account Balance Inquiry
- ✅ Fund Transfer/Payments
- ✅ Transaction History
- ✅ Loan & Credit Information
- ✅ Reminders & Alerts
- ✅ Secure Authentication
- ✅ Error Handling & Guidance
- ✅ Multi-turn Conversations

### Advanced Features
- ✅ Personalized Financial Assistant (Spending Tracking)
- ✅ Fraud/Unusual Activity Alerts
- ✅ Bill/Recharge Automation
- ✅ Cheque Book & Card Services
- ✅ Proactive Notifications

---

## 💬 Example Voice Commands

Try these commands after logging in:

1. **Balance & Account**
   - "Check my balance"
   - "What's my account balance?"
   - "Show my credit limit"

2. **Transfers & Payments**
   - "Transfer ₹2000 to Akash"
   - "Send ₹5000 to Rahul"
   - "Pay my electricity bill"

3. **Spending & Expenses**
   - "Show my spending summary"
   - "How much did I spend this month?"
   - "What did I spend on food last month?"
   - "Show my expenses by category"

4. **Transactions**
   - "Show my recent transactions"
   - "List transactions from last week"
   - "Find transaction to Akash"

5. **Loans & Credit**
   - "What's my loan balance?"
   - "When is my next EMI due?"
   - "Show interest rates"

6. **Notifications & Alerts**
   - "Show my notifications"
   - "Any alerts?"
   - "Check for fraud"

7. **Card Management**
   - "Block my debit card"
   - "Unblock my credit card"
   - "Set card limit to ₹50000"
   - "Show my cards"

8. **Services**
   - "Request cheque book"
   - "Setup auto-pay for electricity bill"
   - "Show auto-pay settings"

---

## 🔍 Verify Servers Are Running

### Check Backend
Open browser: http://127.0.0.1:8000/health

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "models": "loaded"
}
```

### Check Frontend
Open browser: http://localhost:3000

You should see the login page.

---

## 🐛 Troubleshooting

### Backend Not Starting
1. Check if port 8000 is available
2. Ensure Python dependencies are installed: `pip install -r requirements.txt`
3. Check database is initialized: `python scripts/init_db.py`

### Frontend Not Starting
1. Check if port 3000 is available
2. Ensure Node modules are installed: `npm install`
3. Check for errors in terminal

### Login Issues
- Verify credentials: `demo_user` / `demo123`
- Check backend is running
- Clear browser cache and try again

### Voice Not Working
- Use Chrome or Edge browser (best Web Speech API support)
- Allow microphone permissions
- Ensure HTTPS or localhost (required for Web Speech API)

---

## 📊 API Testing

Test the API directly using the interactive docs:
- Visit: http://127.0.0.1:8000/docs
- Try endpoints:
  - `/api/banking/balance` - Get balance
  - `/api/banking/spending/summary` - Get spending summary
  - `/api/banking/notifications` - Get notifications
  - `/api/voice/process` - Process voice command

---

## 🎯 Next Steps

1. ✅ Servers started
2. ⏳ Open http://localhost:3000 in browser
3. ⏳ Login with demo credentials
4. ⏳ Try voice commands
5. ⏳ Explore all features!

---

**Happy Banking! 🎉**


