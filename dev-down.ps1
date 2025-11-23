param([string]$ComposeFile = "docker-compose.dev.yml")
Write-Host "Stopping PostgreSQL dev DB..."
docker compose -f $ComposeFile down
