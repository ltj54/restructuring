param(
    [string]$Message = "",
    [string]$Body    = "Automatisk generert PR via super-deploy.ps1"
)

$ErrorActionPreference = "Stop"

$Yellow = [ConsoleColor]::Yellow
$Green  = [ConsoleColor]::Green
$Red    = [ConsoleColor]::Red
$Cyan   = [ConsoleColor]::Cyan

Write-Host ""
Write-Host "============================================" -ForegroundColor $Cyan
Write-Host " SUPER DEPLOY - Auto PR / Auto Deploy" -ForegroundColor $Cyan
Write-Host "============================================" -ForegroundColor $Cyan
Write-Host ""

# Locate repo root relative to this script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $repoRoot

# Find current branch
$currentBranch = git rev-parse --abbrev-ref HEAD

if ($currentBranch -eq "HEAD") {
    Write-Host "`nERROR: Detached HEAD. Aborting." -ForegroundColor $Red
    exit 1
}

Write-Host "Current branch: $currentBranch" -ForegroundColor $Yellow

# Default commit message
if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = "Auto-commit ($currentBranch) - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

# Stage + commit
Write-Host "`nAdding changes..." -ForegroundColor $Yellow
git add -A

$changes = git diff --cached --name-only

if (-not [string]::IsNullOrWhiteSpace($changes)) {
    Write-Host "`nCommitting: $Message" -ForegroundColor $Yellow
    git commit -m "$Message"
} else {
    Write-Host "`nNo changes to commit." -ForegroundColor $Yellow
}

# If on main -> push and exit
if ($currentBranch -eq "main") {
    Write-Host "`nOn main -> pushing to origin/main..." -ForegroundColor $Yellow
    git push origin main

    if ($LASTEXITCODE -ne 0) {
        Write-Host "`ngit push failed on main." -ForegroundColor $Red
        exit 1
    }

    Write-Host "`nMain push OK. GitHub Actions will run." -ForegroundColor $Green
    exit 0
}

# Not on main -> handle PR
Write-Host "`nNot on main -> creating/updating PR..." -ForegroundColor $Yellow

if (-not (Get-Command "gh" -ErrorAction SilentlyContinue)) {
    Write-Host "`nGitHub CLI (gh) is missing. Install from https://cli.github.com/" -ForegroundColor $Red
    exit 1
}

Write-Host "`nPushing branch: $currentBranch" -ForegroundColor $Yellow
git push origin $currentBranch

$existingPR = gh pr list --head $currentBranch --json number --jq ".[0].number" 2>$null

if ($existingPR) {
    Write-Host "`nPR already exists (#$existingPR). Updating..." -ForegroundColor $Yellow

    $autoBody = @"
**SUPER-DEPLOY: Automatisk oppdatert**

Branch: `$currentBranch`
Tid: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Endringer er pushet og CI er trigget på nytt.
"@

    gh pr edit $existingPR --body "$autoBody"
    gh pr comment $existingPR --body "SUPER-DEPLOY: Ny push + restart CI"

    Write-Host "Triggering latest GitHub Actions run..." -ForegroundColor $Cyan
    $runId = gh run list --limit 1 --json databaseId --jq ".[0].databaseId" 2>$null
    if ($runId) {
        gh run rerun $runId | Out-Null
    }

    Write-Host "`nOpening PR in browser..." -ForegroundColor $Yellow
    gh pr view $existingPR --web
    exit 0
}

# Create new PR
Write-Host "`nCreating Pull Request..." -ForegroundColor $Yellow

gh pr create `
    --base main `
    --head $currentBranch `
    --title "$Message" `
    --body "$Body" `
    --assignee "@me"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nPull Request created!" -ForegroundColor $Green
    Write-Host "Opening PR..." -ForegroundColor $Yellow
    gh pr view --web
} else {
    Write-Host "`nCould not create PR." -ForegroundColor $Red
}

Write-Host ""
exit 0
