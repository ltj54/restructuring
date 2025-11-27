<# =====================================================================
  start-db.ps1
  ---------------------------------------------------------------
  Starter PostgreSQL-containere definert i docker-compose.dev.yml
# ===================================================================== #>

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " STARTING POSTGRES (PG 18)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$composeFile = Join-Path $scriptRoot "docker-compose.dev.yml"

if (-Not (Test-Path $composeFile)) {
    Write-Host "❌ FEIL: Finner ikke compose-filen: $composeFile" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Bruker compose-fil: $composeFile" -ForegroundColor Yellow
docker compose -f $composeFile up -d

Write-Host ""
Write-Host "✔ PostgreSQL 18 er nå startet." -ForegroundColor Green
Write-Host ""
