#!/bin/bash
echo "Starting Backend Server..."
cd "$(dirname "$0")/backend" || exit 1

# Get absolute path
BACKEND_DIR="$(pwd)"
export PYTHONPATH="$BACKEND_DIR:$PYTHONPATH"

echo "PYTHONPATH set to: $PYTHONPATH"
echo "Working directory: $BACKEND_DIR"

# Install in development mode if setup.py exists
if [ -f "setup.py" ]; then
    echo "Installing package in development mode..."
    pip install -e . > /dev/null 2>&1
fi

# Start the server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload


