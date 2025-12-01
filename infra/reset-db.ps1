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

# Finn script-root og compose-fil
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$composeFile = Join-Path $scriptRoot "..\docker-compose.dev.yml"

# Navn på volumet som brukes av docker-compose.dev.yml
$volumeName = "restructuring-clean_restructuring_dev_pgdata"

# Sjekk at compose-filen finnes
if (-Not (Test-Path $composeFile)) {
    Write-Host "❌ FEIL: Finner ikke compose-filen: $composeFile" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Compose-fil funnet: $composeFile" -ForegroundColor Yellow

# Sjekk om Docker kjører
Write-Host ""
Write-Host "🔍 Sjekker Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker kjører ikke! Start Docker Desktop og prøv igjen." -ForegroundColor Red
    exit 1
}

Write-Host "✔ Docker kjører." -ForegroundColor Green

# Stopper containere
Write-Host ""
Write-Host "⛔ Stopper containere..." -ForegroundColor Yellow
docker compose -f $composeFile down --remove-orphans

# Slett volum
Write-Host ""
Write-Host "🗑 Sletter databasevolum: $volumeName" -ForegroundColor Yellow

$volumeExists = docker volume ls --format "{{.Name}}" | Where-Object { $_ -eq $volumeName }

if ($volumeExists) {
    docker volume rm $volumeName -f | Out-Null
    Write-Host "✔ Volum slettet." -ForegroundColor Green
} else {
    Write-Host "ℹ Volum eksisterte ikke – fortsetter." -ForegroundColor DarkYellow
}

# Start container på nytt
Write-Host ""
Write-Host "🚀 Starter Postgres 18 på nytt..." -ForegroundColor Yellow
docker compose -f $composeFile up -d

# Vent litt mens Postgres initierer cluster
Write-Host ""
Write-Host "⏳ Venter på at Postgres skal bli klar..." -ForegroundColor Yellow
$ready = $false
for ($i = 1; $i -le 30; $i++) {
    $logs = docker logs restructuring-dev-db 2>&1
    if ($logs -match "database system is ready to accept connections") {
        $ready = $true
        break
    }
    Start-Sleep -Seconds 1
}

if ($ready) {
    Write-Host "✔ Postgres er klar." -ForegroundColor Green
} else {
    Write-Host "⚠ Postgres ble ikke klar innen forventet tid – sjekk docker logs." -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "🎉 DATABASE RESET FULLFØRT (PG 18, TOM)" -ForegroundColor Green
Write-Host "=============================================="
Write-Host "DB-navn : restructuring_dev"
Write-Host "Bruker  : restructuring"
Write-Host "Passord : restructuring"
Write-Host "Port    : 5432"
Write-Host ""
