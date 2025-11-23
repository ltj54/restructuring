param([string]$ComposeFile = "docker-compose.dev.yml")
Write-Host "Starting PostgreSQL dev DB..."
docker compose -f $ComposeFile up -d
