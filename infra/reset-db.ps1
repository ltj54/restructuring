<# =====================================================================
  reset-db.ps1
  ---------------------------------------------------------------
  Stopper containere, sletter databasen (volumet),
  og starter en helt ren PostgreSQL 18-instans igjen.
# ===================================================================== #>

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " RESETTING POSTGRES DATABASE (PG 18)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$composeFile = Join-Path $scriptRoot "docker-compose.dev.yml"
$volumeName = "restructuring_db_data"

if (-Not (Test-Path $composeFile)) {
    Write-Host "❌ FEIL: Finner ikke compose-filen: $composeFile" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Compose-fil: $composeFile" -ForegroundColor Yellow

Write-Host ""
Write-Host "⛔ Stopper containere..." -ForegroundColor Yellow
docker compose -f $composeFile down

Write-Host ""
Write-Host "🗑 Sletter databasevolum: $volumeName" -ForegroundColor Yellow
docker volume rm $volumeName -f | Out-Null

Write-Host ""
Write-Host "🚀 Starter Postgres 18 på nytt..." -ForegroundColor Yellow
docker compose -f $composeFile up -d

Write-Host ""
Write-Host "🎉 DATABASE RESET FULLFØRT (PG 18, TOM)" -ForegroundColor Green
Write-Host "=============================================="
Write-Host "DB-navn : restructuring_dev"
Write-Host "Bruker  : restructuring"
Write-Host "Passord : restructuring"
Write-Host "Port    : 5432"
Write-Host ""
