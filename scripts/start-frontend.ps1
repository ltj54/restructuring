param(
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $scriptDir "..\frontend"

Set-Location $frontendDir

if (-not $SkipInstall -and -not (Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Cyan
    npm install
}

Write-Host "Starting Vite dev server on http://localhost:5173/restructuring/" -ForegroundColor Green
npm run dev -- --open=false
