#!/usr/bin/env bash
# ========================================================
# DevForge AI — Single Unified Full-Stack Server Starter
# Starts both Frontend (Port 3000) and Backend (Port 8000)
# ========================================================

echo "🚀 Starting DevForge AI Full-Stack Environment..."

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. Clear any stale processes on ports 3000 and 8000
lsof -ti :3000,8000 | xargs kill -9 2>/dev/null || true

# 2. Start Backend FastAPI Server on Port 8000
echo "⚡ Launching Backend API Server (http://localhost:8000)..."
cd "$ROOT_DIR/backend"
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 3. Start Frontend Vite Server on Port 3000
echo "🎨 Launching Frontend Web App (http://localhost:3000)..."
cd "$ROOT_DIR/frontend"
npm run dev -- --port 3000 &
FRONTEND_PID=$!

echo ""
echo "========================================================"
echo "🎉 DEVFORGE AI IS LIVE! ACCESS THE APP HERE:"
echo "👉 http://localhost:3000/"
echo "========================================================"
echo ""

# Clean exit handler
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" EXIT INT TERM

wait
