@echo off
echo Starting Both Servers...
echo.
echo Starting Backend...
start "Backend Server" cmd /k "cd backend && set PYTHONPATH=%CD% && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
echo.
echo Both servers are starting!
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://127.0.0.1:8000
echo.
pause










