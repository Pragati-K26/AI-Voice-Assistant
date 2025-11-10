#!/bin/bash
echo "Starting Both Servers..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start Backend in background
echo "Starting Backend Server..."
cd "$SCRIPT_DIR/backend" || exit 1
export PYTHONPATH="$(pwd):$PYTHONPATH"

# Install in development mode if setup.py exists
if [ -f "setup.py" ]; then
    pip install -e . > /dev/null 2>&1
fi

# Start backend in a new terminal (Linux) or background process
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

echo "Backend started with PID: $BACKEND_PID"
sleep 3

# Start Frontend
echo "Starting Frontend Server..."
cd "$SCRIPT_DIR/frontend" || exit 1
npm run dev &
FRONTEND_PID=$!

echo "Frontend started with PID: $FRONTEND_PID"
echo ""
echo "========================================"
echo "  Both servers are starting!"
echo "========================================"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://127.0.0.1:8000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID









