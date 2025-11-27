<# =====================================================================
  init-db.ps1
  ---------------------------------------------------------------
  Kjører alle .sql-filer i /sql-init/ mot PostgreSQL 18-databasen.
  Katalogen blir automatisk opprettet hvis den mangler.
# ===================================================================== #>

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " INITIALIZING DATABASE (SQL IMPORT)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$scriptRoot   = Split-Path -Parent $MyInvocation.MyCommand.Definition
$sqlFolder    = Join-Path $scriptRoot "sql-init"
$composeFile  = Join-Path $scriptRoot "docker-compose.dev.yml"

$psql = "psql"   # Forutsetter at PostgreSQL 18 er i PATH

# Sjekk folder
if (-Not (Test-Path $sqlFolder)) {
    Write-Host "📁 Oppretter mappe for SQL-init: $sqlFolder" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $sqlFolder | Out-Null
    Write-Host "ℹ Ingen SQL-filer å kjøre enda." -ForegroundColor Yellow
    exit 0
}

# Finn filer
$sqlFiles = Get-ChildItem -Path $sqlFolder -Filter *.sql -File

if ($sqlFiles.Count -eq 0) {
    Write-Host "ℹ Ingen SQL-filer funnet i $sqlFolder" -ForegroundColor Yellow
    exit 0
}

Write-Host "📄 SQL-filer funnet:" -ForegroundColor Cyan
$sqlFiles | ForEach-Object { Write-Host " - $($_.Name)" }

Write-Host ""
Write-Host "🚀 Kjører SQL-filer mot PostgreSQL 18..." -ForegroundColor Yellow

foreach ($file in $sqlFiles) {
    Write-Host "➡ Importerer: $($file.Name)" -ForegroundColor Cyan
    & $psql -h localhost -p 5432 -U restructuring -d restructuring_dev -f $file.FullName
}

Write-Host ""
Write-Host "🎉 Database import fullført!" -ForegroundColor Green
Write-Host ""
