param(
    [string]$Message = "Deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

# =====================================================================
# 🚀 FULL DEPLOY TRIGGER – GIT COMMIT + PUSH (GitHub Actions gjør resten)
# =====================================================================

$ErrorActionPreference = "Stop"

$Green  = [ConsoleColor]::Green
$Red    = [ConsoleColor]::Red
$Cyan   = [ConsoleColor]::Cyan
$Yellow = [ConsoleColor]::Yellow

Write-Host ""
Write-Host "============================================" -ForegroundColor $Cyan
Write-Host " 🚀 Starter FULL deploy (Git commit + push)" -ForegroundColor $Cyan
Write-Host "============================================" -ForegroundColor $Cyan
Write-Host ""

# Finn repo-root (scripts\ -> ..)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Resolve-Path (Join-Path $scriptDir "..")

Set-Location $repoRoot

Write-Host "📂 Repo-root: $repoRoot" -ForegroundColor $Yellow

# ---------------------------------------------------------------------
# 1️⃣ Sjekk status
# ---------------------------------------------------------------------
Write-Host "`n🔎 Git status (før deploy):" -ForegroundColor $Yellow
git status

# ---------------------------------------------------------------------
# 2️⃣ Legg til alle endringer
# ---------------------------------------------------------------------
Write-Host "`n➕ Legger til alle endringer (git add -A)..." -ForegroundColor $Yellow
git add -A

# Sjekk om det faktisk er noe å committe
$changes = git diff --cached --name-only

if ([string]::IsNullOrWhiteSpace($changes)) {
    Write-Host "`nℹ️ Ingen endringer å committe. Hopper over commit." -ForegroundColor $Yellow
} else {
    # -----------------------------------------------------------------
    # 3️⃣ Commit
    # -----------------------------------------------------------------
    Write-Host "`n💾 Committer med melding: $Message" -ForegroundColor $Yellow
    git commit -m $Message
}

# ---------------------------------------------------------------------
# 4️⃣ Push til main
# ---------------------------------------------------------------------
Write-Host "`n⬆️ Pusher til origin main..." -ForegroundColor $Yellow

try {
    git push origin main
    if ($LASTEXITCODE -ne 0) {
        throw "git push feilet med kode $LASTEXITCODE"
    }

    Write-Host "`n✅ Push OK! GitHub Actions vil nå kjøre deploy-workflow." -ForegroundColor $Green
    Write-Host "   → Frontend bygges og deployes til GitHub Pages." -ForegroundColor $Green
    Write-Host "   → Backend-deploy til Render trigges hvis backend/ er endret." -ForegroundColor $Green
}
catch {
    Write-Host "`n❌ git push feilet." -ForegroundColor $Red
    Write-Host $_.Exception.Message -ForegroundColor $Red
    exit 1
}

Write-Host ""
