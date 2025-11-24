param(
    [string]$ComposeFileRelative = "..\infra\docker-compose.dev.yml"
)

# =====================================================================
# 🐘 Start PostgreSQL dev-database via Docker Compose
# =====================================================================

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$composePath = Join-Path $scriptDir $ComposeFileRelative

if (-not (Test-Path $composePath)) {
    Write-Host "❌ Fant ikke docker-compose-fil: $composePath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " 🐘 Starter PostgreSQL dev-DB (Docker)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Bruker compose-fil: $composePath" -ForegroundColor Yellow

docker compose -f $composePath up -d

Write-Host ""
Write-Host "✅ PostgreSQL dev-DB kjører nå" -ForegroundColor Green
Write-Host "   → Host: localhost" -ForegroundColor Green
Write-Host "   → Port: 5432" -ForegroundColor Green
Write-Host "   → DB: restructuring_dev" -ForegroundColor Green
Write-Host "   → User: restructuring" -ForegroundColor Green
Write-Host ""
