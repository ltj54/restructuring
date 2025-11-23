# =====================================================================
# 📦 make-dev-package.ps1 – Stabil versjon (100% fungerende)
# Ekskluderer node_modules, dist, target, logs osv.
# =====================================================================

Set-Location $PSScriptRoot

$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$zipName = "restructuring-dev-$timestamp.zip"
$zipPath = Join-Path $PSScriptRoot $zipName

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " 📦 Lager komplett utviklingspakke (ZIP)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Slett gammel zip hvis den tilfeldigvis finnes
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# 2. Ekskludér mapper du IKKE vil ha med
$excludeDirs = @(
    "node_modules",
    "dist",
    "target",
    "logs",
    "coverage",
    ".git",
    ".github",
    ".idea",
    ".vscode"
)

# 3. Samle ALLE filer, men hopp over ekskluderte mapper
Write-Host "📦 Samler filer..." -ForegroundColor Yellow

$allFiles = Get-ChildItem -Recurse -File | Where-Object {
    $full = $_.FullName
    -not ($excludeDirs | Where-Object { $full -like "*\$_\*" })
}

# Quick debug dersom noe går galt
if ($allFiles.Count -eq 0) {
    Write-Host "❌ Ingen filer funnet! Noe er galt." -ForegroundColor Red
    exit 1
}

# 4. Lag ZIP
Compress-Archive -Path $allFiles.FullName -DestinationPath $zipPath -CompressionLevel Optimal

Write-Host ""
Write-Host "🎉 ZIP generert:" -ForegroundColor Green
Write-Host "➡  $zipPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dra zip'en rett inn i ChatGPT for full analyse." -ForegroundColor Yellow
Write-Host ""
