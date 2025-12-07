# -------------------------------------------
# db.ps1
# Åpner psql i Docker-databasen for Restructuring
# -------------------------------------------

$containerName = "restructuring-dev-db"
$dbUser = "restructuring"
$dbName = "restructuring_dev"

Write-Host "🔍 Sjekker om databasen kjører..." -ForegroundColor Cyan

# Finn containeren
$containerRunning = docker ps --format "{{.Names}}" | Select-String $containerName

if (-not $containerRunning) {
    Write-Host "🚫 Databasecontainer '$containerName' kjører ikke." -ForegroundColor Red
    Write-Host "🔄 Starter den nå..." -ForegroundColor Yellow

    docker compose up -d $containerName

    Start-Sleep -Seconds 3
}

Write-Host "✅ Kobler til PostgreSQL via Docker..." -ForegroundColor Green
Write-Host ""

docker exec -it $containerName psql -U $dbUser -d $dbName
