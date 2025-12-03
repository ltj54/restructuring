<#
  rebuild-all.ps1
  Full rebuild av Restructuring-prosjektet (backend + frontend).

  Kjøreeksempler:
    pwsh ./rebuild-all.ps1
    pwsh ./rebuild-all.ps1 -SkipTests
#>

[CmdletBinding()]
param(
    [switch]$SkipTests
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([string]$Text)
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
}

function Run-Step {
    param(
        [string]$Name,
        [scriptblock]$Action
    )
    Write-Host ""
    Write-Host "▶ $Name..." -ForegroundColor Yellow
    try {
        & $Action
        Write-Host "✔ $Name OK" -ForegroundColor Green
    }
    catch {
        Write-Host "✖ $Name FEILET" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }
}

Write-Section "RESTRUCTURING – FULL REBUILD (BACKEND + FRONTEND)"

# Husk hvor vi startet
$root = Get-Location

# -------------------------------------
# 1) Backend – Maven build
# -------------------------------------
Run-Step "Backend build (Maven)" {
    Set-Location (Join-Path $root "backend")

    $mvnArgs = @("clean", "package")

    if ($SkipTests) {
        $mvnArgs += "-DskipTests"
        Write-Host "  (Tester SKIPPES)" -ForegroundColor DarkYellow
    }

    Write-Host "  Kjør: mvn $($mvnArgs -join ' ')" -ForegroundColor DarkGray
    mvn @mvnArgs
}

# -------------------------------------
# 2) Frontend – npm build
# -------------------------------------
Run-Step "Frontend build (Vite/React)" {
    Set-Location (Join-Path $root "frontend")

    if (-not (Test-Path "package.json")) {
        throw "Fant ikke package.json i frontend-mappen. Sjekk at scriptet ligger i prosjektroten."
    }

    if (-not (Test-Path "node_modules")) {
        Write-Host "  node_modules mangler – kjører npm install først..." -ForegroundColor DarkYellow
        npm install
    }

    Write-Host "  Kjør: npm run build" -ForegroundColor DarkGray
    npm run build
}

# -------------------------------------
# 3) Ferdig
# -------------------------------------
Set-Location $root
Write-Section "REBUILD FULLFØRT 🎉"
Write-Host "Backend: mvn clean package" -ForegroundColor Gray
Write-Host "Frontend: npm run build" -ForegroundColor Gray

if ($SkipTests) {
    Write-Host "Tester ble SKIPPET (brukte -SkipTests)" -ForegroundColor DarkYellow
}
else {
    Write-Host "Tester ble kjørt (standard)" -ForegroundColor DarkGreen
}
