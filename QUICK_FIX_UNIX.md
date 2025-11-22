# 🔧 Quick Fix for Unix/Linux/Bash Environments

If you're getting `ModuleNotFoundError: No module named 'app'` errors, follow these steps:

## ✅ Solution 1: Install in Development Mode (Recommended)

```bash
# Navigate to backend directory
cd backend

# Install the package in development mode
pip install -e .

# Now start the server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

This makes the `app` module available system-wide.

---

## ✅ Solution 2: Set PYTHONPATH Correctly

```bash
# Navigate to backend directory
cd backend

# Set PYTHONPATH to current directory (use absolute path)
export PYTHONPATH="$(pwd):$PYTHONPATH"

# Verify it's set
echo $PYTHONPATH

# Start the server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## ✅ Solution 3: Use the Updated Script

```bash
# Make script executable
chmod +x start-backend.sh

# Run the script
./start-backend.sh
```

The script automatically sets PYTHONPATH and installs the package if needed.

---

## ❌ Common Mistakes

### ❌ Wrong: Using PowerShell syntax in bash
```bash
$env:PYTHONPATH="..."  # This is PowerShell, not bash!
```

### ✅ Correct: Use export for bash
```bash
export PYTHONPATH="$(pwd):$PYTHONPATH"
```

---

## 🔍 Verify Installation

```bash
# Test if app module can be imported
cd backend
python -c "from app.main import app; print('✓ Backend ready!')"
```

If this works, the server should start correctly!

---

## 🐳 Alternative: Use Docker (Works Everywhere)

```bash
docker-compose up --build
```

This avoids all Python path issues!









