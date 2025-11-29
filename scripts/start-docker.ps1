Write-Host "== Starting PostgreSQL Docker (dev)..." -ForegroundColor Cyan

$compose = Join-Path $PSScriptRoot "../infra/docker-compose.dev.yml"
docker compose -f $compose up -d

Write-Host "-> Waiting for database..."

for ($i=0; $i -lt 30; $i++) {
    $ps = docker ps --filter "name=restructuring-dev-db" --format "{{.Status}}" 2>$null
    if (-not $ps) {
        Start-Sleep 1
        continue
    }

    $r = docker exec restructuring-dev-db pg_isready -U restructuring 2>$null
    if ($r -match "accepting connections") {
        Write-Host "[OK] Database is ready!"
        exit 0
    }
    Start-Sleep 1
}

Write-Host "!! Database did not start in time."
exit 1
