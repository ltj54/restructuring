<# =====================================================================
  dev-up.ps1
  ---------------------------------------------------------------
  Starter hele utviklingsmiljøet:
    • PostgreSQL (docker-compose.dev.yml)
    • Backend (Spring Boot)
    • Frontend (Vite + React)
# ===================================================================== #>

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " STARTING FULL DEV ENVIRONMENT" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Finner paths
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$composeFile = Join-Path $root "docker-compose.dev.yml"
$backendDir = Join-Path $root "..\backend"
$frontendDir = Join-Path $root "..\frontend"

# ---------------------------------------------------------
# 1. START DATABASE (docker compose)
# ---------------------------------------------------------
Write-Host "🐘 Starter PostgreSQL 18..." -ForegroundColor Yellow

if (-Not (Test-Path $composeFile)) {
    Write-Host "❌ FEIL: compose-fil mangler: $composeFile" -ForegroundColor Red
    exit 1
}

docker compose -f $composeFile up -d

# Vent til DB er klar
Write-Host "⏳ Venter på at databasen skal bli klar..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# ---------------------------------------------------------
# 2. START BACKEND (Spring Boot)
# ---------------------------------------------------------
Write-Host ""
Write-Host "🔥 Starter BACKEND..." -ForegroundColor Yellow

if (-Not (Test-Path $backendDir)) {
    Write-Host "❌ FEIL: backend-katalog finnes ikke: $backendDir" -ForegroundColor Red
    exit 1
}

Push-Location $backendDir
Start-Process "cmd.exe" -ArgumentList "/c mvn spring-boot:run" -WindowStyle Minimized
Pop-Location

Write-Host "⏳ Venter på backend (10 sek)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# ---------------------------------------------------------
# 3. START FRONTEND (Vite + React)
# ---------------------------------------------------------
Write-Host ""
Write-Host "⚛ Starter FRONTEND..." -ForegroundColor Yellow

if (-Not (Test-Path $frontendDir)) {
    Write-Host "❌ FEIL: frontend-katalog finnes ikke: $frontendDir" -ForegroundColor Red
    exit 1
}

Push-Location $frontendDir
Start-Process "cmd.exe" -ArgumentList "/c npm run dev" -WindowStyle Minimized
Pop-Location

# ---------------------------------------------------------
# FULLFØRT
# ---------------------------------------------------------
Write-Host ""
Write-Host "🎉 DEV-ENVIRONMENT STARTED" -ForegroundColor Green
Write-Host "============================================"
Write-Host "• DB       : localhost:5432"
Write-Host "• Backend  : http://localhost:8080"
Write-Host "• Frontend : http://localhost:5173"
Write-Host ""
