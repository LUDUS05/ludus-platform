#!/bin/bash

# Health check script for the referral system

BACKEND_URL="${BACKEND_URL:-https://your-backend.onrender.com}"
FRONTEND_URL="${FRONTEND_URL:-https://your-frontend.onrender.com}"
LOG_FILE="health-check-$(date +%Y%m%d).log"

# Check backend
if curl -f -s "$BACKEND_URL/health" > /dev/null; then
    echo "$(date): Backend OK" >> "$LOG_FILE"
else
    echo "$(date): Backend FAILED" >> "$LOG_FILE"
    # Send alert (email, Slack, etc.)
fi

# Check frontend
if curl -f -s "$FRONTEND_URL" > /dev/null; then
    echo "$(date): Frontend OK" >> "$LOG_FILE"
else
    echo "$(date): Frontend FAILED" >> "$LOG_FILE"
    # Send alert
fi
