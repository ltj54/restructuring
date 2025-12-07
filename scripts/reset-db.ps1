# -------------------------------------------
# reset-db.ps1
# Sletter Postgres-data og starter ny database
# -------------------------------------------

Write-Host "🛑 Stopper databasecontainer..." -ForegroundColor Yellow
docker stop restructuring-dev-db 2>$null

Write-Host "🗑 Sletter databasecontainer..." -ForegroundColor Yellow
docker rm restructuring-dev-db 2>$null

Write-Host "🗑 Sletter databasevolum 'db_data'..." -ForegroundColor Yellow
docker volume rm restructuring_db_data 2>$null

Write-Host "🔄 Starter database på nytt..." -ForegroundColor Cyan
docker compose up -d db

Write-Host ""
Write-Host "⏳ Venter på at databasen skal bli healthy..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

docker ps | Select-String "restructuring-dev-db"

Write-Host ""
Write-Host "✅ Reset ferdig! Du kan koble til med ./db.ps1" -ForegroundColor Green
