Write-Host "== Stopping database container..."
docker stop restructuring-dev-db 2>$null | Out-Null
