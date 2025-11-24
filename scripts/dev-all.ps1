# =====================================================================
# 🚀 FULL DEV STARTUP – DATABASE + BACKEND + FRONTEND
# =====================================================================

$Yellow = [ConsoleColor]::Yellow
$Green  = [ConsoleColor]::Green
$Red    = [ConsoleColor]::Red

$ErrorActionPreference = "Stop"

Write-Host "`n======================================" -ForegroundColor $Yellow
Write-Host " 🚀 Starter komplett dev-miljø" -ForegroundColor $Yellow
Write-Host "======================================`n" -ForegroundColor $Yellow

# Paths
$scriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot    = Resolve-Path (Join-Path $scriptDir "..")
$backendDir  = Join-Path $repoRoot "backend"
$frontendDir = Join-Path $repoRoot "frontend"

# Validate folders
if (-not (Test-Path $backendDir)) {
    Write-Host "❌ Mangler backend-katalog: $backendDir" -ForegroundColor $Red
    exit 1
}
if (-not (Test-Path $frontendDir)) {
    Write-Host "❌ Mangler frontend-katalog: $frontendDir" -ForegroundColor $Red
    exit 1
}

# ---------------------------------------------------------------------
# 1️⃣ Start Postgres (Docker)
# ---------------------------------------------------------------------

Write-Host "🐘 Starter Postgres (Docker)..." -ForegroundColor $Yellow

$devUpScript = Join-Path $scriptDir "dev-up.ps1"
& $devUpScript

Start-Sleep -Seconds 3

# ---------------------------------------------------------------------
# 2️⃣ Start backend (Spring Boot) i eget vindu
# ---------------------------------------------------------------------

Write-Host "`n⚙️ Starter backend (port 8080)..." -ForegroundColor $Yellow

$backendCmd = "cd '$backendDir'; ./mvnw.cmd spring-boot:run"

Start-Process pwsh -ArgumentList "-NoExit", "-ExecutionPolicy Bypass", "-Command `"$backendCmd`""

Start-Sleep -Seconds 2

# ---------------------------------------------------------------------
# 3️⃣ Start frontend (Vite) i eget vindu
# ---------------------------------------------------------------------

Write-Host "`n🌐 Starter frontend (port 5173)..." -ForegroundColor $Yellow

$frontendCmd = "cd '$frontendDir'; npm run dev"

Start-Process pwsh -ArgumentList "-NoExit", "-ExecutionPolicy Bypass", "-Command `"$frontendCmd`""

Start-Sleep -Seconds 2

# ---------------------------------------------------------------------
# 4️⃣ Åpne nettleser
# ---------------------------------------------------------------------

Write-Host "`n🌍 Åpner nettleser..." -ForegroundColor $Green
Start-Process "http://localhost:5173"

Write-Host "`n🎉 Alt er klart!" -ForegroundColor $Green
Write-Host "   Backend:  http://localhost:8080" -ForegroundColor $Green
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor $Green
Write-Host ""
