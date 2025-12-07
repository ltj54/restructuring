Write-Host "== Starting Vite frontend..." -ForegroundColor Cyan
Set-Location (Join-Path $PSScriptRoot "../frontend")
npx vite --open=false
