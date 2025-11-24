param(
    [string]$ComposeFileRelative = "..\infra\docker-compose.dev.yml"
)

# =====================================================================
# 🧹 Stopp PostgreSQL dev-database (Docker)
# =====================================================================

$ErrorActionPreference = "Stop"

$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$composePath = Join-Path $scriptDir $ComposeFileRelative

if (-not (Test-Path $composePath)) {
    Write-Host "❌ Fant ikke docker-compose-fil: $composePath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " 🧹 Stopper PostgreSQL dev-DB (Docker)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

docker compose -f $composePath down

Write-Host ""
Write-Host "✅ PostgreSQL dev-DB stoppet og fjernet" -ForegroundColor Green
Write-Host ""
