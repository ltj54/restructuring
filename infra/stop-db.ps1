<# =====================================================================
  stop-db.ps1
  ---------------------------------------------------------------
  Stopper PostgreSQL-containere uten å slette data
# ===================================================================== #>

Write-Host ""
Write-Host "============================================" -ForegroundColor Yellow
Write-Host " STOPPING POSTGRES" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow
Write-Host ""

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$composeFile = Join-Path $scriptRoot "docker-compose.dev.yml"

if (-Not (Test-Path $composeFile)) {
    Write-Host "❌ FEIL: Finner ikke compose-filen: $composeFile" -ForegroundColor Red
    exit 1
}

docker compose -f $composeFile down

Write-Host ""
Write-Host "✔ PostgreSQL stoppet (data beholdt)." -ForegroundColor Green
Write-Host ""
