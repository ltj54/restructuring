Write-Host "== Starting Vite frontend..." -ForegroundColor Cyan
Set-Location (Join-Path $PSScriptRoot "../frontend")
npm run dev
