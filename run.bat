@echo off
title MediCare AI - Local Development
echo ===================================================
echo   KHOI DONG MEDICARE AI - FULLSTACK (1 TERMINAL)
echo ===================================================

echo [1/4] Setting up SQLite database...
cd backend && bunx prisma db push --accept-data-loss 2>nul && cd ..

echo [2/4] Setting up Python environment...
if not exist "ai_service\venv" (
    echo Creating Python virtual environment...
    python -m venv ai_service\venv
)
call ai_service\venv\Scripts\pip install -r ai_service\requirements.txt -q

echo [3/4] Starting AI Service, Backend, and Frontend...
echo ===================================================
echo - Frontend (Vite): http://localhost:5173
echo - Backend (Bun): http://localhost:3000
echo - AI Service (Python): http://localhost:8000
echo Nhan Ctrl+C de thoat tat ca dich vu.
echo ===================================================

npx concurrently --kill-others --names "AI,BACKEND,FRONTEND" --prefix-colors "yellow,blue,green" "cd ai_service && venv\Scripts\python -m uvicorn main:app --reload --port 8000" "cd backend && bun install --silent && bun run dev" "npm install --silent && node node_modules/vite/bin/vite.js"
