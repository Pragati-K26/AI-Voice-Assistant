@echo off
echo Starting Backend Server...
cd backend
set PYTHONPATH=%CD%
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause










