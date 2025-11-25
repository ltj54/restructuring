@echo off
REM Start Vite frontend for Restructuring
cd /d "%~dp0..\frontend"

IF NOT EXIST "node_modules" (
  echo Installing npm dependencies...
  npm install
)

echo Starting Vite dev server on http://localhost:5173/restructuring/
npm run dev -- --open=false
