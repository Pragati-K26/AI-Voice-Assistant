# 🚀 How to Run the Application

Complete step-by-step instructions for running both backend and frontend.

---

## Prerequisites

✅ Python 3.9+ installed  
✅ Node.js 18+ installed  
✅ pip and npm available  

---

## Method 1: Run Manually (Step by Step)

### Step 1: Start Backend Server

**Open Terminal 1:**

#### For Windows (PowerShell):
```powershell
# Navigate to backend directory
cd backend

# Set Python path
$env:PYTHONPATH="D:\ai-voice-assistant\backend"

# Activate virtual environment (if using venv)
.\venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Install package in development mode (recommended for Unix/Cloud)
pip install -e .

# Initialize database (first time only)
python scripts/init_db.py

# Start the server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### For Linux/macOS/Bash (Git Bash/WSL):
```bash
# Navigate to backend directory
cd backend

# Set Python path (use absolute path)
export PYTHONPATH="$(pwd):$PYTHONPATH"
# OR install in development mode (recommended):
pip install -e .

# Activate virtual environment (if using venv)
source venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Initialize database (first time only)
python scripts/init_db.py

# Start the server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**You should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Keep this terminal open!**

---

### Step 2: Start Frontend Server

**Open Terminal 2 (new terminal window):**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**You should see:**
```
- ready started server on 0.0.0.0:3000
- Local:        http://localhost:3000
```

**Keep this terminal open!**

---

## Method 2: Using Docker (Easiest)

```bash
# From project root directory
docker-compose up

# Or with rebuild
docker-compose up --build
```

This starts both servers automatically!

---

## Method 3: Quick Start Scripts

### Windows (PowerShell)

**Start Backend:**
```powershell
cd backend
$env:PYTHONPATH="D:\ai-voice-assistant\backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

**Start Frontend:**
```powershell
cd frontend
npm run dev
```

### macOS/Linux (Bash)

**Start Backend:**
```bash
cd backend

# Option 1: Install in development mode (recommended)
pip install -e .

# Option 2: Set PYTHONPATH
export PYTHONPATH="$(pwd):$PYTHONPATH"

# Start server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

**OR use the script:**
```bash
chmod +x start-backend.sh
./start-backend.sh
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

---

## ✅ Verify Servers Are Running

### Check Backend:
Open browser: **http://127.0.0.1:8000/health**

You should see:
```json
{
  "status": "healthy",
  "database": "connected",
  "models": "loaded"
}
```

### Check Frontend:
Open browser: **http://localhost:3000**

You should see the login page.

### Check API Docs:
Open browser: **http://127.0.0.1:8000/docs**

You should see Swagger UI documentation.

---

## 🔑 Login Credentials

- **Username**: `demo_user`
- **Password**: `demo123`
- **Voice PIN**: `1234`

---

## 📋 Quick Checklist

### First Time Setup:
- [ ] Install Python 3.9+
- [ ] Install Node.js 18+
- [ ] Install backend dependencies: `pip install -r requirements.txt`
- [ ] Install frontend dependencies: `npm install`
- [ ] Initialize database: `python scripts/init_db.py`

### Every Time:
- [ ] Start backend server (Terminal 1)
- [ ] Start frontend server (Terminal 2)
- [ ] Open http://localhost:3000 in browser
- [ ] Login and use the application

---

## 🛠️ Troubleshooting

### Backend Won't Start

**Issue**: Port 8000 already in use
```bash
# Find process using port 8000 (Windows)
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use a different port
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

**Issue**: Module not found errors
```bash
# Make sure you're in backend directory
cd backend

# Set Python path
$env:PYTHONPATH="D:\ai-voice-assistant\backend"

# Install dependencies
pip install -r requirements.txt
```

**Issue**: Database errors
```bash
# Re-initialize database
cd backend
python scripts/init_db.py
```

### Frontend Won't Start

**Issue**: Port 3000 already in use
```bash
# Find process using port 3000 (Windows)
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

**Issue**: npm install errors
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Module not found
```bash
# Reinstall dependencies
cd frontend
npm install
```

### Connection Errors

**Issue**: Cannot connect to backend
- ✅ Check backend is running on port 8000
- ✅ Check backend health: http://127.0.0.1:8000/health
- ✅ Check CORS settings in backend
- ✅ Check API_URL in frontend environment

**Issue**: Login fails
- ✅ Check backend is running
- ✅ Verify credentials: `demo_user` / `demo123`
- ✅ Check browser console for errors
- ✅ Clear browser cache

---

## 📝 Environment Variables

### Backend (.env file)
```env
DATABASE_URL=sqlite:///./banking_assistant.db
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
```

### Frontend (.env.local file)
```env
API_URL=http://localhost:8000
```

---

## 🎯 Expected Output

### Backend Terminal:
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Frontend Terminal:
```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  ✓ Ready in 2.5s
```

---

## 🚀 Quick Commands Summary

### Backend:
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Frontend:
```bash
cd frontend
npm run dev
```

### Both with Docker:
```bash
docker-compose up
```

---

## 📚 Additional Resources

- **API Documentation**: http://127.0.0.1:8000/docs
- **Backend Health**: http://127.0.0.1:8000/health
- **Frontend**: http://localhost:3000

---

**That's it! Your application should now be running! 🎉**


