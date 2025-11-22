#!/bin/bash
# Quick script to check training progress

echo "=== Banking77 Training Status ==="
echo ""

if [ -f "banking77_training.log" ]; then
    echo "Latest training output:"
    tail -30 banking77_training.log
    echo ""
else
    echo "Training log not found. Training may not have started yet."
fi

echo ""
echo "=== GPU Status ==="
nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu --format=csv,noheader 2>/dev/null || echo "nvidia-smi not available"

echo ""
echo "=== Python Processes ==="
ps aux | grep "fine_tune_intent_model" | grep -v grep || echo "No training process found"



