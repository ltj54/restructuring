Write-Host "-> Checking DB readiness (via Docker)..."
for ($i=0; $i -lt 20; $i++) {
    $ps = docker ps --filter "name=restructuring-dev-db" --format "{{.Status}}" 2>$null
    if (-not $ps) {
        Write-Host "!! Database container not running. Start it with scripts/start-docker.ps1" -ForegroundColor Red
        exit 1
    }

    $r = docker exec restructuring-dev-db pg_isready -U restructuring 2>$null
    if ($r -match "accepting connections") {
        Write-Host "[OK] Database ready."
        break
    }
    Start-Sleep 1
}
Write-Host "== Starting backend..."
Set-Location (Join-Path $PSScriptRoot "../backend")
./mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
