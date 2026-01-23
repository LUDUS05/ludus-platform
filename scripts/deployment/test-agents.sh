#!/usr/bin/env bash
set -euo pipefail

python -m venv venv && source venv/bin/activate
pip install -r agents/requirements.txt

# Start API in background
uvicorn agents.api.main:app --port 8081 &
API_PID=$!

sleep 2

# Health check
curl -sf http://localhost:8081/health | cat

kill $API_PID || true
