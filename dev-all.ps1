# =====================================================================
# 🚀 FULL DEV STARTUP – DATABASE + BACKEND + FRONTEND
# =====================================================================

$Yellow = [ConsoleColor]::Yellow
$Green  = [ConsoleColor]::Green
$Red    = [ConsoleColor]::Red

Write-Host "`n======================================" -ForegroundColor $Yellow
Write-Host " 🚀 Starter komplett dev-miljø" -ForegroundColor $Yellow
Write-Host "======================================`n" -ForegroundColor $Yellow

# ---------------------------------------------------------------------
# 1️⃣ Start Postgres (Docker)
# ---------------------------------------------------------------------
Write-Host "🐘 Starter Postgres (Docker)..." -ForegroundColor $Yellow
docker-compose -f "$PSScriptRoot/docker-compose.dev.yml" up -d

# Vent litt
Start-Sleep -Seconds 3

# ---------------------------------------------------------------------
# 2️⃣ Start backend i NYTT VINDU
# ---------------------------------------------------------------------
Write-Host "`n⚙️ Starter Spring Boot backend (eget vindu)..." -ForegroundColor $Yellow
$backendDir = Join-Path $PSScriptRoot "restructuring-backend"

Start-Process pwsh -ArgumentList "-NoExit", "-ExecutionPolicy Bypass", "-Command `"cd '$backendDir'; mvn spring-boot:run`""

Start-Sleep -Seconds 2

# ---------------------------------------------------------------------
# 3️⃣ Start frontend i NYTT VINDU
# ---------------------------------------------------------------------
Write-Host "`n🌐 Starter frontend (eget vindu)..." -ForegroundColor $Yellow
$frontendDir = Join-Path $PSScriptRoot "restructuring-frontend"

Start-Process pwsh -ArgumentList "-NoExit", "-ExecutionPolicy Bypass", "-Command `"cd '$frontendDir'; npm run dev`""

Start-Sleep -Seconds 2

# ---------------------------------------------------------------------
# 4️⃣ Åpne nettleser automatisk
# ---------------------------------------------------------------------
Write-Host "`n🌍 Åpner nettleser på http://localhost:5173 ..." -ForegroundColor $Green
Start-Process "http://localhost:5173"

Write-Host "`n🎉 Alt er klart! Backend på port 8080, frontend på port 5173." -ForegroundColor $Green
