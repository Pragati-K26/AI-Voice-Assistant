# Quick Start Guide

Get up and running in 5 minutes!

## Option 1: Docker (Easiest)

```bash
# Clone repository
git clone <your-repo-url>
cd automated-financial-transaction

# Start everything with Docker
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Option 2: Manual Setup

### 1. Backend (Terminal 1)

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python scripts/init_db.py
python -m app.main
```

### 2. Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

### 3. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Login Credentials

- **Username**: `demo_user`
- **Password**: `demo123`
- **Voice PIN**: `1234`

## Test Voice Commands

1. Click the microphone button
2. Say:
   - "Check my balance"
   - "Transfer ₹2000 to Akash"
   - "Show my transactions"
   - "What are the interest rates?"

## Troubleshooting

**Web Speech API not working?**
- Use Chrome or Edge browser
- Allow microphone permissions

**Backend won't start?**
- Ensure Python 3.9+ is installed
- Check if port 8000 is available

**Frontend won't start?**
- Ensure Node.js 18+ is installed
- Delete `node_modules` and run `npm install` again

For detailed setup, see [SETUP.md](SETUP.md)
For deployment, see [DEPLOYMENT.md](DEPLOYMENT.md)

