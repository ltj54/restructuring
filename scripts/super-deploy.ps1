param(
    [string]$Message = "",
    [string]$Body    = "Automatisk generert PR via super-deploy.ps1"
)

# =====================================================================
# 🚀 SUPER-DEPLOY — FULL AUTO (branch → PR, main → deploy)
# =====================================================================

$ErrorActionPreference = "Stop"

$Yellow = [ConsoleColor]::Yellow
$Green  = [ConsoleColor]::Green
$Red    = [ConsoleColor]::Red
$Cyan   = [ConsoleColor]::Cyan

Write-Host ""
Write-Host "============================================" -ForegroundColor $Cyan
Write-Host " 🚀 SUPER DEPLOY — Auto PR / Auto Deploy" -ForegroundColor $Cyan
Write-Host "============================================" -ForegroundColor $Cyan
Write-Host ""

# Finn repo-root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $repoRoot

# Finn nåværende branch
$currentBranch = git rev-parse --abbrev-ref HEAD

if ($currentBranch -eq "HEAD") {
    Write-Host "`n❌ ERROR: Du er i DETACHED HEAD state. Avbryter." -ForegroundColor $Red
    exit 1
}

Write-Host "🔎 Nåværende branch: $currentBranch" -ForegroundColor $Yellow

# Standard commit-melding
if ($Message -eq "") {
    $Message = "Auto-commit ($currentBranch) - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

# ---------------------------------------------------------------------
# 1️⃣ Git add + commit
# ---------------------------------------------------------------------
Write-Host "`n➕ Legger til endringer..." -ForegroundColor $Yellow
git add -A

$changes = git diff --cached --name-only

if (-not [string]::IsNullOrWhiteSpace($changes)) {
    Write-Host "`n💾 Committer: $Message" -ForegroundColor $Yellow
    git commit -m "$Message"
}
else {
    Write-Host "`nℹ️ Ingen endringer å committe." -ForegroundColor $Yellow
}

# ---------------------------------------------------------------------
# Hvis vi er på MAIN → gjør deploy
# ---------------------------------------------------------------------
if ($currentBranch -eq "main") {
    Write-Host "`n⬆️ På main → Pusher til origin/main..." -ForegroundColor $Yellow
    git push origin main

    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ git push feilet på main." -ForegroundColor $Red
        exit 1
    }

    Write-Host "`n✅ MAIN push OK! GitHub Actions trigges nå:" -ForegroundColor $Green
    Write-Host "   → Frontend -> GitHub Pages" -ForegroundColor $Green
    Write-Host "   → Backend -> Render (hvis endret)" -ForegroundColor $Green
    Write-Host ""
    exit 0
}

# ---------------------------------------------------------------------
# 2️⃣ Hvis vi IKKE er på main → opprett PR
# ---------------------------------------------------------------------
Write-Host "`n➡️ Ikke på main → Oppretter Pull Request..." -ForegroundColor $Yellow

# Sjekk om gh CLI er installert
if (-not (Get-Command "gh" -ErrorAction SilentlyContinue)) {
    Write-Host "`n❌ GitHub CLI (gh) mangler!" -ForegroundColor $Red
    Write-Host "Installer: https://cli.github.com/" -ForegroundColor $Yellow
    exit 1
}

# Push branchen
Write-Host "`n⬆️ Pusher branch: $currentBranch" -ForegroundColor $Yellow
git push origin $currentBranch

# Finn eksisterende PR
$existingPR = gh pr list --head $currentBranch --json number --jq ".[0].number" 2>$null

if ($existingPR) {
    Write-Host "`nℹ️ PR finnes allerede (#$existingPR). Viser den:" -ForegroundColor $Yellow
    gh pr view $existingPR
    exit 0
}

# Opprett ny PR
Write-Host "`n📬 Oppretter Pull Request..." -ForegroundColor $Yellow

gh pr create `
    --base main `
    --head $currentBranch `
    --title "$Message" `
    --body "$Body" `
    --assignee "@me"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Pull Request opprettet!" -ForegroundColor $Green
    Write-Host "👉 Åpner PR..." -ForegroundColor $Yellow
    gh pr view --web
} else {
    Write-Host "`n❌ Kunne ikke opprette PR." -ForegroundColor $Red
}

Write-Host ""
exit 0
