# 📦 Installation & Setup Guide

## Prerequisites Check

### 1. Check Python Installation
```bash
python --version
# Should show: Python 3.9.x or higher
```

If not installed: Download from https://www.python.org/downloads/

### 2. Check Node.js Installation
```bash
node --version
# Should show: v18.x.x or higher
npm --version
# Should show: 9.x.x or higher
```

If not installed: Download from https://nodejs.org/

---

## Step-by-Step Installation

### Step 1: Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment (optional but recommended)
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# 4. Install Python dependencies
pip install -r requirements.txt

# 5. Initialize database
python scripts/init_db.py

# 6. Verify installation
python -c "from app.main import app; print('✓ Backend ready!')"
```

**Expected Output:**
```
✓ Backend ready!
```

---

### Step 2: Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node.js dependencies
npm install

# 3. Verify installation
npm run build
```

**Expected Output:**
```
✓ Compiled successfully
```

---

## 🚀 Running the Application

### Option A: Using Batch Scripts (Windows)

**Double-click these files:**
- `start-all.bat` - Starts both servers
- OR
- `start-backend.bat` - Starts only backend
- `start-frontend.bat` - Starts only frontend

### Option B: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option C: Docker

```bash
docker-compose up --build
```

---

## ✅ Verification

1. **Backend Health Check**
   - Open: http://127.0.0.1:8000/health
   - Should see: `{"status":"healthy"}`

2. **API Documentation**
   - Open: http://127.0.0.1:8000/docs
   - Should see: Swagger UI

3. **Frontend**
   - Open: http://localhost:3000
   - Should see: Login page

---

## 🔑 Login

- Username: `demo_user`
- Password: `demo123`

---

## 📝 Common Issues & Solutions

### Python Module Not Found
```bash
# Make sure you're in backend directory
cd backend

# Set PYTHONPATH
# Windows:
set PYTHONPATH=%CD%
# macOS/Linux:
export PYTHONPATH=$(pwd)

# Or use Python path flag
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### npm install fails
```bash
# Clear cache and try again
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Port Already in Use
```bash
# Change port in command
# Backend: --port 8001
# Frontend: npm run dev -- -p 3001
```

---

**Ready to go! Follow the running instructions above.** 🎉










